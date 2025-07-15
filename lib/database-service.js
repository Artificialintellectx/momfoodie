/**
 * Smart Database Service for fetching meal suggestions from Supabase
 * Features: Smart ordering, proper counting, unlimited more suggestions
 */

import { supabase } from './supabase';

/**
 * Smart meal suggestion system with intelligent ordering and unlimited pagination
 */
class SmartMealSuggestions {
  constructor() {
    this.suggestionHistory = new Map(); // Track what's been shown to avoid duplicates
    this.totalAvailable = new Map(); // Cache total available counts
    this.currentOffsets = new Map(); // Track current offset for each criteria
    this.shownCounts = new Map(); // Track how many suggestions have been shown for each criteria
  }

  /**
   * Get smart meal suggestions with proper counting and intelligent ordering
   * @param {string} mealType - breakfast, lunch, or dinner
   * @param {string} dietaryPreference - dietary restrictions
   * @param {string} cuisine - preferred cuisine (optional)
   * @param {string} ingredients - available ingredients (optional)
   * @param {number} count - number of suggestions to return
   * @param {boolean} getNew - whether to get new suggestions (true) or continue from current offset (false)
   * @returns {Promise<Object>} Object with suggestions and metadata
   */
  async getSmartSuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '', count = 1, getNew = false) {
    try {
      console.log('Smart suggestions request:', { mealType, dietaryPreference, cuisine, count, getNew });

      // Get total available count first
      const totalAvailable = await this.getTotalAvailable(mealType, dietaryPreference, cuisine, ingredients);
      
      // Calculate the offset based on whether we want new suggestions or continue
      const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
      let currentOffset = this.currentOffsets.get(criteriaKey) || 0;
      
      if (getNew) {
        // For new suggestions, start from a random offset to get variety
        currentOffset = Math.floor(Math.random() * Math.max(1, totalAvailable - count));
        // Don't reset the total shown count when getting new suggestions
      }
      
      // Calculate how many more are available
      const availableAtOffset = Math.max(0, totalAvailable - currentOffset);
      const actualCount = Math.min(count, availableAtOffset);

      if (actualCount === 0) {
        return {
          suggestions: [],
          hasMore: false,
          totalAvailable,
          requested: count,
          actual: 0,
          remaining: 0
        };
      }

      // Build smart query with intelligent ordering
      let query = this.buildSmartQuery(mealType, dietaryPreference, cuisine, ingredients, actualCount, currentOffset);
      
      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw new Error('Failed to fetch suggestions from database');
      }

      if (!data || data.length === 0) {
        return {
          suggestions: [],
          hasMore: false,
          totalAvailable,
          requested: count,
          actual: 0,
          remaining: 0
        };
      }

      // Transform and enhance suggestions
      const suggestions = data.map(recipe => this.transformRecipe(recipe));

      // Track how many suggestions have been shown
      const currentShown = this.shownCounts.get(criteriaKey) || 0;
      
      // Always update the offset for next time
      this.currentOffsets.set(criteriaKey, currentOffset + actualCount);
      
      // For new suggestions, we're replacing current ones, so reset the count
      if (getNew) {
        this.shownCounts.set(criteriaKey, actualCount);
      } else {
        // For continuing suggestions, add to the total shown count
        this.shownCounts.set(criteriaKey, currentShown + actualCount);
      }

      const totalShown = this.shownCounts.get(criteriaKey);
      const hasMore = totalAvailable > totalShown;
      const remaining = Math.max(0, totalAvailable - totalShown);

      console.log(`Smart suggestions result: ${suggestions.length}/${count} requested, ${totalAvailable} total available, shown: ${totalShown}, remaining: ${remaining}, ${hasMore ? 'more available' : 'no more'}`);

      return {
        suggestions,
        hasMore,
        totalAvailable,
        requested: count,
        actual: actualCount,
        remaining: remaining,
        totalShown: totalShown
      };

    } catch (error) {
      console.error('Smart suggestions error:', error);
      return this.getFallbackSuggestions(mealType, dietaryPreference, count);
    }
  }

  /**
   * Build smart query with intelligent ordering
   */
  buildSmartQuery(mealType, dietaryPreference, cuisine, ingredients, count, offset) {
    let query = supabase
      .from('meal_suggestions')
      .select('*')
      .eq('meal_type', mealType)
      .eq('dietary_preference', dietaryPreference);

    // Add cuisine filter if specified
    if (cuisine && cuisine !== '') {
      // For now, we'll focus on Nigerian cuisine since that's what we have
      // In the future, you can expand this to support other cuisines
      if (cuisine === 'nigerian') {
        // All our current recipes are Nigerian, so no additional filter needed
      }
    }

    // Add ingredient matching if specified
    if (ingredients && ingredients.trim() !== '') {
      const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
      
      // Create ingredient matching conditions
      const ingredientConditions = ingredientList.map(ingredient => {
        // Match ingredients in the ingredients array column
        return `ingredients.cs.{${ingredient}}`;
      });
      
      // Also search in description for broader matches
      const descriptionConditions = ingredientList.map(ingredient => {
        return `description.ilike.%${ingredient}%`;
      });
      
      // Combine all conditions with OR
      const allConditions = [...ingredientConditions, ...descriptionConditions];
      query = query.or(allConditions.join(','));
    }

    // Smart ordering: prioritize recipes with more matching ingredients, then alphabetical
    if (ingredients && ingredients.trim() !== '') {
      // For ingredient matching, we'll order by name for consistency
      // In a more advanced implementation, you could add a scoring system
      query = query.order('name', { ascending: true });
    } else {
      // Default ordering when no ingredients specified
      query = query.order('name', { ascending: true });
    }

    // Add pagination
    query = query.range(offset, offset + count - 1);

    return query;
  }

  /**
   * Get total available count for a given criteria
   */
  async getTotalAvailable(mealType, dietaryPreference, cuisine = '', ingredients = '') {
    const cacheKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    
    if (this.totalAvailable.has(cacheKey)) {
      return this.totalAvailable.get(cacheKey);
    }

    try {
      let query = supabase
        .from('meal_suggestions')
        .select('id', { count: 'exact' })
        .eq('meal_type', mealType)
        .eq('dietary_preference', dietaryPreference);

      // Add same filters as main query
      if (cuisine && cuisine !== '') {
        if (cuisine === 'nigerian') {
          // No additional filter needed for Nigerian
        }
      }

      if (ingredients && ingredients.trim() !== '') {
        const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
        
        // Create ingredient matching conditions
        const ingredientConditions = ingredientList.map(ingredient => {
          // Match ingredients in the ingredients array column
          return `ingredients.cs.{${ingredient}}`;
        });
        
        // Also search in description for broader matches
        const descriptionConditions = ingredientList.map(ingredient => {
          return `description.ilike.%${ingredient}%`;
        });
        
        // Combine all conditions with OR
        const allConditions = [...ingredientConditions, ...descriptionConditions];
        query = query.or(allConditions.join(','));
      }

      const { count, error } = await query;

      if (error) {
        console.error('Count query error:', error);
        return 0;
      }

      this.totalAvailable.set(cacheKey, count || 0);
      return count || 0;

    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }

  /**
   * Transform database recipe to enhanced format
   */
  transformRecipe(recipe) {
    // Generate smart tags based on recipe characteristics
    const tags = this.generateSmartTags(recipe);
    
    // Estimate nutrition info based on ingredients
    const nutritionInfo = this.estimateNutrition(recipe);
    
    // Determine difficulty based on prep time and ingredients
    const difficulty = this.estimateDifficulty(recipe);
    
    // Estimate cost based on ingredients
    const estimatedCost = this.estimateCost(recipe);

    return {
      name: recipe.name,
      description: recipe.description,
      prep_time: recipe.prep_time,
      ingredients: recipe.ingredients || [],
      instructions: this.generateInstructions(recipe),
      nutrition_info: nutritionInfo,
      difficulty,
      cuisine: 'Nigerian',
      is_ai_generated: false,
      tags,
      serving_size: this.estimateServingSize(recipe),
      estimated_cost: estimatedCost,
      source: 'Database',
      id: recipe.id // Keep the database ID for tracking
    };
  }

  /**
   * Generate smart tags based on recipe characteristics
   */
  generateSmartTags(recipe) {
    const tags = ['Nigerian', 'Authentic'];
    
    // Add meal type tag
    if (recipe.meal_type) {
      tags.push(recipe.meal_type.charAt(0).toUpperCase() + recipe.meal_type.slice(1));
    }
    
    // Add dietary preference tag
    if (recipe.dietary_preference && recipe.dietary_preference !== 'any') {
      tags.push(recipe.dietary_preference.charAt(0).toUpperCase() + recipe.dietary_preference.slice(1));
    }
    
    // Add ingredient-based tags
    const ingredients = recipe.ingredients || [];
    if (ingredients.some(i => i.toLowerCase().includes('fish'))) tags.push('Seafood');
    if (ingredients.some(i => i.toLowerCase().includes('chicken'))) tags.push('Poultry');
    if (ingredients.some(i => i.toLowerCase().includes('beef'))) tags.push('Beef');
    if (ingredients.some(i => i.toLowerCase().includes('plantain'))) tags.push('Plantain');
    if (ingredients.some(i => i.toLowerCase().includes('rice'))) tags.push('Rice');
    if (ingredients.some(i => i.toLowerCase().includes('yam'))) tags.push('Yam');
    if (ingredients.some(i => i.toLowerCase().includes('soup'))) tags.push('Soup');
    if (ingredients.some(i => i.toLowerCase().includes('pepper'))) tags.push('Spicy');
    
    return tags.slice(0, 5); // Limit to 5 tags
  }

  /**
   * Estimate nutrition info based on ingredients
   */
  estimateNutrition(recipe) {
    const ingredients = recipe.ingredients || [];
    const prepTime = recipe.prep_time || '30 mins';
    
    // Simple estimation based on ingredients and prep time
    let calories = '300-400';
    let protein = '10-15g';
    let carbs = '40-60g';
    let fat = '10-20g';
    
    if (ingredients.some(i => i.toLowerCase().includes('meat') || i.toLowerCase().includes('fish') || i.toLowerCase().includes('chicken'))) {
      protein = '20-30g';
      calories = '400-500';
    }
    
    if (ingredients.some(i => i.toLowerCase().includes('rice') || i.toLowerCase().includes('yam') || i.toLowerCase().includes('plantain'))) {
      carbs = '50-70g';
    }
    
    if (ingredients.some(i => i.toLowerCase().includes('palm oil'))) {
      fat = '15-25g';
    }
    
    return { calories, protein, carbs, fat };
  }

  /**
   * Estimate difficulty based on prep time and ingredients
   */
  estimateDifficulty(recipe) {
    const prepTime = recipe.prep_time || '30 mins';
    const timeMinutes = parseInt(prepTime) || 30;
    const ingredients = recipe.ingredients || [];
    
    if (timeMinutes > 90 || ingredients.length > 12) return 'Hard';
    if (timeMinutes > 45 || ingredients.length > 8) return 'Medium';
    return 'Easy';
  }

  /**
   * Estimate cost based on ingredients
   */
  estimateCost(recipe) {
    const ingredients = recipe.ingredients || [];
    
    if (ingredients.some(i => i.toLowerCase().includes('meat') || i.toLowerCase().includes('fish'))) {
      return 'Moderate';
    }
    if (ingredients.some(i => i.toLowerCase().includes('palm oil') || i.toLowerCase().includes('stockfish'))) {
      return 'Moderate';
    }
    return 'Low';
  }

  /**
   * Estimate serving size based on ingredients
   */
  estimateServingSize(recipe) {
    const ingredients = recipe.ingredients || [];
    
    if (ingredients.length > 10) return '4-6 people';
    if (ingredients.length > 6) return '3-4 people';
    return '2-3 people';
  }

  /**
   * Generate basic cooking instructions
   */
  generateInstructions(recipe) {
    // For now, return empty array since we don't have detailed instructions in DB
    // In the future, you can add instruction generation based on ingredients
    return [];
  }

  /**
   * Track shown suggestions to avoid duplicates
   */
  trackShownSuggestions(mealType, dietaryPreference, suggestions) {
    const key = `${mealType}-${dietaryPreference}`;
    if (!this.suggestionHistory.has(key)) {
      this.suggestionHistory.set(key, new Set());
    }
    
    suggestions.forEach(suggestion => {
      this.suggestionHistory.get(key).add(suggestion.id);
    });
  }

  /**
   * Get fallback suggestions when database fails
   */
  getFallbackSuggestions(mealType, dietaryPreference, count) {
    const fallbackSuggestions = {
      breakfast: {
        any: [
          {
            name: 'Jollof Rice with Fried Plantain',
            description: 'Classic Nigerian jollof rice served with sweet fried plantain',
            prep_time: '45 mins',
            ingredients: ['Basmati rice', 'Tomatoes', 'Red bell peppers', 'Onions', 'Chicken stock', 'Bay leaves', 'Ripe plantain', 'Vegetable oil'],
            instructions: [],
            nutrition_info: { calories: '450', protein: '12g', carbs: '65g', fat: '18g' },
            difficulty: 'Medium',
            cuisine: 'Nigerian',
            is_ai_generated: false,
            tags: ['Nigerian', 'Traditional', 'Rice'],
            serving_size: '4 people',
            estimated_cost: 'Moderate',
            source: 'Fallback'
          }
        ]
      }
    };

    const suggestions = fallbackSuggestions[mealType]?.[dietaryPreference] || 
                       fallbackSuggestions[mealType]?.['any'] || 
                       fallbackSuggestions['breakfast']['any'];

    return {
      suggestions: suggestions.slice(0, count),
      hasMore: false,
      totalAvailable: suggestions.length,
      requested: count,
      actual: Math.min(count, suggestions.length),
      remaining: 0
    };
  }

  /**
   * Clear suggestion history (useful for testing)
   */
  clearHistory() {
    this.suggestionHistory.clear();
    this.totalAvailable.clear();
    this.currentOffsets.clear();
    this.shownCounts.clear();
  }

  /**
   * Reset shown counts for a specific criteria (useful when user changes preferences)
   */
  resetShownCounts(mealType, dietaryPreference, cuisine = '', ingredients = '') {
    const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    this.shownCounts.delete(criteriaKey);
    this.currentOffsets.delete(criteriaKey);
  }
}

