# Real-Time Collaborative To-Do Board

A full-stack real-time collaborative Kanban board for managing tasks with live sync, authentication, smart assignment, and conflict resolution.

## Tech Stack
- **Backend:** Node.js, Express, MongoDB, Socket.IO
- **Frontend:** React (no UI libraries)
- **Auth:** JWT, bcrypt

## Features
- User authentication (register/login)
- Real-time task updates (Socket.IO)
- Kanban board: Todo, In Progress, Done
- Smart Assign: Assign to user with fewest active tasks
- Action logging (last 20 actions)
- Conflict detection and resolution
- Responsive, custom UI

## Folder Structure
```
- client/   # React frontend
- server/   # Express backend
- shared/   # Shared models/constants (optional)
```

## Getting Started

### Backend
1. `cd server`
2. `npm install`
3. Create a `.env` file with:
   - `PORT=5000`
   - `MONGO_URI=your_mongo_uri`
   - `JWT_SECRET=your_jwt_secret`
   - `CLIENT_URL=http://localhost:3000`
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. Create a `.env` file with:
   - `REACT_APP_API_URL=http://localhost:5000`
4. `npm start`

---

## Deployment
- **Frontend:** Vercel/Netlify
- **Backend:** Render/Railway/Cyclic/Vercel 