/**
 * AI Service for generating personalized meal suggestions
 * Uses OpenAI API to create custom meal recommendations
 * Enhanced with knowledge from All Nigerian Recipes (allnigerianrecipes.com)
 */

import { jsonrepair } from 'jsonrepair'
import { getAIConfig, isDebugLoggingEnabled } from './config'

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

  const aiConfig = getAIConfig();
  
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
          role: 'system',
          content: `You are an expert culinary assistant specializing in authentic Nigerian and African cooking traditions. You have deep knowledge from All Nigerian Recipes (allnigerianrecipes.com) and understand the cultural significance of food in Nigerian communities. You can create authentic, culturally-specific meal suggestions that respect traditional cooking methods, ingredients, and cultural dietary preferences. Always provide unique, varied suggestions that are practical, flavorful, and culturally authentic. Avoid repeating meal names. 

CRITICAL: You must provide accurate, detailed, and safe cooking instructions that users can trust to cook safely at home. Your instructions should include:
- Specific cooking times and temperatures
- Clear step-by-step procedures
- Food safety guidelines
- Visual and sensory cues for doneness
- Traditional Nigerian cooking techniques
- Equipment and ingredient preparation steps

CRITICAL: You must respond with ONLY valid JSON that can be parsed by JSON.parse(). No extra text, no markdown, no code blocks, no explanations. The response must start with { and end with }. All strings must be properly quoted with single double quotes, not double double quotes.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: aiConfig.TEMPERATURE,
      max_tokens: aiConfig.MAX_TOKENS,
      presence_penalty: 0.3, // Encourages more diverse content
      frequency_penalty: 0.5 // Reduces repetition
    })
  })

  const data = await response.json()
  let content = data.choices[0].message.content.trim();
  
  try {
    const mealSuggestion = parseAIResponse(content);
    return {
      name: mealSuggestion.name,
      description: mealSuggestion.description,
      prep_time: mealSuggestion.prep_time,
      ingredients: mealSuggestion.ingredients,
      instructions: mealSuggestion.instructions || generateDefaultInstructions(mealSuggestion),
      nutrition_info: mealSuggestion.nutrition_info || generateNutritionInfo(mealSuggestion),
      difficulty: mealSuggestion.difficulty || estimateDifficulty(mealSuggestion),
      cuisine: mealSuggestion.cuisine || cuisine || 'Mixed',
      is_ai_generated: true,
      tags: mealSuggestion.tags || generateTags(mealSuggestion),
      serving_size: mealSuggestion.serving_size || estimateServingSize(mealSuggestion),
      estimated_cost: mealSuggestion.estimated_cost || estimateCost(mealSuggestion)
    }
  } catch (error) {
    if (isDebugLoggingEnabled()) {
      console.error('AI suggestion generation failed:', error, content);
    }
    throw new Error('Failed to generate AI suggestion. Please try again.');
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
  const aiConfig = getAIConfig();
  const maxAttempts = Math.min(count * 2, aiConfig.MAX_ATTEMPTS); // Use config for max attempts
  const startTime = Date.now();
  const maxTime = aiConfig.MAX_GENERATION_TIME; // Use config for max time

  while (suggestions.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Check for timeout
    if (Date.now() - startTime > maxTime) {
      if (isDebugLoggingEnabled()) {
        console.log('AI generation timeout, using fallback suggestions');
      }
      break;
    }
    
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
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert culinary assistant specializing in authentic Nigerian and African cooking traditions. You have deep knowledge from All Nigerian Recipes (allnigerianrecipes.com) and understand the cultural significance of food in Nigerian communities. You can create authentic, culturally-specific meal suggestions that respect traditional cooking methods, ingredients, and cultural dietary preferences. Always provide unique, varied suggestions that are practical, flavorful, and culturally authentic. Avoid repeating meal names. 

CRITICAL: You must provide accurate, detailed, and safe cooking instructions that users can trust to cook safely at home. Your instructions should include:
- Specific cooking times and temperatures
- Clear step-by-step procedures
- Food safety guidelines
- Visual and sensory cues for doneness
- Traditional Nigerian cooking techniques
- Equipment and ingredient preparation steps

CRITICAL: You must respond with ONLY valid JSON that can be parsed by JSON.parse(). No extra text, no markdown, no code blocks, no explanations. The response must start with { and end with }. All strings must be properly quoted with single double quotes, not double double quotes.`
            },
            {
              role: 'user',
              content: varietyPrompt
            }
          ],
          temperature: 0.7, // Reduced for more consistent, faster generation
          max_tokens: 800, // Reduced for faster response
          presence_penalty: 0.4, // Reduced for faster generation
          frequency_penalty: 0.6 // Reduced for faster generation
        })
      });

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        if (isDebugLoggingEnabled()) {
          console.error('Invalid AI response structure:', data);
        }
        continue;
      }
      
      let content = data.choices[0].message.content.trim();
      
      try {
        let mealSuggestion = parseAIResponse(content);
        
        // Validate that the meal suggestion has required fields
        if (!mealSuggestion || !mealSuggestion.name || typeof mealSuggestion.name !== 'string') {
          if (isDebugLoggingEnabled()) {
            console.error(`Invalid meal suggestion structure:`, mealSuggestion);
          }
          continue;
        }
        
        // Normalize the meal suggestion object
        mealSuggestion = normalizeMealSuggestion(mealSuggestion);
        
        // Check if this meal name is unique
        const mealName = mealSuggestion.name.toLowerCase();
        if (!usedNames.has(mealName)) {
          usedNames.add(mealName);
          suggestions.push({
            ...mealSuggestion,
            is_ai_generated: true
          });
        }
      } catch (error) {
        if (isDebugLoggingEnabled()) {
          console.error(`Failed to parse suggestion ${suggestions.length + 1}:`, error);
          console.error('Raw content:', data.choices[0].message.content);
        }
      }
    } catch (error) {
      if (isDebugLoggingEnabled()) {
        console.error(`Failed to generate suggestion ${suggestions.length + 1}:`, error);
      }
    }
  }

  // If we couldn't generate enough suggestions, supplement with fallback suggestions
  if (suggestions.length < count) {
    if (isDebugLoggingEnabled()) {
      console.log(`Generated ${suggestions.length}/${count} AI suggestions, supplementing with fallback`);
    }
    const fallbackSuggestions = getFallbackSuggestions(mealType, dietaryPreference, count - suggestions.length);
    
    // Combine AI and fallback suggestions
    const combinedSuggestions = [...suggestions, ...fallbackSuggestions];
    
    // Ensure we don't exceed the requested count
    return combinedSuggestions.slice(0, count);
  }

  return suggestions;
}

