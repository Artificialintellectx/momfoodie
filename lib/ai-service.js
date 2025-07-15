/**
 * AI Service for generating personalized meal suggestions
 * Uses OpenAI API to create custom meal recommendations
 */

import { jsonrepair } from 'jsonrepair'

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

  const prompt = createEnhancedMealPrompt(mealType, dietaryPreference, cuisine, ingredients)

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
          content: 'You are an expert culinary assistant specializing in diverse, creative, and delicious meal suggestions. You have extensive knowledge of global cuisines, cooking techniques, and dietary requirements. Always provide unique, varied suggestions that are practical and flavorful. Respond with ONLY valid JSON in the exact format specified.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8, // Increased for more creativity
      max_tokens: 1200, // Increased for more detailed responses
      presence_penalty: 0.3, // Encourages more diverse content
      frequency_penalty: 0.5 // Reduces repetition
    })
  })

  const data = await response.json()
  let content = data.choices[0].message.content.trim();
  try {
    content = jsonrepair(content);
    const mealSuggestion = JSON.parse(content);
    return {
      name: mealSuggestion.name,
      description: mealSuggestion.description,
      prep_time: mealSuggestion.prep_time,
      ingredients: mealSuggestion.ingredients,
      instructions: mealSuggestion.instructions || [],
      nutrition_info: mealSuggestion.nutrition_info || {},
      difficulty: mealSuggestion.difficulty || 'Medium',
      cuisine: mealSuggestion.cuisine || cuisine || 'Mixed',
      is_ai_generated: true,
      tags: mealSuggestion.tags || [],
      serving_size: mealSuggestion.serving_size || '2-4 people',
      estimated_cost: mealSuggestion.estimated_cost || 'Moderate'
    }
  } catch (error) {
    console.error('AI suggestion generation failed:', error, content)
    throw new Error('Failed to generate AI suggestion. Please try again.')
  }
}

/**
 * Generate multiple diverse AI suggestions
 * @param {string} mealType - breakfast, lunch, or dinner
 * @param {string} dietaryPreference - dietary restrictions
 * @param {string} cuisine - preferred cuisine (optional)
 * @param {string} ingredients - available ingredients (optional)
 * @param {number} count - number of suggestions to generate (default: 3)
 * @returns {Promise<Array>} Array of AI-generated meal suggestions
 */
export async function generateMultipleAISuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '', count = 3) {
  const suggestions = [];
  const usedNames = new Set();
  let attempts = 0;
  const maxAttempts = count * 3; // Allow up to 3x the requested count for retries

  while (suggestions.length < count && attempts < maxAttempts) {
    attempts++;
    try {
      // Add variety by slightly modifying the prompt for each suggestion
      const varietyPrompt = createVarietyPrompt(mealType, dietaryPreference, cuisine, ingredients, attempts - 1, usedNames);

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
              content: 'You are an expert culinary assistant. Generate unique, diverse meal suggestions. Avoid repeating meal names. Be creative with fusion cuisines, seasonal ingredients, and cooking techniques. Respond with ONLY valid JSON.'
            },
            {
              role: 'user',
              content: varietyPrompt
            }
          ],
          temperature: 0.9, // High creativity for variety
          max_tokens: 1200,
          presence_penalty: 0.6, // High penalty to avoid repetition
          frequency_penalty: 0.8
        })
      });

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      try {
        content = jsonrepair(content);
        const mealSuggestion = JSON.parse(content);
        // Check if this meal name is unique
        if (!usedNames.has(mealSuggestion.name.toLowerCase())) {
          usedNames.add(mealSuggestion.name.toLowerCase());
          suggestions.push({
            name: mealSuggestion.name,
            description: mealSuggestion.description,
            prep_time: mealSuggestion.prep_time,
            ingredients: mealSuggestion.ingredients,
            instructions: mealSuggestion.instructions || [],
            nutrition_info: mealSuggestion.nutrition_info || {},
            difficulty: mealSuggestion.difficulty || 'Medium',
            cuisine: mealSuggestion.cuisine || cuisine || 'Mixed',
            is_ai_generated: true,
            tags: mealSuggestion.tags || [],
            serving_size: mealSuggestion.serving_size || '2-4 people',
            estimated_cost: mealSuggestion.estimated_cost || 'Moderate'
          });
        }
      } catch (error) {
        console.error(`Failed to generate suggestion ${suggestions.length + 1}:`, error, content);
      }
    } catch (error) {
      console.error(`Failed to generate suggestion ${suggestions.length + 1}:`, error);
    }
  }

  return suggestions;
}

