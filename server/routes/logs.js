import express from 'express';
import auth from '../middleware/auth.js';
import ActionLog from '../models/ActionLog.js';

const router = express.Router();

// GET /api/logs/recent
router.get('/recent', auth, async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username')
      .populate('task', 'title');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 