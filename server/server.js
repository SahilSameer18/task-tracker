require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const dns = require('dns')

// resolved te dns issue for db
dns.setServers(["1.1.1.1", "8.8.8.8"]);


// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware Setup
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173')
app.use(cors({
  origin: clientUrl,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// basic API check for server running
app.get('/', (req, res) => {
  res.send('Task Tracker API is running...');
});

// Define PORT and Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
