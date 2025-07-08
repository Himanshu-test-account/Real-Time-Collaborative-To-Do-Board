import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';

// Load env vars
dotenv.config();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://jazzy-granita-3c914e.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
// console.log('CORS allowed origin:', process.env.CLIENT_URL);
app.use(cors({
  origin: ['http://localhost:3000', 'https://jazzy-granita-3c914e.netlify.app'],
  credentials: true
}));

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

app.get('/status', (req, res) => {
  res.json({ active: true, error: false });
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 