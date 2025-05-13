/**
 * AeroVista - Main Server File
 * Express server to handle API endpoints and static file serving
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import route handlers
const contactRoutes = require('./api/contact');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, './')));

// API routes
app.use('/api', contactRoutes);

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  // Check if the request is for a file that exists
  const filePath = path.join(__dirname, req.path);
  try {
    if (require('fs').existsSync(filePath) && require('fs').statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
    // If file doesn't exist, serve index.html
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (err) {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Website: http://localhost:${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Log to a file or service
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Log to a file or service
}); 