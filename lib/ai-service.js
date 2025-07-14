/**
 * AI Service for generating personalized meal suggestions
 * Uses OpenAI API to create custom meal recommendations
 */

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

/**
 * Generate AI-powered meal suggestion
 * @param {string} mealType - breakfast, lunch, or dinner
 * @param {string} dietaryPreference - dietary restrictions
 * @param {string} cuisine - preferred cuisine (optional)
 * @param {string} ingredients - available ingredients (optional)
 * @returns {Promise<Object>} AI-generated meal suggestion
 */
export async function generateAIMealSuggestion(mealType, dietaryPreference, cuisine = '', ingredients = '') {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = createMealPrompt(mealType, dietaryPreference, cuisine, ingredients)

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
            role: 'system',
            content: 'You are a helpful cooking assistant that provides detailed meal suggestions. Always respond with valid JSON in the exact format specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Parse the JSON response
    const mealSuggestion = JSON.parse(content)
    
    return {
      name: mealSuggestion.name,
      description: mealSuggestion.description,
      prep_time: mealSuggestion.prep_time,
      ingredients: mealSuggestion.ingredients,
      instructions: mealSuggestion.instructions || [],
      nutrition_info: mealSuggestion.nutrition_info || {},
      difficulty: mealSuggestion.difficulty || 'Medium',
      cuisine: mealSuggestion.cuisine || cuisine || 'Mixed',
      is_ai_generated: true
    }
  } catch (error) {
    console.error('AI suggestion generation failed:', error)
    throw new Error('Failed to generate AI suggestion. Please try again.')
  }
}

/**
 * Create a detailed prompt for meal generation
 */
function createMealPrompt(mealType, dietaryPreference, cuisine, ingredients) {
  const dietaryInfo = {
    'any': 'no dietary restrictions',
    'vegetarian': 'vegetarian (no meat or fish)',
    'vegan': 'vegan (plant-based only)',
    'gluten-free': 'gluten-free',
    'low-carb': 'low-carbohydrate',
    'high-protein': 'high-protein'
  }

  const cuisineInfo = cuisine ? `preferably ${cuisine} cuisine` : 'any cuisine'
  const ingredientsInfo = ingredients ? `using these available ingredients: ${ingredients}` : ''

  return `Generate a detailed meal suggestion for ${mealType} that is ${dietaryInfo[dietaryPreference] || dietaryPreference}, ${cuisineInfo}. ${ingredientsInfo}

Please respond with ONLY a valid JSON object in this exact format:
{
  "name": "Creative meal name",
  "description": "Detailed description of the meal and why it's perfect for this occasion",
  "prep_time": "X mins",
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "nutrition_info": {
    "calories": "approximate calories",
    "protein": "protein content",
    "carbs": "carbohydrate content",
    "fat": "fat content"
  },
  "difficulty": "Easy/Medium/Hard",
  "cuisine": "cuisine type"
}

Make the suggestion creative, practical, and delicious. Consider seasonal ingredients and cooking time appropriate for ${mealType}.`
}

/**
 * Generate multiple AI suggestions
 * @param {string} mealType - breakfast, lunch, or dinner
 * @param {string} dietaryPreference - dietary restrictions
 * @param {number} count - number of suggestions to generate
 * @returns {Promise<Array>} Array of AI-generated meal suggestions
 */
export async function generateMultipleAISuggestions(mealType, dietaryPreference, count = 3) {
  const suggestions = []
  
  for (let i = 0; i < count; i++) {
    try {
      const suggestion = await generateAIMealSuggestion(mealType, dietaryPreference)
      suggestions.push(suggestion)
    } catch (error) {
      console.error(`Failed to generate suggestion ${i + 1}:`, error)
    }
  }
  
  return suggestions
} 