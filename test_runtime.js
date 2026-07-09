// Simulate browser loading all scripts in order
const fs = require('fs');
const path = require('path');

// Minimal DOM simulation
global.window = {};
global.document = {
  _listeners: [],
  getElementById: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ className: '', setAttribute: () => {}, addEventListener: () => {}, classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false } }),
  addEventListener: (evt, fn) => { if (evt === 'DOMContentLoaded') global.document._listeners.push(fn); },
  body: { appendChild: () => {}, style: {} },
  documentElement: { dataset: {} }
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.setTimeout = (fn, ms) => fn();

// Load scripts in order (skip firebase.js since it's ES module)
const scripts = ['utils.js','theme.js','api.js','renderer.js','chat.js','auth.js','settings.js','app.js'];

let error = false;
for (const f of scripts) {
  try {
    const code = fs.readFileSync(path.join('frontend/js', f), 'utf8');
    eval(code);
    console.log(`✅ ${f} — loaded OK`);
  } catch (e) {
    console.log(`❌ ${f} — RUNTIME ERROR: ${e.message}`);
    console.log(`   at: ${e.stack.split('\n')[1]}`);
    error = true;
  }
}

// Check globals
console.log('\n=== GLOBALS ===');
console.log('window.StyleAgentUtils:', !!window.StyleAgentUtils);
console.log('window.ThemeManager:', !!window.ThemeManager);
console.log('window.API:', !!window.API);
console.log('window.Renderer:', !!window.Renderer);
console.log('window.Chat:', !!window.Chat);
console.log('window.Auth:', !!window.Auth);
console.log('window.Settings:', !!window.Settings);
console.log('window.App:', !!window.App);

console.log('\n' + (error ? '❌ ERRORS FOUND — PAGE WILL BE BLANK' : '✅ ALL SCRIPTS LOAD WITHOUT ERROR'));
