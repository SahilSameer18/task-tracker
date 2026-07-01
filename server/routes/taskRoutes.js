const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

// GET request to fetch all tasks
router.get('/', protect, getTasks);

// POST request to create a new task
router.post('/', protect, createTask);

// PUT request to update an existing task by ID
router.put('/:id', protect, updateTask);

// DELETE request to remove a task by ID
router.delete('/:id', protect, deleteTask);

module.exports = router;
