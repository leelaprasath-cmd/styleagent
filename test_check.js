// Quick test: verify HTML structure and JS syntax
const fs = require('fs');
const path = require('path');

console.log('=== JS SYNTAX CHECK ===');
const jsFiles = ['utils.js','theme.js','api.js','landing.js','renderer.js','chat.js','auth.js','settings.js','app.js'];
let allOk = true;
for (const f of jsFiles) {
  try {
    const code = fs.readFileSync(path.join('frontend/js', f), 'utf8');
    new Function(code);
    console.log(`  ✅ ${f} — OK`);
  } catch (e) {
    console.log(`  ❌ ${f} — ERROR: ${e.message}`);
    allOk = false;
  }
}

console.log('\n=== HTML STRUCTURE CHECK ===');
const html = fs.readFileSync('frontend/index.html', 'utf8');
console.log('  landing-page exists:', html.includes('id="landing-page"'));
console.log('  landing-page hidden:', html.includes('style="display:none"'));
console.log('  auth-screen exists:', html.includes('id="auth-screen"'));
console.log('  auth-screen hidden:', html.includes('auth-screen hidden'));
console.log('  app-layout exists:', html.includes('id="app-layout"'));
console.log('  app-layout NOT hidden:', !html.includes('app-layout" class="hidden"'));

// Check script order
const authIdx = html.indexOf('src="js/auth.js"');
const appIdx = html.indexOf('src="js/app.js"');
console.log('  auth.js loads before app.js:', authIdx < appIdx);

// Check for chat-area, messages-container, chat-input
console.log('  chat-area exists:', html.includes('id="chat-area"'));
console.log('  messages-container exists:', html.includes('id="messages-container"'));
console.log('  chat-input exists:', html.includes('id="chat-input"'));
console.log('  send-btn exists:', html.includes('id="send-btn"'));
console.log('  settings-modal exists:', html.includes('id="settings-modal"'));
console.log('  settings-btn exists:', html.includes('id="settings-btn"'));

console.log('\n=== RESULT ===');
console.log(allOk ? '✅ ALL JS FILES PASS' : '❌ SOME JS FILES HAVE ERRORS');