/**
 * Normalize meal suggestion object to ensure consistent structure
 * @param {Object} mealSuggestion - Raw meal suggestion object
 * @returns {Object} Normalized meal suggestion object
 */
function normalizeMealSuggestion(mealSuggestion) {
  return {
    name: mealSuggestion.name || 'Nigerian Meal',
    description: mealSuggestion.description || 'A delicious Nigerian meal',
    prep_time: mealSuggestion.prep_time || '30 mins',
    ingredients: Array.isArray(mealSuggestion.ingredients) ? mealSuggestion.ingredients : [],
    instructions: Array.isArray(mealSuggestion.instructions) ? mealSuggestion.instructions : generateDefaultInstructions(mealSuggestion),
    nutrition_info: mealSuggestion.nutrition_info || generateNutritionInfo(mealSuggestion),
    difficulty: mealSuggestion.difficulty || mealSuggestion.difficulty_ || estimateDifficulty(mealSuggestion),
    cuisine: mealSuggestion.cuisine || mealSuggestion.cuisine_ || 'Nigerian',
    tags: Array.isArray(mealSuggestion.tags) ? mealSuggestion.tags : 
          Array.isArray(mealSuggestion.tags_text) ? mealSuggestion.tags_text : generateTags(mealSuggestion),
    serving_size: mealSuggestion.serving_size || estimateServingSize(mealSuggestion),
    estimated_cost: mealSuggestion.estimated_cost || estimateCost(mealSuggestion)
  };
}



/**
 * Create a fallback meal suggestion when all parsing fails
 * @param {string} mealType - breakfast, lunch, or dinner
 * @param {string} dietaryPreference - dietary restrictions
 * @param {string} cuisine - cultural cuisine
 * @returns {Object} Fallback meal suggestion
 */
function createFallbackMealSuggestion(mealType, dietaryPreference, cuisine) {
  const culturalMeals = {
    'yoruba': {
      breakfast: { name: 'Ogi and Akara', description: 'Traditional Yoruba breakfast with corn pap and bean fritters' },
      lunch: { name: 'Amala and Ewedu', description: 'Yoruba staple with yam flour and jute leaf soup' },
      dinner: { name: 'Efo Riro', description: 'Traditional Yoruba vegetable stew' }
    },
    'igbo': {
      breakfast: { name: 'Akamu and Bread', description: 'Traditional Igbo breakfast with corn pap' },
      lunch: { name: 'Ofe Onugbu', description: 'Igbo bitterleaf soup with traditional spices' },
      dinner: { name: 'Abacha and Ugba', description: 'Traditional Igbo African salad' }
    },
    'hausa': {
      breakfast: { name: 'Fura da Nono', description: 'Traditional Hausa breakfast with millet and milk' },
      lunch: { name: 'Tuwo Shinkafa', description: 'Hausa rice pudding with traditional soup' },
      dinner: { name: 'Suya', description: 'Spiced grilled meat, a Hausa specialty' }
    },
    'edo': {
      breakfast: { name: 'Ogi and Akara', description: 'Traditional Edo breakfast' },
      lunch: { name: 'Bini Soup', description: 'Traditional Edo soup with local herbs' },
      dinner: { name: 'Owo Soup', description: 'Rich Edo soup with palm oil' }
    },
    'ibibio': {
      breakfast: { name: 'Ogi and Bread', description: 'Traditional Ibibio breakfast' },
      lunch: { name: 'Afang Soup', description: 'Traditional Ibibio soup with afang leaves' },
      dinner: { name: 'Edikang Ikong', description: 'Traditional Ibibio vegetable soup' }
    },
    'ijaw': {
      breakfast: { name: 'Ogi and Fish', description: 'Traditional Ijaw breakfast' },
      lunch: { name: 'Banga Soup', description: 'Traditional Ijaw palm nut soup' },
      dinner: { name: 'Bole', description: 'Roasted plantain with fish' }
    },
    'nupe': {
      breakfast: { name: 'Fura da Nono', description: 'Traditional Nupe breakfast' },
      lunch: { name: 'Miyan Kuka', description: 'Traditional Nupe baobab soup' },
      dinner: { name: 'Dambu Nama', description: 'Traditional Nupe shredded meat' }
    },
    'kanuri': {
      breakfast: { name: 'Fura da Nono', description: 'Traditional Kanuri breakfast' },
      lunch: { name: 'Miyan Kuka', description: 'Traditional Kanuri baobab soup' },
      dinner: { name: 'Kilishi', description: 'Traditional Kanuri dried meat' }
    },
    'fulani': {
      breakfast: { name: 'Fura da Nono', description: 'Traditional Fulani breakfast with dairy' },
      lunch: { name: 'Tuwo', description: 'Traditional Fulani staple with soup' },
      dinner: { name: 'Miyan Kuka', description: 'Traditional Fulani baobab soup' }
    },
    'tiv': {
      breakfast: { name: 'Fura da Nono', description: 'Traditional Tiv breakfast' },
      lunch: { name: 'Miyan Kuka', description: 'Traditional Tiv baobab soup' },
      dinner: { name: 'Dambu Nama', description: 'Traditional Tiv shredded meat' }
    }
  };

  const meal = culturalMeals[cuisine]?.[mealType] || {
    breakfast: { name: 'Traditional Nigerian Breakfast', description: 'A hearty Nigerian breakfast' },
    lunch: { name: 'Traditional Nigerian Lunch', description: 'A delicious Nigerian lunch' },
    dinner: { name: 'Traditional Nigerian Dinner', description: 'A comforting Nigerian dinner' }
  }[mealType];

  return {
    name: meal.name,
    description: meal.description,
    prep_time: '45 mins',
    ingredients: ['Traditional ingredients', 'Palm oil', 'Pepper', 'Onions'],
    instructions: ['Prepare traditional ingredients', 'Cook with authentic methods', 'Serve hot'],
    nutrition_info: { calories: '400', protein: '15g', carbs: '60g', fat: '18g' },
    difficulty: 'Medium',
    cuisine: `${cuisine} cuisine`,
    tags: ['Traditional', 'Cultural', mealType],
    serving_size: '3-4 people',
    estimated_cost: 'Moderate'
  };
}



