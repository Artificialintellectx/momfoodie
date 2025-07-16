import { useState } from 'react';
import { getSmartMealSuggestions, getTotalAvailableCount, clearSuggestionHistory } from '../lib/database-service';

export default function TestDebug() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testScenario = async () => {
    setLoading(true);
    const newResults = [];
    
    try {
      // Clear history first
      clearSuggestionHistory();
      newResults.push('🧹 Cleared suggestion history');
      
      // Test 1: Get total available
      const totalAvailable = await getTotalAvailableCount('breakfast', 'any', 'yoruba', '');
      newResults.push(`📊 Total available: ${totalAvailable}`);
      
      // Test 2: Get first suggestion
      const result1 = await getSmartMealSuggestions('breakfast', 'any', 'yoruba', '', 1, false);
      newResults.push(`🔍 First suggestion: ${result1.suggestions.length} returned, totalShown: ${result1.totalShown}, hasMore: ${result1.hasMore}, isAI: ${result1.suggestions[0]?.is_ai_generated || false}`);
      
      // Test 3: Get second suggestion
      const result2 = await getSmartMealSuggestions('breakfast', 'any', 'yoruba', '', 1, false);
      newResults.push(`🔍 Second suggestion: ${result2.suggestions.length} returned, totalShown: ${result2.totalShown}, hasMore: ${result2.hasMore}, isAI: ${result2.suggestions[0]?.is_ai_generated || false}`);
      
      // Test 4: Get third suggestion
      const result3 = await getSmartMealSuggestions('breakfast', 'any', 'yoruba', '', 1, false);
      newResults.push(`🔍 Third suggestion: ${result3.suggestions.length} returned, totalShown: ${result3.totalShown}, hasMore: ${result3.hasMore}, isAI: ${result3.suggestions[0]?.is_ai_generated || false}`);
      
      // Test 5: Try to get more (should trigger AI)
      const result4 = await getSmartMealSuggestions('breakfast', 'any', 'yoruba', '', 1, true);
      newResults.push(`🔍 Fourth suggestion (getNew=true): ${result4.suggestions.length} returned, totalShown: ${result4.totalShown}, hasMore: ${result4.hasMore}, isAI: ${result4.suggestions[0]?.is_ai_generated || false}`);
      
      // Test 6: Get AI suggestion
      const result5 = await getSmartMealSuggestions('breakfast', 'any', 'yoruba', '', 1, true);
      newResults.push(`🔍 Fifth suggestion (AI): ${result5.suggestions.length} returned, totalShown: ${result5.totalShown}, hasMore: ${result5.hasMore}, isAI: ${result5.suggestions[0]?.is_ai_generated || false}`);
      
    } catch (error) {
      newResults.push(`❌ Error: ${error.message}`);
    }
    
    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Service Debug Test</h1>
        
        <button
          onClick={testScenario}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Running Test...' : 'Run Debug Test'}
        </button>
        
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 