-- Add new Nigerian recipes to existing meal_suggestions table
-- This file adds additional recipes without recreating the table

INSERT INTO meal_suggestions (name, description, meal_type, dietary_preference, prep_time, ingredients) VALUES

-- Additional Breakfast options
('Puff Puff', 'Sweet, fluffy Nigerian doughnuts', 'breakfast', 'vegetarian', '45 mins', ARRAY['Flour', 'Yeast', 'Sugar', 'Nutmeg', 'Salt', 'Vegetable oil']),
('Kunu Zaki', 'Traditional millet drink with ginger', 'breakfast', 'vegan', '20 mins', ARRAY['Millet', 'Ginger', 'Cloves', 'Sugar', 'Coconut']),
('Boli and Groundnut', 'Roasted plantain with groundnut', 'breakfast', 'vegan', '25 mins', ARRAY['Unripe plantain', 'Groundnut', 'Palm oil', 'Salt']),
('Eko and Efo Riro', 'Corn pudding with vegetable soup', 'breakfast', 'vegetarian', '40 mins', ARRAY['Corn flour', 'Spinach', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Ogi and Akara', 'Fermented corn pudding with bean cakes', 'breakfast', 'vegetarian', '30 mins', ARRAY['Corn', 'Black-eyed peas', 'Onions', 'Pepper', 'Palm oil']),
('Yam Porridge', 'Boiled yam in rich tomato sauce', 'breakfast', 'vegetarian', '35 mins', ARRAY['White yam', 'Tomatoes', 'Onions', 'Palm oil', 'Spinach', 'Seasoning']),

-- Additional Lunch options
('Suya', 'Spicy grilled meat skewers - popular street food', 'lunch', 'any', '30 mins', ARRAY['Beef', 'Groundnut powder', 'Cayenne pepper', 'Paprika', 'Onion powder', 'Garlic powder', 'Bamboo skewers']),
('Abacha and Ugba', 'African salad with cassava flakes', 'lunch', 'vegetarian', '25 mins', ARRAY['Cassava flakes', 'Ugba (oil bean)', 'Palm oil', 'Pepper', 'Onions', 'Stockfish', 'Seasoning']),
('Ofada Rice and Stew', 'Local rice with spicy pepper sauce', 'lunch', 'any', '60 mins', ARRAY['Ofada rice', 'Bell peppers', 'Scotch bonnet', 'Onions', 'Palm oil', 'Assorted meat', 'Seasoning']),
('Ewedu and Amala', 'Jute leaf soup with yam flour', 'lunch', 'any', '50 mins', ARRAY['Ewedu leaves', 'Yam flour', 'Locust beans', 'Palm oil', 'Assorted meat', 'Onions', 'Seasoning']),
('Ila Alasepo', 'Okra soup with ewedu', 'lunch', 'vegetarian', '45 mins', ARRAY['Fresh okra', 'Ewedu leaves', 'Palm oil', 'Onions', 'Pepper', 'Seasoning', 'Locust beans']),
('Efo Riro', 'Spinach stew with assorted meat', 'lunch', 'any', '70 mins', ARRAY['Spinach', 'Assorted meat', 'Tomatoes', 'Onions', 'Palm oil', 'Pepper', 'Seasoning', 'Stockfish']),
('Gbegiri', 'Bean soup with yam flour', 'lunch', 'vegetarian', '55 mins', ARRAY['Brown beans', 'Palm oil', 'Onions', 'Pepper', 'Seasoning', 'Yam flour']),
('Ewedu and Gbegiri', 'Jute leaf and bean soup combination', 'lunch', 'vegetarian', '60 mins', ARRAY['Ewedu leaves', 'Brown beans', 'Palm oil', 'Onions', 'Locust beans', 'Seasoning']),

-- Additional Dinner options
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

-- Additional High-protein options
('Grilled Suya', 'High-protein grilled meat skewers', 'lunch', 'high-protein', '30 mins', ARRAY['Lean beef', 'Groundnut powder', 'Cayenne pepper', 'Paprika', 'Onion powder', 'Garlic powder']),
('Fish Pepper Soup', 'Protein-rich fish soup', 'dinner', 'high-protein', '45 mins', ARRAY['Fresh fish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Onions']),
('Chicken and Rice', 'Grilled chicken with jollof rice', 'lunch', 'high-protein', '55 mins', ARRAY['Chicken', 'Rice', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning', 'Bell peppers']),

-- Additional Low-carb options
('Grilled Fish Salad', 'Low-carb fish salad', 'lunch', 'low-carb', '20 mins', ARRAY['Grilled fish', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive oil', 'Lemon']),
('Vegetable Pepper Soup', 'Low-carb vegetable soup', 'dinner', 'low-carb', '35 mins', ARRAY['Mixed vegetables', 'Pepper soup spice', 'Ginger', 'Garlic', 'Onions']),

-- Additional Gluten-free options
('Efo Riro with Yam', 'Gluten-free spinach stew with yam', 'lunch', 'gluten-free', '60 mins', ARRAY['Spinach', 'Yam', 'Tomatoes', 'Onions', 'Palm oil', 'Seasoning']),
('Okra Soup with Plantain', 'Gluten-free okra soup', 'dinner', 'gluten-free', '45 mins', ARRAY['Fresh okra', 'Plantain', 'Palm oil', 'Onions', 'Seasoning']),

-- Regional Specialties
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

-- Update the summary view to reflect new data
DROP VIEW IF EXISTS meal_suggestions_summary;
CREATE VIEW meal_suggestions_summary AS
SELECT 
    meal_type,
    dietary_preference,
    COUNT(*) as total_suggestions,
    ARRAY_AGG(name ORDER BY name) as meal_names
FROM meal_suggestions
GROUP BY meal_type, dietary_preference
ORDER BY meal_type, dietary_preference; 