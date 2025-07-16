# Mode Switching Guide

This guide explains how to switch between different modes in Mummyfoodie.

## Available Modes

### 1. **AI-Only Mode** (Current)
- Database suggestions are disabled
- All suggestions come from AI generation
- Faster response times
- More creative and varied suggestions
- No dependency on database connection

### 2. **Database Mode**
- Only database suggestions are used
- No AI generation
- Consistent, curated suggestions
- Requires database connection
- Faster for repeated requests

### 3. **Hybrid Mode**
- Both database and AI suggestions are used
- Database suggestions are shown first
- AI suggestions are used when database is exhausted
- Best of both worlds

## How to Switch Modes

### Using the Script (Recommended)

```bash
# Switch to AI-only mode
node scripts/switch-mode.js ai

# Switch to database-only mode
node scripts/switch-mode.js database

# Switch to hybrid mode (both database and AI)
node scripts/switch-mode.js both
```

### Manual Configuration

You can also manually edit `lib/config.js`:

```javascript
export const CONFIG = {
  // Set to false to disable database suggestions
  ENABLE_DATABASE_SUGGESTIONS: false,  // Change this
  
  // Set to true to enable AI suggestions
  ENABLE_AI_SUGGESTIONS: true,         // Change this
  
  // ... rest of config
};
```

## After Switching Modes

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Clear browser cache** (optional but recommended)

3. **Test the app** to ensure the new mode is working

## Configuration Options

### AI Configuration
```javascript
AI: {
  PRE_GENERATE_COUNT: 5,        // Number of AI suggestions to pre-generate
  MAX_GENERATION_TIME: 20000,   // Max time to wait for AI (ms)
  MAX_ATTEMPTS: 3,              // Max attempts for AI generation
  TEMPERATURE: 0.7,             // AI creativity (0.0 to 1.0)
  MAX_TOKENS: 800               // Max tokens for AI response
}
```

### Database Configuration
```javascript
DATABASE: {
  SUGGESTIONS_PER_REQUEST: 3,   // Suggestions per request
  ENABLE_SMART_ORDERING: true,  // Enable smart ordering
  ENABLE_PAGINATION: true       // Enable pagination
}
```

### Development Configuration
```javascript
DEV_CONFIG: {
  DEBUG_LOGGING: true,          // Enable debug logging
  SHOW_DETAILED_ERRORS: true,   // Show detailed errors
  ENABLE_PERFORMANCE_MONITORING: false
}
```

## Troubleshooting

### If AI-only mode isn't working:
1. Check that `ENABLE_DATABASE_SUGGESTIONS: false`
2. Check that `ENABLE_AI_SUGGESTIONS: true`
3. Verify your OpenAI API key is set in `.env.local`
4. Check browser console for errors

### If database mode isn't working:
1. Check that `ENABLE_DATABASE_SUGGESTIONS: true`
2. Check that `ENABLE_AI_SUGGESTIONS: false`
3. Verify your Supabase connection is working
4. Check browser console for errors

### If hybrid mode isn't working:
1. Check that both `ENABLE_DATABASE_SUGGESTIONS: true` and `ENABLE_AI_SUGGESTIONS: true`
2. Verify both database and AI configurations are correct
3. Check browser console for errors

## Current Status

**Current Mode:** AI-Only Mode
- ✅ Database suggestions: Disabled
- ✅ AI suggestions: Enabled
- ✅ Fallback suggestions: Enabled

To switch back to database mode when needed:
```bash
node scripts/switch-mode.js database
``` 