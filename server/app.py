from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from flask_socketio import SocketIO, emit, join_room, leave_room
from passlib.hash import bcrypt
from sqlalchemy import create_engine, text
from pymongo import MongoClient
import redis, os
from dotenv import load_dotenv

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
            display_name VARCHAR(255),
            name VARCHAR(255),
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
    questions_col = mdb["questions"]
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
    if not email or not pw:
        return {"msg": "email/password required"}, 400

    pwd_hash = bcrypt.hash(pw)
    print(f"[DEBUG] Attempting to register user: {email}")
    try:
        with engine.begin() as conn:
            # Insert without specifying id - let MySQL auto-increment handle it
            result = conn.execute(text(
                "INSERT INTO users (email,password_hash) VALUES (:e,:p)"
            ), {"e": email, "p": pwd_hash})
            # Get the auto-generated ID
            uid = result.lastrowid
        print(f"[DEBUG] User {email} registered successfully with ID: {uid}")
    except Exception as e:
        print(f"[ERROR] Registration failed for {email}: {str(e)}")
        if "Duplicate entry" in str(e) or "UNIQUE constraint" in str(e):
            return {"msg": "Email address is already registered. Please try signing in instead."}, 409
        else:
            return {"msg": f"Database error: {str(e)}"}, 500

    token = create_access_token(identity=str(uid), additional_claims={"email": email})
    return {"accessToken": token, "user": {"id": str(uid), "email": email}}

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
            row = conn.execute(text("SELECT id, password_hash FROM users WHERE email=:e"), {"e": email}).fetchone()
        if not row or not bcrypt.verify(pw, row.password_hash):
            return {"msg": "Invalid email or password"}, 401

        token = create_access_token(identity=str(row.id), additional_claims={"email": email})
        return {"accessToken": token, "user": {"id": str(row.id), "email": email}}
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
            res = conn.execute(text("SELECT id, email, display_name FROM users WHERE id=:id"), {"id": uid}).mappings().first()
        if not res:
            return {"msg": "User not found"}, 404
        return {"user": dict(res)}
    except Exception as e:
        return {"msg": "Failed to get user info"}, 500

@app.post("/questions")
@jwt_required()
def save_questions():
    if not questions_col:
        return {"msg": "Questions database unavailable"}, 503
        
    uid = get_jwt_identity()
    payload = request.get_json() or {}
    doc = {
        "userId": uid,
        "answers": payload.get("answers", {}),
        "formVersion": payload.get("formVersion", "v1"),
        "riskScore": payload.get("riskScore", 0),
        "tags": payload.get("tags", []),
    }
    try:
        ins = questions_col.insert_one(doc)
        return {"id": str(ins.inserted_id)}, 201
    except Exception as e:
        return {"msg": "Failed to save questions"}, 500

@app.get("/questions")
@jwt_required()
def list_questions():
    if not questions_col:
        return {"msg": "Questions database unavailable"}, 503
        
    uid = get_jwt_identity()
    try:
        items = []
        for d in questions_col.find({"userId": uid}).sort("_id", -1).limit(50):
            d["_id"] = str(d["_id"])
            items.append(d)
        return {"items": items}
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
