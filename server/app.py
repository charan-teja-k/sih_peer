import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from flask_socketio import SocketIO, join_room, leave_room, emit
from passlib.hash import bcrypt
from sqlalchemy import create_engine, text
from pymongo import MongoClient
import redis, os, uuid

# ---------- Config ----------
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")
JWT_SECRET = os.getenv("JWT_SECRET", "dev")
SQLALCHEMY_URL = os.getenv("SQLALCHEMY_URL", "postgresql+psycopg2://app:app@localhost:5432/appdb")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "app")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET

# CORS for Vite dev
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5175", 
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
    CORS_ORIGIN
]
CORS(app, resources={r"/*": {"origins": CORS_ORIGINS}}, supports_credentials=True)

jwt = JWTManager(app)

# Redis for presence + SocketIO message queue
r = redis.from_url(REDIS_URL)
socketio = SocketIO(app, cors_allowed_origins="*", message_queue=REDIS_URL, async_mode="eventlet")

# SQL (Postgres) setup
engine = create_engine(SQLALCHEMY_URL, future=True)
with engine.begin() as conn:
    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        display_name text,
        created_at timestamptz DEFAULT now()
    );
    """))
    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS email_log (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        "to" text NOT NULL,
        subject text,
        status text,
        created_at timestamptz DEFAULT now()
    );
    """))

# Mongo (for questions JSON)
mongo = MongoClient(MONGO_URL)
mdb = mongo[MONGO_DB]
questions_col = mdb["questions"]

# ---------- REST ----------

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/auth/register")
def register():
    data = request.get_json() or {}
    email = data.get("email")
    pw = data.get("password")
    if not email or not pw:
        return {"msg": "email/password required"}, 400

    uid = str(uuid.uuid4())
    pwd_hash = bcrypt.hash(pw)
    try:
        with engine.begin() as conn:
            conn.execute(text(
                "INSERT INTO users (id,email,password_hash) VALUES (:id,:e,:p)"
            ), {"id": uid, "e": email, "p": pwd_hash})
    except Exception as e:
        return {"msg": "email exists?"}, 409

    token = create_access_token(identity=uid, additional_claims={"email": email})
    return {"accessToken": token, "user": {"id": uid, "email": email}}

@app.post("/auth/login")
def login():
    data = request.get_json() or {}
    email, pw = data.get("email"), data.get("password")
    with engine.begin() as conn:
        row = conn.execute(text("SELECT id, password_hash FROM users WHERE email=:e"), {"e": email}).fetchone()
    if not row or not bcrypt.verify(pw, row.password_hash):
        return {"msg": "invalid credentials"}, 401

    token = create_access_token(identity=str(row.id), additional_claims={"email": email})
    return {"accessToken": token, "user": {"id": str(row.id), "email": email}}

@app.get("/users/me")
@jwt_required()
def me():
    uid = get_jwt_identity()
    with engine.begin() as conn:
        res = conn.execute(text("SELECT id, email, display_name FROM users WHERE id=:id"), {"id": uid}).mappings().first()
    return {"user": res}

@app.post("/questions")
@jwt_required()
def save_questions():
    uid = get_jwt_identity()
    payload = request.get_json() or {}
    doc = {
        "userId": uid,
        "answers": payload.get("answers", {}),
        "formVersion": payload.get("formVersion", "v1"),
        "riskScore": payload.get("riskScore", 0),
        "tags": payload.get("tags", []),
    }
    ins = questions_col.insert_one(doc)
    return {"id": str(ins.inserted_id)}, 201

@app.get("/questions")
@jwt_required()
def list_questions():
    uid = get_jwt_identity()
    items = []
    for d in questions_col.find({"userId": uid}).sort("_id", -1).limit(50):
        d["_id"] = str(d["_id"])
        items.append(d)
    return {"items": items}

# ---------- Presence helpers ----------
def set_online(user_id):
    r.setex(f"online:{user_id}", 60, "1")

def add_to_room(room_id, user_id):
    r.sadd(f"room:{room_id}:online", user_id)

def remove_from_room(room_id, user_id):
    r.srem(f"room:{room_id}:online", user_id)

def room_users(room_id):
    return [u.decode() if isinstance(u, bytes) else u for u in r.smembers(f"room:{room_id}:online")]

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
    socketio.run(app, host="0.0.0.0", port=8000)
