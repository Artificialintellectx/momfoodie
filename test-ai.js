// Simple test for AI service
import { generateAIMealSuggestion } from './lib/ai-service.js'

async function testAI() {
  try {
    console.log('Testing AI meal suggestion...')
    const suggestion = await generateAIMealSuggestion('breakfast', 'vegetarian', 'Nigerian')
    console.log('AI Suggestion:', JSON.stringify(suggestion, null, 2))
  } catch (error) {
    console.error('AI Test failed:', error.message)
  }
}

testAI() 