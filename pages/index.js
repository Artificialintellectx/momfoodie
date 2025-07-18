import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChefHat, Sparkles, Heart, MessageCircle, Home as HomeIcon, Utensils, Settings, ArrowRight, Star, Clock, Users, DollarSign, X, List, Info } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

// Loading Skeleton Components
const FormSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
    <div className="space-y-5 sm:space-y-6">
      {/* Meal Type Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 sm:w-48 mb-3 skeleton-wave"></div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 sm:h-24 bg-gray-100 rounded-xl skeleton-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Cuisine Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 sm:w-36 mb-3 skeleton-wave"></div>
        <div className="h-14 sm:h-12 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Dietary Preference Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 sm:w-40 mb-3 skeleton-wave"></div>
        <div className="h-14 sm:h-12 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Ingredients Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 sm:w-44 mb-3 skeleton-wave"></div>
        <div className="h-24 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Suggestion Count Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 sm:w-40 mb-3 skeleton-wave"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-12 bg-gray-100 rounded-xl skeleton-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SuggestionCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 skeleton-wave"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-8 skeleton-pulse"></div>
    </div>
    
    <div className="space-y-2 mb-3 sm:mb-4">
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full skeleton-wave"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6 skeleton-wave"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6 skeleton-wave"></div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded skeleton-pulse"></div>
          <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-12 sm:w-16 skeleton-wave"></div>
        </div>
      ))}
    </div>

    <div className="flex gap-2 mb-3 sm:mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-5 sm:h-6 bg-gray-200 rounded-full w-12 sm:w-16 skeleton-pulse"></div>
      ))}
    </div>

    <div className="h-10 sm:h-12 bg-gray-200 rounded-xl skeleton-wave"></div>
  </div>
);

const SuggestionsSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
    <div className="flex items-center gap-2 mb-4 sm:mb-6">
      <div className="p-1.5 sm:p-2 bg-gray-200 rounded-full w-8 h-8 sm:w-9 sm:h-9 skeleton-pulse"></div>
      <div className="h-6 sm:h-7 bg-gray-200 rounded w-40 sm:w-48 skeleton-wave"></div>
    </div>

    {/* Mobile Carousel Skeleton */}
    <div className="md:hidden">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 sm:w-80">
            <SuggestionCardSkeleton />
          </div>
        ))}
      </div>
    </div>

    {/* Desktop List Skeleton */}
    <div className="hidden md:grid gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <SuggestionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="text-center mb-6 sm:mb-8">
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full skeleton-pulse"></div>
      <div className="h-8 sm:h-12 bg-gray-200 rounded w-40 sm:w-48 skeleton-wave"></div>
    </div>
    <div className="h-4 sm:h-6 bg-gray-200 rounded w-64 sm:w-80 mx-auto skeleton-wave"></div>
  </div>
);

