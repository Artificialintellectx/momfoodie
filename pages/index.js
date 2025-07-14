import { useState, useEffect } from 'react'
import { generateAIMealSuggestion, generateMultipleAISuggestions } from '../lib/ai-service'
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  Sparkles, 
  RefreshCw, 
  Heart,
  Coffee,
  Sun,
  Moon,
  Brain,
  MessageCircle
} from 'lucide-react'

export default function Home() {
  const [mealType, setMealType] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [animateCard, setAnimateCard] = useState(false)
  const [cuisine, setCuisine] = useState('')
  const [availableIngredients, setAvailableIngredients] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' })
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [showMultiple, setShowMultiple] = useState(false)

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: Coffee, emoji: '🌅', color: 'from-yellow-400 to-orange-500' },
    { value: 'lunch', label: 'Lunch', icon: Sun, emoji: '☀️', color: 'from-orange-400 to-red-500' },
    { value: 'dinner', label: 'Dinner', icon: Moon, emoji: '🌙', color: 'from-purple-400 to-pink-500' }
  ]

  const dietaryPreferences = [
    { value: 'any', label: 'Any', description: 'No restrictions' },
    { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { value: 'vegan', label: 'Vegan', description: 'Plant-based only' },
    { value: 'gluten-free', label: 'Gluten Free', description: 'No gluten' },
    { value: 'low-carb', label: 'Low Carb', description: 'Reduced carbs' },
    { value: 'high-protein', label: 'High Protein', description: 'Protein rich' }
  ]

  const cuisineOptions = [
    { value: '', label: 'Any Cuisine', description: 'Mix of cuisines' },
    { value: 'Nigerian', label: 'Nigerian', description: 'Traditional Nigerian dishes', popular: true },
    { value: 'Italian', label: 'Italian', description: 'Pasta, pizza, Mediterranean' },
    { value: 'Mexican', label: 'Mexican', description: 'Tacos, enchiladas, spicy' },
    { value: 'Asian', label: 'Asian', description: 'Chinese, Japanese, Thai' },
    { value: 'Mediterranean', label: 'Mediterranean', description: 'Greek, Lebanese, healthy' },
    { value: 'American', label: 'American', description: 'Classic comfort food' },
    { value: 'Indian', label: 'Indian', description: 'Curries, spices, vegetarian' }
  ]



  const getSuggestion = async () => {
    if (!mealType || !dietaryPreference) {
      setError('Please select both meal type and dietary preference')
      return
    }

    setLoading(true)
    setError('')
    setAnimateCard(false)
    setShowMultiple(false)

    try {
      // Generate AI suggestion
      const selectedSuggestion = await generateAIMealSuggestion(
        mealType, 
        dietaryPreference, 
        cuisine, 
        availableIngredients
      )

      if (selectedSuggestion) {
        setSuggestion(selectedSuggestion)
        setSuggestions([])
        setAnimateCard(true)
      } else {
        setError('No suggestions found for your preferences. Try different options!')
      }
    } catch (err) {
      console.error('Error generating AI suggestion:', err)
      setError('Unable to generate AI suggestion. Please check your OpenAI API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMultipleSuggestions = async () => {
    if (!mealType || !dietaryPreference) {
      setError('Please select both meal type and dietary preference')
      return
    }

    setLoading(true)
    setError('')
    setAnimateCard(false)
    setShowMultiple(true)

    try {
      // Generate multiple AI suggestions
      const multipleSuggestions = await generateMultipleAISuggestions(
        mealType, 
        dietaryPreference, 
        cuisine, 
        availableIngredients,
        3
      )

      if (multipleSuggestions && multipleSuggestions.length > 0) {
        setSuggestions(multipleSuggestions)
        setSuggestion(null)
        setAnimateCard(true)
      } else {
        setError('Unable to generate multiple suggestions. Please try again.')
      }
    } catch (err) {
      console.error('Error generating multiple AI suggestions:', err)
      setError('Unable to generate multiple suggestions. Please check your OpenAI API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setFeedbackLoading(true)
    // For now, just log the feedback. You can wire this up to Formspree or your backend later.
    console.log('User Feedback:', feedback)
    setTimeout(() => {
      setFeedbackSent(true)
      setFeedbackLoading(false)
      setFeedback({ name: '', email: '', message: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-25 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <ChefHat className="w-12 h-12 text-orange-600" />
              <Heart className="w-4 h-4 text-red-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              MomFoodie
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Never wonder what to cook again! Get personalized meal suggestions for breakfast, lunch, or dinner based on your dietary preferences.
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 mb-8 border border-white/20">
          {/* Meal Type Selection */}
          <div className="mb-8">
            <label className="block text-xl font-bold text-gray-800 mb-6">
              <Utensils className="inline w-6 h-6 mr-3" />
              What meal are you planning?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealTypes.map((meal) => {
                const IconComponent = meal.icon
                return (
                  <button
                    key={meal.value}
                    onClick={() => setMealType(meal.value)}
                    className={`group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 btn-pulse ${
                      mealType === meal.value
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3">{meal.emoji}</div>
                      <IconComponent className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                        mealType === meal.value ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-500'
                      }`} />
                      <div className={`font-semibold text-lg ${
                        mealType === meal.value ? 'text-orange-700' : 'text-gray-700'
                      }`}>
                        {meal.label}
                      </div>
                    </div>
                    {mealType === meal.value && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${meal.color} opacity-10 rounded-2xl`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="mb-8">
            <label className="block text-xl font-bold text-gray-800 mb-6">
              <Sparkles className="inline w-6 h-6 mr-3" />
              Dietary Preference
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dietaryPreferences.map((diet) => (
                <button
                  key={diet.value}
                  onClick={() => setDietaryPreference(diet.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left btn-pulse ${
                    dietaryPreference === diet.value
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50'
                  }`}
                >
                  <div className={`font-semibold mb-1 ${
                    dietaryPreference === diet.value ? 'text-orange-700' : 'text-gray-700'
                  }`}>
                    {diet.label}
                  </div>
                  <div className="text-sm text-gray-500">{diet.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Options */}
          <div className="mb-8 space-y-6">
            {/* Cuisine Preference */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Preferred Cuisine (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {cuisineOptions.map((cuisineOption) => (
                  <button
                    key={cuisineOption.value}
                    onClick={() => setCuisine(cuisineOption.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 text-left relative ${
                      cuisine === cuisineOption.value
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50'
                    }`}
                  >
                    {cuisineOption.popular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        Popular
                      </div>
                    )}
                    <div className={`font-medium text-sm ${
                      cuisine === cuisineOption.value ? 'text-orange-700' : 'text-gray-700'
                    }`}>
                      {cuisineOption.label}
                    </div>
                    <div className="text-xs text-gray-500">{cuisineOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Ingredients */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Available Ingredients (Optional)
              </label>
              <textarea
                value={availableIngredients}
                onChange={(e) => setAvailableIngredients(e.target.value)}
                placeholder="e.g., chicken, rice, tomatoes, onions, garlic..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
                rows="3"
              />
              <p className="text-sm text-gray-500 mt-2">
                List ingredients you have on hand for more personalized suggestions
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="text-red-700 font-medium">{error}</div>
            </div>
          )}

          {/* Get Suggestion Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={getSuggestion}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl btn-pulse"
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Brain className="w-6 h-6" />
              )}
              {loading 
                ? 'AI is Creating Your Perfect Meal...'
                : 'Get AI Meal Suggestion'
              }
            </button>
            
            <button
              onClick={getMultipleSuggestions}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl btn-pulse"
            >
              {loading ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
              {loading 
                ? 'AI is Creating Multiple Meals...'
                : 'Get 3 AI Suggestions'
              }
            </button>
          </div>
        </div>

        {/* Single Suggestion Card */}
        {suggestion && !showMultiple && (
          <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border-l-4 border-orange-500 transition-all duration-500 ${
            animateCard ? 'animate-slide-up' : ''
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Today's Suggestion
              </h2>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-orange-600">
                  {suggestion.name}
                </h3>
                {suggestion.is_ai_generated && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                    <Brain className="w-3 h-3" />
                    AI Generated
                  </div>
                )}
              </div>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                {suggestion.description}
              </p>
              
              <div className="flex items-center gap-6 text-gray-600 mb-6 flex-wrap">
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">{suggestion.prep_time}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                  <Utensils className="w-5 h-5 text-green-500" />
                  <span className="font-medium capitalize">{mealType}</span>
                </div>
                {suggestion.difficulty && (
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                    <ChefHat className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{suggestion.difficulty}</span>
                  </div>
                )}
                {suggestion.cuisine && suggestion.cuisine !== 'Mixed' && (
                  <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{suggestion.cuisine}</span>
                  </div>
                )}
                {suggestion.serving_size && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                    <Heart className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">{suggestion.serving_size}</span>
                  </div>
                )}
                {suggestion.estimated_cost && (
                  <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full">
                    <span className="text-indigo-500 font-bold">$</span>
                    <span className="font-medium">{suggestion.estimated_cost}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Ingredients You'll Need:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestion.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                  >
                    <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Instructions - Only for AI suggestions */}
            {suggestion.instructions && suggestion.instructions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Cooking Instructions:
                </h4>
                <div className="space-y-3">
                  {suggestion.instructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed">{instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags - Only for AI suggestions */}
            {suggestion.tags && suggestion.tags.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Tags:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-medium rounded-full text-sm border border-pink-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition Information - Only for AI suggestions */}
            {suggestion.nutrition_info && Object.keys(suggestion.nutrition_info).length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Nutrition Information:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(suggestion.nutrition_info).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center"
                    >
                      <div className="text-sm text-gray-500 capitalize">{key}</div>
                      <div className="font-semibold text-gray-700">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={getSuggestion}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-2 btn-pulse"
              >
                <RefreshCw className="w-5 h-5" />
                Get Another Suggestion
              </button>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${suggestion.name} - MomFoodie`,
                      text: `Check out this delicious ${mealType} recipe: ${suggestion.name}. ${suggestion.description}`,
                      url: window.location.href
                    })
                  } else {
                    // Fallback for browsers that don't support Web Share API
                    navigator.clipboard.writeText(`${suggestion.name}: ${suggestion.description}`)
                    alert('Recipe copied to clipboard!')
                  }
                }}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 btn-pulse"
              >
                <Heart className="w-5 h-5" />
                Share Recipe
              </button>
            </div>
          </div>
        )}

        {/* Multiple Suggestions Display */}
        {showMultiple && suggestions.length > 0 && (
          <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border-l-4 border-purple-500 transition-all duration-500 ${
            animateCard ? 'animate-slide-up' : ''
          }`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Multiple AI Suggestions
              </h2>
            </div>
            
            <div className="space-y-8">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-purple-600">
                      {suggestion.name}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                      <Brain className="w-3 h-3" />
                      AI
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">{suggestion.prep_time}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium capitalize">{mealType}</span>
                    </div>
                    {suggestion.difficulty && (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <ChefHat className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{suggestion.difficulty}</span>
                      </div>
                    )}
                    {suggestion.cuisine && suggestion.cuisine !== 'Mixed' && (
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{suggestion.cuisine}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Ingredients:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestion.ingredients.slice(0, 6).map((ingredient, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{ingredient}</span>
                        </div>
                      ))}
                      {suggestion.ingredients.length > 6 && (
                        <div className="text-sm text-gray-500 italic">
                          +{suggestion.ingredients.length - 6} more ingredients
                        </div>
                      )}
                    </div>
                  </div>

                  {suggestion.tags && suggestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {suggestion.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium rounded-full text-xs border border-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={getMultipleSuggestions}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-2 btn-pulse"
              >
                <RefreshCw className="w-5 h-5" />
                Get More Suggestions
              </button>
              
              <button
                onClick={() => {
                  const allSuggestions = suggestions.map(s => `${s.name}: ${s.description}`).join('\n\n')
                  if (navigator.share) {
                    navigator.share({
                      title: `Multiple Meal Suggestions - MomFoodie`,
                      text: `Check out these ${mealType} suggestions:\n\n${allSuggestions}`,
                      url: window.location.href
                    })
                  } else {
                    navigator.clipboard.writeText(allSuggestions)
                    alert('Suggestions copied to clipboard!')
                  }
                }}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 btn-pulse"
              >
                <Heart className="w-5 h-5" />
                Share All
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 relative">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/30">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <p className="text-gray-600 font-medium">Made with love for delicious meals</p>
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
          <button
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all flex items-center gap-2"
            onClick={() => { setShowFeedback(true); setFeedbackSent(false); }}
            aria-label="Send Feedback"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden md:inline font-semibold">Send Feedback</span>
          </button>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setShowFeedback(false)}
                aria-label="Close Feedback"
              >
                &times;
              </button>
              {feedbackSent ? (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-bold text-orange-600 mb-4">Thank you for your feedback!</h3>
                  <p className="text-gray-600">We appreciate your input and will use it to improve MomFoodie.</p>
                  <button
                    className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                    onClick={() => setShowFeedback(false)}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  <h3 className="text-2xl font-bold text-orange-600 mb-2 text-center">Send Us Feedback</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name (optional)</label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:outline-none"
                      value={feedback.name}
                      onChange={e => setFeedback(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
                    <input
                      type="email"
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:outline-none"
                      value={feedback.email}
                      onChange={e => setFeedback(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:outline-none resize-none"
                      rows="4"
                      required
                      value={feedback.message}
                      onChange={e => setFeedback(f => ({ ...f, message: e.target.value }))}
                      placeholder="Your feedback..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={feedbackLoading}
                  >
                    {feedbackLoading ? 'Sending...' : 'Send Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
