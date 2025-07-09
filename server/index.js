import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';

// Load env vars
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors({
  origin: [
    'https://gilded-hummingbird-c2155d.netlify.app'
  ],
  credentials: true
}));

// Test CORS route
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

app.get('/', (req, res) => {
  res.json({ active: true, error: false });
});

// Catch-all 404 handler (should be after all other routes)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', code: 404 });
});

// Socket.IO setup (optional, only if you need real-time features)
// If you want to use Socket.IO with Vercel, you need a custom serverless function or a different host.
// For now, we skip Socket.IO setup for Vercel compatibility.

export default app; 