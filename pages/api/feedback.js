/**
 * API route to handle feedback submissions
 * You can extend this to send emails, store in database, etc.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, timestamp, userAgent, url } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Log the feedback (for development)
    console.log('Feedback received:', {
      message,
      timestamp,
      userAgent,
      url,
      receivedAt: new Date().toISOString()
    });

    // Check if email environment variables are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email environment variables not configured. Skipping email notification.');
      // Still return success to user, but log the warning
      return res.status(200).json({ 
        success: true, 
        message: 'Feedback received successfully (email notification not configured)',
        timestamp: new Date().toISOString()
      });
    }

    // Send email notification
    const emailResult = await sendEmailNotification({ message, timestamp, userAgent, url });

    // Return success
    res.status(200).json({ 
      success: true, 
      message: emailResult.success ? 'Feedback received and email sent successfully' : 'Feedback received (email failed)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process feedback' 
    });
  }
}

// Email function using nodemailer
async function sendEmailNotification(feedbackData) {
  try {
    // Check if nodemailer is available
    const nodemailer = require('nodemailer');
    
    console.log('Attempting to send email notification...');
    console.log('Email user:', process.env.EMAIL_USER ? 'Configured' : 'Not configured');
    console.log('Email pass:', process.env.EMAIL_PASS ? 'Configured' : 'Not configured');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'New Feedback from Mummyfoodie',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">🍽️ New Feedback from Mummyfoodie</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Feedback Message:</h3>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${feedbackData.message}</p>
          </div>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 14px; color: #6b7280;">
            <p><strong>Time:</strong> ${new Date(feedbackData.timestamp).toLocaleString()}</p>
            <p><strong>User Agent:</strong> ${feedbackData.userAgent}</p>
            <p><strong>Page URL:</strong> ${feedbackData.url}</p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            This feedback was automatically sent from your Mummyfoodie app.
          </p>
        </div>
      `
    });
    
    console.log('Feedback email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send feedback email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    // Don't throw error - we still want to return success to user
    // but log the email failure
    return { success: false, error: error.message };
  }
} 