/**
 * Create an enhanced prompt for meal generation with more variety
 */
function createEnhancedMealPrompt(mealType, dietaryPreference, cuisine, ingredients) {
  const dietaryInfo = {
    'any': 'no dietary restrictions',
    'vegetarian': 'vegetarian (no meat or fish)',
    'vegan': 'vegan (plant-based only)',
    'gluten-free': 'gluten-free',
    'low-carb': 'low-carbohydrate',
    'high-protein': 'high-protein'
  };

  const cuisineInfo = cuisine ? `preferably ${cuisine} cuisine` : 'any global cuisine';
  const ingredientsInfo = ingredients ? `using these available ingredients: ${ingredients}` : '';
  
  const seasonalIngredients = getSeasonalIngredients();
  const cookingTechniques = getCookingTechniques(mealType);

  return `Generate a creative and diverse meal suggestion for ${mealType} that is ${dietaryInfo[dietaryPreference] || dietaryPreference}, ${cuisineInfo}. ${ingredientsInfo}

Consider these elements for variety:
- Seasonal ingredients: ${seasonalIngredients}
- Cooking techniques: ${cookingTechniques}
- Fusion cuisines and modern twists
- Different flavor profiles (spicy, sweet, savory, tangy, umami)
- Various textures (crispy, creamy, chewy, tender)
- Colorful and visually appealing dishes

Please respond with ONLY a valid JSON object in this exact format:
{
  "name": "Creative and unique meal name",
  "description": "Detailed description explaining the flavors, textures, and why it's perfect for this occasion",
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
  "cuisine": "cuisine type",
  "tags": ["tag1", "tag2", "tag3"],
  "serving_size": "number of people",
  "estimated_cost": "Low/Moderate/High"
}

Make the suggestion creative, practical, and delicious. Consider seasonal ingredients and cooking time appropriate for ${mealType}. Be adventurous with flavors and techniques!
Respond with ONLY valid JSON, no explanations, no markdown, no extra text, no triple backticks.`
}

/**
 * Create a variety prompt for multiple suggestions
 */
function createVarietyPrompt(mealType, dietaryPreference, cuisine, ingredients, index, usedNames) {
  const varietyHints = [
    'Try a fusion approach combining different cuisines',
    'Focus on seasonal and local ingredients',
    'Use modern cooking techniques like sous vide or air frying',
    'Create a comfort food with a gourmet twist',
    'Experiment with bold spices and herbs',
    'Make it a one-pot or sheet pan meal',
    'Add a unique sauce or condiment',
    'Use alternative grains or proteins',
    'Create a deconstructed version of a classic dish',
    'Focus on presentation and plating'
  ]

  const hint = varietyHints[index % varietyHints.length]
  const usedNamesList = Array.from(usedNames).join(', ')
  
  return `${createEnhancedMealPrompt(mealType, dietaryPreference, cuisine, ingredients)}

Variety hint: ${hint}

Important: Avoid these already used meal names: ${usedNamesList}

Make this suggestion completely different from the previous ones. Be creative and unique!`
}

/**
 * Get seasonal ingredients based on current month
 */
function getSeasonalIngredients() {
  const month = new Date().getMonth();
  const seasonal = {
    0: 'winter squash, citrus fruits, root vegetables, kale, pomegranate',
    1: 'citrus fruits, winter greens, mushrooms, sweet potatoes',
    2: 'asparagus, peas, spring onions, strawberries, rhubarb',
    3: 'artichokes, fresh herbs, spring vegetables, early berries',
    4: 'strawberries, cherries, fresh peas, spring greens',
    5: 'berries, stone fruits, summer squash, fresh herbs',
    6: 'tomatoes, corn, zucchini, peaches, basil',
    7: 'peaches, plums, tomatoes, eggplant, peppers',
    8: 'apples, pears, pumpkins, winter squash, mushrooms',
    9: 'pumpkins, apples, pears, Brussels sprouts, cranberries',
    10: 'winter squash, cranberries, pears, Brussels sprouts',
    11: 'citrus fruits, winter squash, root vegetables, pomegranate'
  }
  return seasonal[month] || 'fresh seasonal ingredients';
}

/**
 * Get cooking techniques based on meal type
 */
function getCookingTechniques(mealType) {
  const techniques = {
    'breakfast': 'poaching, scrambling, baking, grilling, slow cooking',
    'lunch': 'stir-frying, grilling, baking, slow cooking, pressure cooking',
    'dinner': 'braising, roasting, grilling, slow cooking, sous vide, air frying'
  };
  return techniques[mealType] || 'various cooking techniques';
} 