import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/users - get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router; 