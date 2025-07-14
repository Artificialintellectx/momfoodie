-- Create the meal_suggestions table
CREATE TABLE meal_suggestions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    dietary_preference VARCHAR(50) NOT NULL CHECK (dietary_preference IN ('any', 'vegetarian', 'vegan', 'gluten-free', 'low-carb', 'high-protein')),
    prep_time VARCHAR(50),
    ingredients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample Nigerian meal data
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

-- Lunch options
('Egusi Soup with Pounded Yam', 'Rich melon seed soup with assorted meat', 'lunch', 'any', '90 mins', ARRAY['Ground egusi', 'Spinach', 'Assorted meat', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam', 'Seasoning cubes']),
('Fried Rice Nigerian Style', 'Colorful rice with mixed vegetables and protein', 'lunch', 'any', '40 mins', ARRAY['Rice', 'Carrots', 'Green beans', 'Sweet corn', 'Green peas', 'Chicken', 'Curry powder', 'Bay leaves']),
('Amala and Ewedu', 'Yam flour with jute leaf soup', 'lunch', 'any', '45 mins', ARRAY['Yam flour', 'Ewedu leaves', 'Locust beans', 'Palm oil', 'Assorted meat', 'Seasoning cubes', 'Onions']),
('Vegetable Jollof Rice', 'Classic jollof rice loaded with vegetables', 'lunch', 'vegetarian', '50 mins', ARRAY['Rice', 'Tomatoes', 'Carrots', 'Green beans', 'Sweet peas', 'Vegetable stock', 'Bell peppers', 'Onions']),
('Okra Soup with Fufu', 'Nutritious okra soup with cassava fufu', 'lunch', 'any', '60 mins', ARRAY['Fresh okra', 'Assorted meat', 'Fish', 'Palm oil', 'Onions', 'Seasoning', 'Cassava flour']),
('Rice and Beans (Waakye)', 'Rice and beans cooked together with spices', 'lunch', 'vegetarian', '75 mins', ARRAY['Rice', 'Brown beans', 'Ginger', 'Onions', 'Bay leaves', 'Salt', 'Palm oil']),
('Bitter Leaf Soup', 'Traditional soup with bitter leaves and assorted meat', 'lunch', 'any', '80 mins', ARRAY['Bitter leaves', 'Assorted meat', 'Stockfish', 'Palm oil', 'Ogiri', 'Onions', 'Seasoning', 'Cocoyam']),
('Vegan Jollof Rice', 'Plant-based jollof rice with vegetables', 'lunch', 'vegan', '45 mins', ARRAY['Rice', 'Tomatoes', 'Onions', 'Vegetable oil', 'Vegetable stock', 'Mixed vegetables', 'Spices']),

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

-- High-protein options
('Grilled Fish with Vegetables', 'Grilled tilapia with steamed vegetables', 'dinner', 'high-protein', '35 mins', ARRAY['Tilapia fish', 'Broccoli', 'Carrots', 'Green beans', 'Olive oil', 'Garlic', 'Lemon', 'Black pepper']),
('Chicken Pepper Soup', 'Protein-rich chicken soup', 'dinner', 'high-protein', '50 mins', ARRAY['Chicken', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Egusi with Extra Fish', 'Protein-loaded egusi soup', 'lunch', 'high-protein', '85 mins', ARRAY['Ground egusi', 'Assorted fish', 'Spinach', 'Palm oil', 'Onions', 'Seasoning', 'Pounded yam']),
('Protein Breakfast Bowl', 'High-protein morning meal', 'breakfast', 'high-protein', '20 mins', ARRAY['Boiled eggs', 'Grilled chicken', 'Avocado', 'Spinach', 'Tomatoes']),

-- Low-carb options
('Vegetable Soup with Meat', 'Low-carb vegetable soup', 'dinner', 'low-carb', '45 mins', ARRAY['Mixed vegetables', 'Beef', 'Spinach', 'Onions', 'Palm oil', 'Seasoning']),
('Grilled Chicken Salad', 'Fresh salad with grilled chicken', 'lunch', 'low-carb', '25 mins', ARRAY['Grilled chicken', 'Lettuce', 'Tomatoes', 'Cucumber', 'Avocado', 'Olive oil', 'Lemon']),
('Pepper Soup (No Yam)', 'Spicy soup without starchy additions', 'dinner', 'low-carb', '40 mins', ARRAY['Goat meat', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Vegetable Omelet', 'Low-carb breakfast with vegetables', 'breakfast', 'low-carb', '15 mins', ARRAY['Eggs', 'Spinach', 'Tomatoes', 'Onions', 'Bell peppers', 'Olive oil']),

-- Gluten-free options
('Rice and Fish Stew', 'Gluten-free rice with fish stew', 'lunch', 'gluten-free', '55 mins', ARRAY['Rice', 'Fresh fish', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning', 'Red peppers']),
('Plantain and Fish', 'Boiled plantain with grilled fish', 'dinner', 'gluten-free', '30 mins', ARRAY['Unripe plantain', 'Grilled fish', 'Palm oil', 'Onions', 'Pepper', 'Tomatoes']),
('Yam and Vegetable Sauce', 'Boiled yam with vegetable sauce', 'breakfast', 'gluten-free', '35 mins', ARRAY['White yam', 'Spinach', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']);

-- Enable Row Level Security (optional)
ALTER TABLE meal_suggestions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read meal suggestions
CREATE POLICY "Anyone can read meal suggestions" ON meal_suggestions
    FOR SELECT USING (true);

-- Create an index for faster queries
CREATE INDEX idx_meal_suggestions_type_diet ON meal_suggestions(meal_type, dietary_preference);

-- Create a view for easy querying
CREATE VIEW meal_suggestions_summary AS
SELECT 
    meal_type,
    dietary_preference,
    COUNT(*) as total_suggestions,
    ARRAY_AGG(name ORDER BY name) as meal_names
FROM meal_suggestions
GROUP BY meal_type, dietary_preference
ORDER BY meal_type, dietary_preference;
