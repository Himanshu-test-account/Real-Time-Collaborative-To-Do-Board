# Logic Document: Real-Time Collaborative To-Do Board

## Backend Architecture
- **Express.js** REST API for authentication, tasks, logs
- **MongoDB** for persistent storage
- **Socket.IO** for real-time updates
- **JWT** for stateless authentication
- **bcrypt** for password hashing
- **Action Log**: MongoDB collection for all actions
- **Smart Assign**: Assigns to user with fewest active (not Done) tasks
- **Conflict Handling**: Each task has a version/lastModified; concurrent edits detected and surfaced

## Frontend Architecture
- **React** SPA
- **Custom CSS** for all UI (no libraries)
- **Auth Pages**: Register/Login, JWT storage
- **Kanban Board**: 3 columns, drag-and-drop, real-time updates
- **Task Card**: Title, priority, assigned user, Smart Assign, edit/delete
- **Activity Log Panel**: Live feed of last 20 actions
- **Conflict UI**: Modal for merge/overwrite
- **Socket.IO**: For live updates
- **Responsive Design**: Mobile, tablet, desktop

## Real-Time Sync
- On any task change (add/edit/delete/assign/drag-drop), backend emits event via Socket.IO
- All clients update board in real time

## Smart Assign Logic
- POST `/api/tasks/:id/smart-assign`
- Finds user with fewest active (not Done) tasks
- Assigns task and broadcasts update

## Conflict Resolution
- Each task has a version or lastModified timestamp
- On update, backend checks version
- If conflict, returns both versions
- Frontend shows modal for user to merge/overwrite

## Security
- All sensitive routes protected by JWT middleware
- Passwords hashed with bcrypt
- CORS restricted to CLIENT_URL 