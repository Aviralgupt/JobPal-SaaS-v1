#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Switching to Vercel/Gemini version...');

// Backup original App.js
const appPath = path.join(__dirname, 'client', 'src', 'App.js');
const appBackupPath = path.join(__dirname, 'client', 'src', 'App_Local.js');
const appVercelPath = path.join(__dirname, 'client', 'src', 'App_Vercel.js');

try {
  // Check if files exist
  if (!fs.existsSync(appPath)) {
    console.error('❌ App.js not found!');
    process.exit(1);
  }
  
  if (!fs.existsSync(appVercelPath)) {
    console.error('❌ App_Vercel.js not found!');
    process.exit(1);
  }

  // Backup original if not already backed up
  if (!fs.existsSync(appBackupPath)) {
    fs.copyFileSync(appPath, appBackupPath);
    console.log('✅ Backed up original App.js to App_Local.js');
  }

  // Replace App.js with Vercel version
  fs.copyFileSync(appVercelPath, appPath);
  console.log('✅ Switched to Vercel version (App_Vercel.js -> App.js)');

  console.log('\n🎉 Successfully switched to Vercel/Gemini version!');
  console.log('\nNext steps:');
  console.log('1. Make sure you have your Google Gemini API key');
  console.log('2. Set GOOGLE_API_KEY environment variable in Vercel');
  console.log('3. Deploy: vercel --prod');
  console.log('\nTo switch back to local version, run: node switch-to-local.js');

} catch (error) {
  console.error('❌ Error switching versions:', error.message);
  process.exit(1);
}
