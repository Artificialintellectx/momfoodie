/**
 * Feedback Service - Multiple options for receiving user feedback
 */

// Option 1: EmailJS Integration (Recommended for simple setup)
export async function sendFeedbackEmail(feedbackData) {
  // You'll need to install EmailJS: npm install @emailjs/browser
  // And set up your EmailJS account at https://www.emailjs.com/
  
  try {
    const { load } = await import('@emailjs/browser');
    await load('YOUR_EMAILJS_PUBLIC_KEY'); // Replace with your EmailJS public key
    
    const { send } = await import('@emailjs/browser');
    
    const result = await send(
      'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
      {
        message: feedbackData.message,
        timestamp: feedbackData.timestamp,
        user_agent: feedbackData.userAgent,
        page_url: feedbackData.url,
        to_email: 'your-email@example.com' // Your email address
      },
      'YOUR_EMAILJS_PUBLIC_KEY' // Replace with your EmailJS public key
    );
    
    return result;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
}

// Option 2: Supabase Database Integration
export async function sendFeedbackToDatabase(feedbackData) {
  // You'll need to set up Supabase and create a feedback table
  // Table structure: id, message, timestamp, user_agent, url, created_at
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        message: feedbackData.message,
        timestamp: feedbackData.timestamp,
        user_agent: feedbackData.userAgent,
        url: feedbackData.url
      }]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase error:', error);
    throw error;
  }
}

// Option 3: Webhook Integration (Zapier, Make.com, etc.)
export async function sendFeedbackToWebhook(feedbackData) {
  // Set up a webhook in Zapier, Make.com, or similar service
  // They'll give you a URL to send data to
  
  try {
    const response = await fetch('YOUR_WEBHOOK_URL', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

// Option 4: Simple API Route (if you want to handle it server-side)
export async function sendFeedbackToAPI(feedbackData) {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}

// Option 5: Google Forms Integration (Free and easy)
export async function sendFeedbackToGoogleForms(feedbackData) {
  // Create a Google Form and get the pre-filled URL
  // This is the simplest option - no setup required
  
  try {
    const formUrl = 'YOUR_GOOGLE_FORM_URL'; // Replace with your Google Form URL
    const encodedMessage = encodeURIComponent(feedbackData.message);
    const encodedTimestamp = encodeURIComponent(feedbackData.timestamp);
    
    // Open Google Form in new tab with pre-filled data
    window.open(`${formUrl}?entry.123456789=${encodedMessage}&entry.987654321=${encodedTimestamp}`, '_blank');
    
    return { success: true };
  } catch (error) {
    console.error('Google Forms error:', error);
    throw error;
  }
} 