import { useState, useEffect } from 'react';
import { X, Clock, Users, DollarSign, Utensils, List, Info, ChefHat, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Loading Skeleton Component
const RecipeModalSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between mb-6">
      <div className="h-8 bg-gray-200 rounded w-48 skeleton-wave"></div>
      <div className="w-8 h-8 bg-gray-200 rounded skeleton-pulse"></div>
    </div>
    
    <div className="h-4 bg-gray-200 rounded w-full mb-2 skeleton-wave"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-6 skeleton-wave"></div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-100 rounded-xl p-4">
          <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2 skeleton-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1 skeleton-wave"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mx-auto skeleton-wave"></div>
        </div>
      ))}
    </div>
    
    <div className="space-y-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 skeleton-wave"></div>
        <div className="bg-gray-50 rounded-xl p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full skeleton-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 skeleton-wave"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function RecipeModal({ recipeId, isOpen, onClose }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && recipeId) {
      fetchRecipe(recipeId);
    }
  }, [isOpen, recipeId]);

  const fetchRecipe = async (recipeId) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('meal_suggestions')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        setError('Recipe not found');
        return;
      }

      // Transform the recipe data to match the expected format
      const transformedRecipe = transformRecipe(data);
      setRecipe(transformedRecipe);

    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const transformRecipe = (recipe) => {
    // Generate smart tags based on recipe characteristics
    const tags = generateSmartTags(recipe);
    
    // Estimate nutrition info based on ingredients
    const nutritionInfo = estimateNutrition(recipe);
    
    // Determine difficulty based on prep time and ingredients
    const difficulty = estimateDifficulty(recipe);
    
    // Estimate cost based on ingredients
    const estimatedCost = estimateCost(recipe);

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      prep_time: recipe.prep_time,
      ingredients: recipe.ingredients || [],
      instructions: generateInstructions(recipe),
      nutrition_info: nutritionInfo,
      difficulty,
      cuisine: 'Nigerian',
      is_ai_generated: false,
      tags,
      serving_size: estimateServingSize(recipe),
      estimated_cost: estimatedCost,
      source: 'Database',
      meal_type: recipe.meal_type,
      dietary_preference: recipe.dietary_preference
    };
  };

  const generateSmartTags = (recipe) => {
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
    
    return tags.slice(0, 5);
  };

  const estimateNutrition = (recipe) => {
    const ingredients = recipe.ingredients || [];
    const prepTime = recipe.prep_time || '30 mins';
    
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
  };

  const estimateDifficulty = (recipe) => {
    const prepTime = recipe.prep_time || '30 mins';
    const timeMinutes = parseInt(prepTime) || 30;
    const ingredients = recipe.ingredients || [];
    
    if (timeMinutes > 90 || ingredients.length > 12) return 'Hard';
    if (timeMinutes > 45 || ingredients.length > 8) return 'Medium';
    return 'Easy';
  };

  const estimateCost = (recipe) => {
    const ingredients = recipe.ingredients || [];
    
    if (ingredients.some(i => i.toLowerCase().includes('meat') || i.toLowerCase().includes('fish'))) {
      return 'Moderate';
    }
    if (ingredients.some(i => i.toLowerCase().includes('palm oil') || i.toLowerCase().includes('stockfish'))) {
      return 'Moderate';
    }
    return 'Low';
  };

  const estimateServingSize = (recipe) => {
    const ingredients = recipe.ingredients || [];
    const prepTime = recipe.prep_time || '30 mins';
    
    if (ingredients.some(i => i.toLowerCase().includes('rice') || i.toLowerCase().includes('yam'))) {
      return '4-6 people';
    }
    if (ingredients.some(i => i.toLowerCase().includes('soup'))) {
      return '6-8 people';
    }
    return '2-4 people';
  };

  const generateInstructions = (recipe) => {
    // Generate basic cooking instructions based on recipe type
    const instructions = [
      'Prepare all ingredients as specified in the recipe.',
      'Follow traditional Nigerian cooking methods for authentic flavor.',
      'Adjust seasoning to taste preference.',
      'Serve hot with appropriate accompaniments.'
    ];
    
    return instructions;
  };

  const handleClose = () => {
    onClose();
    setRecipe(null);
    setLoading(true);
    setError(null);
  };

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙'
    };
    return icons[mealType] || '🍽️';
  };

  const getMealTypeLabel = (mealType) => {
    const labels = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner'
    };
    return labels[mealType] || 'Meal';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-bounce-in">
        {loading ? (
          <RecipeModalSkeleton />
        ) : error ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="text-red-500 mb-4">
              <Info className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <button
              onClick={handleClose}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : recipe ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <ChefHat className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
                  <p className="text-gray-600 text-sm">
                    {getMealTypeIcon(recipe.meal_type)} {getMealTypeLabel(recipe.meal_type)} • {recipe.cuisine} Cuisine
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {recipe.description}
              </p>

              {/* Recipe Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold text-gray-900">{recipe.prep_time}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Serves</p>
                  <p className="font-semibold text-gray-900">{recipe.serving_size}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-semibold text-gray-900">{recipe.estimated_cost}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Utensils className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-semibold text-gray-900">{recipe.difficulty}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <List className="w-5 h-5 text-orange-500" />
                  Ingredients
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-500" />
                  Instructions
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <ol className="space-y-3">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-500" />
                  Nutrition (Estimated)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="font-semibold text-gray-900">{recipe.nutrition_info.calories}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600">Protein</p>
                    <p className="font-semibold text-gray-900">{recipe.nutrition_info.protein}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600">Carbs</p>
                    <p className="font-semibold text-gray-900">{recipe.nutrition_info.carbs}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600">Fat</p>
                    <p className="font-semibold text-gray-900">{recipe.nutrition_info.fat}</p>
                  </div>
                </div>
              </div>

              {/* Source Info */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 fill-current text-orange-500" />
                  <span className="text-sm">Recipe from our authentic Nigerian database</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 