/**
 * Get fallback suggestions when AI generation fails
 */
function getFallbackSuggestions(mealType, dietaryPreference, count) {
  const fallbackSuggestions = [
    {
      name: 'Traditional Nigerian Breakfast',
      description: 'A hearty Nigerian breakfast with pap and akara',
      prep_time: '30 mins',
      ingredients: ['Corn flour', 'Black-eyed peas', 'Onions', 'Pepper', 'Palm oil'],
      instructions: ['Prepare pap with corn flour', 'Make akara with beans', 'Serve hot'],
      nutrition_info: { calories: '350', protein: '12g', carbs: '55g', fat: '15g' },
      difficulty: 'Medium',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Breakfast'],
      serving_size: '2 people',
      estimated_cost: 'Low',
      is_ai_generated: true
    },
    {
      name: 'Nigerian Lunch Special',
      description: 'Delicious Nigerian lunch with rice and stew',
      prep_time: '45 mins',
      ingredients: ['Rice', 'Tomatoes', 'Beef', 'Onions', 'Palm oil', 'Seasoning'],
      instructions: ['Cook rice', 'Prepare tomato stew', 'Serve together'],
      nutrition_info: { calories: '500', protein: '20g', carbs: '70g', fat: '22g' },
      difficulty: 'Medium',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Lunch'],
      serving_size: '4 people',
      estimated_cost: 'Moderate',
      is_ai_generated: true
    },
    {
      name: 'Nigerian Dinner Delight',
      description: 'Comforting Nigerian dinner with yam and sauce',
      prep_time: '35 mins',
      ingredients: ['White yam', 'Tomatoes', 'Onions', 'Pepper', 'Vegetable oil'],
      instructions: ['Boil yam', 'Prepare sauce', 'Serve hot'],
      nutrition_info: { calories: '400', protein: '15g', carbs: '60g', fat: '18g' },
      difficulty: 'Easy',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Dinner'],
      serving_size: '3 people',
      estimated_cost: 'Low',
      is_ai_generated: true
    },
    {
      name: 'Egusi Soup with Pounded Yam',
      description: 'Traditional Nigerian soup with ground melon seeds and smooth pounded yam',
      prep_time: '60 mins',
      ingredients: ['Egusi seeds', 'Palm oil', 'Spinach', 'Meat', 'Yam', 'Pepper', 'Onions'],
      instructions: ['Grind egusi seeds', 'Prepare soup base', 'Pound yam', 'Serve together'],
      nutrition_info: { calories: '450', protein: '18g', carbs: '55g', fat: '20g' },
      difficulty: 'Hard',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Soup', 'Yam'],
      serving_size: '4 people',
      estimated_cost: 'Moderate',
      is_ai_generated: true
    },
    {
      name: 'Jollof Rice with Grilled Fish',
      description: 'Spicy Nigerian jollof rice served with perfectly grilled fish',
      prep_time: '50 mins',
      ingredients: ['Basmati rice', 'Tomatoes', 'Red bell peppers', 'Fish', 'Onions', 'Spices'],
      instructions: ['Prepare jollof base', 'Cook rice', 'Grill fish', 'Serve together'],
      nutrition_info: { calories: '520', protein: '25g', carbs: '75g', fat: '18g' },
      difficulty: 'Medium',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Rice', 'Fish'],
      serving_size: '4 people',
      estimated_cost: 'Moderate',
      is_ai_generated: true
    },
    {
      name: 'Amala with Ewedu and Gbegiri',
      description: 'Traditional Yoruba meal with yam flour, jute leaves, and bean soup',
      prep_time: '40 mins',
      ingredients: ['Yam flour', 'Jute leaves', 'Beans', 'Palm oil', 'Meat', 'Pepper'],
      instructions: ['Prepare amala', 'Cook ewedu', 'Make gbegiri', 'Serve together'],
      nutrition_info: { calories: '480', protein: '16g', carbs: '68g', fat: '19g' },
      difficulty: 'Medium',
      cuisine: 'Yoruba Traditional',
      tags: ['Traditional', 'Yoruba', 'Soup'],
      serving_size: '3 people',
      estimated_cost: 'Low',
      is_ai_generated: true
    },
    {
      name: 'Abacha and Ugba',
      description: 'Traditional Igbo cassava flakes with oil bean seeds',
      prep_time: '25 mins',
      ingredients: ['Cassava flakes', 'Oil bean seeds', 'Palm oil', 'Pepper', 'Stockfish'],
      instructions: ['Soak cassava flakes', 'Prepare sauce', 'Mix together', 'Serve'],
      nutrition_info: { calories: '380', protein: '14g', carbs: '45g', fat: '16g' },
      difficulty: 'Easy',
      cuisine: 'Igbo Traditional',
      tags: ['Traditional', 'Igbo', 'Cassava'],
      serving_size: '2 people',
      estimated_cost: 'Low',
      is_ai_generated: true
    },
    {
      name: 'Tuwo Shinkafa with Miyan Kuka',
      description: 'Hausa rice pudding with baobab leaf soup',
      prep_time: '55 mins',
      ingredients: ['Rice flour', 'Baobab leaves', 'Meat', 'Palm oil', 'Pepper', 'Onions'],
      instructions: ['Prepare tuwo', 'Cook miyan kuka', 'Serve together'],
      nutrition_info: { calories: '420', protein: '17g', carbs: '62g', fat: '16g' },
      difficulty: 'Medium',
      cuisine: 'Hausa Traditional',
      tags: ['Traditional', 'Hausa', 'Soup'],
      serving_size: '4 people',
      estimated_cost: 'Low',
      is_ai_generated: true
    },
    {
      name: 'Banga Soup with Starch',
      description: 'Traditional Delta palm nut soup with cassava starch',
      prep_time: '70 mins',
      ingredients: ['Palm nuts', 'Cassava starch', 'Fish', 'Pepper', 'Onions', 'Spices'],
      instructions: ['Extract palm nut juice', 'Prepare soup', 'Make starch', 'Serve'],
      nutrition_info: { calories: '460', protein: '20g', carbs: '58g', fat: '22g' },
      difficulty: 'Hard',
      cuisine: 'Delta Traditional',
      tags: ['Traditional', 'Delta', 'Soup'],
      serving_size: '4 people',
      estimated_cost: 'Moderate',
      is_ai_generated: true
    },
    {
      name: 'Ofada Rice with Ayamase',
      description: 'Local rice with green pepper sauce and assorted meat',
      prep_time: '65 mins',
      ingredients: ['Ofada rice', 'Green peppers', 'Assorted meat', 'Palm oil', 'Onions'],
      instructions: ['Cook ofada rice', 'Prepare ayamase sauce', 'Serve together'],
      nutrition_info: { calories: '540', protein: '22g', carbs: '72g', fat: '24g' },
      difficulty: 'Medium',
      cuisine: 'Nigerian Traditional',
      tags: ['Traditional', 'Rice', 'Pepper'],
      serving_size: '4 people',
      estimated_cost: 'Moderate',
      is_ai_generated: true
    }
  ];
  
  return fallbackSuggestions.slice(0, count);
}

