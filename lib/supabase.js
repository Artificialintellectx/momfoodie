import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * @typedef {Object} MealSuggestion
 * @property {number} id - The unique identifier for the meal suggestion
 * @property {string} name - The name of the meal
 * @property {string} description - Description of the meal
 * @property {'breakfast' | 'lunch' | 'dinner'} meal_type - Type of meal
 * @property {'any' | 'vegetarian' | 'vegan' | 'gluten-free' | 'low-carb' | 'high-protein'} dietary_preference - Dietary preference
 * @property {string} prep_time - Preparation time
 * @property {string[]} ingredients - List of ingredients
 * @property {string} created_at - Creation timestamp
 */
