/**
 * Smart Database Service for fetching meal suggestions from Supabase
 * Features: Smart ordering, proper counting, unlimited more suggestions
 * Now supports AI-only mode via configuration
 */

import { supabase } from './supabase';
import { isDatabaseEnabled, isAIEnabled, isFallbackEnabled, getAIConfig, isDebugLoggingEnabled } from './config';

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
    this.isPreGenerating = false; // Flag to prevent multiple pre-generation calls
    this.processingCriteria = null; // Flag to prevent duplicate requests for same criteria
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
    const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    
    // Check if we're already processing this criteria
    if (this.processingCriteria === criteriaKey) {
      if (isDebugLoggingEnabled()) {
        console.log('⚠️ Already processing criteria:', criteriaKey, '- skipping duplicate request');
      }
      return null;
    }
    
    this.processingCriteria = criteriaKey;
    
    // Set a timeout to clear the processing flag if AI generation takes too long
    const processingTimeout = setTimeout(() => {
      if (this.processingCriteria === criteriaKey) {
        console.log('⚠️ Processing timeout reached, clearing processing flag');
        this.processingCriteria = null;
      }
    }, 5000); // 5 second timeout for processing flag
    
    try {
      if (isDebugLoggingEnabled()) {
        console.log('=== Smart suggestions request ===');
        console.log('Request:', { mealType, dietaryPreference, cuisine, count, getNew });
        console.log('Database enabled:', isDatabaseEnabled());
        console.log('AI enabled:', isAIEnabled());
      }

      // If database is disabled, go straight to AI mode
      if (!isDatabaseEnabled()) {
        if (isDebugLoggingEnabled()) {
          console.log('✅ Database disabled, using AI-only mode');
        }
        
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        const hasMoreAISuggestions = currentAIOffset < aiSuggestionPool.length;
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: aiSuggestionPool.length,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - currentAIOffset),
          totalShown: currentAIOffset,
          isAIGenerated: true
        };
      }

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
        
        // Get current AI offset BEFORE getting suggestions (so we know the starting position)
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        
        // Get AI suggestions with pagination
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        
        // Get the updated offset AFTER getting suggestions
        const updatedAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        
        // Check if there are more AI suggestions available
        const hasMoreAISuggestions = updatedAIOffset < aiSuggestionPool.length;
        
        console.log(`AI suggestions: ${aiSuggestions.length} returned, pool size: ${aiSuggestionPool.length}, offset: ${currentAIOffset}→${updatedAIOffset}, hasMore: ${hasMoreAISuggestions}`);
        
        // Calculate the current position in the overall suggestion flow
        const currentPosition = totalAvailable + updatedAIOffset;
        const totalAvailableWithAI = totalAvailable + aiSuggestionPool.length;
        
        // Ensure totalAvailable is never less than current position
        const finalTotalAvailable = Math.max(totalAvailableWithAI, currentPosition);
        
        console.log(`=== Count tracking ===`);
        console.log(`Database total: ${totalAvailable}`);
        console.log(`AI offset: ${currentAIOffset} → ${updatedAIOffset}`);
        console.log(`Current position: ${currentPosition}`);
        console.log(`Total with AI: ${totalAvailableWithAI}`);
        console.log(`Final total: ${finalTotalAvailable}`);
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: finalTotalAvailable,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - updatedAIOffset),
          totalShown: currentPosition,
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
          
          // Get current AI offset BEFORE getting suggestions
          const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
          const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
          
          const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
          
          // Get the updated offset AFTER getting suggestions
          const updatedAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
          const hasMoreAISuggestions = updatedAIOffset < aiSuggestionPool.length;
          
          // Calculate the current position in the overall suggestion flow
          const currentPosition = totalAvailable + updatedAIOffset;
          const totalAvailableWithAI = totalAvailable + aiSuggestionPool.length;
          
          // Ensure totalAvailable is never less than current position
          const finalTotalAvailable = Math.max(totalAvailableWithAI, currentPosition);
          
          return {
            suggestions: aiSuggestions,
            hasMore: hasMoreAISuggestions,
            totalAvailable: finalTotalAvailable,
            requested: count,
            actual: aiSuggestions.length,
            remaining: Math.max(0, aiSuggestionPool.length - updatedAIOffset),
            totalShown: currentPosition,
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
        
        // Get current AI offset BEFORE getting suggestions
        const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
        const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        
        const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
        
        // Get the updated offset AFTER getting suggestions
        const updatedAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
        const hasMoreAISuggestions = updatedAIOffset < aiSuggestionPool.length;
        
        // Calculate the current position in the overall suggestion flow
        const currentPosition = totalAvailable + updatedAIOffset;
        const totalAvailableWithAI = totalAvailable + aiSuggestionPool.length;
        
        // Ensure totalAvailable is never less than current position
        const finalTotalAvailable = Math.max(totalAvailableWithAI, currentPosition);
        
        return {
          suggestions: aiSuggestions,
          hasMore: hasMoreAISuggestions,
          totalAvailable: finalTotalAvailable,
          requested: count,
          actual: aiSuggestions.length,
          remaining: Math.max(0, aiSuggestionPool.length - updatedAIOffset),
          totalShown: currentPosition,
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
      
      console.log(`=== Database count tracking ===`);
      console.log(`criteriaKey: ${criteriaKey}`);
      console.log(`currentShown before: ${currentShown}`);
      console.log(`actualCount: ${actualCount}`);
      console.log(`totalShown after: ${totalShown}`);
      console.log(`currentOffset: ${currentOffset} → ${currentOffset + actualCount}`);
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
            
            // Get current AI offset BEFORE getting suggestions
            const aiSuggestionPool = this.aiSuggestionPool.get(criteriaKey) || [];
            const currentAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
            
            const aiSuggestions = await this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
            
            // Get the updated offset AFTER getting suggestions
            const updatedAIOffset = this.aiSuggestionOffsets.get(criteriaKey) || 0;
            const hasMoreAISuggestions = updatedAIOffset < aiSuggestionPool.length;
            
            // Calculate the current position in the overall suggestion flow
            const currentPosition = totalAvailable + updatedAIOffset;
            const totalAvailableWithAI = totalAvailable + aiSuggestionPool.length;
            
            // Ensure totalAvailable is never less than current position
            const finalTotalAvailable = Math.max(totalAvailableWithAI, currentPosition);
            
            return {
              suggestions: aiSuggestions,
              hasMore: hasMoreAISuggestions,
              totalShown: currentPosition,
              totalAvailable: finalTotalAvailable,
              requested: count,
              actual: aiSuggestions.length,
              remaining: Math.max(0, aiSuggestionPool.length - updatedAIOffset),
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
    } finally {
      // Clear the timeout and processing flag
      clearTimeout(processingTimeout);
      this.processingCriteria = null;
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
      // Handle Nigerian cultural cuisines
      // For now, all our database recipes are general Nigerian, so we'll return them for any Nigerian cultural cuisine
      // In the future, you can add specific cultural cuisine data to the database
      if (['yoruba', 'igbo', 'hausa', 'edo', 'ibibio', 'ijaw', 'nupe', 'kanuri', 'fulani', 'tiv'].includes(cuisine)) {
        // All current recipes are Nigerian, so they work for any Nigerian cultural cuisine
        // No additional filter needed for now
        console.log(`Cultural cuisine selected: ${cuisine} - using general Nigerian recipes`);
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
    // If database is disabled, return 0 to force AI mode
    if (!isDatabaseEnabled()) {
      if (isDebugLoggingEnabled()) {
        console.log('Database disabled, returning 0 for total available');
      }
      return 0;
    }

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
        // Handle Nigerian cultural cuisines
        // For now, all our database recipes are general Nigerian, so we'll return them for any Nigerian cultural cuisine
        if (['yoruba', 'igbo', 'hausa', 'edo', 'ibibio', 'ijaw', 'nupe', 'kanuri', 'fulani', 'tiv'].includes(cuisine)) {
          // All current recipes are Nigerian, so they work for any Nigerian cultural cuisine
          // No additional filter needed for now
          if (isDebugLoggingEnabled()) {
            console.log(`Cultural cuisine count: ${cuisine} - using general Nigerian recipes`);
          }
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
        if (isDebugLoggingEnabled()) {
          console.error('Count query error:', error);
        }
        return 0;
      }

      this.totalAvailable.set(cacheKey, count || 0);
      return count || 0;

    } catch (error) {
      if (isDebugLoggingEnabled()) {
        console.error('Error getting total count:', error);
      }
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
        
        // Import the AI service dynamically to avoid chunk loading issues
        let generateMultipleAISuggestions;
        try {
          const aiService = await import('./ai-service');
          generateMultipleAISuggestions = aiService.generateMultipleAISuggestions;
        } catch (error) {
          console.error('Failed to import AI service:', error);
          // Fallback to hardcoded suggestions if AI service fails
          return this.getFallbackSuggestions(mealType, dietaryPreference, count);
        }
        
        // Generate a pool of 12 AI suggestions for faster generation
        let aiSuggestionPool;
        try {
          aiSuggestionPool = await generateMultipleAISuggestions(mealType, dietaryPreference, cuisine, ingredients, 12);
        } catch (error) {
          console.error('AI generation failed, using fallback:', error);
          return this.getFallbackSuggestions(mealType, dietaryPreference, count);
        }
        
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
      
      // Check if we've exhausted the current pool
      if (currentAIOffset >= aiSuggestions.length) {
        console.log('AI pool exhausted, generating new pool...');
        
        // Clear the current pool and generate a new one
        this.aiSuggestionPool.delete(criteriaKey);
        this.aiSuggestionOffsets.delete(criteriaKey);
        
        // Recursively call to generate new pool
        return this.getAISuggestions(mealType, dietaryPreference, cuisine, ingredients, count);
      }
      
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
    } finally {
      // Clear the processing flag (this is called from getSmartSuggestions, so timeout is cleared there)
      this.processingCriteria = null;
    }
  }

  /**
   * Pre-generate AI suggestions for faster initial loading
   */
  async pregenerateAISuggestions(mealType, dietaryPreference, cuisine, ingredients) {
    const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    
    // Only pre-generate if we don't already have suggestions and not already generating
    if (!this.aiSuggestionPool.has(criteriaKey) && !this.isPreGenerating) {
      console.log('Pre-generating AI suggestions for faster loading...');
      this.isPreGenerating = true;
      
      try {
        // Start pre-generation in background without affecting count tracking
        setTimeout(async () => {
          try {
            // Import the AI service dynamically to avoid chunk loading issues
            let generateMultipleAISuggestions;
            try {
              const aiService = await import('./ai-service');
              generateMultipleAISuggestions = aiService.generateMultipleAISuggestions;
            } catch (error) {
              console.error('Failed to import AI service for pre-generation:', error);
              this.isPreGenerating = false;
              return;
            }
            
            // Generate a pool of 12 AI suggestions for faster generation
            let aiSuggestionPool;
            try {
              aiSuggestionPool = await generateMultipleAISuggestions(mealType, dietaryPreference, cuisine, ingredients, 12);
            } catch (error) {
              console.error('AI pre-generation failed:', error);
              this.isPreGenerating = false;
              return;
            }
            
            // Transform suggestions to match our format with unique IDs
            const transformedSuggestions = aiSuggestionPool.map((suggestion, index) => ({
              ...suggestion,
              id: `ai-${Date.now()}-${index}`, // Generate unique ID for AI suggestions
              source: 'AI Generated',
              is_ai_generated: true
            }));
            
            this.aiSuggestionPool.set(criteriaKey, transformedSuggestions);
            this.aiSuggestionOffsets.set(criteriaKey, 0);
            console.log(`Pre-generated ${transformedSuggestions.length} AI suggestions for pool`);
          } catch (error) {
            console.error('Pre-generation failed:', error);
          } finally {
            this.isPreGenerating = false;
          }
        }, 100); // Small delay to ensure it doesn't interfere with initial load
      } catch (error) {
        console.error('Pre-generation setup failed:', error);
        this.isPreGenerating = false;
      }
    }
  }

  /**
   * Reset shown counts for a specific criteria (useful when user changes preferences)
   */
  resetShownCounts(mealType, dietaryPreference, cuisine = '', ingredients = '') {
    const criteriaKey = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    console.log(`🔄 Resetting counts for: ${criteriaKey}`);
    console.log(`Before reset - shownCounts: ${this.shownCounts.get(criteriaKey) || 0}, currentOffsets: ${this.currentOffsets.get(criteriaKey) || 0}`);
    
    this.shownCounts.delete(criteriaKey);
    this.currentOffsets.delete(criteriaKey);
    this.aiSuggestionPool.delete(criteriaKey);
    this.aiSuggestionOffsets.delete(criteriaKey);
    
    console.log(`After reset - shownCounts: ${this.shownCounts.get(criteriaKey) || 0}, currentOffsets: ${this.currentOffsets.get(criteriaKey) || 0}`);
    
    // Add a small delay to ensure the reset takes effect
    return new Promise(resolve => setTimeout(resolve, 50));
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

/**
 * Pre-generate AI suggestions for faster loading
 */
export async function pregenerateAISuggestions(mealType, dietaryPreference, cuisine = '', ingredients = '') {
  return smartMealSuggestions.pregenerateAISuggestions(mealType, dietaryPreference, cuisine, ingredients);
} 