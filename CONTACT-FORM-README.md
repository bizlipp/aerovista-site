# AeroVista Contact Form System

This document explains the contact form implementation across the AeroVista website. The system has been standardized to ensure consistent behavior, accessibility, and functionality across all pages.

## Contact Form Structure

All contact forms across the website follow this standard structure:

```html
<section id="contact" class="container section-md" aria-labelledby="contact-heading">
  <h2 id="contact-heading">Get in Touch</h2>
  <form id="contactForm" class="form-group" role="form" aria-label="Contact form">
    <input class="form-control mb-sm" required type="text" placeholder="Your Name" aria-label="Your name" />
    <input class="form-control mb-sm" required type="email" placeholder="Email" aria-label="Your email address" />
    <textarea class="form-control mb-md" required rows="5" placeholder="Your Message" aria-label="Your message"></textarea>
    <button class="btn" type="submit">Send Message</button>
  </form>
</section>
```

## Key Features

1. **Standardized HTML Structure**: All forms use the same HTML structure and CSS classes
2. **Accessibility Support**: ARIA labels and roles for screen readers
3. **Client-side Validation**: Required fields and email format validation
4. **Server-side Processing**: Submissions processed by the `/api/contact` API endpoint
5. **Fallback Mechanism**: Submissions stored locally if email sending fails

## How It Works

### Client-Side (Browser)

1. User fills out the contact form
2. JavaScript in `main.js` handles the form submission through the `initContactForm()` function
3. Form data is validated
4. On valid submission, data is sent to the server via a POST request to `/api/contact`
5. Success/error messages are displayed to the user

### Server-Side (Node.js)

1. Express server handles the incoming request
2. Validates submitted data
3. Attempts to send email notification
4. Stores submission data as a backup
5. Returns success/error response to the client

## Configuration

### Email Settings

Configure email settings in a `.env` file at the project root:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
EMAIL_FROM=website@aerovista.us
EMAIL_TO=contact@aerovista.us
```

### Data Storage

Contact form submissions are stored in the `data/submissions` directory as JSON files (as a backup mechanism).

## Adding a Contact Form to a New Page

1. Copy the standard HTML structure
2. Customize placeholder text and headings as needed
3. Ensure the form has the ID `contactForm`
4. Keep all ARIA attributes for accessibility

## Troubleshooting

If contact form submissions are not working:

1. Check browser console for JavaScript errors
2. Verify the form has the correct ID: `contactForm`
3. Ensure the server is running (`npm start`)
4. Check server logs for errors
5. Verify email configuration in `.env` file

## Security Considerations

- All inputs are validated on both client and server sides
- The server uses Helmet for security headers
- Rate limiting prevents abuse
- Sensitive data is not stored in logs 