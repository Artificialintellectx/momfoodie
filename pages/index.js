import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateAIMealSuggestion } from '../lib/ai-service'
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
  Database
} from 'lucide-react'

export default function Home() {
  const [mealType, setMealType] = useState('')
  const [dietaryPreference, setDietaryPreference] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [animateCard, setAnimateCard] = useState(false)
  const [useAI, setUseAI] = useState(false)
  const [cuisine, setCuisine] = useState('')
  const [availableIngredients, setAvailableIngredients] = useState('')

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
    { value: 'Nigerian', label: 'Nigerian', description: 'Traditional Nigerian dishes' },
    { value: 'Italian', label: 'Italian', description: 'Pasta, pizza, Mediterranean' },
    { value: 'Mexican', label: 'Mexican', description: 'Tacos, enchiladas, spicy' },
    { value: 'Asian', label: 'Asian', description: 'Chinese, Japanese, Thai' },
    { value: 'Mediterranean', label: 'Mediterranean', description: 'Greek, Lebanese, healthy' },
    { value: 'American', label: 'American', description: 'Classic comfort food' },
    { value: 'Indian', label: 'Indian', description: 'Curries, spices, vegetarian' }
  ]

  // Fallback meal suggestions
  const fallbackSuggestions = {
    breakfast: {
      any: [
        { 
          name: 'Akara and Bread', 
          description: 'Crispy bean fritters served with fresh bread and spicy pepper sauce', 
          prep_time: '20 mins', 
          ingredients: ['Black-eyed peas', 'Onions', 'Scotch bonnet pepper', 'Salt', 'Fresh bread', 'Palm oil'] 
        },
        { 
          name: 'Moi Moi', 
          description: 'Steamed bean pudding with aromatic spices and vegetables', 
          prep_time: '45 mins', 
          ingredients: ['Black-eyed peas', 'Red bell pepper', 'Onions', 'Palm oil', 'Seasoning cubes', 'Boiled eggs'] 
        },
        { 
          name: 'Yam and Egg Sauce', 
          description: 'Boiled yam served with scrambled eggs in tomato sauce', 
          prep_time: '25 mins', 
          ingredients: ['White yam', 'Eggs', 'Tomatoes', 'Onions', 'Pepper', 'Vegetable oil'] 
        },
        { 
          name: 'Pancakes Nigerian Style', 
          description: 'Fluffy pancakes with a Nigerian twist using plantain', 
          prep_time: '20 mins', 
          ingredients: ['Flour', 'Eggs', 'Milk', 'Ripe plantain', 'Sugar', 'Baking powder', 'Nutmeg'] 
        }
      ],
      vegetarian: [
        { 
          name: 'Vegetarian Moi Moi', 
          description: 'Steamed bean pudding with vegetables and no meat', 
          prep_time: '45 mins', 
          ingredients: ['Black-eyed peas', 'Bell peppers', 'Onions', 'Palm oil', 'Seasoning', 'Carrots'] 
        },
        { 
          name: 'Bread and Tea', 
          description: 'Fresh bread with Nigerian tea (milk tea with spices)', 
          prep_time: '10 mins', 
          ingredients: ['Fresh bread', 'Tea bags', 'Milk', 'Sugar', 'Ginger', 'Cloves'] 
        },
        { 
          name: 'Fruit Salad with Yogurt', 
          description: 'Fresh tropical fruits with creamy yogurt', 
          prep_time: '15 mins', 
          ingredients: ['Banana', 'Orange', 'Pineapple', 'Watermelon', 'Mango', 'Plain yogurt'] 
        }
      ],
      vegan: [
        { 
          name: 'Vegan Akara', 
          description: 'Bean fritters made without eggs, crispy and delicious', 
          prep_time: '25 mins', 
          ingredients: ['Black-eyed peas', 'Onions', 'Scotch bonnet pepper', 'Salt', 'Ginger'] 
        },
        { 
          name: 'Tropical Fruit Bowl', 
          description: 'Mixed seasonal Nigerian fruits', 
          prep_time: '10 mins', 
          ingredients: ['Banana', 'Orange', 'Mango', 'Pineapple', 'Coconut flakes'] 
        }
      ]
    },
    lunch: {
      any: [
        { 
          name: 'Jollof Rice', 
          description: 'The crown jewel of Nigerian cuisine - spiced rice with rich tomato base', 
          prep_time: '50 mins', 
          ingredients: ['Basmati rice', 'Tomatoes', 'Red bell peppers', 'Onions', 'Chicken stock', 'Bay leaves', 'Thyme', 'Curry powder'] 
        },
        { 
          name: 'Egusi Soup with Pounded Yam', 
          description: 'Rich melon seed soup with assorted meat and fish', 
          prep_time: '75 mins', 
          ingredients: ['Ground egusi', 'Spinach', 'Assorted meat', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam'] 
        },
        { 
          name: 'Fried Rice Nigerian Style', 
          description: 'Colorful rice with mixed vegetables and protein', 
          prep_time: '35 mins', 
          ingredients: ['Rice', 'Carrots', 'Green beans', 'Sweet corn', 'Green peas', 'Chicken', 'Curry powder'] 
        },
        { 
          name: 'Amala and Ewedu', 
          description: 'Yam flour with jute leaf soup - a Yoruba classic', 
          prep_time: '40 mins', 
          ingredients: ['Yam flour', 'Ewedu leaves', 'Locust beans', 'Palm oil', 'Assorted meat', 'Seasoning'] 
        }
      ],
      vegetarian: [
        { 
          name: 'Vegetable Jollof Rice', 
          description: 'Classic jollof rice loaded with mixed vegetables', 
          prep_time: '45 mins', 
          ingredients: ['Rice', 'Tomatoes', 'Carrots', 'Green beans', 'Sweet peas', 'Vegetable stock', 'Bell peppers'] 
        },
        { 
          name: 'Vegetable Soup with Semolina', 
          description: 'Nutritious vegetable soup with semolina swallow', 
          prep_time: '35 mins', 
          ingredients: ['Mixed vegetables', 'Spinach', 'Tomatoes', 'Palm oil', 'Seasoning', 'Semolina'] 
        }
      ],
      vegan: [
        { 
          name: 'Vegan Jollof Rice', 
          description: 'Plant-based version of the classic jollof rice', 
          prep_time: '45 mins', 
          ingredients: ['Rice', 'Tomatoes', 'Onions', 'Vegetable oil', 'Vegetable stock', 'Mixed vegetables'] 
        },
        { 
          name: 'Vegetable Stir-fry with Rice', 
          description: 'Colorful vegetables stir-fried with Nigerian spices', 
          prep_time: '25 mins', 
          ingredients: ['Cabbage', 'Carrots', 'Green beans', 'Onions', 'Ginger', 'Garlic', 'White rice'] 
        }
      ]
    },
    dinner: {
      any: [
        { 
          name: 'Pepper Soup', 
          description: 'Spicy Nigerian soup perfect for dinner', 
          prep_time: '50 mins', 
          ingredients: ['Goat meat', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Yam'] 
        },
        { 
          name: 'Rice and Stew', 
          description: 'White rice with rich Nigerian tomato stew', 
          prep_time: '60 mins', 
          ingredients: ['Rice', 'Tomatoes', 'Beef', 'Onions', 'Red peppers', 'Palm oil', 'Seasoning'] 
        },
        { 
          name: 'Spaghetti Nigerian Style', 
          description: 'Spaghetti with Nigerian tomato sauce and spices', 
          prep_time: '35 mins', 
          ingredients: ['Spaghetti', 'Ground beef', 'Tomatoes', 'Onions', 'Garlic', 'Curry powder', 'Bay leaves'] 
        },
        { 
          name: 'Plantain and Beans', 
          description: 'Sweet plantain with beans porridge - comfort food', 
          prep_time: '45 mins', 
          ingredients: ['Ripe plantain', 'Brown beans', 'Palm oil', 'Onions', 'Pepper', 'Crayfish'] 
        }
      ],
      vegetarian: [
        { 
          name: 'Vegetable Rice', 
          description: 'Rice cooked with assorted vegetables', 
          prep_time: '35 mins', 
          ingredients: ['Rice', 'Carrots', 'Green beans', 'Sweet peas', 'Onions', 'Vegetable oil'] 
        },
        { 
          name: 'Beans Porridge', 
          description: 'Beans cooked with plantain and vegetables', 
          prep_time: '70 mins', 
          ingredients: ['Brown beans', 'Ripe plantain', 'Spinach', 'Palm oil', 'Onions', 'Pepper'] 
        }
      ],
      vegan: [
        { 
          name: 'Vegan Beans Porridge', 
          description: 'Plant-based beans porridge with coconut oil', 
          prep_time: '65 mins', 
          ingredients: ['Brown beans', 'Plantain', 'Spinach', 'Coconut oil', 'Onions', 'Pepper'] 
        },
        { 
          name: 'Vegetable Pasta', 
          description: 'Pasta with rich vegetable sauce', 
          prep_time: '30 mins', 
          ingredients: ['Pasta', 'Tomatoes', 'Onions', 'Bell peppers', 'Garlic', 'Basil', 'Olive oil'] 
        }
      ]
    }
  }

  const getSuggestion = async () => {
    if (!mealType || !dietaryPreference) {
      setError('Please select both meal type and dietary preference')
      return
    }

    setLoading(true)
    setError('')
    setAnimateCard(false)

    try {
      let selectedSuggestion = null

      if (useAI) {
        // Generate AI suggestion
        selectedSuggestion = await generateAIMealSuggestion(
          mealType, 
          dietaryPreference, 
          cuisine, 
          availableIngredients
        )
      } else {
        // Try to get suggestion from Supabase
        const { data, error: supabaseError } = await supabase
          .from('meal_suggestions')
          .select('*')
          .eq('meal_type', mealType)
          .eq('dietary_preference', dietaryPreference)

        if (!supabaseError && data && data.length > 0) {
          // Get random suggestion from database
          const randomIndex = Math.floor(Math.random() * data.length)
          selectedSuggestion = data[randomIndex]
        } else {
          // Use fallback suggestions
          const fallbackOptions = fallbackSuggestions[mealType]?.[dietaryPreference] || 
                                 fallbackSuggestions[mealType]?.['any'] || []
          
          if (fallbackOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * fallbackOptions.length)
            selectedSuggestion = fallbackOptions[randomIndex]
          }
        }
      }

      if (selectedSuggestion) {
        setSuggestion(selectedSuggestion)
        setAnimateCard(true)
      } else {
        setError('No suggestions found for your preferences. Try different options!')
      }
    } catch (err) {
      console.error('Error fetching suggestion:', err)
      
      // Fallback to local suggestions on error
      const fallbackOptions = fallbackSuggestions[mealType]?.[dietaryPreference] || 
                             fallbackSuggestions[mealType]?.['any'] || []
      
      if (fallbackOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackOptions.length)
        setSuggestion(fallbackOptions[randomIndex])
        setAnimateCard(true)
      } else {
        setError('Unable to get suggestions. Please try again.')
      }
    } finally {
      setLoading(false)
    }
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

          {/* AI vs Database Toggle */}
          <div className="mb-8">
            <label className="block text-xl font-bold text-gray-800 mb-6">
              <Brain className="inline w-6 h-6 mr-3" />
              Suggestion Type
            </label>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUseAI(false)}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  !useAI
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50'
                }`}
              >
                <Database className={`w-5 h-5 ${!useAI ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-semibold ${!useAI ? 'text-orange-700' : 'text-gray-700'}`}>
                    Database Suggestions
                  </div>
                  <div className="text-sm text-gray-500">Curated meal collection</div>
                </div>
              </button>
              
              <button
                onClick={() => setUseAI(true)}
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                  useAI
                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50'
                }`}
              >
                <Brain className={`w-5 h-5 ${useAI ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`font-semibold ${useAI ? 'text-orange-700' : 'text-gray-700'}`}>
                    AI Suggestions
                  </div>
                  <div className="text-sm text-gray-500">Personalized & creative</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Options - Only show when AI is selected */}
          {useAI && (
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
                      className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                        cuisine === cuisineOption.value
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-25 hover:to-orange-50'
                      }`}
                    >
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
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="text-red-700 font-medium">{error}</div>
            </div>
          )}

          {/* Get Suggestion Button */}
          <button
            onClick={getSuggestion}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl btn-pulse"
          >
            {loading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              useAI ? <Brain className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />
            )}
            {loading 
              ? (useAI ? 'AI is Creating Your Perfect Meal...' : 'Getting Your Perfect Meal...')
              : (useAI ? 'Get AI Meal Suggestion' : 'Get Meal Suggestion')
            }
          </button>
        </div>

        {/* Suggestion Card */}
        {suggestion && (
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

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/30">
            <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            <p className="text-gray-600 font-medium">Made with love for delicious meals</p>
            <ChefHat className="w-5 h-5 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
