import express from 'express';
import auth from '../middleware/auth.js';
import Task from '../models/Task.js';
import ActionLog from '../models/ActionLog.js';

const router = express.Router();

// GET /api/tasks - List all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate, status } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create new task
    const task = new Task({
      title: title.trim(),
      description: description || '',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      status: status || 'Todo',
      createdBy: req.user.id
    });

    const savedTask = await task.save();
    
    // Populate assignedTo field for response
    await savedTask.populate('assignedTo', 'username email');

    // Log the action with description and username
    await ActionLog.create({
      actionType: 'CREATE',
      user: req.user.id,
      task: savedTask._id,
      description: `Created task "${savedTask.title}"`,
      timestamp: new Date(),
    });

    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - Update task (with conflict handling)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate, status } = req.body;
    const taskId = req.params.id;

    // Find the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (status !== undefined) task.status = status;
    
    task.lastModified = new Date();
    task.version += 1;

    const updatedTask = await task.save();
    
    // Populate assignedTo field for response
    await updatedTask.populate('assignedTo', 'username email');

    // Log the action with description and username
    await ActionLog.create({
      actionType: 'UPDATE',
      user: req.user.id,
      task: updatedTask._id,
      description: `Updated task "${updatedTask.title}"`,
      timestamp: new Date(),
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/tasks/:id - Update task status (for drag and drop)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    task.lastModified = new Date();
    task.version += 1;

    const updatedTask = await task.save();
    
    // Populate assignedTo field for response
    await updatedTask.populate('assignedTo', 'username email');

    // Log the action
    await ActionLog.create({
      actionType: 'MOVE',
      user: req.user.id,
      task: updatedTask._id
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(taskId);

    // Log the action with description and username
    await ActionLog.create({
      actionType: 'DELETE',
      user: req.user.id,
      task: taskId,
      description: `Deleted task "${task.title}"`,
      timestamp: new Date(),
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks/:id/smart-assign - Smart assign logic
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Simple smart assign logic - assign to user with least tasks
    const User = (await import('../models/User.js')).default;
    const users = await User.find();
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'No users available for assignment' });
    }

    // Count tasks per user
    const taskCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Task.countDocuments({ assignedTo: user._id });
        return { user, count };
      })
    );

    // Find user with least tasks
    const userWithLeastTasks = taskCounts.reduce((min, current) => 
      current.count < min.count ? current : min
    );

    task.assignedTo = userWithLeastTasks.user._id;
    task.lastModified = new Date();
    task.version += 1;

    const updatedTask = await task.save();
    
    // Populate assignedTo field for response
    await updatedTask.populate('assignedTo', 'username email');

    // Log the action
    await ActionLog.create({
      actionType: 'SMART_ASSIGN',
      user: req.user.id,
      task: updatedTask._id
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error smart assigning task:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 