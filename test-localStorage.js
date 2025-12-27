// Mock localStorage för Node.js
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
      console.log(`✓ localStorage.setItem('${key}', ...)`);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;
global.document = {
  getElementById: (id) => ({
    value: '',
    addEventListener: () => {},
    classList: { contains: () => false }
  }),
  body: { classList: { contains: () => false } },
  addEventListener: () => {}
};

global.window = {
  innerWidth: 1200,
  innerHeight: 800
};

// Load the script
const fs = require('fs');
const script = fs.readFileSync('script.js', 'utf8');

// Create the NameWheel instance
eval(script);

// Create instance
const wheel = new NameWheel();

// Test: Simulate addName()
console.log('\n=== TEST: addName() ===');
console.log('Initial names:', wheel.names);

// Manually add some names
wheel.nameInput.value = 'Adam\nBerit\nClaes';
console.log('Input text set to: "Adam\\nBerit\\nClaes"');

// Call addName
wheel.addName();

console.log('After addName():', wheel.names);
console.log('\nLocalStorage contents:');
const saved = JSON.parse(localStorage.getItem('nameWheelData') || '{}');
console.log('names:', saved.names);
