#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to Local/Ollama version...');

// Paths
const appPath = path.join(__dirname, 'client', 'src', 'App.js');
const appBackupPath = path.join(__dirname, 'client', 'src', 'App_Local.js');

try {
  // Check if backup exists
  if (!fs.existsSync(appBackupPath)) {
    console.error('❌ App_Local.js backup not found!');
    console.log('It seems you haven\'t switched to Vercel version yet, or the backup was deleted.');
    process.exit(1);
  }

  // Restore original App.js from backup
  fs.copyFileSync(appBackupPath, appPath);
  console.log('✅ Restored original App.js from App_Local.js backup');

  console.log('\n🎉 Successfully switched back to Local/Ollama version!');
  console.log('\nNext steps:');
  console.log('1. Make sure Ollama is running: ollama serve');
  console.log('2. Make sure you have the model: ollama pull phi3:mini');
  console.log('3. Start the local server: cd server && python app.py');
  console.log('4. Start the client: cd client && npm start');

} catch (error) {
  console.error('❌ Error switching versions:', error.message);
  process.exit(1);
}
