from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from flask_socketio import SocketIO, emit, join_room, leave_room
from passlib.hash import bcrypt
from sqlalchemy import create_engine, text
from pymongo import MongoClient
import redis, os
from dotenv import load_dotenv
from ml_predictor import predict_mental_health_risk

# Load environment variables from .env file
load_dotenv()

# ---------- Config ----------
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")
JWT_SECRET = os.getenv("JWT_SECRET", "dev")
SQLALCHEMY_URL = os.getenv("SQLALCHEMY_URL")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
MONGO_DB = os.getenv("MONGO_DB", "app")
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

# Validate required environment variables
if not SQLALCHEMY_URL:
    print("[ERROR] SQLALCHEMY_URL environment variable is required!")
    exit(1)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET

# CORS for Vite dev - Support all common Vite ports
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175", 
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:5177",
    "http://127.0.0.1:5178",
    CORS_ORIGIN
]

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=CORS_ORIGINS)

CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}}, supports_credentials=True)

jwt = JWTManager(app)

# Redis for presence (optional)
try:
    r = redis.from_url(REDIS_URL)
    r.ping()  # Test connection
    print("[SUCCESS] Connected to Redis")
except Exception as e:
    print(f"[WARNING] Redis connection failed: {e}")
    print("[WARNING] Redis functionality will be disabled")
    r = None

# SQL (MySQL) setup with error handling
try:
    engine = create_engine(SQLALCHEMY_URL, future=True)
    with engine.begin() as conn:
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            display_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """))
        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS email_log (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            `to` VARCHAR(255) NOT NULL,
            subject TEXT,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """))
    print("[SUCCESS] Connected to MySQL")
except Exception as e:
    print(f"[WARNING] MySQL connection failed: {e}")
    print("[WARNING] User authentication will be disabled")
    engine = None

# Mongo (for questions JSON) with error handling
try:
    mongo = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    mdb = mongo[MONGO_DB]
    questions_col = mdb["student_mental_questions"]
    # Test connection with timeout
    mongo.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB")
except Exception as e:
    print(f"[WARNING] MongoDB connection failed: {e}")
    print("[WARNING] Questions functionality will be disabled")
    mongo = None
    mdb = None
    questions_col = None

# ---------- REST ----------

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/test-db")
def test_db():
    if not engine:
        return {"msg": "Database unavailable"}, 503
    try:
        with engine.begin() as conn:
            # Use different SQL for different databases
            if "mysql" in SQLALCHEMY_URL.lower():
                result = conn.execute(text("SHOW TABLES"))
                tables = [row[0] for row in result]
            else:  # SQLite
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
                tables = [row[0] for row in result]
            return {"tables": tables, "database_type": "mysql" if "mysql" in SQLALCHEMY_URL.lower() else "sqlite"}
    except Exception as e:
        return {"error": str(e)}, 500

@app.post("/auth/register")
def register():
    if not engine:
        return {"msg": "Database unavailable"}, 503
        
    data = request.get_json() or {}
    email = data.get("email")
    pw = data.get("password")
    name = data.get("name")
    age = data.get("age")
    phone_number = data.get("phone_number")
    
    # Validate required fields
    if not email or not pw:
        return {"msg": "email/password required"}, 400
    if not name or not age or not phone_number:
        return {"msg": "name, age, and phone number are required"}, 400
    
    # Validate age
    try:
        age = int(age)
        if age < 16 or age > 100:
            return {"msg": "Age must be between 16 and 100"}, 400
    except ValueError:
        return {"msg": "Age must be a valid number"}, 400
    
    # Validate phone number (basic validation)
    if len(phone_number) < 10:
        return {"msg": "Phone number must be at least 10 digits"}, 400

    pwd_hash = bcrypt.hash(pw)
    print(f"[DEBUG] Attempting to register user: {email}")
    try:
        with engine.begin() as conn:
            # Insert with all required fields
            result = conn.execute(text(
                "INSERT INTO users (email, password_hash, name, age, phone_number) VALUES (:e, :p, :n, :a, :ph)"
            ), {"e": email, "p": pwd_hash, "n": name, "a": age, "ph": phone_number})
            # Get the auto-generated ID
            uid = result.lastrowid
        print(f"[DEBUG] User {email} registered successfully with ID: {uid}")
    except Exception as e:
        print(f"[ERROR] Registration failed for {email}: {str(e)}")
        if "Duplicate entry" in str(e) or "UNIQUE constraint" in str(e):
            return {"msg": "Email address is already registered. Please try signing in instead."}, 409
        else:
            return {"msg": f"Database error: {str(e)}"}, 500

    token = create_access_token(identity=str(uid), additional_claims={"email": email, "name": name})
    return {"accessToken": token, "user": {"id": str(uid), "email": email, "name": name, "age": age, "phone_number": phone_number}}