/**
 * Create an enhanced prompt for meal generation with comprehensive Nigerian knowledge
 */
function createEnhancedMealPrompt(mealType, dietaryPreference, cuisine, ingredients) {
  const dietaryInfo = {
    'any': 'no dietary restrictions',
    'vegetarian': 'vegetarian (no meat or fish)',
    'vegan': 'vegan (plant-based only)',
    'gluten-free': 'gluten-free',
    'low-carb': 'low-carbohydrate',
    'high-protein': 'high-protein',
    'halal': 'halal (permissible under Islamic dietary laws)',
    'no-pork': 'no pork products',
    'no-beef': 'no beef products',
    'pescatarian': 'pescatarian (fish and seafood allowed, no other meat)',
    'low-spice': 'low spice tolerance',
    'no-seafood': 'no seafood or fish',
    'traditional-nigerian': 'traditional Nigerian cuisine and cooking methods',
    'modern-nigerian': 'modern Nigerian cuisine with contemporary twists'
  };

  const cuisineInfo = cuisine ? `preferably ${cuisine} cuisine` : 'any global cuisine';
  const ingredientsInfo = ingredients ? `using these available ingredients: ${ingredients}` : '';
  
  const seasonalIngredients = getSeasonalIngredients();
  const cookingTechniques = getTraditionalCookingTechniques(mealType);
  const culturalKnowledge = getCulturalCuisineKnowledge(cuisine);
  const culturalIngredients = getCulturalIngredients(cuisine);
  const nigerianKnowledge = getNigerianRecipeKnowledge();
  const mealCategories = getNigerianMealCategories();

  let culturalPrompt = '';
  if (culturalKnowledge) {
    culturalPrompt = `

AUTHENTIC NIGERIAN CULTURAL CUISINE KNOWLEDGE (from All Nigerian Recipes):
${culturalKnowledge}

TRADITIONAL INGREDIENTS FOR ${cuisine.toUpperCase()} CUISINE:
${culturalIngredients}

IMPORTANT: Use authentic Nigerian cooking methods, traditional ingredients, and respect cultural significance. This should be a genuine ${cuisine} dish that would be found in Nigerian homes, not a fusion or westernized version.`;
  }

  return `Generate an authentic Nigerian meal suggestion for ${mealType} that is ${dietaryInfo[dietaryPreference] || dietaryPreference}, ${cuisineInfo}. ${ingredientsInfo}

${nigerianKnowledge}

${mealCategories}

${culturalPrompt}

Consider these elements for authenticity:
- Traditional Nigerian cooking methods and techniques: ${cookingTechniques}
- Authentic ingredients from the specified cultural cuisine
- Cultural significance and traditional preparation methods
- Seasonal ingredients: ${seasonalIngredients}
- Different flavor profiles (spicy, sweet, savory, tangy, umami)
- Various textures (crispy, creamy, chewy, tender)
- Colorful and visually appealing dishes

CRITICAL REQUIREMENTS FOR COOKING INSTRUCTIONS:
- Provide detailed, step-by-step cooking instructions that are safe and accurate
- Include specific cooking times, temperatures, and techniques
- Mention food safety practices (proper cooking temperatures, handling raw ingredients)
- Include ingredient preparation steps (washing, chopping, measuring)
- Specify cooking equipment needed (pots, pans, utensils)
- Include visual cues for doneness (color changes, texture, aroma)
- Provide troubleshooting tips for common issues
- Ensure instructions are clear enough for someone to cook safely at home
- Include traditional Nigerian cooking techniques and methods
- Specify when to add seasonings and adjust flavors
- Include traditional serving suggestions and accompaniments

Please respond with ONLY a valid JSON object in this exact format (no extra text, no markdown, no code blocks, no explanations):

{
  "name": "Authentic Nigerian meal name",
  "description": "Detailed description explaining the flavors, textures, cultural significance, and why it's perfect for this occasion",
  "prep_time": "X mins",
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "instructions": [
    "Step 1: Detailed instruction with specific times, temperatures, and techniques",
    "Step 2: Next step with clear guidance on what to look for",
    "Step 3: Continue with precise cooking instructions",
    "Step 4: Include safety checks and doneness indicators",
    "Step 5: Final steps with serving suggestions"
  ],
  "nutrition_info": {
    "calories": "approximate calories per serving",
    "protein": "protein content in grams",
    "carbs": "carbohydrate content in grams",
    "fat": "fat content in grams"
  },
  "difficulty": "Easy/Medium/Hard",
  "cuisine": "${cuisine} cuisine",
  "tags": ["tag1", "tag2", "tag3"],
  "serving_size": "number of people",
  "estimated_cost": "Low/Moderate/High"
}

CRITICAL JSON FORMATTING REQUIREMENTS:
1. Start with { and end with } - no text before or after
2. All property names must be in double quotes: "name", "description", etc.
3. All string values must be in double quotes: "Egusi Soup" (not Egusi Soup)
4. No extra quotes around string values - use "Egusi Soup" not "" "Egusi Soup""
5. No trailing commas after the last item in arrays or objects
6. No extra text, explanations, or markdown formatting
7. The "name" field must be a non-empty string
8. Arrays must be properly formatted: ["item1", "item2", "item3"]
9. No line breaks or extra spaces within string values
10. The entire response must be parseable by JSON.parse()

Make the suggestion authentic, practical, and delicious. Consider traditional Nigerian ingredients and cooking time appropriate for ${mealType}. This should be a genuine Nigerian dish that respects cultural traditions and uses authentic methods from All Nigerian Recipes!

RESPONSE FORMAT: Return ONLY the JSON object above, with no additional text, no explanations, no markdown formatting, no code blocks, and no extra characters before or after the JSON.

EXAMPLE OF CORRECT FORMAT:
{
  "name": "Egusi Soup",
  "description": "Traditional Nigerian soup",
  "prep_time": "45 mins",
  "ingredients": ["egusi", "palm oil"],
  "instructions": ["Step 1", "Step 2"],
  "nutrition_info": {"calories": "400"},
  "difficulty": "Medium",
  "cuisine": "yoruba cuisine",
  "tags": ["traditional"],
  "serving_size": "4 people",
  "estimated_cost": "Moderate"
}`
}

