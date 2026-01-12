// Test highlighting logic

// Mock canvas context
const mockCtx = {
  createLinearGradient: () => ({
    addColorStop: () => {}
  }),
  beginPath: () => {},
  moveTo: () => {},
  arc: () => {},
  closePath: () => {},
  fill: () => {},
  stroke: () => {},
  save: () => {},
  translate: () => {},
  rotate: () => {},
  fillText: () => {},
  restore: () => {}
};

// Simulated NameWheel class
class NameWheelTest {
  constructor() {
    this.names = ['Anna', 'Bo', 'Cia'];
    this.drawnNames = [];
    this.currentRotation = 0;
    this.ctx = mockCtx;
  }

  getSelectedName() {
    const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
    if (displayNames.length === 0) return null;
    
    const sliceAngle = (2 * Math.PI) / displayNames.length;
    let normalizedRotation = this.currentRotation % (2 * Math.PI);
    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
    
    const pointerAngle = -Math.PI / 2;
    let relativeAngle = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
    const selectedIndex = Math.floor(relativeAngle / sliceAngle) % displayNames.length;
    
    return displayNames[selectedIndex];
  }

  lightenColor(color, amount = 50) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  testDrawing() {
    const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
    const sliceAngle = displayNames.length > 0 ? (2 * Math.PI) / displayNames.length : 0;
    
    const selectedName = this.getSelectedName();
    console.log('selectedName:', selectedName);
    console.log('displayNames:', displayNames);
    
    displayNames.forEach((name, index) => {
      const isSelected = name === selectedName;
      console.log(`  [${index}] "${name}" === "${selectedName}" ? ${isSelected}`);
      
      if (isSelected) {
        console.log(`    -> Would highlight segment ${index}`);
      }
    });
  }
}

console.log('='.repeat(60));
console.log('TEST 1: Initial state (no rotation)');
console.log('='.repeat(60));
let wheel = new NameWheelTest();
wheel.testDrawing();

console.log('\n' + '='.repeat(60));
console.log('TEST 2: After some rotation');
console.log('='.repeat(60));
wheel.currentRotation = Math.PI / 2;
wheel.testDrawing();

console.log('\n' + '='.repeat(60));
console.log('TEST 3: After drawing one name');
console.log('='.repeat(60));
wheel.drawnNames = ['Anna'];
wheel.currentRotation = 0;
wheel.testDrawing();

console.log('\n' + '='.repeat(60));
console.log('LIGHTEN COLOR TEST');
console.log('='.repeat(60));
const original = '#8C79A8';
const lightened = wheel.lightenColor(original, 70);
console.log(`Original: ${original}`);
console.log(`Lightened: ${lightened}`);
