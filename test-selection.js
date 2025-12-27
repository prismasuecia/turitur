// Test av segment selection logic

class NameWheelTest {
    constructor() {
        this.names = [];
        this.drawnNames = [];
        this.drawingHistory = [];
        this.currentRotation = 0;
    }

    addName(input) {
        let namesToAdd = input.split(/[\s\n\r,]+/).filter(n => n.trim() !== '');
        this.drawingHistory = [];
        namesToAdd.forEach(name => {
            const cleanName = name.trim();
            if (cleanName === '' || this.names.includes(cleanName)) return;
            this.names.push(cleanName);
        });
    }

    getSelectedName() {
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        if (displayNames.length === 0) return null;
        
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const selectedIndex = Math.floor((3 * Math.PI / 2 + normalizedRotation) / sliceAngle) % displayNames.length;
        const selectedName = displayNames[selectedIndex];
        
        return {
            name: selectedName,
            index: selectedIndex,
            displayNames: displayNames
        };
    }

    showWheel() {
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        
        console.log('  Hjulet (från topp medurs):');
        displayNames.forEach((name, index) => {
            const startDeg = (index * sliceAngle * 180 / Math.PI).toFixed(0);
            const endDeg = ((index + 1) * sliceAngle * 180 / Math.PI).toFixed(0);
            const centerDeg = ((index + 0.5) * sliceAngle * 180 / Math.PI).toFixed(0);
            const pointer = Math.abs(((centerDeg - 270 + 360) % 360)) < 45 ? ' ← PEKAREN' : '';
            console.log(`    [${index}] ${name.padEnd(10)} ${startDeg.padStart(3)}°-${endDeg.padStart(3)}° (center: ${centerDeg}°)${pointer}`);
        });
    }

    spin(rotationDeg) {
        this.currentRotation += rotationDeg * Math.PI / 180;
        this.currentRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        const result = this.getSelectedName();
        if (result && result.name) {
            this.drawingHistory.unshift(result.name);
            if (!this.drawnNames.includes(result.name)) {
                this.drawnNames.unshift(result.name);
            }
        }
        return result;
    }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('TEST AV SEGMENTVAL - Erik, Lisa, Johan');
console.log('═══════════════════════════════════════════════════════════\n');

let wheel = new NameWheelTest();
wheel.addName('Erik, Lisa, Johan');

console.log('📍 INITIALT HJUL (ingen rotation):');
wheel.showWheel();

console.log('\n🔄 SNURRA 1: Lägg till 150° rotation');
let r1 = wheel.spin(150);
console.log(`  Rotation nu: ${(wheel.currentRotation * 180 / Math.PI).toFixed(0)}°`);
console.log(`  Valt namn: ${r1.name} (index ${r1.index} från displayNames)`);
console.log(`  displayNames: ${r1.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n🔄 SNURRA 2: Lägg till 200° rotation');
let r2 = wheel.spin(200);
console.log(`  Rotation nu: ${(wheel.currentRotation * 180 / Math.PI).toFixed(0)}°`);
console.log(`  Valt namn: ${r2.name} (index ${r2.index} från displayNames)`);
console.log(`  displayNames: ${r2.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n🔄 SNURRA 3: Lägg till 220° rotation');
let r3 = wheel.spin(220);
console.log(`  Rotation nu: ${(wheel.currentRotation * 180 / Math.PI).toFixed(0)}°`);
console.log(`  Valt namn: ${r3.name} (index ${r3.index} från displayNames)`);
console.log(`  displayNames: ${r3.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('SLUTRESULTAT:');
console.log('═══════════════════════════════════════════════════════════');
console.log('Snurra 1 valde: ' + r1.name);
console.log('Snurra 2 valde: ' + r2.name);
console.log('Snurra 3 valde: ' + r3.name);
console.log('\nHistoriken:');
wheel.drawingHistory.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
});

console.log('\n✓ FÖRVÄNTAD KORREKTHET:');
console.log(`  Varje namn bör matcha det som är vid pekaren på hjulet`);