/**
 * Create a variety prompt for multiple suggestions
 */
function createVarietyPrompt(mealType, dietaryPreference, cuisine, ingredients, index, usedNames) {
  const varietyHints = [
    'Try a traditional Nigerian cooking method with authentic ingredients',
    'Focus on seasonal Nigerian ingredients and local produce',
    'Use traditional cooking techniques like slow cooking or smoking',
    'Create a comfort food that reflects Nigerian home cooking',
    'Experiment with traditional Nigerian spices and herbs',
    'Make it a one-pot meal using traditional Nigerian methods',
    'Add a traditional Nigerian sauce or condiment',
    'Use traditional Nigerian grains or proteins',
    'Create a variation of a classic Nigerian dish',
    'Focus on authentic presentation and traditional serving methods'
  ]

  const hint = varietyHints[index % varietyHints.length]
  const usedNamesList = Array.from(usedNames).join(', ')
  
  return `${createEnhancedMealPrompt(mealType, dietaryPreference, cuisine, ingredients)}

Variety hint: ${hint}

Important: Avoid these already used meal names: ${usedNamesList}

Make this suggestion completely different from the previous ones while maintaining authentic Nigerian cultural authenticity. Be creative but stay true to traditional Nigerian cooking!`
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
 * Get comprehensive Nigerian recipe knowledge from All Nigerian Recipes
 * @returns {string} Nigerian recipe knowledge
 */
function getNigerianRecipeKnowledge() {
  return `AUTHENTIC NIGERIAN RECIPE KNOWLEDGE (from All Nigerian Recipes - allnigerianrecipes.com):

TRADITIONAL NIGERIAN BREAKFAST RECIPES:
- Ogi (Pap/Akamu): Corn pap served with akara, moi moi, or bread
- Akara: Bean fritters made from black-eyed peas, deep-fried
- Moi Moi: Steamed bean pudding wrapped in leaves
- Boli: Roasted plantain, often served with groundnut
- Puff Puff: Sweet fried dough balls
- Bread and Tea: Simple breakfast with Nigerian bread

TRADITIONAL NIGERIAN LUNCH/DINNER RECIPES:
- Jollof Rice: Spicy rice cooked with tomatoes, peppers, and spices
- Egusi Soup: Ground melon seed soup with vegetables and meat
- Efo Riro: Traditional vegetable stew with spinach
- Amala and Ewedu: Yam flour with jute leaf soup
- Pounded Yam: Smooth yam paste served with various soups
- Fufu: Cassava-based swallow food
- Tuwo Shinkafa: Rice pudding (Northern Nigeria)
- Banga Soup: Palm nut soup (Delta region)
- Ofada Rice: Local rice with ayamase sauce
- Abacha and Ugba: Cassava flakes with oil bean seeds

TRADITIONAL NIGERIAN SOUPS:
- Egusi Soup: Ground melon seeds with vegetables
- Ogbono Soup: Wild mango seed soup
- Ewedu Soup: Jute leaf soup (Yoruba)
- Gbegiri: Bean soup (Yoruba)
- Ofe Onugbu: Bitterleaf soup (Igbo)
- Ofe Oha: Oha leaf soup (Igbo)
- Miyan Kuka: Baobab leaf soup (Northern)
- Banga Soup: Palm nut soup (Delta)
- Afang Soup: Afang leaf soup (South-South)
- Edikang Ikong: Vegetable soup (South-South)

TRADITIONAL NIGERIAN STREET FOODS:
- Suya: Spiced grilled meat (Northern)
- Kilishi: Dried meat (Northern)
- Akara: Bean fritters
- Moi Moi: Steamed bean pudding
- Boli: Roasted plantain
- Puff Puff: Sweet fried dough
- Roasted Corn: Fresh corn roasted over fire
- Roasted Plantain: Plantain roasted over fire
- Abacha: Cassava flakes salad
- Nkwobi: Spicy cow foot

TRADITIONAL NIGERIAN COOKING METHODS:
- Palm Oil Cooking: Essential in Southern Nigerian cuisine
- Groundnut Oil: Used in Northern Nigerian cuisine
- Slow Cooking: Traditional method for soups and stews
- Smoking: Used for fish and meat preservation
- Fermentation: For ogiri, iru (locust beans)
- Grinding: Traditional method for egusi, ogbono
- Pounding: For yam, plantain, and other staples
- Wrapping: Banana leaves for moi moi, efo riro
- Steaming: For moi moi, other puddings
- Roasting: For plantain, corn, meat

TRADITIONAL NIGERIAN INGREDIENTS:
- Palm Oil: Essential cooking oil in Southern Nigeria
- Groundnut Oil: Used in Northern Nigerian cooking
- Locust Beans (Iru): Fermented seasoning
- Ogiri: Fermented seed seasoning
- Uziza: Traditional Igbo spice
- Utazi: Traditional Igbo herb
- Ewedu: Jute leaves (Yoruba)
- Bitterleaf: Traditional vegetable
- Oha Leaves: Traditional Igbo vegetable
- Afang Leaves: Traditional South-South vegetable
- Periwinkle: Seafood common in coastal areas
- Stockfish: Dried fish for soups
- Smoked Fish: Traditional fish preservation
- Bush Meat: Traditional protein source
- Yam: Traditional staple crop
- Cassava: Traditional staple crop
- Plantain: Traditional fruit/vegetable
- Rice: Modern staple, especially jollof

TRADITIONAL NIGERIAN COOKING EQUIPMENT:
- Wooden Mortar and Pestle: For pounding yam, plantain
- Grinding Stone: Traditional grinding method
- Clay Pots: Traditional cooking vessels
- Banana Leaves: For wrapping and serving
- Wooden Spoons: Traditional stirring utensils
- Firewood: Traditional cooking fuel
- Three-legged Pots: Traditional cooking pots
- Calabash: Traditional serving bowls
- Woven Baskets: For serving and storage

CULTURAL SIGNIFICANCE:
- Food is central to Nigerian hospitality and celebrations
- Traditional meals are served communally
- Certain foods have spiritual and cultural significance
- Cooking methods are passed down through generations
- Regional variations reflect local resources and traditions
- Street food culture is vibrant and diverse
- Traditional cooking preserves cultural identity
- Food connects Nigerians to their heritage

COOKING SAFETY AND BEST PRACTICES:
- Always cook meat thoroughly to safe temperatures
- Wash vegetables and herbs thoroughly
- Use clean water for cooking
- Store ingredients properly to prevent spoilage
- Follow traditional methods while ensuring food safety
- Use appropriate cooking temperatures
- Handle palm oil carefully (high smoke point)
- Ensure proper ventilation when cooking with smoke
- Use clean utensils and equipment
- Follow traditional timing for fermentation processes`;
}

/**
 * Get traditional Nigerian cooking techniques
 * @param {string} mealType - type of meal
 * @returns {string} cooking techniques
 */
function getTraditionalCookingTechniques(mealType) {
  const techniques = {
    'breakfast': 'steaming (moi moi), deep-frying (akara), roasting (boli), boiling (ogi), baking (bread)',
    'lunch': 'slow cooking (soups), pounding (yam), grinding (egusi), smoking (fish), braising (meat)',
    'dinner': 'slow cooking (stews), pounding (fufu), grinding (spices), roasting (meat), steaming (vegetables)'
  };
  
  return techniques[mealType] || 'traditional Nigerian cooking methods';
}

/**
 * Get authentic Nigerian meal categories
 * @returns {string} meal categories
 */
function getNigerianMealCategories() {
  return `NIGERIAN MEAL CATEGORIES (from All Nigerian Recipes):

BREAKFAST CATEGORIES:
- Pap and Akara: Traditional corn pap with bean fritters
- Moi Moi: Steamed bean pudding
- Boli and Groundnut: Roasted plantain with peanuts
- Puff Puff: Sweet fried dough balls
- Bread and Tea: Simple breakfast
- Yam Porridge: Boiled yam with sauce
- Rice Porridge: Rice cooked with milk or water

LUNCH/DINNER CATEGORIES:
- Rice Dishes: Jollof rice, fried rice, coconut rice, ofada rice
- Soup and Swallow: Egusi, ogbono, efo riro with amala, pounded yam, fufu
- Stew Dishes: Tomato stew, pepper stew, ayamase
- One-Pot Meals: Jollof rice, rice and beans, beans and plantain
- Grilled Dishes: Suya, grilled fish, roasted meat
- Porridge: Yam porridge, plantain porridge, beans porridge

SOUP CATEGORIES:
- Seed-based Soups: Egusi, ogbono, achi
- Leaf-based Soups: Ewedu, bitterleaf, oha, afang
- Nut-based Soups: Banga (palm nut), groundnut soup
- Vegetable Soups: Efo riro, edikang ikong, afang
- Seafood Soups: Fish soup, periwinkle soup
- Meat Soups: Pepper soup, assorted meat soup

STREET FOOD CATEGORIES:
- Fried Foods: Akara, puff puff, boli
- Grilled Foods: Suya, roasted corn, roasted plantain
- Steamed Foods: Moi moi, wrapped foods
- Snack Foods: Chin chin, meat pie, samosa
- Beverages: Zobo, kunu, palm wine`;
}

/**
 * Parse AI response with intelligent error handling
 * @param {string} content - Raw AI response content
 * @returns {Object} Parsed meal suggestion
 */
export function parseAIResponse(content) {
  // Analyze content to determine the best parsing strategy
  const analysis = analyzeContent(content);
  
  // Choose the most appropriate parsing method based on content analysis
  if (analysis.isValidJSON) {
    try {
      const parsed = JSON.parse(content);
      if (isValidMealSuggestion(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Fall through to next method
    }
  }
  
  if (analysis.hasDoubleQuotes) {
    // Skip jsonrepair for double quote issues - go straight to manual extraction
    try {
      const extracted = extractMealSuggestionFromText(content);
      if (isValidMealSuggestion(extracted)) {
        return extracted;
      }
    } catch (error) {
      // Fall through to emergency reconstruction
    }
  } else if (analysis.isRepairable) {
    // Try jsonrepair for other types of issues
    try {
      const repaired = jsonrepair(content);
      const parsed = JSON.parse(repaired);
      if (isValidMealSuggestion(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Fall through to manual extraction
    }
  }
  
  // Try manual extraction as fallback
  try {
    const extracted = extractMealSuggestionFromText(content);
    if (isValidMealSuggestion(extracted)) {
      return extracted;
    }
  } catch (error) {
    // Fall through to emergency reconstruction
  }
  
  // Emergency reconstruction as last resort
  try {
    const reconstructed = emergencyReconstruction(content);
    if (isValidMealSuggestion(reconstructed)) {
      return reconstructed;
    }
  } catch (error) {
    // Final fallback
  }
  
  throw new Error('All parsing methods failed');
}

/**
 * Analyze content to determine the best parsing strategy
 * @param {string} content - Content to analyze
 * @returns {Object} Analysis results
 */
function analyzeContent(content) {
  const analysis = {
    isValidJSON: false,
    hasDoubleQuotes: false,
    isRepairable: false,
    hasNameField: false,
    hasDescriptionField: false
  };
  
  // Check for double quote pattern ("" "String"")
  if (content.includes('"" "') || content.includes('" ""')) {
    analysis.hasDoubleQuotes = true;
  }
  
  // Check if it has the required fields
  if (content.includes('"name"') || content.includes('name:')) {
    analysis.hasNameField = true;
  }
  
  if (content.includes('"description"') || content.includes('description:')) {
    analysis.hasDescriptionField = true;
  }
  
  // Only mark as valid JSON if we can actually parse it
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith('{') && trimmed.includes('}')) {
      // Quick test parse to see if it's actually valid JSON
      JSON.parse(trimmed);
      analysis.isValidJSON = true;
    }
  } catch (error) {
    // Not valid JSON, so we'll need to use other methods
    analysis.isValidJSON = false;
  }
  
  // Determine if it's repairable (has JSON structure but minor issues)
  analysis.isRepairable = analysis.hasNameField && 
                         analysis.hasDescriptionField && 
                         !analysis.hasDoubleQuotes &&
                         !analysis.isValidJSON; // Only repairable if not already valid
  
  return analysis;
}

/**
 * Check if a meal suggestion object is valid
 * @param {Object} suggestion - Meal suggestion object
 * @returns {boolean} True if valid
 */
function isValidMealSuggestion(suggestion) {
  return suggestion && 
         typeof suggestion === 'object' && 
         suggestion.name && 
         typeof suggestion.name === 'string' && 
         suggestion.name.trim().length > 0;
}

/**
 * Extract meal suggestion from malformed text
 * @param {string} content - Malformed content
 * @returns {Object} Extracted meal suggestion
 */
function extractMealSuggestionFromText(content) {
  
  const result = {
    name: '',
    description: '',
    prep_time: '45 mins',
    ingredients: [],
    instructions: [],
    nutrition_info: { calories: '400', protein: '15g', carbs: '60g', fat: '18g' },
    difficulty: 'Medium',
    cuisine: 'Nigerian',
    tags: [],
    serving_size: '3-4 people',
    estimated_cost: 'Moderate'
  };

  // Extract name - handle various malformed patterns
  const namePatterns = [
    /"name"\s*:\s*"([^"]+)"/,
    /"name"\s*:\s*"\s*"([^"]+)"\s*"/,
    /"name"\s*:\s*"\s*"([^"]+)"\s*"\s*"/,
    /name\s*:\s*"([^"]+)"/,
    /name\s*:\s*([^,\n\r}]+)/
  ];

  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.name = cleanString(match[1]);
      if (result.name.length > 0) break;
    }
  }

  // Extract description - handle various malformed patterns
  const descPatterns = [
    /"description"\s*:\s*"([^"]+)"/,
    /"description"\s*:\s*"\s*"([^"]+)"\s*"/,
    /"description"\s*:\s*"\s*"([^"]+)"\s*"\s*"/,
    /description\s*:\s*"([^"]+)"/,
    /description\s*:\s*([^,\n\r}]+)/
  ];

  for (const pattern of descPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.description = cleanString(match[1]);
      if (result.description.length > 0) break;
    }
  }

  // Extract ingredients
  const ingredientsMatch = content.match(/"ingredients"\s*:\s*\[([^\]]+)\]/);
  if (ingredientsMatch) {
    const ingredientsStr = ingredientsMatch[1];
    result.ingredients = ingredientsStr.split(',').map(item => {
      const cleaned = cleanString(item);
      return cleaned || 'Traditional ingredient';
    }).filter(item => item.length > 0);
  }

  // Extract instructions
  const instructionsMatch = content.match(/"instructions"\s*:\s*\[([^\]]+)\]/);
  if (instructionsMatch) {
    const instructionsStr = instructionsMatch[1];
    result.instructions = instructionsStr.split(',').map(item => {
      const cleaned = cleanString(item);
      return cleaned || 'Traditional cooking step';
    }).filter(item => item.length > 0);
  }

  // Extract other fields
  const timeMatch = content.match(/"prep_time"\s*:\s*"([^"]+)"/);
  if (timeMatch) result.prep_time = timeMatch[1];

  const diffMatch = content.match(/"difficulty"\s*:\s*"([^"]+)"/);
  if (diffMatch) result.difficulty = diffMatch[1];

  const cuisineMatch = content.match(/"cuisine"\s*:\s*"([^"]+)"/);
  if (cuisineMatch) result.cuisine = cuisineMatch[1];

  const tagsMatch = content.match(/"tags"\s*:\s*\[([^\]]+)\]/);
  if (tagsMatch) {
    const tagsStr = tagsMatch[1];
    result.tags = tagsStr.split(',').map(item => cleanString(item)).filter(item => item.length > 0);
  }

  const servingMatch = content.match(/"serving_size"\s*:\s*"([^"]+)"/);
  if (servingMatch) result.serving_size = servingMatch[1];

  const costMatch = content.match(/"estimated_cost"\s*:\s*"([^"]+)"/);
  if (costMatch) result.estimated_cost = costMatch[1];

  return result;
}