// Create singleton instance
const smartMealSuggestions = new SmartMealSuggestions();

/**
 * Main function to get smart meal suggestions
 */
export async function getSmartMealSuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '', count = 1, getNew = false) {
  return smartMealSuggestions.getSmartSuggestions(mealType, dietaryPreference, cuisine, ingredients, count, getNew);
}

/**
 * Legacy function for backward compatibility
 */
export async function getDatabaseMealSuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '', count = 3) {
  const result = await smartMealSuggestions.getSmartSuggestions(mealType, dietaryPreference, cuisine, ingredients, count, false);
  return result.suggestions;
}

/**
 * Legacy function for backward compatibility
 */
export async function getMultipleDatabaseSuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '', count = 3) {
  const result = await smartMealSuggestions.getSmartSuggestions(mealType, dietaryPreference, cuisine, ingredients, count, false);
  return result.suggestions;
}

/**
 * Get total available count for a criteria
 */
export async function getTotalAvailableCount(mealType, dietaryPreference, cuisine = '', ingredients = '') {
  return smartMealSuggestions.getTotalAvailable(mealType, dietaryPreference, cuisine, ingredients);
}

/**
 * Clear suggestion history (useful for testing)
 */
export function clearSuggestionHistory() {
  smartMealSuggestions.clearHistory();
}

/**
 * Reset shown counts for a specific criteria
 */
export function resetShownCounts(mealType, dietaryPreference, cuisine = '', ingredients = '') {
  smartMealSuggestions.resetShownCounts(mealType, dietaryPreference, cuisine, ingredients);
} 