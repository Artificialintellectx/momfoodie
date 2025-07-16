import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChefHat, Sparkles, Heart, MessageCircle, Home as HomeIcon, Utensils, Settings, ArrowRight, Star, Clock, Users, DollarSign, X, List, Info } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

// Loading Skeleton Components
const FormSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
    <div className="space-y-6">
      {/* Meal Type Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-3 skeleton-wave"></div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl skeleton-pulse"></div>
          ))}
        </div>
      </div>
      
      {/* Cuisine Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 mb-3 skeleton-wave"></div>
        <div className="h-14 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Dietary Preference Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 mb-3 skeleton-wave"></div>
        <div className="h-14 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Ingredients Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-44 mb-3 skeleton-wave"></div>
        <div className="h-24 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Suggestion Count Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 mb-3 skeleton-wave"></div>
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

    <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-4">
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

    {/* Mobile Carousel Skeleton */}
    <div className="md:hidden">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-80">
            <SuggestionCardSkeleton />
          </div>
        ))}
      </div>
    </div>

    {/* Desktop List Skeleton */}
    <div className="hidden md:grid gap-6">
      {[1, 2, 3].map((i) => (
        <SuggestionCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full skeleton-pulse"></div>
      <div className="h-12 bg-gray-200 rounded w-48 skeleton-wave"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-80 mx-auto skeleton-wave"></div>
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
    { value: 'igbo', label: 'Igbo Cuisine', icon: '🥜' },
    { value: 'hausa', label: 'Hausa Cuisine', icon: '🌾' },
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
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        {pageLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
                <ChefHat className="w-10 h-10 text-orange-500 animate-bounce" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: 'Fredoka One, cursive' }}>
                Mummyfoodie
              </h1>
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Never wonder what to cook again! Get personalized meal suggestions
            </p>
          </div>
        )}

        {/* Main Form */}
        {pageLoading ? (
          <FormSkeleton />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
              What meal are you planning?
            </label>
              <div className="grid grid-cols-3 gap-3">
                {mealTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMealType(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                      mealType === option.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:bg-orange-25'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

            {/* Cuisine Selection */}
            <div>
              <CustomDropdown
                label="Preferred Cuisine"
                options={cuisineOptions}
                value={cuisine}
                onChange={setCuisine}
                placeholder="Select cuisine"
              />
            </div>

            {/* Dietary Preference */}
            <div>
              <CustomDropdown
                label="Dietary Preference"
                options={dietaryOptions}
                value={dietaryPreference}
                onChange={handleDietaryPreferenceChange}
                placeholder="Select preference"
              />
        </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Available Ingredients (optional)
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken, rice, tomatoes, spinach..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none"
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

        {/* Sticky Action Buttons */}
        {!pageLoading && (
          <div className="fixed bottom-6 left-4 right-4 z-40 md:hidden">
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Suggestions
                </div>
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="bg-white text-orange-500 font-bold py-4 px-4 rounded-2xl shadow-lg border-2 border-orange-200 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}




      </div>



      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Share Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {feedbackSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-500 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">Thank you!</h3>
                <p className="text-gray-600">We appreciate your feedback and will use it to improve Mummyfoodie.</p>
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
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none"
                    rows="4"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 transform hover:scale-105 active:scale-95"
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