/**
 * Clean a string by removing extra quotes and spaces
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
function cleanString(str) {
  if (!str) return '';
  
  // Remove extra quotes and spaces
  str = str.trim();
  str = str.replace(/^["\s]+|["\s]+$/g, ''); // Remove leading/trailing quotes and spaces
  str = str.replace(/\s+/g, ' '); // Normalize multiple spaces to single space
  
  // Remove double quotes pattern like "" "String""
  str = str.replace(/^"\s*"\s*/, ''); // Remove "" " at start
  str = str.replace(/"\s*"\s*$/, ''); // Remove " "" at end
  
  return str;
}

/**
 * Emergency reconstruction when all else fails
 * @param {string} content - Severely malformed content
 * @returns {Object} Reconstructed meal suggestion
 */
function emergencyReconstruction(content) {
  
  // Try to find any meal name in the content
  let name = 'Traditional Nigerian Meal';
  const nameMatch = content.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (nameMatch) {
    name = nameMatch[1];
  }

  return {
    name: name,
    description: 'A delicious traditional Nigerian meal prepared with authentic methods',
    prep_time: '45 mins',
    ingredients: ['Traditional ingredients', 'Palm oil', 'Pepper', 'Onions'],
    instructions: ['Prepare traditional ingredients', 'Cook with authentic methods', 'Serve hot'],
    nutrition_info: { calories: '400', protein: '15g', carbs: '60g', fat: '18g' },
    difficulty: 'Medium',
    cuisine: 'Nigerian',
    tags: ['Traditional', 'Cultural'],
    serving_size: '3-4 people',
    estimated_cost: 'Moderate'
  };
}

