const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { processImage } = require('./imageProcessor');

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

// Apply rate limiter to image processing endpoint
app.use('/api/image', limiter);

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