import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Sparkles, Star, Clock, Users, DollarSign, Utensils, X, List, Info, ChefHat } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { generateMultipleAISuggestions } from '../lib/ai-service';

// Loading Skeleton Components
const SuggestionCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
    <div className="flex items-start justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 skeleton-wave"></div>
      <div className="h-4 bg-gray-200 rounded w-8 skeleton-pulse"></div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full skeleton-wave"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 skeleton-wave"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6 skeleton-wave"></div>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded skeleton-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-16 skeleton-wave"></div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 bg-gray-200 rounded-full w-16 skeleton-pulse"></div>
      ))}
    </div>

    <div className="h-12 bg-gray-200 rounded-xl skeleton-wave"></div>
  </div>
);

const SuggestionsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center gap-2 mb-6">
      <div className="p-2 bg-gray-200 rounded-full w-9 h-9 skeleton-pulse"></div>
      <div className="h-7 bg-gray-200 rounded w-48 skeleton-wave"></div>
    </div>

    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <SuggestionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default function Suggestions() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateCard, setAnimateCard] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipe, setShowRecipe] = useState(false);

  useEffect(() => {
    // Get form data from URL query parameters
    const {
      mealType = 'breakfast',
      dietaryPreference = 'any',
      cuisine = '',
      ingredients = '',
      suggestionCount = 1
    } = router.query;

    if (router.isReady) {
      generateSuggestions(mealType, dietaryPreference, cuisine, ingredients, parseInt(suggestionCount));
    }
  }, [router.isReady, router.query]);

  const generateSuggestions = async (mealType, dietaryPreference, cuisine, ingredients, suggestionCount) => {
    setLoading(true);
    setSuggestions([]);
    setAnimateCard(false);

    try {
      const aiSuggestions = await generateMultipleAISuggestions(
        mealType,
        dietaryPreference,
        cuisine,
        ingredients,
        suggestionCount
      );
      setSuggestions(aiSuggestions);
      setTimeout(() => setAnimateCard(true), 100);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipe(true);
  };

  const handleBack = () => {
    router.push('/');
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

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
              {getMealTypeIcon(router.query.mealType)} {getMealTypeLabel(router.query.mealType)} Suggestions
            </h1>
            <p className="text-gray-600 text-sm">
              {router.query.dietaryPreference !== 'any' && `${router.query.dietaryPreference} • `}
              {router.query.cuisine && `${router.query.cuisine} cuisine`}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && <SuggestionsSkeleton />}

        {/* Suggestions Display */}
        {suggestions.length > 0 && !loading && (
          <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-500 ${
            animateCard ? 'animate-fade-in' : ''
          }`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-100 rounded-full">
                <Sparkles className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Meal Suggestions
              </h2>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <Swiper
                spaceBetween={20}
                slidesPerView={1.2}
                centeredSlides={true}
                loop={false}
                className="suggestion-swiper"
              >
                {suggestions.map((suggestion, index) => (
                  <SwiperSlide key={index}>
                    <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">
                          {suggestion.name}
                        </h3>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">AI</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {suggestion.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{suggestion.prep_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{suggestion.serving_size}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{suggestion.estimated_cost}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Utensils className="w-4 h-4" />
                          <span>{suggestion.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => handleViewRecipe(suggestion)}
                        className="w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                      >
                        View Recipe
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop List */}
            <div className="hidden md:grid gap-6">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 border border-orange-100 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {suggestion.name}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">AI</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {suggestion.description}
                  </p>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{suggestion.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{suggestion.serving_size}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{suggestion.estimated_cost}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Utensils className="w-4 h-4" />
                      <span>{suggestion.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleViewRecipe(suggestion)}
                    className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                  >
                    View Recipe
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Modal */}
        {showRecipe && selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                <button
                  onClick={() => setShowRecipe(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Recipe Description */}
              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {selectedRecipe.description}
                </p>
              </div>

              {/* Recipe Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Prep Time</div>
                  <div className="font-semibold text-gray-900">{selectedRecipe.prep_time}</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Serves</div>
                  <div className="font-semibold text-gray-900">{selectedRecipe.serving_size}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Cost</div>
                  <div className="font-semibold text-gray-900">{selectedRecipe.estimated_cost}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Utensils className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Difficulty</div>
                  <div className="font-semibold text-gray-900">{selectedRecipe.difficulty}</div>
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
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions */}
              {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-500" />
                    Instructions
                  </h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((instruction, index) => (
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
              {selectedRecipe.nutrition_info && Object.keys(selectedRecipe.nutrition_info).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-500" />
                    Nutrition Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(selectedRecipe.nutrition_info).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-sm text-gray-600 capitalize">{key}</div>
                        <div className="font-semibold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.tags.map((tag, index) => (
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

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowRecipe(false)}
                  className="bg-orange-500 text-white font-semibold py-3 px-8 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
                >
                  Close Recipe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 