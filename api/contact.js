/**
 * Contact Form API Endpoint
 * Handles form submissions from the website's contact forms
 */

// Import required modules (Node.js implementation)
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Configure email transport (replace with actual SMTP config)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

// Fallback file storage for contact form submissions
const SUBMISSIONS_DIR = path.join(__dirname, '../data/submissions');

// Create submissions directory if it doesn't exist
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(SUBMISSIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create submissions directory:', error);
  }
}

// Store submission in file (fallback if email fails)
async function storeSubmission(data) {
  try {
    await ensureDirectoryExists();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${data.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
    const filepath = path.join(SUBMISSIONS_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to store submission:', error);
    return false;
  }
}

// Send email notification
async function sendEmailNotification(data) {
  try {
    const { name, email, message, page } = data;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'website@aerovista.us',
      to: process.env.EMAIL_TO || 'contact@aerovista.us',
      subject: `New contact form submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Page: ${page || 'Not specified'}

Message:
${message}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Page:</strong> ${page || 'Not specified'}</p>
<h3>Message:</h3>
<p>${message.replace(/\n/g, '<br>')}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

// Contact form submission handler
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message, page } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Store submission data
    const timestamp = new Date().toISOString();
    const submissionData = {
      name,
      email,
      message,
      page,
      timestamp,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    // Try to send email
    const emailSent = await sendEmailNotification(submissionData);
    
    // Always store submission as backup
    const stored = await storeSubmission(submissionData);
    
    // Return success if either method worked
    if (emailSent || stored) {
      return res.status(200).json({
        success: true,
        message: 'Form submission received successfully'
      });
    } else {
      throw new Error('Failed to process submission');
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing your submission'
    });
  }
});

module.exports = router; 