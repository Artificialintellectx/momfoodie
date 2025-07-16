import { useState } from 'react';
import { generateAIMealSuggestion } from '../lib/ai-service';

export default function TestCulturalAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testCulturalAI = async (cuisine) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const suggestion = await generateAIMealSuggestion('dinner', 'any', cuisine, '');
      setResult(suggestion);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const culturalCuisines = [
    'yoruba', 'igbo', 'hausa', 'edo', 'ibibio', 
    'ijaw', 'nupe', 'kanuri', 'fulani', 'tiv'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-orange-800">
          Test Cultural AI Suggestions
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {culturalCuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => testCulturalAI(cuisine)}
              disabled={loading}
              className="p-4 bg-white rounded-xl shadow-lg border border-gray-200 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {cuisine === 'yoruba' && '🫘'}
                  {cuisine === 'igbo' && '🥜'}
                  {cuisine === 'hausa' && '🌾'}
                  {cuisine === 'edo' && '🍠'}
                  {cuisine === 'ibibio' && '🐟'}
                  {cuisine === 'ijaw' && '🦐'}
                  {cuisine === 'nupe' && '🌽'}
                  {cuisine === 'kanuri' && '🥩'}
                  {cuisine === 'fulani' && '🥛'}
                  {cuisine === 'tiv' && '🌿'}
                </div>
                <div className="font-semibold text-gray-800 capitalize">
                  {cuisine}
                </div>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-2 text-gray-600">Generating authentic {result?.cuisine || 'Nigerian'} suggestion...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{result.name}</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {result.cuisine}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{result.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Ingredients</h3>
                <ul className="space-y-1">
                  {result.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600">• {ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
                <ol className="space-y-2">
                  {result.instructions.map((instruction, index) => (
                    <li key={index} className="text-gray-600">
                      <span className="font-medium text-orange-600">{index + 1}.</span> {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <span className="text-sm text-gray-500">Prep Time</span>
                <p className="font-semibold text-gray-800">{result.prep_time}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Difficulty</span>
                <p className="font-semibold text-gray-800">{result.difficulty}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Serving</span>
                <p className="font-semibold text-gray-800">{result.serving_size}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Cost</span>
                <p className="font-semibold text-gray-800">{result.estimated_cost}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 