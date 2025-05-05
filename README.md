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

## Navigation & Accessibility Updates

The site has been updated with standardized navigation and improved accessibility:

- **Standardized Navigation**: All pages now use the same navigation order and consistent URLs.
- **Mobile Navigation**: All pages now support a responsive mobile menu toggle.
- **Active Link Highlighting**: Current page links are highlighted and include `aria-current` attributes.
- **Skip Links**: All pages now include a skip-to-content link for keyboard users.
- **Breadcrumbs**: Subpages now include breadcrumb navigation for improved orientation.
- **URL Casing**: All URLs now use uppercase for consistency (e.g., `Store.html` not `store.html`).

### Usage Information

#### Navigation Component
The site uses a shared navigation component that adds:
- Mobile navigation toggle
- Active link highlighting
- Skip to content links
- Breadcrumb navigation

This is automatically initialized when pages load.

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

## Contact Form Implementation

The contact forms across the site now use a real backend service instead of simulating submissions:

- Implemented with Nodemailer for sending emails
- Server endpoint `/api/contact` handles submissions
- Error handling and validation for all submissions
- User feedback for successful/failed submissions
- Email confirmation sent to submitters
- Contact details logged as backup

### Configuration

To set up the contact form:

1. Install required dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   # Email Configuration
   SMTP_HOST=your.smtp.server
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_password
   
   # Contact Form Configuration
   CONTACT_FROM="AeroVista Website <no-reply@aerovista.us>"
   CONTACT_TO=recipient@example.com
   ```

3. Start the server:
   ```
   npm start
   ```

The contact form will automatically send submissions to the configured email address. 