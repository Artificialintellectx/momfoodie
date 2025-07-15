import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Heart, MessageCircle, Home as HomeIcon, Utensils, Settings, ArrowRight, Star, Clock, Users, DollarSign, X, List, Info } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { generateMultipleAISuggestions } from '../lib/ai-service';

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
      
      {/* Dietary Preference Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-40 mb-3 skeleton-wave"></div>
        <div className="h-14 bg-gray-100 rounded-xl skeleton-pulse"></div>
      </div>
      
      {/* Cuisine Skeleton */}
      <div>
        <div className="h-4 bg-gray-200 rounded w-36 mb-3 skeleton-wave"></div>
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
  const [mealType, setMealType] = useState('breakfast');
  const [dietaryPreference, setDietaryPreference] = useState('any');
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestionCount, setSuggestionCount] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    
    // Simulate feedback submission
    setTimeout(() => {
      console.log('Feedback submitted:', feedbackMessage);
      setFeedbackSent(true);
      setFeedbackLoading(false);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSent(false);
        setFeedbackMessage('');
      }, 2000);
    }, 1000);
  };

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipe(true);
  };

  const mealTypeOptions = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' }
  ];

  const dietaryOptions = [
    { value: 'any', label: 'Any' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'low-carb', label: 'Low-Carb' },
    { value: 'high-protein', label: 'High-Protein' }
  ];

  const cuisineOptions = [
    { value: '', label: 'Any Cuisine' },
    { value: 'nigerian', label: 'Nigerian', popular: true },
    { value: 'italian', label: 'Italian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'thai', label: 'Thai' },
    { value: 'french', label: 'French' }
  ];

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
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
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

            {/* Dietary Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-white"
              >
                {dietaryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preferred Cuisine
              </label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all duration-200 bg-white"
              >
                {cuisineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.popular && '🔥'}
                  </option>
                ))}
              </select>
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

            {/* Suggestion Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                How many suggestions?
              </label>
              <div className="flex gap-2">
                {[1, 3, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSuggestionCount(count)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                      suggestionCount === count
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
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
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Getting Suggestions...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Get Suggestions
                  </div>
                )}
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

        {/* Desktop Action Button */}
        {!pageLoading && (
          <div className="hidden md:block mb-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Getting Suggestions...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Suggestions
                </div>
              )}
            </button>
          </div>
        )}

        {/* Suggestions Display */}
        {loading && (
          <SuggestionsSkeleton />
        )}
        
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
      </div>

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
