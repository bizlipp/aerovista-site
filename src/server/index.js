// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { processImage } = require('./imageProcessor');
const { processContactForm } = require('./contactHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiter to sensitive endpoints
app.use('/api/image', limiter);
app.use('/api/contact', limiter);

// Body parser for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../')));

// Image processing endpoint
app.get('/api/image', async (req, res) => {
  try {
    const { src, width, height, format, quality, blur } = req.query;
    
    if (!src) {
      return res.status(400).json({ error: 'Source image URL is required' });
    }

    // Parse numeric parameters
    const options = {
      width: width ? parseInt(width, 10) : null,
      height: height ? parseInt(height, 10) : null,
      format: format || 'webp',
      quality: quality ? parseInt(quality, 10) : 80,
      blur: blur === 'true' || (typeof blur === 'string' && !isNaN(parseFloat(blur))) 
        ? (blur === 'true' ? true : parseFloat(blur)) 
        : false
    };

    // Process the image
    const imagePath = await processImage(src, options);
    
    // Return the processed image URL
    res.json({ 
      url: `${req.protocol}://${req.get('host')}${imagePath}`,
      width: options.width,
      height: options.height,
      format: options.format
    });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Direct image serving endpoint (returns the image directly)
app.get('/api/image-direct', async (req, res) => {
  try {
    const { src, width, height, format, quality, blur } = req.query;
    
    if (!src) {
      return res.status(400).send('Source image URL is required');
    }

    // Parse numeric parameters
    const options = {
      width: width ? parseInt(width, 10) : null,
      height: height ? parseInt(height, 10) : null,
      format: format || 'webp',
      quality: quality ? parseInt(quality, 10) : 80,
      blur: blur === 'true' || (typeof blur === 'string' && !isNaN(parseFloat(blur))) 
        ? (blur === 'true' ? true : parseFloat(blur)) 
        : false
    };

    // Process the image
    const imagePath = await processImage(src, options);
    
    // Redirect to the processed image
    res.redirect(imagePath);
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).send('Failed to process image');
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const formData = req.body;
    
    // Add IP information (for security/spam detection)
    formData.ipAddress = req.ip || req.connection.remoteAddress;
    formData.userAgent = req.headers['user-agent'];
    
    // Process the form
    const result = await processContactForm(formData);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: result.message 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Contact form processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing your request'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fallback - serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 