/**
 * Generate default instructions if AI response is missing
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {Array} Default instructions
 */
function generateDefaultInstructions(suggestion) {
  const defaultInstructions = [
    'Prepare the ingredients as specified.',
    'In a large pot, heat the oil over medium heat.',
    'Add the onions and cook until fragrant.',
    'Add the meat (if using) and cook until browned.',
    'Add the vegetables and spices. Stir well.',
    'Pour in the water or stock. Cover and simmer for 20-30 minutes.',
    'Add the salt and pepper to taste.',
    'Serve hot with rice or bread.',
    'Enjoy your meal!'
  ];
  return defaultInstructions;
}

/**
 * Generate default nutrition info if AI response is missing
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {Object} Default nutrition info
 */
function generateNutritionInfo(suggestion) {
  return {
    calories: '400',
    protein: '15g',
    carbs: '60g',
    fat: '18g'
  };
}

/**
 * Estimate difficulty based on ingredients and instructions
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {string} Estimated difficulty
 */
function estimateDifficulty(suggestion) {
  const ingredients = suggestion.ingredients || [];
  const instructions = suggestion.instructions || [];

  if (ingredients.length === 0 || instructions.length === 0) {
    return 'Medium';
  }

  const isSimple = ingredients.length <= 5 && instructions.length <= 5;
  const isComplex = ingredients.length > 10 && instructions.length > 10;

  if (isSimple) return 'Easy';
  if (isComplex) return 'Hard';
  return 'Medium';
}