@app.post("/auth/login")
def login():
    if not engine:
        return {"msg": "Database unavailable"}, 503
        
    data = request.get_json() or {}
    email, pw = data.get("email"), data.get("password")
    if not email or not pw:
        return {"msg": "email/password required"}, 400
        
    try:
        with engine.begin() as conn:
            row = conn.execute(text("SELECT id, email, name, age, phone_number, password_hash FROM users WHERE email=:e"), {"e": email}).fetchone()
        if not row or not bcrypt.verify(pw, row.password_hash):
            return {"msg": "Invalid email or password"}, 401

        token = create_access_token(identity=str(row.id), additional_claims={"email": email, "name": row.name})
        return {"accessToken": token, "user": {"id": str(row.id), "email": email, "name": row.name, "age": row.age, "phone_number": row.phone_number}}
    except Exception as e:
        return {"msg": "Login failed"}, 500

@app.get("/users/me")
@jwt_required()
def me():
    if not engine:
        return {"msg": "Database unavailable"}, 503
        
    uid = get_jwt_identity()
    try:
        with engine.begin() as conn:
            res = conn.execute(text("SELECT id, email, name, age, phone_number, display_name FROM users WHERE id=:id"), {"id": uid}).mappings().first()
        if not res:
            return {"msg": "User not found"}, 404
        return {"user": dict(res)}
    except Exception as e:
        return {"msg": "Failed to get user info"}, 500

