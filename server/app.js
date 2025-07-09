import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';
import userRoutes from './routes/users.js';

const app = express();

app.use(cors({
  origin: [
    'https://gilded-hummingbird-c2155d.netlify.app' // your Netlify frontend
  ],
  credentials: true, // if you use cookies or auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] // add any custom headers you use
}));

// This line ensures Express responds to OPTIONS requests
app.options('*', cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

export default app; 