import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Sparkles, Star, Clock, Users, DollarSign, Utensils } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { getSmartMealSuggestions, resetShownCounts } from '../lib/database-service';
import { pregenerateAISuggestions } from '../lib/database-service';
import RecipeModal from '../components/RecipeModal';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
  const [suggestionMetadata, setSuggestionMetadata] = useState({
    totalAvailable: 0,
    requested: 0,
    actual: 0,
    remaining: 0,
    totalShown: 0
  });
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!router.isReady) return;

    // Get form data from URL query parameters
    const {
      mealType = 'breakfast',
      dietaryPreference = 'any',
      cuisine = '',
      ingredients = '',
      suggestionCount = 1
    } = router.query;

    const currentCriteria = `${mealType}-${dietaryPreference}-${cuisine}-${ingredients}`;
    const lastCriteria = sessionStorage.getItem('lastCriteria');

    // Only generate suggestions if:
    // 1. This is the first time (not initialized) OR
    // 2. The criteria has actually changed
    if (!hasInitialized || currentCriteria !== lastCriteria) {
      console.log('🔄 useEffect triggered:', { 
        hasInitialized, 
        currentCriteria, 
        lastCriteria, 
        isInitialLoad: !hasInitialized 
      });
      
      if (!hasInitialized) {
        setHasInitialized(true);
      }
      
      sessionStorage.setItem('lastCriteria', currentCriteria);
      generateSuggestions(mealType, dietaryPreference, cuisine, ingredients, parseInt(suggestionCount));
      
      // Start pre-generating AI suggestions in the background for faster loading
      setTimeout(() => {
        pregenerateAISuggestions(mealType, dietaryPreference, cuisine, ingredients);
      }, 500);
    }
  }, [router.isReady, router.query, hasInitialized]);

  const generateSuggestions = async (mealType, dietaryPreference, cuisine, ingredients, suggestionCount) => {
    console.log('🔄 generateSuggestions called with:', { mealType, dietaryPreference, cuisine, ingredients, suggestionCount });
    
    // Prevent multiple simultaneous calls
    if (isGenerating) {
      console.log('⚠️ generateSuggestions already in progress, skipping...');
      return;
    }
    
    setIsGenerating(true);
    setLoading(true);
    setSuggestions([]);
    setAnimateCard(false);

    // Reset shown counts for this criteria when first loading
    await resetShownCounts(mealType, dietaryPreference, cuisine, ingredients);

    try {
      const result = await getSmartMealSuggestions(
        mealType,
        dietaryPreference,
        cuisine,
        ingredients,
        suggestionCount,
        false // First load, not getting new suggestions
      );
      
      // Handle case where request was skipped due to duplicate
      if (result === null) {
        console.log('⚠️ Request was skipped due to duplicate, retrying...');
        
        // Prevent infinite retries
        if (retryCount >= 3) {
          console.error('❌ Max retries reached, showing error');
          alert('Failed to load suggestions after multiple attempts. Please refresh the page.');
          return;
        }
        
        setRetryCount(prev => prev + 1);
        // Wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, 200));
        return generateSuggestions(mealType, dietaryPreference, cuisine, ingredients, suggestionCount);
      }
      
      console.log('✅ generateSuggestions result:', { 
        suggestionsCount: result.suggestions.length, 
        totalShown: result.totalShown,
        totalAvailable: result.totalAvailable 
      });
      
      setSuggestions(result.suggestions);
      setHasMoreSuggestions(result.hasMore);
      setSuggestionMetadata({
        totalAvailable: result.totalAvailable,
        requested: result.requested,
        actual: result.actual,
        remaining: result.remaining,
        totalShown: result.totalShown
      });
      
      setTimeout(() => setAnimateCard(true), 100);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert('Failed to fetch suggestions. Please try again.');
    } finally {
      setLoading(false);
      setIsGenerating(false);
      setRetryCount(0); // Reset retry count on success
    }
  };

  const handleViewRecipe = (recipe) => {
    // Open recipe modal instead of navigating to a separate page
    setSelectedRecipeId(recipe.id);
    setIsRecipeModalOpen(true);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setSelectedRecipeId(null);
  };

  const handleLoadMoreSuggestions = async () => {
    setLoadingMore(true);
    
    try {
      const {
        mealType = 'breakfast',
        dietaryPreference = 'any',
        cuisine = '',
        ingredients = ''
      } = router.query;

      // Get the same number of suggestions as the original request
      const originalCount = parseInt(router.query.suggestionCount) || 1;
      
      // Get new suggestions (replacing current ones)
      const result = await getSmartMealSuggestions(
        mealType,
        dietaryPreference,
        cuisine,
        ingredients,
        originalCount, // Get the same number as original request
        true // Get new suggestions with randomization
      );

      if (result.suggestions.length === 0) {
        setHasMoreSuggestions(false);
      } else {
        // Replace current suggestions with new ones
        setSuggestions(result.suggestions);
        setHasMoreSuggestions(result.hasMore);
        setSuggestionMetadata({
          totalAvailable: result.totalAvailable,
          requested: result.requested,
          actual: result.actual,
          remaining: result.remaining,
          totalShown: result.totalShown
        });
        
        // Reset animation for new suggestions
        setAnimateCard(false);
        setTimeout(() => setAnimateCard(true), 100);
      }
    } catch (error) {
      console.error('Error loading more suggestions:', error);
    } finally {
      setLoadingMore(false);
    }
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

  const getCuisineDisplayName = (cuisine) => {
    const cuisineLabels = {
      'yoruba': 'Yoruba Cuisine',
      'igbo': 'Igbo Cuisine',
      'hausa': 'Hausa Cuisine',
      'edo': 'Edo Cuisine',
      'ibibio': 'Ibibio Cuisine',
      'ijaw': 'Ijaw Cuisine',
      'nupe': 'Nupe Cuisine',
      'kanuri': 'Kanuri Cuisine',
      'fulani': 'Fulani Cuisine',
      'tiv': 'Tiv Cuisine',
      'nigerian': 'Nigerian Cuisine'
    };
    return cuisineLabels[cuisine] || `${cuisine} cuisine`;
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
              {router.query.cuisine && `${getCuisineDisplayName(router.query.cuisine)}`}
              {router.query.ingredients && router.query.ingredients.trim() !== '' && (
                <span className="inline-flex items-center gap-1 ml-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Matching ingredients: {router.query.ingredients}
                </span>
              )}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Meal Suggestions
                </h2>
              </div>
              {suggestionMetadata.totalAvailable > 0 && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                  {suggestionMetadata.totalShown} of {suggestionMetadata.totalAvailable} available
                  {suggestions.some(s => s.is_ai_generated) && (
                    <span className="ml-2 text-blue-600 font-medium">• AI Enhanced</span>
                  )}
                </div>
              )}
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
                          <span className="text-sm font-medium">
                            {suggestion.is_ai_generated ? 'AI' : 'DB'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {suggestion.description}
                      </p>
                      
                      {/* Show matching ingredients if user specified ingredients */}
                      {router.query.ingredients && router.query.ingredients.trim() !== '' && suggestion.ingredients && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Available ingredients used:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.ingredients
                              .filter(ingredient => 
                                router.query.ingredients.toLowerCase().includes(ingredient.toLowerCase())
                              )
                              .map((ingredient, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                                >
                                  {ingredient}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

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
                      <span className="text-sm font-medium">
                        {suggestion.is_ai_generated ? 'AI' : 'DB'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {suggestion.description}
                  </p>
                  
                  {/* Show matching ingredients if user specified ingredients */}
                  {router.query.ingredients && router.query.ingredients.trim() !== '' && suggestion.ingredients && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Available ingredients used:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.ingredients
                          .filter(ingredient => 
                            router.query.ingredients.toLowerCase().includes(ingredient.toLowerCase())
                          )
                          .map((ingredient, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                            >
                              {ingredient}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

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

            {/* AI Suggestions Info */}
            {suggestions.length > 0 && suggestions.some(s => s.is_ai_generated) && (
              <div className="mt-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">AI-Enhanced Suggestions</h3>
                  </div>
                  <p className="text-blue-700 text-sm">
                    You've explored all our database suggestions! Here are fresh AI-generated meal ideas tailored to your preferences. Click "Get More AI Suggestions" to see more.
                  </p>
                </div>
              </div>
            )}

            {/* New Suggestions Button */}
            {suggestions.length > 0 && hasMoreSuggestions && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMoreSuggestions}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading New Suggestions...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {suggestions.some(s => s.is_ai_generated) ? 'Get More AI Suggestions' : 'Get New Suggestions'}
                    </div>
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {suggestions.some(s => s.is_ai_generated) 
                    ? 'Click to see more AI-generated meal ideas' 
                    : 'Click to see different meal ideas for your preferences'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recipe Modal */}
        <RecipeModal
          recipeId={selectedRecipeId}
          isOpen={isRecipeModalOpen}
          onClose={handleCloseRecipeModal}
        />
      </div>
    </div>
  );
} 