export default function Home() {
  const router = useRouter();
  const [mealType, setMealType] = useState('breakfast');
  const [dietaryPreference, setDietaryPreference] = useState('any');
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState('');

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showDietaryDropdown, setShowDietaryDropdown] = useState(false);
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDietaryDropdown(false);
        setShowCuisineDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Navigate to suggestions page with form data for both mobile and desktop
    const queryParams = new URLSearchParams({
      mealType,
      dietaryPreference,
      cuisine,
      ingredients,
      suggestionCount: '1' // Default to 1 suggestion
    });
    router.push(`/suggestions?${queryParams.toString()}`);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    
    try {
      // Send feedback to your email or database
      const feedbackData = {
        message: feedbackMessage,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Send feedback via API route
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      const result = await response.json();
      console.log('Feedback sent successfully:', result);
      
      setFeedbackSent(true);
      setFeedbackLoading(false);
      
      // Show success message
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSent(false);
        setFeedbackMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Failed to send feedback:', error);
      setFeedbackLoading(false);
      // You could show an error message here
    }
  };



  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  const dietaryOptions = [
    { value: 'any', label: 'Any Food', icon: '🍽️' },
    { value: 'vegetarian', label: 'No Meat (Efo, Moi Moi)', icon: '🥬' },
    { value: 'vegan', label: 'Plant-Based Only', icon: '🌱' },
    { value: 'gluten-free', label: 'No Wheat (Yam, Rice)', icon: '🌾' },
    { value: 'low-carb', label: 'Light Food (Soup, Pepper Soup)', icon: '🥑' },
    { value: 'high-protein', label: 'Protein Rich (Fish, Meat)', icon: '💪' },
    { value: 'halal', label: 'Halal (No Pork)', icon: '☪️' },
    { value: 'pescatarian', label: 'Fish Only (No Meat)', icon: '🐟' },
    { value: 'low-spice', label: 'Mild Spice (No Pepper)', icon: '🌶️' },
    { value: 'traditional', label: 'Traditional Nigerian', icon: '🇳🇬' },
    { value: 'modern', label: 'Modern Nigerian', icon: '🍛' }
  ];

  const cuisineOptions = [
    { value: '', label: 'Any Nigerian Cuisine', icon: '🇳🇬' },
    { value: 'yoruba', label: 'Yoruba Cuisine', icon: '🫘', popular: true },
    { value: 'igbo', label: 'Igbo Cuisine', icon: '🥜', popular: true },
    { value: 'hausa', label: 'Hausa Cuisine', icon: '🌾', popular: true },
    { value: 'edo', label: 'Edo Cuisine', icon: '🍠' },
    { value: 'ibibio', label: 'Ibibio Cuisine', icon: '🐟' },
    { value: 'ijaw', label: 'Ijaw Cuisine', icon: '🦐' },
    { value: 'nupe', label: 'Nupe Cuisine', icon: '🌽' },
    { value: 'kanuri', label: 'Kanuri Cuisine', icon: '🥩' },
    { value: 'fulani', label: 'Fulani Cuisine', icon: '🥛' },
    { value: 'tiv', label: 'Tiv Cuisine', icon: '🌿' }
  ];

  const handleDietaryPreferenceChange = (value) => {
    setDietaryPreference(value);
  };

  const isNigerianDietarySelected = false;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        {/* Header */}
        {pageLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative">
                <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: 'Fredoka One, cursive' }}>
                Mummyfoodie
              </h1>
            </div>
            <p className="text-gray-600 text-base sm:text-lg font-medium px-2">
              Never wonder what to cook again! Get personalized meal suggestions
            </p>
          </div>
        )}

        {/* Main Form */}
        {pageLoading ? (
          <FormSkeleton />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          
          {/* Progress Indicator */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Form Progress</span>
              <span className="text-xs font-medium text-gray-600">
                {[mealType, cuisine, dietaryPreference].filter(Boolean).length}/3 completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${([mealType, cuisine, dietaryPreference].filter(Boolean).length / 3) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${mealType ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>Meal Type</span>
              <span className={`text-xs ${cuisine ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>Cuisine</span>
              <span className={`text-xs ${dietaryPreference ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>Dietary</span>
            </div>
          </div>

          {/* Meal Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
              What meal are you planning?
            </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {mealTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMealType(option.value)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[80px] sm:min-h-[100px] ${
                      mealType === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:bg-orange-25'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs sm:text-sm font-medium leading-tight">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

            {/* Enhanced Cuisine Selection */}
            <div className={`relative ${!cuisine ? 'animate-pulse' : ''} ${mealType && !cuisine ? 'ring-2 ring-orange-200 ring-opacity-50 rounded-xl p-2 -m-2' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Choose Your Cuisine
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">• Get authentic recipes</span>
                </div>
              </div>
              
              {/* Quick Selection for Popular Cuisines */}
              <div className="mb-4">
                <div className="text-xs text-gray-600 mb-2">Quick pick popular cuisines:</div>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.filter(opt => opt.popular).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setCuisine(option.value)}
                      className={`px-3 py-2.5 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm font-medium min-h-[44px] flex items-center justify-center ${
                        cuisine === option.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <span className="mr-1">{option.icon}</span>
                      <span className="hidden sm:inline">{option.label.replace(' Cuisine', '')}</span>
                      <span className="sm:hidden">{option.label.replace(' Cuisine', '').split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Cuisine Dropdown */}
              <div className="relative">
                <CustomDropdown
                  label=""
                  options={cuisineOptions}
                  value={cuisine}
                  onChange={setCuisine}
                  placeholder="Or select any Nigerian cuisine..."
                />
              </div>
              
              {/* Success Indicator */}
              {cuisine && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-green-500">✅</div>
                    <div className="text-sm text-green-700 font-medium">
                      Great choice! We'll suggest authentic {cuisineOptions.find(opt => opt.value === cuisine)?.label.toLowerCase()} recipes.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cuisine Selection Helper */}
              {!cuisine && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-500 mt-0.5">💡</div>
                    <div className="text-sm text-blue-700">
                      <strong>Tip:</strong> Choosing a specific cuisine helps us suggest authentic, traditional recipes that match your cultural preferences.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dietary Preference */}
            <div className="relative z-0">
              <CustomDropdown
                label="Dietary Preference"
                options={dietaryOptions}
                value={dietaryPreference}
                onChange={handleDietaryPreferenceChange}
                placeholder="Select preference"
              />
        </div>

            {/* Ingredients */}
            <div className="relative z-0">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Available Ingredients (optional)
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken, rice, tomatoes, spinach..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none text-base"
                rows="3"
              />
            </div>
            


            {/* Desktop Submit Button */}
            <div className="hidden md:block">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Suggestions
                </div>
              </button>
            </div>
          </form>
                  </div>
        )}

        {/* Enhanced Sticky Action Buttons for Mobile */}
        {!pageLoading && (
          <div className="fixed bottom-4 left-3 right-3 z-40 md:hidden">
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[56px] flex items-center justify-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-base">Get Suggestions</span>
                </div>
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="bg-white text-orange-500 font-bold py-4 px-4 rounded-2xl shadow-lg border-2 border-orange-200 transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[56px] min-w-[56px] flex items-center justify-center"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}




      </div>



      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[9997]">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Share Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSent ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 fill-current" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-4">Thank you!</h3>
                <p className="text-gray-600 text-sm sm:text-base">We appreciate your feedback and will use it to improve Mummyfoodie.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Tell us what you think about Mummyfoodie..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none text-base"
                    rows="4"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full bg-orange-500 text-white font-bold py-3 sm:py-4 px-6 rounded-xl hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 active:scale-95 min-h-[48px] flex items-center justify-center"
                >
                  {feedbackLoading ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
