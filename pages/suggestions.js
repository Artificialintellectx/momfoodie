import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Sparkles, Star, Clock, Users, DollarSign, Utensils, ChefHat, Heart, Globe } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { getSmartMealSuggestions, resetShownCounts } from '../lib/database-service';
import { pregenerateAISuggestions } from '../lib/database-service';
import RecipeModal from '../components/RecipeModal';

// Helper function for cuisine display names
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

// Delightful Loading Animation Component
const LoadingAnimation = ({ mealType, cuisine, isLoading, loadingProgress = 0, suggestionsReady = false, currentStage = 0 }) => {
  const [isComplete, setIsComplete] = useState(false);
  
  const stages = [
    {
      title: "Gathering Cuisine Preferences",
      description: `Exploring ${cuisine ? getCuisineDisplayName(cuisine) : 'Nigerian'} culinary traditions`,
      icon: Globe,
      color: "from-blue-400 to-purple-500",
      progressThreshold: 0.25
    },
    {
      title: "Gathering Dietary Preferences",
      description: "Understanding your dietary needs and restrictions",
      icon: Heart,
      color: "from-green-400 to-teal-500",
      progressThreshold: 0.5
    },
    {
      title: "Analyzing All Preferences",
      description: "Creating the perfect meal combination just for you",
      icon: Sparkles,
      color: "from-yellow-400 to-orange-500",
      progressThreshold: 0.75
    },
    {
      title: "Ready to Show Suggestions",
      description: "Your personalized meal suggestions are ready!",
      icon: ChefHat,
      color: "from-pink-400 to-red-500",
      progressThreshold: 1.0
    }
  ];

  // Update completion state
  useEffect(() => {
    console.log('🔄 LoadingAnimation update:', { loadingProgress, isLoading, suggestionsReady, currentStage });
    
    // Complete animation when suggestions are ready
    if (suggestionsReady) {
      setIsComplete(true);
      return;
    }

    // Reset completion when loading starts
    if (isLoading && !suggestionsReady) {
      setIsComplete(false);
    }
  }, [loadingProgress, isLoading, suggestionsReady, currentStage]);

  // Force re-render when currentStage changes
  useEffect(() => {
    console.log('🎯 LoadingAnimation: Stage changed to', currentStage);
  }, [currentStage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-1 sm:p-2 md:p-4">
      {/* Mobile-optimized layout */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Compact Header for Mobile */}
        <div className="text-center mb-2 sm:mb-3 md:mb-6">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-1.5 sm:mb-2 md:mb-3 animate-bounce">
            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-0.5 sm:mb-1 md:mb-2">
            Creating Your Perfect {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </h1>
          <p className="text-xs text-gray-600">
            Our AI chef is crafting personalized suggestions just for you
          </p>
        </div>

        {/* Mobile-optimized Progress Stages */}
        <div className="space-y-1.5 sm:space-y-2 md:space-y-4">
          {stages.map((stage, index) => {
            const IconComponent = stage.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            
            // Debug logging for stage states
            if (isActive || isCompleted) {
              console.log(`🎯 Stage ${index} (${stage.title}):`, { isActive, isCompleted, currentStage });
            }
            
            return (
              <div
                key={index}
                className={`relative transition-all duration-1000 ease-out ${
                  isActive ? 'scale-105 animate-stage-bounce' : 'scale-100'
                }`}
              >
                {/* Compact Stage Card */}
                <div
                  className={`relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-2.5 md:p-4 border-2 transition-all duration-1000 ${
                    isActive
                      ? `bg-gradient-to-r ${stage.color} border-transparent shadow-xl animate-stage-glow`
                      : isCompleted
                      ? 'bg-green-50 border-green-200 shadow-lg'
                      : 'bg-white border-gray-200 shadow-md'
                  }`}
                >
                  {/* Background Pattern */}
                  {isActive && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full -ml-4 -mb-4 sm:-ml-6 sm:-mb-6"></div>
                    </div>
                  )}

                  {/* Compact Content */}
                  <div className="relative flex items-center space-x-2 sm:space-x-2.5 md:space-x-3">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-1000 ${
                        isActive
                          ? 'bg-white/20 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-green-500 text-white animate-bounce-in'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <IconComponent className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      )}
                    </div>

                    {/* Compact Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-xs sm:text-sm md:text-base transition-all duration-1000 ${
                          isActive ? 'text-white' : isCompleted ? 'text-green-800' : 'text-gray-700'
                        }`}
                      >
                        {stage.title}
                      </h3>
                      <p
                        className={`text-xs transition-all duration-1000 ${
                          isActive ? 'text-white/90' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {stage.description}
                      </p>
                    </div>

                    {/* Animated Elements */}
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="flex space-x-0.5 sm:space-x-1">
                          {[0, 1, 2].map((dot) => (
                            <div
                              key={dot}
                              className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white/60 rounded-full animate-bounce"
                              style={{
                                animationDelay: `${dot * 0.2}s`,
                                animationDuration: '1s'
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-white/20">
                      <div className="h-full bg-white/60 rounded-r-full animate-stage-progress"></div>
                    </div>
                  )}
                </div>

                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className="absolute left-3 sm:left-3.5 md:left-4 top-full w-0.5 h-2 sm:h-3 md:h-4 bg-gradient-to-b from-gray-200 to-transparent"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Loading Message */}
        <div className="text-center mt-2 sm:mt-3 md:mt-6">
          {!isComplete ? (
            <div className="inline-flex items-center space-x-1.5 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
              <div className="flex space-x-0.5 sm:space-x-1">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${dot * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-700 font-medium">Almost there...</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-green-700 font-medium">Ready!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [suggestionsReady, setSuggestionsReady] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const isGeneratingRef = useRef(false);

  // Debug loadingProgress changes
  useEffect(() => {
    console.log('🔄 loadingProgress changed to:', loadingProgress);
  }, [loadingProgress]);

  // Calculate current stage based on progress
  useEffect(() => {
    const stages = [0.25, 0.5, 0.75, 1.0];
    let newStage = 0;
    
    // Find the current stage based on progress
    for (let i = 0; i < stages.length; i++) {
      if (loadingProgress >= stages[i]) {
        newStage = i;
      } else {
        break;
      }
    }
    
    console.log('🎯 Stage calculation:', { loadingProgress, newStage, currentStage, stages });
    
    if (newStage !== currentStage) {
      console.log('🎯 Main component: Updating stage from', currentStage, 'to', newStage);
      setCurrentStage(newStage);
    }
  }, [loadingProgress, currentStage]);

  const generateSuggestions = useCallback(async (mealType, dietaryPreference, cuisine, ingredients, suggestionCount) => {
    console.log('🔄 generateSuggestions called with:', { mealType, dietaryPreference, cuisine, ingredients, suggestionCount });
    
    // Prevent multiple simultaneous calls
    if (isGeneratingRef.current) {
      console.log('⚠️ generateSuggestions already in progress, skipping...');
      return;
    }
    
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setLoading(true);
    setSuggestions([]);
    setAnimateCard(false);
    setLoadingProgress(0);
    setSuggestionsReady(false);

    // Reset shown counts for this criteria when first loading
    await resetShownCounts(mealType, dietaryPreference, cuisine, ingredients);
    setLoadingProgress(0.25); // Stage 1: Gathering Cuisine Preferences

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
        setLoadingProgress(0.5); // Stage 2: Gathering Dietary Preferences
        
        // Prevent too many retries
        if (retryCount >= 2) {
          console.error('❌ Max retries reached, showing error');
          alert('Failed to load suggestions after multiple attempts. Please refresh the page.');
          return;
        }
        
        setRetryCount(prev => prev + 1);
        // Wait longer before retrying to avoid overwhelming the backend
        await new Promise(resolve => setTimeout(resolve, 3000));
        return generateSuggestions(mealType, dietaryPreference, cuisine, ingredients, suggestionCount);
      }
      
      console.log('✅ generateSuggestions result:', { 
        suggestionsCount: result.suggestions.length, 
        totalShown: result.totalShown,
        totalAvailable: result.totalAvailable 
      });
      
      setLoadingProgress(0.75); // Stage 3: Analyzing All Preferences
      setSuggestions(result.suggestions);
      setHasMoreSuggestions(result.hasMore);
      setSuggestionMetadata({
        totalAvailable: result.totalAvailable,
        requested: result.requested,
        actual: result.actual,
        remaining: result.remaining,
        totalShown: result.totalShown
      });
      
      setLoadingProgress(1.0); // Stage 4: Ready to Show Suggestions
      setSuggestionsReady(true);
      setTimeout(() => setAnimateCard(true), 100);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert('Failed to fetch suggestions. Please try again.');
    } finally {
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setLoading(false);
      }, 500);
      isGeneratingRef.current = false;
      setIsGenerating(false);
      setRetryCount(0); // Reset retry count on success
    }
  }, [retryCount]);

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
      
      // Call generateSuggestions directly without dependency
      const fetchSuggestions = async () => {
        if (isGeneratingRef.current) {
          console.log('⚠️ Already generating suggestions, skipping...');
          return;
        }
        
        isGeneratingRef.current = true;
        setLoading(true);
        setSuggestions([]);
        setAnimateCard(false);
        setLoadingProgress(0);
        setSuggestionsReady(false);
        setCurrentStage(0);

        // Reset shown counts for this criteria when first loading
        await resetShownCounts(mealType, dietaryPreference, cuisine, ingredients);
        
        // Add delay to ensure smooth stage transitions
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('📊 Setting progress to 0.25 (Stage 1)');
        setLoadingProgress(0.25); // Stage 1: Gathering Cuisine Preferences
        console.log('📊 Progress state after 0.25:', loadingProgress);
        
        // Add delay before starting the AI request to show stage 1
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Add delay to show stage 2 (Gathering Dietary Preferences)
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('📊 Setting progress to 0.5 (Stage 2)');
          setLoadingProgress(0.5); // Stage 2: Gathering Dietary Preferences
          
          const result = await getSmartMealSuggestions(
            mealType,
            dietaryPreference,
            cuisine,
            ingredients,
            parseInt(suggestionCount),
            false // First load, not getting new suggestions
          );
          
          // Handle case where request was skipped due to duplicate
          if (result === null) {
            console.log('⚠️ Request was skipped due to duplicate, retrying...');
            
            // Add delay before stage 2
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('📊 Setting progress to 0.5 (Stage 2)');
            setLoadingProgress(0.5); // Stage 2: Gathering Dietary Preferences
            
            // Prevent too many retries
            if (retryCount >= 2) {
              console.error('❌ Max retries reached, showing error');
              alert('Failed to load suggestions after multiple attempts. Please refresh the page.');
              return;
            }
            
            setRetryCount(prev => prev + 1);
            // Wait longer before retrying to avoid overwhelming the backend
            await new Promise(resolve => setTimeout(resolve, 3000));
            return fetchSuggestions();
          }
          
          console.log('✅ generateSuggestions result:', { 
            suggestionsCount: result.suggestions.length, 
            totalShown: result.totalShown,
            totalAvailable: result.totalAvailable 
          });
          
          // Add delay before stage 3
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('📊 Setting progress to 0.75 (Stage 3)');
          setLoadingProgress(0.75); // Stage 3: Analyzing All Preferences
          console.log('📊 Progress state after 0.75:', loadingProgress);
          setSuggestions(result.suggestions);
          setHasMoreSuggestions(result.hasMore);
          setSuggestionMetadata({
            totalAvailable: result.totalAvailable,
            requested: result.requested,
            actual: result.actual,
            remaining: result.remaining,
            totalShown: result.totalShown
          });
          
          // Add a small delay before final stage
          setTimeout(() => {
            console.log('📊 Setting progress to 1.0 (Stage 4)');
            setLoadingProgress(1.0); // Stage 4: Ready to Show Suggestions
            console.log('📊 Progress state after 1.0:', loadingProgress);
            setSuggestionsReady(true);
          }, 1000);
          
          // Ensure minimum loading time for smooth animation
          await new Promise(resolve => setTimeout(resolve, 500));
          setTimeout(() => setAnimateCard(true), 100);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          alert('Failed to fetch suggestions. Please try again.');
        } finally {
          // Add a small delay to ensure smooth transition
          setTimeout(() => {
            setLoading(false);
          }, 500);
          isGeneratingRef.current = false;
          setIsGenerating(false);
          setRetryCount(0); // Reset retry count on success
        }
      };
      
      fetchSuggestions();
      
      // Start pre-generating AI suggestions in the background for faster loading
      setTimeout(() => {
        pregenerateAISuggestions(mealType, dietaryPreference, cuisine, ingredients);
      }, 500);
    }
  }, [router.isReady, router.query, hasInitialized, retryCount, loadingProgress]);

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
      <div className="container mx-auto px-4 py-2 sm:py-4 max-w-2xl">
        {/* Header with Back Button - More compact */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={handleBack}
            className="p-2.5 sm:p-3 bg-white rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {getMealTypeIcon(router.query.mealType)} {getMealTypeLabel(router.query.mealType)} Suggestions
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm truncate">
              {router.query.dietaryPreference !== 'any' && `${router.query.dietaryPreference} • `}
              {router.query.cuisine && `${getCuisineDisplayName(router.query.cuisine)}`}
              {router.query.ingredients && router.query.ingredients.trim() !== '' && (
                <span className="inline-flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></span>
                  <span className="hidden sm:inline">Matching ingredients:</span>
                  <span className="sm:hidden">Ingredients:</span>
                  {router.query.ingredients}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <LoadingAnimation 
            key="loading-animation"
            mealType={router.query.mealType || 'breakfast'} 
            cuisine={router.query.cuisine || ''} 
            isLoading={loading}
            loadingProgress={loadingProgress}
            suggestionsReady={suggestionsReady}
            currentStage={currentStage}
          />
        )}

        {/* Suggestions Display */}
        {suggestions.length > 0 && !loading && (
          <div className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 transition-all duration-500 ${
            animateCard ? 'animate-fade-in' : ''
          }`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-full">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Your Meal Suggestions
                </h2>
              </div>
              {suggestionMetadata.totalAvailable > 0 && (
                <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-full">
                  <span className="hidden sm:inline">{suggestionMetadata.totalShown} of {suggestionMetadata.totalAvailable} available</span>
                  <span className="sm:hidden">{suggestionMetadata.totalShown}/{suggestionMetadata.totalAvailable}</span>
                  {suggestions.some(s => s.is_ai_generated) && (
                    <span className="ml-1 sm:ml-2 text-blue-600 font-medium">• AI</span>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden">
              <Swiper
                spaceBetween={16}
                slidesPerView={1.1}
                centeredSlides={true}
                loop={false}
                className="suggestion-swiper"
              >
                {suggestions.map((suggestion, index) => (
                  <SwiperSlide key={index}>
                    <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-orange-100 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
                          {suggestion.name}
                        </h3>
                        <div className="flex items-center gap-1 text-orange-500">
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                          <span className="text-xs sm:text-sm font-medium">
                            {suggestion.is_ai_generated ? 'AI' : 'DB'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                        {suggestion.description}
                      </p>
                      
                      {/* Show matching ingredients if user specified ingredients */}
                      {router.query.ingredients && router.query.ingredients.trim() !== '' && suggestion.ingredients && (
                        <div className="mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Available ingredients used:</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {suggestion.ingredients
                              .filter(ingredient => 
                                router.query.ingredients.toLowerCase().includes(ingredient.toLowerCase())
                              )
                              .map((ingredient, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                                >
                                  {ingredient}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{suggestion.prep_time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{suggestion.serving_size}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{suggestion.estimated_cost}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{suggestion.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={() => handleViewRecipe(suggestion)}
                        className="w-full bg-orange-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                      >
                        View Recipe
                      </button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop List */}
            <div className="hidden md:grid gap-4 sm:gap-6">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-orange-100 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
                      {suggestion.name}
                    </h3>
                    <div className="flex items-center gap-1 text-orange-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {suggestion.is_ai_generated ? 'AI' : 'DB'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                    {suggestion.description}
                  </p>
                  
                  {/* Show matching ingredients if user specified ingredients */}
                  {router.query.ingredients && router.query.ingredients.trim() !== '' && suggestion.ingredients && (
                    <div className="mb-3 sm:mb-4">
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

                  <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{suggestion.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{suggestion.serving_size}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{suggestion.estimated_cost}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{suggestion.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {suggestion.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleViewRecipe(suggestion)}
                    className="bg-orange-500 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl hover:bg-orange-600 transition-colors duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    View Recipe
                  </button>
                </div>
              ))}
            </div>

            {/* AI Suggestions Info */}
            {suggestions.length > 0 && suggestions.some(s => s.is_ai_generated) && (
              <div className="mt-4 sm:mt-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-blue-900">AI-Enhanced Suggestions</h3>
                  </div>
                  <p className="text-blue-700 text-xs sm:text-sm">
                    You've explored all our database suggestions! Here are fresh AI-generated meal ideas tailored to your preferences. Click "Get More AI Suggestions" to see more.
                  </p>
                </div>
              </div>
            )}

            {/* New Suggestions Button */}
            {suggestions.length > 0 && hasMoreSuggestions && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={handleLoadMoreSuggestions}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none text-sm sm:text-base"
                >
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Loading New Suggestions...</span>
                      <span className="sm:hidden">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">
                        {suggestions.some(s => s.is_ai_generated) ? 'Get More AI Suggestions' : 'Get New Suggestions'}
                      </span>
                      <span className="sm:hidden">
                        {suggestions.some(s => s.is_ai_generated) ? 'More AI' : 'More'}
                      </span>
                    </div>
                  )}
                </button>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
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