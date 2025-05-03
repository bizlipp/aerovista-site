const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const mkdirp = promisify(fs.mkdir);

// Directory where processed images will be stored
const CACHE_DIR = path.join(__dirname, '../../public/images');

// Make sure the cache directory exists
mkdirp(CACHE_DIR, { recursive: true }).catch(console.error);

/**
 * Download an image from a URL
 * @param {string} url - The URL of the image to download
 * @returns {Promise<Buffer>} - A promise that resolves to a buffer containing the image data
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Process an image with Sharp
 * @param {string} sourceUrl - The URL or path of the source image
 * @param {Object} options - Processing options
 * @param {number} options.width - The width to resize to (if not provided, will maintain aspect ratio)
 * @param {number} options.height - The height to resize to (if not provided, will maintain aspect ratio)
 * @param {string} options.format - The output format (webp, jpeg, png)
 * @param {number} options.quality - The output quality (1-100)
 * @param {boolean} options.blur - Whether to blur the image (and how much, 0.3-100)
 * @param {Object} options.tint - Color tint to apply (r, g, b values 0-255)
 * @returns {Promise<string>} - Path to the processed image
 */
async function processImage(sourceUrl, options = {}) {
  // Default options
  const defaults = {
    width: null,
    height: null,
    format: 'webp',
    quality: 80,
    blur: false,
    tint: null,
  };

  const settings = { ...defaults, ...options };
  
  // Create a unique filename based on the source URL and processing options
  const hash = Buffer.from(JSON.stringify({ sourceUrl, ...settings }))
    .toString('base64')
    .replace(/[/+=]/g, '_');
  
  const outputFilename = `${hash}.${settings.format}`;
  const outputPath = path.join(CACHE_DIR, outputFilename);
  
  // If the file already exists in cache, return it
  if (fs.existsSync(outputPath)) {
    return `/images/${outputFilename}`;
  }
  
  // Download or read the image
  let inputBuffer;
  if (sourceUrl.startsWith('http')) {
    inputBuffer = await downloadImage(sourceUrl);
  } else {
    inputBuffer = await fs.promises.readFile(sourceUrl);
  }
  
  // Initialize Sharp with the input image
  let sharpInstance = sharp(inputBuffer);
  
  // Resize if dimensions are provided
  if (settings.width || settings.height) {
    sharpInstance = sharpInstance.resize({
      width: settings.width,
      height: settings.height,
      fit: 'cover',
      position: 'center',
    });
  }
  
  // Apply blur if requested
  if (settings.blur) {
    const blurAmount = typeof settings.blur === 'number' ? settings.blur : 3;
    sharpInstance = sharpInstance.blur(blurAmount);
  }
  
  // Apply tint if requested
  if (settings.tint) {
    sharpInstance = sharpInstance.tint(settings.tint);
  }
  
  // Set output format and quality
  switch (settings.format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality: settings.quality });
      break;
    case 'jpeg':
    case 'jpg':
      sharpInstance = sharpInstance.jpeg({ quality: settings.quality });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality: settings.quality });
      break;
    case 'avif':
      sharpInstance = sharpInstance.avif({ quality: settings.quality });
      break;
    default:
      sharpInstance = sharpInstance.webp({ quality: settings.quality });
  }
  
  // Process and save the image
  await sharpInstance.toFile(outputPath);
  
  // Return the path to the processed image
  return `/images/${outputFilename}`;
}

module.exports = {
  processImage,
  downloadImage
}; 