#!/usr/bin/env node

/**
 * Script to switch between database mode and AI-only mode
 * Usage: node scripts/switch-mode.js [database|ai|both]
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../lib/config.js');

function updateConfig(mode) {
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  switch (mode.toLowerCase()) {
    case 'database':
      // Enable database, disable AI
      configContent = configContent.replace(
        /ENABLE_DATABASE_SUGGESTIONS: (true|false)/,
        'ENABLE_DATABASE_SUGGESTIONS: true'
      );
      configContent = configContent.replace(
        /ENABLE_AI_SUGGESTIONS: (true|false)/,
        'ENABLE_AI_SUGGESTIONS: false'
      );
      console.log('✅ Switched to DATABASE mode (database enabled, AI disabled)');
      break;
      
    case 'ai':
      // Disable database, enable AI
      configContent = configContent.replace(
        /ENABLE_DATABASE_SUGGESTIONS: (true|false)/,
        'ENABLE_DATABASE_SUGGESTIONS: false'
      );
      configContent = configContent.replace(
        /ENABLE_AI_SUGGESTIONS: (true|false)/,
        'ENABLE_AI_SUGGESTIONS: true'
      );
      console.log('✅ Switched to AI-ONLY mode (database disabled, AI enabled)');
      break;
      
    case 'both':
      // Enable both database and AI
      configContent = configContent.replace(
        /ENABLE_DATABASE_SUGGESTIONS: (true|false)/,
        'ENABLE_DATABASE_SUGGESTIONS: true'
      );
      configContent = configContent.replace(
        /ENABLE_AI_SUGGESTIONS: (true|false)/,
        'ENABLE_AI_SUGGESTIONS: true'
      );
      console.log('✅ Switched to HYBRID mode (database and AI both enabled)');
      break;
      
    default:
      console.error('❌ Invalid mode. Use: database, ai, or both');
      console.log('\nUsage:');
      console.log('  node scripts/switch-mode.js database  # Database only');
      console.log('  node scripts/switch-mode.js ai        # AI only');
      console.log('  node scripts/switch-mode.js both      # Both database and AI');
      process.exit(1);
  }
  
  fs.writeFileSync(configPath, configContent);
  console.log('📝 Configuration updated successfully!');
  console.log('🔄 Restart your development server to apply changes.');
}

// Get mode from command line arguments
const mode = process.argv[2];

if (!mode) {
  console.error('❌ Please specify a mode');
  console.log('\nUsage:');
  console.log('  node scripts/switch-mode.js database  # Database only');
  console.log('  node scripts/switch-mode.js ai        # AI only');
  console.log('  node scripts/switch-mode.js both      # Both database and AI');
  process.exit(1);
}

updateConfig(mode); 