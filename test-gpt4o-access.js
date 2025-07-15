// Test script to check GPT-4o access
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

async function testGPT4oAccess() {
  if (!OPENAI_API_KEY) {
    console.log('❌ No API key found. Please set NEXT_PUBLIC_OPENAI_API_KEY');
    return;
  }

  console.log('🔍 Testing GPT-4o access...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello! GPT-4o is working!"'
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ GPT-4o access confirmed!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ GPT-4o access denied');
      console.log('Error:', data.error?.message || 'Unknown error');
      console.log('Error code:', data.error?.code);
      
      if (data.error?.code === 'model_not_found') {
        console.log('💡 This usually means you need to subscribe to GPT-4o');
      } else if (data.error?.code === 'insufficient_quota') {
        console.log('💡 You may need to add billing information');
      }
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Also test GPT-3.5-turbo as a fallback
async function testGPT35Access() {
  console.log('\n🔍 Testing GPT-3.5-turbo access...');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello! GPT-3.5-turbo is working!"'
          }
        ],
        max_tokens: 50
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ GPT-3.5-turbo access confirmed!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ GPT-3.5-turbo access denied');
      console.log('Error:', data.error?.message || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testGPT4oAccess();
  await testGPT35Access();
}

runTests(); 