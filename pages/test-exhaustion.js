import { useState } from 'react';
import { getSmartMealSuggestions, clearSuggestionHistory } from '../lib/database-service';

export default function TestExhaustion() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testExhaustion = async () => {
    setLoading(true);
    const newResults = [];
    
    try {
      // Clear history first
      clearSuggestionHistory();
      newResults.push('🧹 Cleared suggestion history');
      
      // Test scenario: Get all 3 database suggestions first
      for (let i = 1; i <= 3; i++) {
        const result = await getSmartMealSuggestions('breakfast', 'any', 'nigerian', '', 1, false);
        newResults.push(`🔍 Suggestion ${i}: ${result.suggestions[0]?.name} | totalShown: ${result.totalShown}/3 | hasMore: ${result.hasMore} | isAI: ${result.suggestions[0]?.is_ai_generated || false}`);
      }
      
      // Now try to get more - this should trigger AI
      newResults.push('--- Trying to get more suggestions (should trigger AI) ---');
      
      const aiResult = await getSmartMealSuggestions('breakfast', 'any', 'nigerian', '', 1, true);
      newResults.push(`🤖 AI Suggestion: ${aiResult.suggestions[0]?.name} | totalShown: ${aiResult.totalShown} | hasMore: ${aiResult.hasMore} | isAI: ${aiResult.suggestions[0]?.is_ai_generated || false}`);
      
      // Try another AI suggestion
      const aiResult2 = await getSmartMealSuggestions('breakfast', 'any', 'nigerian', '', 1, true);
      newResults.push(`🤖 AI Suggestion 2: ${aiResult2.suggestions[0]?.name} | totalShown: ${aiResult2.totalShown} | hasMore: ${aiResult2.hasMore} | isAI: ${aiResult2.suggestions[0]?.is_ai_generated || false}`);
      
    } catch (error) {
      newResults.push(`❌ Error: ${error.message}`);
    }
    
    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Exhaustion Test</h1>
        <p className="mb-6 text-gray-600">This test simulates exhausting all 3 database suggestions and triggering AI mode.</p>
        
        <button
          onClick={testExhaustion}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-3 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Running Test...' : 'Test AI Exhaustion'}
        </button>
        
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded font-mono text-sm">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 