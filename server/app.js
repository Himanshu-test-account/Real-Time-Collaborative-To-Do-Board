import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import logRoutes from './routes/logs.js';
import userRoutes from './routes/users.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://gilded-hummingbird-c2155d.netlify.app/'],
  credentials: true
}));
app.options('*', cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

export default app; 