/**
 * External Recipe APIs Integration
 * Provides additional recipe sources for Nigerian cuisine
 */

// Edamam Recipe API (Free tier available)
const EDAMAM_APP_ID = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.NEXT_PUBLIC_EDAMAM_APP_KEY;

// Spoonacular API (Free tier available)
const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

/**
 * Search for Nigerian recipes using Edamam API
 */
export async function searchEdamamRecipes(query, mealType, dietaryPreference) {
  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    console.log('Edamam API credentials not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&diet=${dietaryPreference}&mealType=${mealType}&cuisineType=African`
    );

    const data = await response.json();
    
    if (data.hits) {
      return data.hits.map(hit => ({
        name: hit.recipe.label,
        description: `A delicious ${hit.recipe.cuisineType?.[0] || 'African'} dish`,
        prep_time: `${Math.round(hit.recipe.totalTime)} mins`,
        ingredients: hit.recipe.ingredientLines,
        instructions: [], // Edamam doesn't provide detailed instructions
        nutrition_info: {
          calories: Math.round(hit.recipe.calories),
          protein: `${Math.round(hit.recipe.totalNutrients.PROCNT?.quantity || 0)}g`,
          carbs: `${Math.round(hit.recipe.totalNutrients.CHOCDF?.quantity || 0)}g`,
          fat: `${Math.round(hit.recipe.totalNutrients.FAT?.quantity || 0)}g`
        },
        difficulty: 'Medium',
        cuisine: hit.recipe.cuisineType?.[0] || 'African',
        is_ai_generated: false,
        tags: hit.recipe.dietLabels || [],
        serving_size: `${hit.recipe.yield} people`,
        estimated_cost: 'Moderate',
        source: 'Edamam',
        image: hit.recipe.image
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Edamam API error:', error);
    return [];
  }
}

/**
 * Search for Nigerian recipes using Spoonacular API
 */
export async function searchSpoonacularRecipes(query, mealType, dietaryPreference) {
  if (!SPOONACULAR_API_KEY) {
    console.log('Spoonacular API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(query)}&cuisine=african&diet=${dietaryPreference}&type=${mealType}&number=5`
    );

    const data = await response.json();
    
    if (data.results) {
      return data.results.map(recipe => ({
        name: recipe.title,
        description: `A traditional ${recipe.cuisines?.[0] || 'African'} dish`,
        prep_time: `${recipe.readyInMinutes} mins`,
        ingredients: [], // Would need additional API call for ingredients
        instructions: [], // Would need additional API call for instructions
        nutrition_info: {
          calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
          protein: `${recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0}g`,
          carbs: `${recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0}g`,
          fat: `${recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0}g`
        },
        difficulty: 'Medium',
        cuisine: recipe.cuisines?.[0] || 'African',
        is_ai_generated: false,
        tags: recipe.dishTypes || [],
        serving_size: `${recipe.servings} people`,
        estimated_cost: 'Moderate',
        source: 'Spoonacular',
        image: recipe.image
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Spoonacular API error:', error);
    return [];
  }
}

/**
 * Get recipes from multiple sources
 */
export async function getRecipesFromMultipleSources(mealType, dietaryPreference, cuisine, ingredients) {
  const query = `${cuisine} ${mealType} ${ingredients}`.trim();
  
  const [edamamRecipes, spoonacularRecipes] = await Promise.all([
    searchEdamamRecipes(query, mealType, dietaryPreference),
    searchSpoonacularRecipes(query, mealType, dietaryPreference)
  ]);

  // Combine and deduplicate recipes
  const allRecipes = [...edamamRecipes, ...spoonacularRecipes];
  const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
    index === self.findIndex(r => r.name.toLowerCase() === recipe.name.toLowerCase())
  );

  return uniqueRecipes;
}

/**
 * Community-curated Nigerian recipes (static data)
 */
export const communityNigerianRecipes = [
  {
    name: "Suya (Spicy Grilled Meat)",
    description: "Popular Nigerian street food - spicy grilled meat skewers",
    prep_time: "30 mins",
    ingredients: ["Beef", "Groundnut powder", "Cayenne pepper", "Paprika", "Onion powder", "Garlic powder", "Bamboo skewers"],
    instructions: [
      "Cut beef into thin strips",
      "Mix groundnut powder with spices",
      "Coat meat with spice mixture",
      "Thread onto skewers",
      "Grill until cooked through"
    ],
    nutrition_info: {
      calories: "350",
      protein: "25g",
      carbs: "5g",
      fat: "20g"
    },
    difficulty: "Easy",
    cuisine: "Nigerian",
    is_ai_generated: false,
    tags: ["street food", "grilled", "spicy"],
    serving_size: "4 people",
    estimated_cost: "Low",
    source: "Community"
  },
  {
    name: "Puff Puff",
    description: "Sweet, fluffy Nigerian doughnuts",
    prep_time: "45 mins",
    ingredients: ["Flour", "Yeast", "Sugar", "Nutmeg", "Salt", "Vegetable oil"],
    instructions: [
      "Mix flour, yeast, sugar, and spices",
      "Add warm water to form dough",
      "Let rise for 1 hour",
      "Shape into balls",
      "Deep fry until golden brown"
    ],
    nutrition_info: {
      calories: "280",
      protein: "4g",
      carbs: "45g",
      fat: "8g"
    },
    difficulty: "Medium",
    cuisine: "Nigerian",
    is_ai_generated: false,
    tags: ["dessert", "sweet", "fried"],
    serving_size: "6 people",
    estimated_cost: "Low",
    source: "Community"
  }
]; 