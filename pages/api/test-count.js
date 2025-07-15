import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Testing database count...');
    
    // Test 1: Count all breakfast suggestions
    const { count: totalBreakfast, error: error1 } = await supabase
      .from('meal_suggestions')
      .select('*', { count: 'exact' })
      .eq('meal_type', 'breakfast');
    
    if (error1) {
      console.error('Error counting breakfast:', error1);
      return res.status(500).json({ error: error1.message });
    }
    
    // Test 2: Count breakfast with dietary_preference = 'any'
    const { count: breakfastAny, error: error2 } = await supabase
      .from('meal_suggestions')
      .select('*', { count: 'exact' })
      .eq('meal_type', 'breakfast')
      .eq('dietary_preference', 'any');
    
    if (error2) {
      console.error('Error counting breakfast any:', error2);
      return res.status(500).json({ error: error2.message });
    }
    
    // Test 3: Get actual breakfast suggestions with 'any' preference
    const { data: breakfastData, error: error3 } = await supabase
      .from('meal_suggestions')
      .select('name, meal_type, dietary_preference')
      .eq('meal_type', 'breakfast')
      .eq('dietary_preference', 'any');
    
    if (error3) {
      console.error('Error getting breakfast data:', error3);
      return res.status(500).json({ error: error3.message });
    }
    
    console.log('Database test results:', {
      totalBreakfast,
      breakfastAny,
      breakfastData: breakfastData?.map(item => item.name)
    });
    
    res.status(200).json({
      totalBreakfast,
      breakfastAny,
      breakfastData: breakfastData?.map(item => item.name),
      message: 'Database count test completed'
    });
    
  } catch (error) {
    console.error('Test count error:', error);
    res.status(500).json({ error: error.message });
  }
} 