@app.post("/questions")
@jwt_required()
def save_questions():
    if questions_col is None:
        return {"msg": "Questions database unavailable"}, 503
    if not engine:
        return {"msg": "SQL database unavailable"}, 503
        
    uid = get_jwt_identity()
    payload = request.get_json() or {}
    
    # Fetch user details from SQL database
    try:
        with engine.begin() as conn:
            user_row = conn.execute(text("SELECT email, name, age FROM users WHERE id=:id"), {"id": uid}).fetchone()
        if not user_row:
            return {"msg": "User not found"}, 404
    except Exception as e:
        print(f"[ERROR] Failed to fetch user details: {e}")
        return {"msg": "Failed to fetch user details"}, 500
    
    # Calculate timestamp
    from datetime import datetime
    
    # Prepare user data for ML model
    user_data = {
        "age": user_row.age,
        "course": payload.get("course", ""),
        "year": payload.get("year", "")
    }
    
    # Get questionnaire answers for ML model
    answers = payload.get("answers", {})
    
    # Use ML model to predict risk
    try:
        ml_result = predict_mental_health_risk(user_data, answers)
        risk_level = ml_result.get("risk_level", "medium")
        predicted_class = ml_result.get("predicted_class", "Medium")
        confidence = ml_result.get("confidence", 0.5)
        ml_features = ml_result.get("top_contributing_features", [])
        
        print(f"[DEBUG] ML Prediction for user {uid}: {predicted_class} (confidence: {confidence:.3f})")
        
        # Map risk level to tags
        risk_tag_mapping = {
            "low": "low_risk",
            "medium": "moderate_risk", 
            "high": "high_risk"
        }
        risk_tag = risk_tag_mapping.get(risk_level, "moderate_risk")
        
    except Exception as e:
        print(f"[ERROR] ML prediction failed, using fallback: {e}")
        # Fallback to simple scoring if ML fails
        risk_score = 0
        if answers:
            for answer_text in answers.values():
                if answer_text == "Not at all":
                    risk_score += 0
                elif answer_text == "Sometimes":
                    risk_score += 1
                elif answer_text == "Often":
                    risk_score += 2
                elif answer_text == "Almost every day":
                    risk_score += 3
        
        max_possible_score = len(answers) * 3 if answers else 45
        risk_percentage = (risk_score / max_possible_score) * 100 if max_possible_score > 0 else 0
        
        if risk_percentage >= 60:
            risk_level = "high"
            risk_tag = "high_risk"
        elif risk_percentage >= 30:
            risk_level = "medium"
            risk_tag = "moderate_risk"
        else:
            risk_level = "low" 
            risk_tag = "low_risk"
        
        predicted_class = risk_level.capitalize()
        confidence = 0.5
        ml_features = []
        ml_result = {"fallback_used": True}
    
    doc = {
        "userId": uid,
        "userEmail": user_row.email,
        "userName": user_row.name,
        "userAge": user_row.age,
        "course": payload.get("course", ""),
        "year": payload.get("year", ""),
        "answers": answers,  # Text responses to Q1-Q15
        "responses": payload.get("responses", {}),  # All responses including course/year
        "formVersion": payload.get("formVersion", "v2"),
        "timestamp": datetime.now(),
        "completed_at": datetime.now().isoformat(),
        "tags": payload.get("tags", []),
        # ML prediction results
        "ml_prediction": {
            "risk_level": risk_level,
            "predicted_class": predicted_class,
            "confidence": confidence,
            "top_features": ml_features,
            "model_used": "random_forest" if not ml_result.get("fallback_used") else "fallback",
            "prediction_timestamp": datetime.now().isoformat()
        }
    }
    
    # Add automatic tags based on ML prediction
    doc["tags"].append(risk_tag)
    
    # Add course-based tag
    if doc["course"]:
        # Clean course name for tag
        course_tag = doc["course"].lower().replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")
        doc["tags"].append(f"course_{course_tag}")
    
    try:
        # Check if user already has an assessment
        existing_assessment = questions_col.find_one({"userId": uid})
        
        if existing_assessment:
            # Update existing assessment (reassessment)
            # Preserve the original creation timestamp but update all other fields
            doc["original_timestamp"] = existing_assessment.get("timestamp", doc["timestamp"])
            doc["assessment_count"] = existing_assessment.get("assessment_count", 1) + 1
            doc["previous_risk_level"] = existing_assessment.get("ml_prediction", {}).get("risk_level", "unknown")
            
            result = questions_col.replace_one({"userId": uid}, doc)
            assessment_id = str(existing_assessment["_id"])
            action = "updated"
            print(f"[DEBUG] Updated ML-based assessment for user {uid}: Course={doc['course']}, Year={doc['year']}, ML Prediction={predicted_class} (confidence: {confidence:.3f}) - Reassessment #{doc['assessment_count']}")
        else:
            # Create new assessment (first time)
            doc["assessment_count"] = 1
            doc["original_timestamp"] = doc["timestamp"]
            
            ins = questions_col.insert_one(doc)
            assessment_id = str(ins.inserted_id)
            action = "created"
            print(f"[DEBUG] Created ML-based assessment for user {uid}: Course={doc['course']}, Year={doc['year']}, ML Prediction={predicted_class} (confidence: {confidence:.3f}) - First assessment")
        
        return {
            "id": assessment_id,
            "action": action,
            "assessmentCount": doc["assessment_count"],
            "riskLevel": risk_level,
            "predictedClass": predicted_class,
            "confidence": confidence,
            "modelUsed": doc["ml_prediction"]["model_used"],
            "topFeatures": ml_features[:3],  # Return top 3 features for display
            "previousRiskLevel": doc.get("previous_risk_level")
        }, 201
    except Exception as e:
        print(f"[ERROR] Failed to save assessment: {e}")
        return {"msg": "Failed to save questions"}, 500

@app.get("/questions")
@jwt_required()
def list_questions():
    if questions_col is None:
        return {"msg": "Questions database unavailable"}, 503
        
    uid = get_jwt_identity()
    try:
        items = []
        # Since we now update instead of insert, there should only be one record per user
        # But we'll still support the old structure for backward compatibility
        for d in questions_col.find({"userId": uid}).sort("_id", -1).limit(10):
            d["_id"] = str(d["_id"])
            # Include user details in the response for backward compatibility
            if "userEmail" not in d:
                # For older records without user details, try to fetch from SQL
                try:
                    if engine:
                        with engine.begin() as conn:
                            user_row = conn.execute(text("SELECT email, name, age FROM users WHERE id=:id"), {"id": uid}).fetchone()
                        if user_row:
                            d["userEmail"] = user_row.email
                            d["userName"] = user_row.name
                            d["userAge"] = user_row.age
                except Exception as e:
                    print(f"[WARNING] Could not fetch user details for old record: {e}")
            
            # Add assessment metadata for frontend
            d["isReassessment"] = d.get("assessment_count", 1) > 1
            d["assessmentCount"] = d.get("assessment_count", 1)
            if "previous_risk_level" in d:
                d["previousRiskLevel"] = d["previous_risk_level"]
                
            items.append(d)
        return {"items": items}
    except Exception as e:
        return {"msg": "Failed to fetch questions"}, 500

