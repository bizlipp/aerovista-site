# AeroVista Image Processing with Sharp

This project implements a local, high-performance image processing pipeline using [Sharp](https://github.com/lovell/sharp), a high-performance Node.js image processing library.

## Features

- On-demand image processing with Sharp
- WebP, JPEG, PNG, and AVIF output format support
- Responsive image generation with srcset
- Image resizing, quality adjustment, and basic transformations
- Lazy loading support
- Image caching for performance
- REST API for image processing

## Implementation

### Server-Side

The server-side implementation consists of:

1. **Image Processor**: Handles image downloading, processing, and caching using Sharp
2. **Express Server**: Provides REST endpoints for image processing

### Client-Side

The client-side implementation includes:

1. **Image Utility**: Client-side library for interacting with the image processing API
2. **Lazy Loading**: Only loads images when they come into view
3. **Responsive Images**: Generates appropriate sizes for different screen sizes

## Usage

### In HTML

```html
<img 
  data-src="https://example.com/image.jpg" 
  data-width="600" 
  data-height="400" 
  data-format="webp" 
  data-quality="85" 
  data-responsive 
  alt="Description" 
  loading="lazy"
  width="600"
  height="400">
```

### In JavaScript

```javascript
import { processImage, updateImageElement } from './src/imageUtil.js';

// Process an image URL
const processedImageUrl = await processImage('https://example.com/image.jpg', {
  width: 800,
  height: 600,
  format: 'webp',
  quality: 85,
  direct: true
});

// Update an existing image element
const imgElement = document.querySelector('img');
await updateImageElement(imgElement, {
  width: 800,
  height: 600,
  format: 'webp',
  quality: 85,
  responsive: true
});
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### GET /api/image

Returns JSON metadata for a processed image.

**Parameters:**
- `src`: Source image URL (required)
- `width`: Target width in pixels
- `height`: Target height in pixels
- `format`: Output format (webp, jpeg, png, avif)
- `quality`: Output quality (1-100)
- `blur`: Apply blur (true or blur amount)

### GET /api/image-direct

Returns the processed image directly.

**Parameters:** Same as `/api/image` 