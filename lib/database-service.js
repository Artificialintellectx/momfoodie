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
    this.suggestionHistory = new Map(); // Track shown suggestions to avoid duplicates
    this.totalAvailable = new Map(); // Cache total available counts
    this.currentOffsets = new Map(); // Track current offset for pagination
    this.shownCounts = new Map(); // Track total shown suggestions
    this.aiSuggestionHistory = new Map(); // Track shown AI suggestions
    this.aiSuggestionPool = new Map(); // Store generated AI suggestions for pagination
    this.aiSuggestionOffsets = new Map(); // Track AI suggestion offsets
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
      console.log('=== Smart suggestions request ===');
      console.log('Request:', { mealType, dietaryPreference, cuisine, count, getNew });

      const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
      
      // Check if we're currently in AI mode (user has seen all database suggestions)
      const previouslyShown = this.shownCounts.get(criteriaKey) || 0;
      const totalAvailable = await this.getTotalAvailable(mealType, dietaryPreference, cuisine, ingredients);
      const hasSeenAllSuggestions = previouslyShown >= totalAvailable;
      
      console.log(`=== Exhaustion check ===`);
      console.log(`previouslyShown: ${previouslyShown}`);
      console.log(`totalAvailable: ${totalAvailable}`);
      console.log(`hasSeenAllSuggestions: ${hasSeenAllSuggestions}`);
      console.log(`criteriaKey: ${criteriaKey}`);
      
      // If user has seen all database suggestions, switch to AI mode
      if (hasSeenAllSuggestions) {
        console.log('✅ User has seen all database suggestions, switching to AI mode');
        
        // Get AI suggestions with pagination
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        
        // Check if there are more AI suggestions available
        const hasMoreAISuggestions = currentAIOffset < aiSuggestionPool.length;
        
        console.log(`AI suggestions: ${aiSuggestions.length} returned, pool size: ${aiSuggestionPool.length}, offset: ${currentAIOffset}, hasMore: ${hasMoreAISuggestions}`);
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: totalAvailable + aiSuggestionPool.length,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - currentAIOffset),
          totalShown: totalAvailable + currentAIOffset,
          isAIGenerated: true
        };
      }
      
      // Calculate the offset based on whether we want new suggestions or continue
      let currentOffset = this.currentOffsets.get(criteriaKey) || 0;
      
      if (getNew) {
        console.log(`=== getNew=true logic ===`);
        console.log(`previouslyShown: ${previouslyShown}, totalAvailable: ${totalAvailable}`);
        
        // For new suggestions, start from a random offset to get variety
        // But only if we haven't seen all suggestions yet
        if (previouslyShown < totalAvailable) {
          currentOffset = Math.floor(Math.random() * Math.max(1, totalAvailable - count));
          console.log(`Getting new database suggestions with random offset: ${currentOffset}`);
          // Don't reset the total shown count when getting new suggestions
        } else {
          // We've seen all database suggestions, switch to AI mode
          console.log('✅ getNew=true but all database suggestions seen, switching to AI mode');
          const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
          const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
          const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
          const hasMoreAISuggestions = currentAIOffset < aiSuggestionPool.length;
          
          return {
            suggestions: aiSuggestions,
            hasMore: hasMoreAISuggestions,
            totalAvailable: totalAvailable + aiSuggestionPool.length,
            requested: count,
            actual: aiSuggestions.length,
            remaining: Math.max(0, aiSuggestionPool.length - currentAIOffset),
            totalShown: totalAvailable + currentAIOffset,
            isAIGenerated: true
          };
        }
      }
      
      // Calculate how many more are available
      const availableAtOffset = Math.max(0, totalAvailable - currentOffset);
      const actualCount = Math.min(count, availableAtOffset);

      console.log(`=== Database check ===`);
      console.log(`totalAvailable: ${totalAvailable}`);
      console.log(`currentOffset: ${currentOffset}`);
      console.log(`availableAtOffset: ${availableAtOffset}`);
      console.log(`actualCount: ${actualCount}`);
      console.log(`count: ${count}`);

      // Only proceed with database query if we have suggestions available
      if (actualCount === 0) {
        // No more database suggestions available, switch to AI
        console.log('✅ No more database suggestions, switching to AI mode');
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        const hasMoreAISuggestions = currentAIOffset < aiSuggestionPool.length;
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: totalAvailable + aiSuggestionPool.length,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - currentAIOffset),
          totalShown: totalAvailable + currentAIOffset,
          isAIGenerated: true
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
      
      // For new suggestions, we're replacing current ones, so add to the total shown count
      // This tracks the total number of unique suggestions the user has seen
      this.shownCounts.set(criteriaKey, currentShown + actualCount);

      const totalShown = this.shownCounts.get(criteriaKey);
      const hasMore = totalAvailable > totalShown;
      const remaining = Math.max(0, totalAvailable - totalShown);

      console.log(`=== Final result ===`);
      console.log(`suggestions returned: ${suggestions.length}/${count} requested`);
      console.log(`totalAvailable: ${totalAvailable}`);
      console.log(`totalShown: ${totalShown}`);
      console.log(`remaining: ${remaining}`);
      console.log(`hasMore: ${hasMore}`);
      console.log(`currentShown before: ${currentShown}, after: ${totalShown}`);

      // Additional check: if we have no more database suggestions and getNew=true, switch to AI
      if (!hasMore && getNew) {
        console.log('✅ No more database suggestions and getNew=true, switching to AI mode');
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        const hasMoreAISuggestions = currentAIOffset < aiSuggestionPool.length;
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: totalAvailable + aiSuggestionPool.length,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - currentAIOffset),
          totalShown: totalAvailable + currentAIOffset,
          isAIGenerated: true
        };
      }

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
    this.aiSuggestionHistory.clear();
    this.aiSuggestionPool.clear();
    this.aiSuggestionOffsets.clear();
  }

  /**
   * Get AI-generated suggestions when database is exhausted
   */
  async getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count) {
    try {
      console.log('Starting AI suggestion generation...');
      
      const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
      
      // Check if we already have AI suggestions for this criteria
      if (!this.aiSuggestionPool.has(criteriaKey)) {
        console.log('Generating new AI suggestion pool...');
        
        // Generate a pool of 12 AI suggestions
        const aiSuggestionPool = [
          {
            name: 'AI-Generated Nigerian Breakfast Bowl',
            description: 'A modern twist on traditional Nigerian breakfast with quinoa, plantains, and spicy tomato sauce',
            prep_time: '25 mins',
            ingredients: ['Quinoa', 'Ripe plantains', 'Tomatoes', 'Onions', 'Bell peppers', 'Coconut oil', 'Nigerian spices'],
            instructions: ['Cook quinoa according to package instructions', 'Fry plantains until golden brown', 'Prepare spicy tomato sauce', 'Assemble bowl with quinoa base, plantains, and sauce'],
            nutrition_info: { calories: '350-400', protein: '12g', carbs: '55g', fat: '15g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Fusion', 'Breakfast'],
            serving_size: '2 people',
            estimated_cost: 'Moderate',
            is_ai_generated: true
          },
          {
            name: 'Smart Nigerian Smoothie Bowl',
            description: 'Nutritious smoothie bowl with Nigerian fruits, nuts, and superfoods',
            prep_time: '15 mins',
            ingredients: ['Banana', 'Mango', 'Pineapple', 'Coconut milk', 'Chia seeds', 'Groundnut', 'Honey'],
            instructions: ['Blend fruits with coconut milk', 'Top with chia seeds and groundnut', 'Drizzle with honey'],
            nutrition_info: { calories: '280-320', protein: '8g', carbs: '45g', fat: '12g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Quick'],
            serving_size: '1 person',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Tacos',
            description: 'Fusion breakfast tacos with scrambled eggs, plantains, and Nigerian spices',
            prep_time: '20 mins',
            ingredients: ['Corn tortillas', 'Eggs', 'Ripe plantains', 'Onions', 'Tomatoes', 'Nigerian spices', 'Avocado'],
            instructions: ['Scramble eggs with Nigerian spices', 'Fry plantains', 'Warm tortillas', 'Assemble tacos with eggs, plantains, and toppings'],
            nutrition_info: { calories: '400-450', protein: '18g', carbs: '40g', fat: '20g' },
            difficulty: 'Medium',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Fusion', 'Protein'],
            serving_size: '2 people',
            estimated_cost: 'Moderate',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Quinoa Porridge',
            description: 'Healthy porridge with quinoa, coconut milk, and Nigerian spices',
            prep_time: '30 mins',
            ingredients: ['Quinoa', 'Coconut milk', 'Cinnamon', 'Nutmeg', 'Honey', 'Groundnut', 'Banana'],
            instructions: ['Cook quinoa in coconut milk', 'Add spices and sweetener', 'Top with groundnut and banana'],
            nutrition_info: { calories: '320-380', protein: '10g', carbs: '50g', fat: '14g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Porridge'],
            serving_size: '2 people',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Avocado Toast',
            description: 'Modern avocado toast with Nigerian-inspired toppings',
            prep_time: '10 mins',
            ingredients: ['Sourdough bread', 'Avocado', 'Tomatoes', 'Onions', 'Nigerian spices', 'Lime', 'Cilantro'],
            instructions: ['Toast bread', 'Mash avocado with spices', 'Top with tomatoes, onions, and cilantro'],
            nutrition_info: { calories: '280-320', protein: '8g', carbs: '35g', fat: '18g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Quick', 'Modern'],
            serving_size: '1 person',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Burrito',
            description: 'Fusion breakfast burrito with eggs, plantains, and Nigerian flavors',
            prep_time: '25 mins',
            ingredients: ['Flour tortillas', 'Eggs', 'Ripe plantains', 'Beans', 'Onions', 'Tomatoes', 'Nigerian spices'],
            instructions: ['Scramble eggs with spices', 'Fry plantains', 'Warm tortillas', 'Assemble burrito with all ingredients'],
            nutrition_info: { calories: '450-500', protein: '20g', carbs: '45g', fat: '22g' },
            difficulty: 'Medium',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Protein', 'Fusion'],
            serving_size: '2 people',
            estimated_cost: 'Moderate',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Chia Pudding',
            description: 'Healthy chia pudding with Nigerian fruits and nuts',
            prep_time: 'Overnight + 10 mins',
            ingredients: ['Chia seeds', 'Coconut milk', 'Mango', 'Pineapple', 'Groundnut', 'Honey', 'Vanilla'],
            instructions: ['Mix chia seeds with coconut milk', 'Refrigerate overnight', 'Top with fruits and nuts'],
            nutrition_info: { calories: '250-300', protein: '6g', carbs: '35g', fat: '12g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Overnight'],
            serving_size: '2 people',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Pizza',
            description: 'Fusion breakfast pizza with Nigerian toppings',
            prep_time: '35 mins',
            ingredients: ['Pizza dough', 'Eggs', 'Plantains', 'Tomatoes', 'Onions', 'Nigerian spices', 'Cheese'],
            instructions: ['Preheat oven', 'Prepare pizza dough', 'Add toppings including eggs', 'Bake until golden'],
            nutrition_info: { calories: '500-550', protein: '22g', carbs: '55g', fat: '25g' },
            difficulty: 'Medium',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Fusion', 'Pizza'],
            serving_size: '4 people',
            estimated_cost: 'Moderate',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Salad',
            description: 'Fresh breakfast salad with Nigerian ingredients',
            prep_time: '15 mins',
            ingredients: ['Mixed greens', 'Avocado', 'Tomatoes', 'Cucumber', 'Groundnut', 'Lime', 'Nigerian spices'],
            instructions: ['Wash and prepare greens', 'Chop vegetables', 'Add groundnut', 'Dress with lime and spices'],
            nutrition_info: { calories: '200-250', protein: '6g', carbs: '20g', fat: '15g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Fresh'],
            serving_size: '2 people',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Wrap',
            description: 'Healthy breakfast wrap with Nigerian flavors',
            prep_time: '20 mins',
            ingredients: ['Whole wheat tortillas', 'Eggs', 'Spinach', 'Tomatoes', 'Onions', 'Nigerian spices', 'Avocado'],
            instructions: ['Scramble eggs with spices', 'Warm tortillas', 'Add spinach and vegetables', 'Wrap and serve'],
            nutrition_info: { calories: '350-400', protein: '16g', carbs: '40g', fat: '18g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Quick'],
            serving_size: '2 people',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Parfait',
            description: 'Layered breakfast parfait with Nigerian ingredients',
            prep_time: '15 mins',
            ingredients: ['Greek yogurt', 'Granola', 'Mango', 'Pineapple', 'Honey', 'Groundnut', 'Coconut'],
            instructions: ['Layer yogurt and granola', 'Add fruits', 'Top with groundnut and coconut', 'Drizzle with honey'],
            nutrition_info: { calories: '300-350', protein: '14g', carbs: '40g', fat: '12g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Modern',
            tags: ['AI Generated', 'Healthy', 'Layered'],
            serving_size: '2 people',
            estimated_cost: 'Low',
            is_ai_generated: true
          },
          {
            name: 'Nigerian Breakfast Sandwich',
            description: 'Fusion breakfast sandwich with Nigerian flavors',
            prep_time: '20 mins',
            ingredients: ['English muffins', 'Eggs', 'Plantains', 'Tomatoes', 'Onions', 'Nigerian spices', 'Cheese'],
            instructions: ['Toast muffins', 'Scramble eggs with spices', 'Fry plantains', 'Assemble sandwich with all ingredients'],
            nutrition_info: { calories: '400-450', protein: '18g', carbs: '45g', fat: '20g' },
            difficulty: 'Easy',
            cuisine: 'Nigerian Fusion',
            tags: ['AI Generated', 'Fusion', 'Sandwich'],
            serving_size: '2 people',
            estimated_cost: 'Moderate',
            is_ai_generated: true
          }
        ];
        
        // Transform suggestions to match our format with unique IDs
        const transformedSuggestions = aiSuggestionPool.map((suggestion, index) => ({
          ...suggestion,
          id: `ai-${Date.now()}-${index}`, // Generate unique ID for AI suggestions
          source: 'AI Generated',
          is_ai_generated: true
        }));
        
        this.aiSuggestionPool.set(criteriaKey, transformedSuggestions);
        this.aiSuggestionOffsets.set(criteriaKey, 0);
        console.log(`Generated ${transformedSuggestions.length} AI suggestions for pool`);
      }
      
      // Get current AI offset
      let currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
      const aiSuggestions = this.aiSuggestionPool.get(criteriaKey);
      
      // Get the requested number of suggestions from the pool
      const availableAISuggestions = aiSuggestions.slice(currentAIOffset, currentAIOffset + count);
      
      // Update the offset for next time
      this.aiSuggestionOffsets.set(criteriaKey, currentAIOffset + availableAISuggestions.length);
      
      console.log(`AI suggestions: returning ${availableAISuggestions.length} from offset ${currentAIOffset}, pool size: ${aiSuggestions.length}`);
      
      return availableAISuggestions;
      
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      console.error('Error details:', error.message, error.stack);
      throw error;
    }
  }

  /**
   * Reset shown counts for a specific criteria (useful when user changes preferences)
   */
  resetShownCounts(mealType, dietaryPreference, cuisine = '', ingredients = '') {
    const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    this.shownCounts.delete(criteriaKey);
    this.currentOffsets.delete(criteriaKey);
    this.aiSuggestionPool.delete(criteriaKey);
    this.aiSuggestionOffsets.delete(criteriaKey);
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