@app.get("/questions/check-history")
@jwt_required()
def check_test_history():
    """Check if the current user has taken the test before and return their latest results"""
    if questions_col is None:
        return {"msg": "Questions database unavailable"}, 503
    if not engine:
        return {"msg": "SQL database unavailable"}, 503
        
    uid = get_jwt_identity()
    
    # Get user email from SQL database
    try:
        with engine.begin() as conn:
            user_row = conn.execute(text("SELECT email FROM users WHERE id=:id"), {"id": uid}).fetchone()
        if not user_row:
            return {"msg": "User not found"}, 404
        user_email = user_row.email
    except Exception as e:
        print(f"[ERROR] Failed to fetch user email: {e}")
        return {"msg": "Failed to fetch user details"}, 500
    
    try:
        # Check if user has any test records by email (most recent first)
        latest_test = questions_col.find_one(
            {"userEmail": user_email}, 
            sort=[("_id", -1)]
        )
        
        if latest_test:
            # User has taken the test before
            latest_test["_id"] = str(latest_test["_id"])
            return {
                "hasTakenTest": True, 
                "latestTest": latest_test,
                "message": "User has previous test results"
            }
        else:
            # User has not taken the test
            return {
                "hasTakenTest": False, 
                "message": "User has not taken the test before"
            }
            
    except Exception as e:
        print(f"[ERROR] Failed to check test history: {e}")
        return {"msg": "Failed to check test history"}, 500

@app.get("/admin/questions")
@jwt_required()
def list_all_questions():
    """Admin endpoint to fetch all question responses with user details"""
    if questions_col is None:
        return {"msg": "Questions database unavailable"}, 503
        
    try:
        items = []
        for d in questions_col.find({}).sort("_id", -1).limit(200):
            d["_id"] = str(d["_id"])
            # Ensure user details are included for all records
            if "userEmail" not in d and engine:
                try:
                    with engine.begin() as conn:
                        user_row = conn.execute(text("SELECT email, name, age FROM users WHERE id=:id"), {"id": d.get("userId")}).fetchone()
                    if user_row:
                        d["userEmail"] = user_row.email
                        d["userName"] = user_row.name
                        d["userAge"] = user_row.age
                except Exception as e:
                    print(f"[WARNING] Could not fetch user details for record: {e}")
            items.append(d)
        return {"items": items, "total": len(items)}
    except Exception as e:
        return {"msg": "Failed to fetch questions"}, 500

# ---------- Presence helpers ----------
def set_online(user_id):
    if r:
        try:
            r.setex(f"online:{user_id}", 60, "1")
        except:
            pass

def add_to_room(room_id, user_id):
    if r:
        try:
            r.sadd(f"room:{room_id}:online", user_id)
        except:
            pass

def remove_from_room(room_id, user_id):
    if r:
        try:
            r.srem(f"room:{room_id}:online", user_id)
        except:
            pass

def room_users(room_id):
    if r:
        try:
            return [u.decode() if isinstance(u, bytes) else u for u in r.smembers(f"room:{room_id}:online")]
        except:
            return []
    return []

# ---------- Socket.IO ----------
@socketio.on("connect", namespace="/chat")
def on_connect():
    token = request.args.get("token")
    if not token:
        return False
    try:
        claims = decode_token(token)
        uid = claims["sub"]
        request.environ["uid"] = uid
        set_online(uid)
        emit("connected", {"userId": uid})
    except Exception:
        return False

@socketio.on("join_room", namespace="/chat")
def on_join(data):
    uid = request.environ.get("uid")
    room_id = data.get("roomId")
    join_room(room_id)
    add_to_room(room_id, uid)
    emit("room_users", {"roomId": room_id, "users": room_users(room_id)}, to=room_id)

@socketio.on("leave_room", namespace="/chat")
def on_leave(data):
    uid = request.environ.get("uid")
    room_id = data.get("roomId")
    leave_room(room_id)
    remove_from_room(room_id, uid)
    emit("room_users", {"roomId": room_id, "users": room_users(room_id)}, to=room_id)

@socketio.on("chat_message", namespace="/chat")
def on_message(data):
    uid = request.environ.get("uid")
    room_id = data.get("roomId")
    text = (data.get("text") or "")[:2000]
    msg = {"roomId": room_id, "userId": uid, "text": text}
    emit("chat_message", msg, to=room_id)

@socketio.on("heartbeat", namespace="/chat")
def on_heartbeat():
    uid = request.environ.get("uid")
    set_online(uid)

@socketio.on("disconnect", namespace="/chat")
def on_disconnect():
    pass

if __name__ == "__main__":
    try:
        print("Starting Flask-SocketIO server on port 8001...")
        socketio.run(app, host="0.0.0.0", port=8001, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()
