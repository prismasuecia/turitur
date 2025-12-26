// Test script för att debugga segmentväljning

const displayNames = ['Anton', 'Erik', 'Sofia', 'Lisa']; // 4 namn
const sliceAngle = (2 * Math.PI) / displayNames.length;

console.log('='.repeat(80));
console.log('TEST: Vilka namn väljs vid olika rotationsvinklar?');
console.log('='.repeat(80));
console.log(`displayNames: ${displayNames.join(', ')}`);
console.log(`Antal namn: ${displayNames.length}`);
console.log(`sliceAngle: ${(sliceAngle * 180 / Math.PI).toFixed(1)}° (${sliceAngle.toFixed(4)} rad)`);
console.log('');

// Visa vilken vinkel varje segment börjar på (innan rotation)
console.log('SEGMENTS I HJULET (innan rotation, i roterat koordinatsystem):');
displayNames.forEach((name, index) => {
    const startAngle = index * sliceAngle;
    const endAngle = (index + 1) * sliceAngle;
    console.log(`  [${index}] ${name.padEnd(10)} | ${(startAngle * 180 / Math.PI).toFixed(1).padStart(6)}° - ${(endAngle * 180 / Math.PI).toFixed(1).padStart(6)}°`);
});
console.log('');

// Nu testa med olika rotationsvinklar
const testRotations = [
    0,
    Math.PI / 4,      // 45°
    Math.PI / 2,      // 90°
    Math.PI,          // 180°
    3 * Math.PI / 2,  // 270° (överst)
    2 * Math.PI - 0.1 // nästan full rotation
];

console.log('TESTA: Vilka namn väljs vid olika rotationsvinklar?');
console.log('Pekaren är ALLTID överst (3π/2 = 270°)');
console.log('');

testRotations.forEach(currentRotation => {
    const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // MIN NUVARANDE LOGIK
    let selectedIndex = Math.floor((3 * Math.PI / 2 - normalizedRotation) / sliceAngle);
    selectedIndex = ((selectedIndex % displayNames.length) + displayNames.length) % displayNames.length;
    
    console.log(`ROTATION: ${(normalizedRotation * 180 / Math.PI).toFixed(1).padStart(6)}° => Index ${selectedIndex} (${displayNames[selectedIndex]})`);
    
    // Visa vilka segment är vid pekaren för denna rotation
    console.log('  Segment positions efter denna rotation (globalt):');
    displayNames.forEach((name, index) => {
        const segmentStart = (index * sliceAngle + normalizedRotation) % (2 * Math.PI);
        const segmentEnd = ((index + 1) * sliceAngle + normalizedRotation) % (2 * Math.PI);
        const isSelected = (selectedIndex === index) ? ' ◄-- SELECTED' : '';
        console.log(`    [${index}] ${name.padEnd(10)} | ${(segmentStart * 180 / Math.PI).toFixed(1).padStart(6)}° - ${(segmentEnd * 180 / Math.PI).toFixed(1).padStart(6)}°${isSelected}`);
    });
    console.log('');
});

console.log('='.repeat(80));
console.log('FRÅGA: Om du suddar ett segment från det synliga hjulet, ser du');
console.log('något mönster? Väljs alltid rätt segment? Eller är det alltid off-by-one?');
console.log('='.repeat(80));
