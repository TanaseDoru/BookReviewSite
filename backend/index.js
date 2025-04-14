// index.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/user-books', require('./routes/userBooks'));
app.use('/api/profile', require('./routes/profile'));
app.use("/api/reviews", require("./routes/reviews")); // Mount reviews routes
app.use('/api/admin', require('./routes/admin')); // Mount admin routes
app.use('/api/questions', require('./routes/questions')); // Mount questions routes
// Start server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
};

startServer();