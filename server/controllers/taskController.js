const mongoose = require('mongoose');
const Task = require('../models/taskModel');

/**
 * @desc    Get all tasks
 * @route   GET /api/tasks
 */
const getTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 6, search, sortBy } = req.query;

    // Parse and sanitize to avoid negative skip values or NaN crashes
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 6);

    const filter = { user: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
const createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Please provide a task title' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      status,
      dueDate,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    // Only allow these fields to be updated — prevents mass-assignment attacks
    const { title, description, status, dueDate } = req.body;

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure the logged-in user matches the task owner
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Update only the whitelisted fields
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, status, dueDate },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    // Check if task exists
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure the logged-in user matches the task owner
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Remove the task from the database
    await task.deleteOne();

    res.status(200).json({ id, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get task counts statistics
 * @route   GET /api/tasks/stats
 */
const getTasksStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Task.countDocuments({ user: userId });
    const pending = await Task.countDocuments({ user: userId, status: 'Pending' });
    const progress = await Task.countDocuments({ user: userId, status: 'In Progress' });
    const completed = await Task.countDocuments({ user: userId, status: 'Completed' });

    res.status(200).json({
      total,
      pending,
      progress,
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTasksStats,
  createTask,
  updateTask,
  deleteTask,
};
