import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, Users, DollarSign, Utensils, List, Info, ChefHat, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Loading Skeleton Component
const RecipeSkeleton = () => (
  <div className="min-h-screen bg-[#f8fafc] font-sans">
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-xl skeleton-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-64 skeleton-wave"></div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 skeleton-wave"></div>
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
    </div>
  </div>
);

export default function RecipePage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

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
    
    if (ingredients.length > 10) return '4-6 people';
    if (ingredients.length > 6) return '3-4 people';
    return '2-3 people';
  };

  const generateInstructions = (recipe) => {
    // For now, return empty array since we don't have detailed instructions in DB
    // In the future, you can add instruction generation based on ingredients
    return [];
  };

  const handleBack = () => {
    router.back();
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

  if (loading) {
    return <RecipeSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {getMealTypeIcon(recipe.meal_type)} {getMealTypeLabel(recipe.meal_type)} Recipe
            </h1>
            <p className="text-gray-600 text-sm">
              {recipe.dietary_preference !== 'any' && `${recipe.dietary_preference} • `}
              Nigerian cuisine
            </p>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Recipe Title and Source */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-4xl font-bold text-gray-900">{recipe.name}</h2>
            <div className="flex items-center gap-1 text-orange-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-sm font-medium">DB</span>
            </div>
          </div>

          {/* Recipe Description */}
          <div className="mb-8">
            <p className="text-gray-600 leading-relaxed text-lg">
              {recipe.description}
            </p>
          </div>

          {/* Recipe Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Prep Time</div>
              <div className="font-semibold text-gray-900">{recipe.prep_time}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Serves</div>
              <div className="font-semibold text-gray-900">{recipe.serving_size}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Cost</div>
              <div className="font-semibold text-gray-900">{recipe.estimated_cost}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Utensils className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Difficulty</div>
              <div className="font-semibold text-gray-900">{recipe.difficulty}</div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-orange-500" />
                Instructions
              </h3>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nutrition Info */}
          {recipe.nutrition_info && Object.keys(recipe.nutrition_info).length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-orange-500" />
                Nutrition Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(recipe.nutrition_info).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                    <div className="font-semibold text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="bg-orange-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
            >
              Back to Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 