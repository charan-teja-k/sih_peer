# Flask Backend for mental-health (drop-in)

## What you get
- JWT auth: `/auth/register`, `/auth/login`, `/users/me`
- Questions API (Mongo JSON): `/questions` (POST/GET)
- Realtime chat + presence (Socket.IO): namespace `/chat` with events `join_room`, `chat_message`, `heartbeat`, `leave_room`
- Postgres for users/emails, Mongo for questions, Redis for presence/pubsub
- CORS set to `http://localhost:5173` (Vite dev)

## Folder placement
Place this alongside your React app root (the folder that has `mental-health/`):
```
<workspace>/
├── mental-health/       # your React app
├── server/              # this folder
├── docker-compose.yml
└── Dockerfile
```

## Run
```bash
docker compose up --build
```
API is on http://localhost:8000

### Health Check
```
GET http://localhost:8000/health
```

### Environment Variables

#### Frontend (.env.example)
```
VITE_API_URL=http://localhost:8000
```

#### Backend (.env.example)
```
JWT_SECRET=changeme
SQLALCHEMY_URL=postgresql+psycopg2://app:app@localhost:5432/appdb
MONGO_URL=mongodb://localhost:27017
MONGO_DB=app
REDIS_URL=redis://localhost:6379/0
```

## Testing & Development

The codebase includes demo components for testing the integration:

### Demo Routes
- **Auth Demo**: http://localhost:5173/auth-demo - Test registration, login, and token management
- **Chat Demo**: http://localhost:5173/chat-demo - Test real-time Socket.IO connection

### Testing Flow
1. Start backend: `docker compose up --build` or run locally
2. Start frontend: `cd mental-health && npm run dev`
3. Visit demo routes to test:
   - Register/Login at `/auth-demo`
   - Test real-time chat at `/chat-demo` (login first)
   - Check health endpoint connectivity

### API Integration
The frontend uses centralized utilities:
- `src/lib/api.ts` - API URL and request helpers with auth headers
- `src/lib/auth.ts` - JWT token management and auth functions  
- `src/lib/chat.ts` - Socket.IO connection with authentication

## Frontend integration (React + Vite)
1) Create `mental-health/.env`:
```
VITE_API_URL=http://localhost:8000
```

2) Install the client lib:
```bash
cd mental-health
npm i socket.io-client
```

3) Login example (client)
```ts
// src/lib/api.ts
export const API_URL = import.meta.env.VITE_API_URL!;

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json(); // { accessToken, user }
}
```

4) Socket.IO example
```ts
// src/lib/chat.ts
import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

export function connectChat(accessToken: string): Socket {
  const socket = io(`${API_URL}`, {
    path: "/socket.io",
    transports: ["websocket"],
    query: { token: accessToken }, // Flask side reads from query
  } as any);

  socket.on("connected", (msg) => console.log("connected", msg));
  socket.on("room_users", (payload) => console.log("room users:", payload));
  socket.on("chat_message", (m) => console.log("chat:", m));

  socket.emit("join_room", { roomId: "peer-support-1" });
  setInterval(() => socket.emit("heartbeat"), 30000);

  return socket;
}
```

> If you already have components like `AnonymousLogin.tsx` or `GroupChat.tsx`, call the login API to get the token, then pass it to `connectChat(token)`.
