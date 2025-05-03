/**
 * AeroVista Image Utility
 * A utility for processing images using the Sharp-based image API
 */

/**
 * Process an image through the Sharp-based image API
 * @param {string} src - The source image URL
 * @param {Object} options - Processing options
 * @param {number} options.width - The width to resize to
 * @param {number} options.height - The height to resize to
 * @param {string} options.format - The output format (webp, jpeg, png)
 * @param {number} options.quality - The output quality (1-100)
 * @param {boolean|number} options.blur - Whether to blur the image (and how much)
 * @param {boolean} options.direct - If true, returns a direct URL to the image instead of fetching metadata
 * @returns {Promise<string|Object>} - A promise that resolves to the processed image URL or metadata
 */
async function processImage(src, options = {}) {
  // Build the query string
  const params = new URLSearchParams();
  params.append('src', src);
  
  if (options.width) params.append('width', options.width);
  if (options.height) params.append('height', options.height);
  if (options.format) params.append('format', options.format);
  if (options.quality) params.append('quality', options.quality);
  if (options.blur !== undefined) params.append('blur', options.blur);
  
  // Use the direct endpoint or the JSON metadata endpoint
  const endpoint = options.direct ? '/api/image-direct' : '/api/image';
  const url = `${endpoint}?${params.toString()}`;
  
  if (options.direct) {
    // For direct mode, just return the URL
    return url;
  } else {
    // For metadata mode, fetch the data
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Image processing failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error processing image:', error);
      // Return the original image on error
      return { url: src };
    }
  }
}

/**
 * Process multiple images at once
 * @param {Array<Object>} images - Array of image objects with src and options
 * @returns {Promise<Array>} - A promise that resolves to an array of processed image URLs or metadata
 */
async function processMultipleImages(images) {
  return Promise.all(images.map(img => processImage(img.src, img.options)));
}

/**
 * Generate a responsive image srcset using the Sharp image API
 * @param {string} src - The source image URL
 * @param {Object} options - Processing options
 * @param {Array<number>} options.widths - Array of widths to generate
 * @param {string} options.format - The output format (webp, jpeg, png)
 * @param {number} options.quality - The output quality (1-100)
 * @returns {Promise<string>} - A promise that resolves to a srcset string
 */
async function generateSrcset(src, options = {}) {
  const widths = options.widths || [320, 640, 960, 1280, 1920];
  const format = options.format || 'webp';
  const quality = options.quality || 80;
  
  const srcsetPromises = widths.map(async width => {
    const imgUrl = processImage(src, {
      width,
      format,
      quality,
      direct: true
    });
    return `${imgUrl} ${width}w`;
  });
  
  const srcsetEntries = await Promise.all(srcsetPromises);
  return srcsetEntries.join(', ');
}

/**
 * Update an <img> element to use the processed image
 * @param {HTMLImageElement} imgElement - The image element to update
 * @param {Object} options - Processing options
 */
async function updateImageElement(imgElement, options = {}) {
  const src = imgElement.getAttribute('data-src') || imgElement.src;
  
  // Extract width and height from the element if not provided in options
  if (!options.width && imgElement.width) {
    options.width = imgElement.width;
  }
  
  if (!options.height && imgElement.height) {
    options.height = imgElement.height;
  }
  
  // Process the image
  const processedImage = await processImage(src, {
    ...options,
    direct: true
  });
  
  // Update the image source
  imgElement.src = processedImage;
  
  // Generate and set srcset if requested
  if (options.responsive) {
    const srcset = await generateSrcset(src, {
      format: options.format,
      quality: options.quality
    });
    imgElement.srcset = srcset;
  }
}

/**
 * Initialize lazy loading for images with data-src attributes
 */
function initLazyLoading() {
  // Use Intersection Observer if available
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          const src = lazyImage.getAttribute('data-src');
          
          if (src) {
            updateImageElement(lazyImage, {
              width: lazyImage.getAttribute('data-width'),
              height: lazyImage.getAttribute('data-height'),
              format: lazyImage.getAttribute('data-format') || 'webp',
              quality: lazyImage.getAttribute('data-quality') || 80,
              responsive: lazyImage.hasAttribute('data-responsive')
            });
            
            // Stop observing the image
            imageObserver.unobserve(lazyImage);
          }
        }
      });
    });
    
    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    document.querySelectorAll('img[data-src]').forEach(img => {
      updateImageElement(img, {
        width: img.getAttribute('data-width'),
        height: img.getAttribute('data-height'),
        format: img.getAttribute('data-format') || 'webp',
        quality: img.getAttribute('data-quality') || 80,
        responsive: img.hasAttribute('data-responsive')
      });
    });
  }
}

// Export the functions
export {
  processImage,
  processMultipleImages,
  generateSrcset,
  updateImageElement,
  initLazyLoading
}; 