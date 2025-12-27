// Test av Groks fix för getSelectedName()

class NameWheelFixed {
    constructor() {
        this.names = [];
        this.drawnNames = [];
        this.drawingHistory = [];
        this.currentRotation = 0;
    }

    addNames(input) {
        let namesToAdd = input.split(/[\s\n\r,]+/).filter(n => n.trim() !== '');
        this.drawingHistory = [];
        this.drawnNames = [];
        namesToAdd.forEach(name => {
            const cleanName = name.trim();
            if (cleanName === '' || this.names.includes(cleanName)) return;
            this.names.push(cleanName);
        });
    }

    getSelectedName() {
        // GROKS KORRIGERING
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        
        if (displayNames.length === 0) return null;
        
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        
        // Normalisera currentRotation till intervallet [0, 2π)
        let normalizedRotation = this.currentRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        
        // Pekaren är fixerad vid toppen av canvas = vinkel -π/2 (eller 3π/2)
        const pointerAngle = -Math.PI / 2;
        
        // Beräkna relativ vinkel från pekaren till hjulrotationen
        let relativeAngle = pointerAngle - normalizedRotation;
        
        // Normalisera till [0, 2π)
        relativeAngle = (relativeAngle + 2 * Math.PI) % (2 * Math.PI);
        
        // Använd Math.floor för exakta och förutsägbara segmentgränser
        const selectedIndex = Math.floor(relativeAngle / sliceAngle) % displayNames.length;
        
        return displayNames[selectedIndex];
    }

    spin(randomAngleDegrees) {
        this.currentRotation += randomAngleDegrees * Math.PI / 180;
        this.currentRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        
        const selectedName = this.getSelectedName();
        
        if (selectedName) {
            this.drawingHistory.unshift(selectedName);
            if (!this.drawnNames.includes(selectedName)) {
                this.drawnNames.unshift(selectedName);
            }
        }
        
        // Debug output
        let normalizedRotation = this.currentRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        const pointerAngle = -Math.PI / 2;
        let relativeAngle = pointerAngle - normalizedRotation;
        relativeAngle = (relativeAngle + 2 * Math.PI) % (2 * Math.PI);
        const selectedIndex = Math.floor(relativeAngle / sliceAngle);
        
        return {
            rotation: this.currentRotation,
            selectedName: selectedName,
            selectedIndex: selectedIndex,
            displayNames: displayNames,
            sliceAngle: sliceAngle
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
            console.log(`    [${index}] ${name.padEnd(10)} ${startDeg.padStart(3)}°-${endDeg.padStart(3)}° (center: ${centerDeg}°)`);
        });
    }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('TEST AV GROKS FIX - 4 namn');
console.log('═══════════════════════════════════════════════════════════\n');

let wheel = new NameWheelFixed();
wheel.addNames('Alice, Bob, Clara, David');

console.log('📍 INITIALT HJUL (ingen rotation):');
wheel.showWheel();

console.log('\n🔄 SNURRA 1: +120° rotation');
let r1 = wheel.spin(120);
console.log(`  Final rotation: ${(r1.rotation * 180 / Math.PI).toFixed(1)}°`);
console.log(`  ✓ Valt namn: ${r1.selectedName} (index ${r1.selectedIndex})`);
console.log(`  DisplayNames: ${r1.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n🔄 SNURRA 2: +150° rotation');
let r2 = wheel.spin(150);
console.log(`  Final rotation: ${(r2.rotation * 180 / Math.PI).toFixed(1)}°`);
console.log(`  ✓ Valt namn: ${r2.selectedName} (index ${r2.selectedIndex})`);
console.log(`  DisplayNames: ${r2.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n🔄 SNURRA 3: +180° rotation');
let r3 = wheel.spin(180);
console.log(`  Final rotation: ${(r3.rotation * 180 / Math.PI).toFixed(1)}°`);
console.log(`  ✓ Valt namn: ${r3.selectedName} (index ${r3.selectedIndex})`);
console.log(`  DisplayNames: ${r3.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n🔄 SNURRA 4: +200° rotation');
let r4 = wheel.spin(200);
console.log(`  Final rotation: ${(r4.rotation * 180 / Math.PI).toFixed(1)}°`);
console.log(`  ✓ Valt namn: ${r4.selectedName} (index ${r4.selectedIndex})`);
console.log(`  DisplayNames: ${r4.displayNames.join(', ')}`);
wheel.showWheel();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('SLUTRESULTAT:');
console.log('═══════════════════════════════════════════════════════════');
console.log('Snurra 1 valde: ' + r1.selectedName);
console.log('Snurra 2 valde: ' + r2.selectedName);
console.log('Snurra 3 valde: ' + r3.selectedName);
console.log('Snurra 4 valde: ' + r4.selectedName);
console.log('\nHistorik (senaste först):');
wheel.drawingHistory.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
});

console.log('\n✓ TEST KLART - Verifiera att varje namn är korrekt valt!');