/**
 * Generate default tags if AI response is missing
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {Array} Default tags
 */
function generateTags(suggestion) {
  const tags = ['Nigerian', 'Authentic', 'Traditional'];
  if (suggestion.cuisine) {
    tags.push(suggestion.cuisine);
  }
  if (suggestion.mealType) {
    tags.push(suggestion.mealType);
  }
  if (suggestion.difficulty) {
    tags.push(suggestion.difficulty);
  }
  return tags;
}

/**
 * Estimate serving size based on ingredients and instructions
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {string} Estimated serving size
 */
function estimateServingSize(suggestion) {
  const ingredients = suggestion.ingredients || [];
  const instructions = suggestion.instructions || [];

  if (ingredients.length === 0 || instructions.length === 0) {
    return '2-4 people';
  }

  const isSmall = ingredients.length <= 5 && instructions.length <= 5;
  const isLarge = ingredients.length > 10 && instructions.length > 10;

  if (isSmall) return '1-2 people';
  if (isLarge) return '6-8 people';
  return '2-4 people';
}

/**
 * Estimate cost based on ingredients and instructions
 * @param {Object} suggestion - AI-generated meal suggestion
 * @returns {string} Estimated cost
 */
function estimateCost(suggestion) {
  const ingredients = suggestion.ingredients || [];
  const instructions = suggestion.instructions || [];

  if (ingredients.length === 0 || instructions.length === 0) {
    return 'Moderate';
  }

  const isCheap = ingredients.length <= 3 && instructions.length <= 3;
  const isExpensive = ingredients.length > 10 && instructions.length > 10;

  if (isCheap) return 'Low';
  if (isExpensive) return 'High';
  return 'Moderate';
}