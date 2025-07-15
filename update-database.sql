-- Database Update Script for Mummyfoodie
-- This script updates the existing database to support new dietary preferences

-- Step 1: Drop the existing table (WARNING: This will delete all existing data)
DROP TABLE IF EXISTS meal_suggestions CASCADE;

-- Step 2: Recreate the table with expanded dietary preferences
CREATE TABLE meal_suggestions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    dietary_preference VARCHAR(50) NOT NULL CHECK (dietary_preference IN ('any', 'vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein', 'halal', 'pescatarian', 'low-spice', 'traditional', 'modern')),
    prep_time VARCHAR(50),
    ingredients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Insert all recipes with expanded dietary preferences
INSERT INTO meal_suggestions (name, description, meal_type, dietary_preference, prep_time, ingredients) VALUES

-- Breakfast options
('Jollof Rice with Fried Plantain', 'Classic Nigerian jollof rice served with sweet fried plantain', 'breakfast', 'any', '45 mins', ARRAY['Basmati rice', 'Tomatoes', 'Red bell peppers', 'Onions', 'Chicken stock', 'Bay leaves', 'Ripe plantain', 'Vegetable oil']),
('Akara and Bread', 'Crispy bean fritters served with fresh bread', 'breakfast', 'any', '25 mins', ARRAY['Black-eyed peas', 'Onions', 'Scotch bonnet pepper', 'Salt', 'Fresh bread', 'Palm oil']),
('Moi Moi', 'Steamed bean pudding with aromatic spices', 'breakfast', 'vegetarian', '50 mins', ARRAY['Black-eyed peas', 'Red bell pepper', 'Onions', 'Palm oil', 'Seasoning cubes', 'Boiled eggs', 'Carrots']),
('Yam and Egg Sauce', 'Boiled yam with scrambled eggs in tomato sauce', 'breakfast', 'any', '30 mins', ARRAY['White yam', 'Eggs', 'Tomatoes', 'Onions', 'Scotch bonnet pepper', 'Vegetable oil', 'Seasoning']),
('Bread and Akamu', 'Fresh bread with fermented corn pudding', 'breakfast', 'vegetarian', '15 mins', ARRAY['Fresh bread', 'Akamu (pap)', 'Milk', 'Sugar', 'Groundnut']),
('Plantain Pancakes', 'Nigerian-style pancakes with mashed plantain', 'breakfast', 'vegetarian', '25 mins', ARRAY['Ripe plantain', 'Flour', 'Eggs', 'Milk', 'Sugar', 'Nutmeg', 'Baking powder']),
('Vegan Akara', 'Bean fritters without eggs', 'breakfast', 'vegan', '30 mins', ARRAY['Black-eyed peas', 'Onions', 'Scotch bonnet pepper', 'Salt', 'Ginger']),
('Fruit Salad Bowl', 'Fresh Nigerian fruits with coconut', 'breakfast', 'vegan', '10 mins', ARRAY['Banana', 'Orange', 'Mango', 'Pineapple', 'Coconut flakes']),
('Puff Puff', 'Sweet, fluffy Nigerian doughnuts', 'breakfast', 'vegetarian', '45 mins', ARRAY['Flour', 'Yeast', 'Sugar', 'Nutmeg', 'Salt', 'Vegetable oil']),
('Kunu Zaki', 'Traditional millet drink with ginger', 'breakfast', 'vegan', '20 mins', ARRAY['Millet', 'Ginger', 'Cloves', 'Sugar', 'Coconut']),
('Boli and Groundnut', 'Roasted plantain with groundnut', 'breakfast', 'vegan', '25 mins', ARRAY['Unripe plantain', 'Groundnut', 'Palm oil', 'Salt']),
('Eko and Efo Riro', 'Corn pudding with vegetable soup', 'breakfast', 'vegetarian', '40 mins', ARRAY['Corn flour', 'Spinach', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Ogi and Akara', 'Fermented corn pudding with bean cakes', 'breakfast', 'vegetarian', '30 mins', ARRAY['Corn', 'Black-eyed peas', 'Onions', 'Pepper', 'Palm oil']),
('Yam Porridge', 'Boiled yam in rich tomato sauce', 'breakfast', 'vegetarian', '35 mins', ARRAY['White yam', 'Tomatoes', 'Onions', 'Palm oil', 'Spinach', 'Seasoning']),

-- Halal Breakfast Options
('Halal Jollof Rice', 'Jollof rice prepared with halal chicken', 'breakfast', 'halal', '45 mins', ARRAY['Basmati rice', 'Tomatoes', 'Red bell peppers', 'Onions', 'Halal chicken', 'Bay leaves', 'Vegetable oil']),
('Halal Akara', 'Bean fritters with halal ingredients', 'breakfast', 'halal', '25 mins', ARRAY['Black-eyed peas', 'Onions', 'Scotch bonnet pepper', 'Salt', 'Palm oil']),

-- Pescatarian Breakfast Options
('Fish and Yam', 'Boiled yam with grilled fish', 'breakfast', 'pescatarian', '30 mins', ARRAY['White yam', 'Grilled fish', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Fish Pepper Soup', 'Spicy fish soup for breakfast', 'breakfast', 'pescatarian', '25 mins', ARRAY['Fresh fish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),

-- Low Spice Breakfast Options
('Mild Yam and Egg', 'Boiled yam with mild egg sauce', 'breakfast', 'low-spice', '30 mins', ARRAY['White yam', 'Eggs', 'Tomatoes', 'Onions', 'Mild seasoning', 'Vegetable oil']),
('Mild Akara', 'Bean fritters with reduced spice', 'breakfast', 'low-spice', '25 mins', ARRAY['Black-eyed peas', 'Onions', 'Mild pepper', 'Salt', 'Palm oil']),

-- Traditional Nigerian Breakfast
('Tuwo Shinkafa', 'Traditional rice pudding', 'breakfast', 'traditional', '70 mins', ARRAY['Rice flour', 'Spinach', 'Assorted meat', 'Palm oil', 'Onions', 'Seasoning']),
('Masa', 'Traditional rice cakes', 'breakfast', 'traditional', '40 mins', ARRAY['Rice', 'Yeast', 'Sugar', 'Salt', 'Vegetable oil']),

-- Modern Nigerian Breakfast
('Nigerian French Toast', 'Modern twist on French toast', 'breakfast', 'modern', '20 mins', ARRAY['Bread', 'Eggs', 'Milk', 'Sugar', 'Cinnamon', 'Butter']),
('Smoothie Bowl', 'Modern fruit smoothie bowl', 'breakfast', 'modern', '15 mins', ARRAY['Banana', 'Mango', 'Yogurt', 'Granola', 'Honey', 'Berries']),

-- Lunch options
('Egusi Soup with Pounded Yam', 'Rich melon seed soup with assorted meat', 'lunch', 'any', '90 mins', ARRAY['Ground egusi', 'Spinach', 'Assorted meat', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam', 'Seasoning cubes']),
('Fried Rice Nigerian Style', 'Colorful rice with mixed vegetables and protein', 'lunch', 'any', '40 mins', ARRAY['Rice', 'Carrots', 'Green beans', 'Sweet corn', 'Green peas', 'Chicken', 'Curry powder', 'Bay leaves']),
('Amala and Ewedu', 'Yam flour with jute leaf soup', 'lunch', 'any', '45 mins', ARRAY['Yam flour', 'Ewedu leaves', 'Locust beans', 'Palm oil', 'Assorted meat', 'Seasoning cubes', 'Onions']),
('Vegetable Jollof Rice', 'Classic jollof rice loaded with vegetables', 'lunch', 'vegetarian', '50 mins', ARRAY['Rice', 'Tomatoes', 'Carrots', 'Green beans', 'Sweet peas', 'Vegetable stock', 'Bell peppers', 'Onions']),
('Okra Soup with Fufu', 'Nutritious okra soup with cassava fufu', 'lunch', 'any', '60 mins', ARRAY['Fresh okra', 'Assorted meat', 'Fish', 'Palm oil', 'Onions', 'Seasoning', 'Cassava flour']),
('Rice and Beans (Waakye)', 'Rice and beans cooked together with spices', 'lunch', 'vegetarian', '75 mins', ARRAY['Rice', 'Brown beans', 'Ginger', 'Onions', 'Bay leaves', 'Salt', 'Palm oil']),
('Bitter Leaf Soup', 'Traditional soup with bitter leaves and assorted meat', 'lunch', 'any', '80 mins', ARRAY['Bitter leaves', 'Assorted meat', 'Stockfish', 'Palm oil', 'Ogiri', 'Onions', 'Seasoning', 'Cocoyam']),
('Vegan Jollof Rice', 'Plant-based jollof rice with vegetables', 'lunch', 'vegan', '45 mins', ARRAY['Rice', 'Tomatoes', 'Onions', 'Vegetable oil', 'Vegetable stock', 'Mixed vegetables', 'Spices']),
('Suya', 'Spicy grilled meat skewers - popular street food', 'lunch', 'any', '30 mins', ARRAY['Beef', 'Groundnut powder', 'Cayenne pepper', 'Paprika', 'Onion powder', 'Garlic powder', 'Bamboo skewers']),
('Abacha and Ugba', 'African salad with cassava flakes', 'lunch', 'vegetarian', '25 mins', ARRAY['Cassava flakes', 'Ugba (oil bean)', 'Palm oil', 'Pepper', 'Onions', 'Stockfish', 'Seasoning']),
('Ofada Rice and Stew', 'Local rice with spicy pepper sauce', 'lunch', 'any', '60 mins', ARRAY['Ofada rice', 'Bell peppers', 'Scotch bonnet', 'Onions', 'Palm oil', 'Assorted meat', 'Seasoning']),
('Ewedu and Amala', 'Jute leaf soup with yam flour', 'lunch', 'any', '50 mins', ARRAY['Ewedu leaves', 'Yam flour', 'Locust beans', 'Palm oil', 'Assorted meat', 'Onions', 'Seasoning']),
('Ila Alasepo', 'Okra soup with ewedu', 'lunch', 'vegetarian', '45 mins', ARRAY['Fresh okra', 'Ewedu leaves', 'Palm oil', 'Onions', 'Pepper', 'Seasoning', 'Locust beans']),
('Efo Riro', 'Spinach stew with assorted meat', 'lunch', 'any', '70 mins', ARRAY['Spinach', 'Assorted meat', 'Tomatoes', 'Onions', 'Palm oil', 'Pepper', 'Seasoning', 'Stockfish']),
('Gbegiri', 'Bean soup with yam flour', 'lunch', 'vegetarian', '55 mins', ARRAY['Brown beans', 'Palm oil', 'Onions', 'Pepper', 'Seasoning', 'Yam flour']),
('Ewedu and Gbegiri', 'Jute leaf and bean soup combination', 'lunch', 'vegetarian', '60 mins', ARRAY['Ewedu leaves', 'Brown beans', 'Palm oil', 'Onions', 'Locust beans', 'Seasoning']),

-- Halal Lunch Options
('Halal Egusi Soup', 'Egusi soup with halal meat', 'lunch', 'halal', '90 mins', ARRAY['Ground egusi', 'Spinach', 'Halal meat', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam', 'Seasoning cubes']),
('Halal Suya', 'Grilled halal meat skewers', 'lunch', 'halal', '30 mins', ARRAY['Halal beef', 'Groundnut powder', 'Cayenne pepper', 'Paprika', 'Onion powder', 'Garlic powder', 'Bamboo skewers']),

-- Pescatarian Lunch Options
('Fish Egusi Soup', 'Egusi soup with fish instead of meat', 'lunch', 'pescatarian', '85 mins', ARRAY['Ground egusi', 'Spinach', 'Fresh fish', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam', 'Seasoning cubes']),
('Fish Pepper Soup', 'Spicy fish soup', 'lunch', 'pescatarian', '45 mins', ARRAY['Fresh fish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),

-- Low Spice Lunch Options
('Mild Efo Riro', 'Spinach stew with reduced spice', 'lunch', 'low-spice', '70 mins', ARRAY['Spinach', 'Assorted meat', 'Tomatoes', 'Onions', 'Palm oil', 'Mild seasoning', 'Stockfish']),
('Mild Jollof Rice', 'Jollof rice with mild seasoning', 'lunch', 'low-spice', '45 mins', ARRAY['Rice', 'Tomatoes', 'Onions', 'Mild seasoning', 'Vegetable oil', 'Bay leaves']),

-- Traditional Nigerian Lunch
('Ofada Rice and Stew', 'Traditional local rice with pepper sauce', 'lunch', 'traditional', '60 mins', ARRAY['Ofada rice', 'Bell peppers', 'Scotch bonnet', 'Onions', 'Palm oil', 'Assorted meat', 'Seasoning']),
('Bitter Leaf Soup', 'Traditional bitter leaf soup', 'lunch', 'traditional', '80 mins', ARRAY['Bitter leaves', 'Assorted meat', 'Stockfish', 'Palm oil', 'Ogiri', 'Onions', 'Seasoning', 'Cocoyam']),

-- Modern Nigerian Lunch
('Nigerian Caesar Salad', 'Modern salad with Nigerian twist', 'lunch', 'modern', '20 mins', ARRAY['Lettuce', 'Grilled chicken', 'Tomatoes', 'Cucumber', 'Nigerian dressing', 'Croutons']),
('Fusion Jollof Pasta', 'Jollof-inspired pasta dish', 'lunch', 'modern', '35 mins', ARRAY['Pasta', 'Tomatoes', 'Onions', 'Bell peppers', 'Nigerian spices', 'Olive oil']),

-- Dinner options
('Pepper Soup', 'Spicy Nigerian soup with goat meat', 'dinner', 'any', '55 mins', ARRAY['Goat meat', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Yam', 'Utazi leaves']),
('Rice and Stew', 'White rice with rich Nigerian tomato stew', 'dinner', 'any', '65 mins', ARRAY['Rice', 'Tomatoes', 'Beef', 'Onions', 'Red peppers', 'Palm oil', 'Seasoning cubes', 'Bay leaves']),
('Spaghetti Nigerian Style', 'Spaghetti with Nigerian tomato sauce', 'dinner', 'any', '35 mins', ARRAY['Spaghetti', 'Ground beef', 'Tomatoes', 'Onions', 'Garlic', 'Curry powder', 'Bay leaves', 'Green peppers']),
('Plantain and Beans Porridge', 'Sweet plantain with beans - comfort food', 'dinner', 'vegetarian', '50 mins', ARRAY['Ripe plantain', 'Brown beans', 'Palm oil', 'Onions', 'Pepper', 'Crayfish', 'Spinach']),
('Catfish Pepper Soup', 'Spicy catfish soup with vegetables', 'dinner', 'any', '45 mins', ARRAY['Fresh catfish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions', 'Yam']),
('Vegetable Rice', 'Rice cooked with assorted vegetables', 'dinner', 'vegetarian', '40 mins', ARRAY['Rice', 'Carrots', 'Green beans', 'Sweet peas', 'Onions', 'Vegetable oil', 'Seasoning']),
('Beans Porridge', 'Beans cooked with plantain and vegetables', 'dinner', 'vegetarian', '75 mins', ARRAY['Brown beans', 'Ripe plantain', 'Spinach', 'Palm oil', 'Onions', 'Pepper', 'Crayfish']),
('Vegan Beans Porridge', 'Plant-based beans porridge', 'dinner', 'vegan', '70 mins', ARRAY['Brown beans', 'Plantain', 'Spinach', 'Coconut oil', 'Onions', 'Pepper', 'Ginger']),
('Vegetable Pasta', 'Pasta with rich vegetable sauce', 'dinner', 'vegan', '30 mins', ARRAY['Pasta', 'Tomatoes', 'Onions', 'Bell peppers', 'Garlic', 'Basil', 'Olive oil', 'Spinach']),
('Isi Ewu', 'Goat head pepper soup', 'dinner', 'any', '90 mins', ARRAY['Goat head', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Utazi leaves']),
('Nkwobi', 'Spicy cow foot delicacy', 'dinner', 'any', '120 mins', ARRAY['Cow foot', 'Palm oil', 'Pepper', 'Onions', 'Utazi leaves', 'Seasoning', 'Stockfish']),
('Afang Soup', 'Traditional soup with afang leaves', 'dinner', 'any', '85 mins', ARRAY['Afang leaves', 'Waterleaf', 'Palm oil', 'Assorted meat', 'Periwinkle', 'Onions', 'Seasoning']),
('Edikang Ikong', 'Pumpkin leaves and waterleaf soup', 'dinner', 'any', '80 mins', ARRAY['Pumpkin leaves', 'Waterleaf', 'Palm oil', 'Assorted meat', 'Periwinkle', 'Onions', 'Seasoning']),
('Oha Soup', 'Traditional soup with oha leaves', 'dinner', 'any', '75 mins', ARRAY['Oha leaves', 'Cocoyam', 'Palm oil', 'Assorted meat', 'Stockfish', 'Onions', 'Seasoning']),
('Nsala Soup', 'White soup with catfish', 'dinner', 'any', '70 mins', ARRAY['Catfish', 'Utazi leaves', 'Pepper', 'Onions', 'Seasoning', 'Yam']),
('Ukodo', 'Yam and pepper soup', 'dinner', 'vegetarian', '50 mins', ARRAY['Yam', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves']),
('Ogbono Soup', 'Wild mango seed soup', 'dinner', 'any', '65 mins', ARRAY['Ogbono', 'Spinach', 'Assorted meat', 'Palm oil', 'Onions', 'Seasoning', 'Stockfish']),
('Banga Soup', 'Palm nut soup with assorted meat', 'dinner', 'any', '90 mins', ARRAY['Palm nuts', 'Assorted meat', 'Stockfish', 'Onions', 'Seasoning', 'Scent leaves']),
('Efo Elegusi', 'Spinach and melon seed soup', 'dinner', 'vegetarian', '60 mins', ARRAY['Spinach', 'Ground egusi', 'Palm oil', 'Onions', 'Pepper', 'Seasoning']),

-- Halal Dinner Options
('Halal Pepper Soup', 'Spicy soup with halal goat meat', 'dinner', 'halal', '55 mins', ARRAY['Halal goat meat', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Yam', 'Utazi leaves']),
('Halal Rice and Stew', 'Rice with halal beef stew', 'dinner', 'halal', '65 mins', ARRAY['Rice', 'Tomatoes', 'Halal beef', 'Onions', 'Red peppers', 'Palm oil', 'Seasoning cubes', 'Bay leaves']),

-- Pescatarian Dinner Options
('Fish Pepper Soup', 'Spicy fish soup', 'dinner', 'pescatarian', '45 mins', ARRAY['Fresh fish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Fish and Rice', 'Rice with fish stew', 'dinner', 'pescatarian', '60 mins', ARRAY['Rice', 'Tomatoes', 'Fresh fish', 'Onions', 'Red peppers', 'Palm oil', 'Seasoning cubes']),

-- Low Spice Dinner Options
('Mild Pepper Soup', 'Soup with reduced spice', 'dinner', 'low-spice', '50 mins', ARRAY['Goat meat', 'Mild seasoning', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Yam']),
('Mild Rice and Stew', 'Rice with mild tomato stew', 'dinner', 'low-spice', '65 mins', ARRAY['Rice', 'Tomatoes', 'Beef', 'Onions', 'Mild seasoning', 'Palm oil', 'Bay leaves']),

-- Traditional Nigerian Dinner
('Isi Ewu', 'Traditional goat head soup', 'dinner', 'traditional', '90 mins', ARRAY['Goat head', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Utazi leaves']),
('Nkwobi', 'Traditional cow foot delicacy', 'dinner', 'traditional', '120 mins', ARRAY['Cow foot', 'Palm oil', 'Pepper', 'Onions', 'Utazi leaves', 'Seasoning', 'Stockfish']),

-- Modern Nigerian Dinner
('Nigerian Stir Fry', 'Modern stir-fried vegetables with protein', 'dinner', 'modern', '25 mins', ARRAY['Mixed vegetables', 'Chicken', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil']),
('Fusion Rice Bowl', 'Modern rice bowl with Nigerian flavors', 'dinner', 'modern', '30 mins', ARRAY['Rice', 'Grilled chicken', 'Avocado', 'Tomatoes', 'Nigerian spices', 'Lime']),

-- High-protein options
('Grilled Fish with Vegetables', 'Grilled tilapia with steamed vegetables', 'dinner', 'high-protein', '35 mins', ARRAY['Tilapia fish', 'Broccoli', 'Carrots', 'Green beans', 'Olive oil', 'Garlic', 'Lemon', 'Black pepper']),
('Chicken Pepper Soup', 'Protein-rich chicken soup', 'dinner', 'high-protein', '50 mins', ARRAY['Chicken', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Egusi with Extra Fish', 'Protein-loaded egusi soup', 'lunch', 'high-protein', '85 mins', ARRAY['Ground egusi', 'Assorted fish', 'Spinach', 'Palm oil', 'Onions', 'Seasoning', 'Pounded yam']),
('Protein Breakfast Bowl', 'High-protein morning meal', 'breakfast', 'high-protein', '20 mins', ARRAY['Boiled eggs', 'Grilled chicken', 'Avocado', 'Spinach', 'Tomatoes']),
('Grilled Suya', 'High-protein grilled meat skewers', 'lunch', 'high-protein', '30 mins', ARRAY['Lean beef', 'Groundnut powder', 'Cayenne pepper', 'Paprika', 'Onion powder', 'Garlic powder']),
('Fish Pepper Soup', 'Protein-rich fish soup', 'dinner', 'high-protein', '45 mins', ARRAY['Fresh fish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Chicken and Rice', 'Grilled chicken with jollof rice', 'lunch', 'high-protein', '55 mins', ARRAY['Chicken', 'Rice', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning', 'Bell peppers']),

-- Low-carb options
('Vegetable Soup with Meat', 'Low-carb vegetable soup', 'dinner', 'low-carb', '45 mins', ARRAY['Mixed vegetables', 'Beef', 'Spinach', 'Onions', 'Palm oil', 'Seasoning']),
('Grilled Chicken Salad', 'Fresh salad with grilled chicken', 'lunch', 'low-carb', '25 mins', ARRAY['Grilled chicken', 'Lettuce', 'Tomatoes', 'Cucumber', 'Avocado', 'Olive oil', 'Lemon']),
('Pepper Soup (No Yam)', 'Spicy soup without starchy additions', 'dinner', 'low-carb', '40 mins', ARRAY['Goat meat', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Vegetable Omelet', 'Low-carb breakfast with vegetables', 'breakfast', 'low-carb', '15 mins', ARRAY['Eggs', 'Spinach', 'Tomatoes', 'Onions', 'Bell peppers', 'Olive oil']),
('Grilled Fish Salad', 'Low-carb fish salad', 'lunch', 'low-carb', '20 mins', ARRAY['Grilled fish', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive oil', 'Lemon']),
('Vegetable Pepper Soup', 'Low-carb vegetable soup', 'dinner', 'low-carb', '35 mins', ARRAY['Mixed vegetables', 'Pepper soup spice', 'Ginger', 'Garlic', 'Onions']),

-- Gluten-free options
('Rice and Fish Stew', 'Gluten-free rice with fish stew', 'lunch', 'gluten-free', '55 mins', ARRAY['Rice', 'Fresh fish', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning', 'Red peppers']),
('Plantain and Fish', 'Boiled plantain with grilled fish', 'dinner', 'gluten-free', '30 mins', ARRAY['Unripe plantain', 'Grilled fish', 'Palm oil', 'Onions', 'Pepper', 'Tomatoes']),
('Yam and Vegetable Sauce', 'Boiled yam with vegetable sauce', 'breakfast', 'gluten-free', '35 mins', ARRAY['White yam', 'Spinach', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Efo Riro with Yam', 'Gluten-free spinach stew with yam', 'lunch', 'gluten-free', '60 mins', ARRAY['Spinach', 'Yam', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Okra Soup with Plantain', 'Gluten-free okra soup', 'dinner', 'gluten-free', '45 mins', ARRAY['Fresh okra', 'Plantain', 'Palm oil', 'Onions', 'Seasoning']),

-- Additional Regional Specialties
('Tuwo Shinkafa', 'Rice pudding with soup', 'lunch', 'any', '70 mins', ARRAY['Rice flour', 'Spinach', 'Assorted meat', 'Palm oil', 'Onions', 'Seasoning']),
('Masa', 'Rice cakes with soup', 'breakfast', 'vegetarian', '40 mins', ARRAY['Rice', 'Yeast', 'Sugar', 'Salt', 'Vegetable oil']),
('Dambu Nama', 'Shredded beef jerky', 'lunch', 'any', '120 mins', ARRAY['Beef', 'Pepper', 'Onions', 'Seasoning', 'Vegetable oil']),
('Kilishi', 'Spicy beef jerky', 'lunch', 'any', '180 mins', ARRAY['Beef', 'Groundnut powder', 'Pepper', 'Spices', 'Vegetable oil']),
('Kuli Kuli', 'Groundnut cakes', 'breakfast', 'vegetarian', '30 mins', ARRAY['Groundnut', 'Pepper', 'Salt', 'Vegetable oil']),
('Gurasa', 'Traditional bread', 'breakfast', 'vegetarian', '60 mins', ARRAY['Flour', 'Yeast', 'Sugar', 'Salt', 'Water']),
('Fura da Nono', 'Millet balls with yogurt', 'breakfast', 'vegetarian', '25 mins', ARRAY['Millet', 'Yogurt', 'Sugar', 'Ginger']),
('Kunun Gyada', 'Groundnut drink', 'breakfast', 'vegan', '20 mins', ARRAY['Groundnut', 'Ginger', 'Sugar', 'Water']),
('Zobo', 'Hibiscus drink', 'breakfast', 'vegan', '15 mins', ARRAY['Hibiscus flowers', 'Ginger', 'Sugar', 'Water']),
('Palm Wine', 'Traditional palm wine', 'breakfast', 'vegan', '5 mins', ARRAY['Palm wine']);

-- Step 4: Enable Row Level Security
ALTER TABLE meal_suggestions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a policy that allows anyone to read meal suggestions
CREATE POLICY "Anyone can read meal suggestions" ON meal_suggestions
    FOR SELECT USING (true);

-- Step 6: Create an index for faster queries
CREATE INDEX idx_meal_suggestions_type_diet ON meal_suggestions(meal_type, dietary_preference);

-- Step 7: Create a view for easy querying
CREATE VIEW meal_suggestions_summary AS
SELECT 
    meal_type,
    dietary_preference,
    COUNT(*) as total_suggestions,
    ARRAY_AGG(name ORDER BY name) as meal_names
FROM meal_suggestions
GROUP BY meal_type, dietary_preference
ORDER BY meal_type, dietary_preference;

-- Step 8: Verify the update
SELECT 
    dietary_preference,
    COUNT(*) as recipe_count
FROM meal_suggestions 
GROUP BY dietary_preference 
ORDER BY dietary_preference; 