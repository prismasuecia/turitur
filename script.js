class NameWheel {
    constructor() {
        this.names = [];
        this.drawnNames = [];
        this.drawingHistory = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.classes = {};
        
        // Canvas size - will be updated based on screen
        this.canvasWidth = 900;
        this.canvasHeight = 900;
        
        // DOM Elements
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nameInput = document.getElementById('nameInput');
        this.addButton = document.getElementById('addButton');
        this.spinButton = document.getElementById('spinButton');
        this.clearButton = document.getElementById('clearButton');
        this.resetButton = document.getElementById('resetButton');
        this.namesList = document.getElementById('namesList');
        this.nameCount = document.getElementById('nameCount');
        this.excludeDrawn = document.getElementById('excludeDrawn');
        this.showDrawn = document.getElementById('showDrawn');
        
        // Class elements
        this.classNameInput = document.getElementById('classNameInput');
        this.saveClassButton = document.getElementById('saveClassButton');
        this.classSelector = document.getElementById('classSelector');
        this.loadClassButton = document.getElementById('loadClassButton');
        this.copyClassButton = document.getElementById('copyClassButton');
        this.duplicateClassButton = document.getElementById('duplicateClassButton');
        this.deleteClassButton = document.getElementById('deleteClassButton');
        
        // Info toggle elements
        this.classesInfoBtn = document.getElementById('classesInfoBtn');
        this.classesInfo = document.getElementById('classesInfo');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.setupCanvasSize();
        this.drawWheel();
        this.updateInstructionVisibility();
    }
    
    setupCanvasSize() {
        // Check if in fullscreen mode
        if (document.body.classList.contains('fullscreen-mode')) {
            // In fullscreen, let CSS handle the sizing
            const vmin = Math.min(window.innerWidth, window.innerHeight) * 0.99;
            this.canvasWidth = vmin;
            this.canvasHeight = vmin;
        } else {
            // Normal mode: adjust canvas size based on viewport
            if (window.innerWidth < 768) {
                this.canvasWidth = 320;
                this.canvasHeight = 320;
            } else if (window.innerWidth < 1200) {
                this.canvasWidth = 480;
                this.canvasHeight = 480;
            } else {
                this.canvasWidth = 720;
                this.canvasHeight = 720;
            }
        }
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
    }
    
    setupEventListeners() {
        this.addButton.addEventListener('click', () => this.addName());
        this.nameInput.addEventListener('keydown', (e) => {
            // Allow Enter + Ctrl/Cmd for adding names
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.addName();
            }
        });
        // Handle paste events to properly detect line breaks
        this.nameInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            this.nameInput.value += text;
        });
        this.spinButton.addEventListener('click', () => this.spin());
        this.clearButton.addEventListener('click', () => this.clearNames());
        this.resetButton.addEventListener('click', () => this.reset());
        this.showDrawn.addEventListener('change', () => this.drawWheel());
        
        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Exit fullscreen on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('fullscreen-mode')) {
                this.toggleFullscreen();
            }
        });
        
        // Class listeners
        this.saveClassButton.addEventListener('click', () => this.saveClass());
        this.loadClassButton.addEventListener('click', () => this.loadClass());
        this.copyClassButton.addEventListener('click', () => this.copyClass());
        this.duplicateClassButton.addEventListener('click', () => this.duplicateClass());
        this.deleteClassButton.addEventListener('click', () => this.deleteClass());
        
        // Info toggle listener
        this.classesInfoBtn.addEventListener('click', () => this.toggleClassesInfo());
    }
    
    addName() {
        const input = this.nameInput.value.trim();
        if (input === '') {
            alert('Skriv eller klistra in minst ett namn!');
            return;
        }
        
        let namesToAdd = [];
        
        // Split on ANY whitespace (spaces, tabs, newlines, carriage returns)
        // This regex matches one or more whitespace characters
        namesToAdd = input.split(/[\s\n\r,]+/).filter(n => n.trim() !== '');
        
        if (namesToAdd.length === 0) {
            alert('Kunde inte hitta några giltiga namn!');
            return;
        }
        
        // Clear drawing history when adding new names
        this.drawingHistory = [];
        
        // Add each name, skip duplicates
        let added = 0;
        let duplicates = 0;
        
        namesToAdd.forEach(name => {
            const cleanName = name.trim();
            if (cleanName === '') return;
            
            if (this.names.includes(cleanName)) {
                duplicates++;
            } else {
                this.names.push(cleanName);
                added++;
            }
        });
        
        if (added > 0) {
            this.nameInput.value = '';
            this.updateUI();
            this.saveToLocalStorage();
            
            if (duplicates > 0) {
                alert(`${added} namn tillagd! (${duplicates} var redan med)`);
            } else {
                alert(`${added} namn tillagd!`);
            }
        } else {
            alert(`Alla ${duplicates} namn var redan med!`);
        }
    }
    
    removeName(index) {
        this.names.splice(index, 1);
        this.updateUI();
        this.saveToLocalStorage();
    }
    
    clearNames() {
        if (this.names.length === 0) return;
        if (confirm('Är du säker på att du vill rensa alla namn?')) {
            this.names = [];
            this.updateUI();
            this.saveToLocalStorage();
        }
    }
    
    reset() {
        if (confirm('Är du säker på att du vill återställa allt?')) {
            this.names = [];
            this.drawnNames = [];
            this.drawingHistory = [];
            this.currentRotation = 0;
            this.updateUI();
            this.saveToLocalStorage();
        }
    }
    
    updateUI() {
        this.updateNamesList();
        this.updateClassSelector();
        this.drawWheel();
        this.spinButton.disabled = this.names.length === 0;
        this.nameCount.textContent = this.names.length;
        this.updateInstructionVisibility();
    }
    
    updateNamesList() {
        this.namesList.innerHTML = '';
        
        this.names.forEach((name, index) => {
            const li = document.createElement('li');
            const isDrawn = this.drawnNames.includes(name);
            
            li.innerHTML = `
                <span class="name ${isDrawn ? 'drawn' : ''}">${name}</span>
                <button class="remove-btn">Ta bort</button>
            `;
            
            li.querySelector('.remove-btn').addEventListener('click', () => {
                this.removeName(index);
            });
            
            this.namesList.appendChild(li);
        });
    }
    
    drawWheel() {
        // Scale canvas for high DPI (retina) displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvasWidth * dpr;
        this.canvas.height = this.canvasHeight * dpr;
        this.canvas.style.width = this.canvasWidth + 'px';
        this.canvas.style.height = this.canvasHeight + 'px';
        this.ctx.scale(dpr, dpr);
        
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const radius = (this.canvasWidth * 0.4); // 40% of canvas width
        
        // Clear canvas with transparent background (ikke tegn noe bakgrunn)
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (this.names.length === 0) {
            this.ctx.fillStyle = '#999';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Lägg till namn för att börja!', centerX, centerY);
            return;
        }
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation);
        
        // Montessori & NPF-anpassad färgpalett – lågmätt, sofistikerad, lugnande
        const colors = [
            { light: '#5B7C99', dark: '#4A6E88' },  // Blå (fokus, stabilitet)
            { light: '#9EC1D9', dark: '#8DB3CE' },  // Ljus dimblå (luft, andrum)
            { light: '#7FAF8A', dark: '#6F9F7A' },  // Grön (balans, trygghet)
            { light: '#C89B5C', dark: '#B88B4C' },  // Ockra/varm orange
            { light: '#C66A5A', dark: '#B65A4A' },  // Dämpad terrakotta
            { light: '#8C79A8', dark: '#7C6998' },  // Mjuk plommon/lila
            { light: '#B8A489', dark: '#A89479' }   // Sand/varm beige
        ];
        
        // Alltid exkludera redan dragna namn från hjulet
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        
        // Beräkna vinkel baserat på återstående namn, inte alla namn
        const sliceAngle = displayNames.length > 0 ? (2 * Math.PI) / displayNames.length : 0;
        
        displayNames.forEach((name, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            
            const colorPair = colors[index % colors.length];
            
            // Draw segment with modern gradient
            const gradient = this.ctx.createLinearGradient(
                Math.cos(startAngle) * radius, Math.sin(startAngle) * radius,
                Math.cos(endAngle) * radius, Math.sin(endAngle) * radius
            );
            
            let lightColor = colorPair.light;
            let darkColor = colorPair.dark;
            
            gradient.addColorStop(0, lightColor);
            gradient.addColorStop(0.5, colorPair.light);
            gradient.addColorStop(1, darkColor);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Elegant segment border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            this.ctx.lineWidth = 3.5;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
            
            // Subtle dark line for depth
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw text with improved rendering
            const textAngle = startAngle + sliceAngle / 2;
            const textX = Math.cos(textAngle) * (radius * 0.87);
            const textY = Math.sin(textAngle) * (radius * 0.87);
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Text shadow for depth
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetY = 1;
            
            const text = name.substring(0, 16);
            this.ctx.fillText(text, 0, 0);
            this.ctx.restore();
        });
        
        this.ctx.restore();
        
        // Premium Apple-style pointer with better design
        this.ctx.fillStyle = '#4A6F8A';
        
        // Pointer shadow
        this.ctx.shadowColor = 'rgba(74, 111, 138, 0.25)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 6;
        
        // Draw pointer triangle
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 18, 26);
        this.ctx.lineTo(centerX + 18, 26);
        this.ctx.lineTo(centerX, 62);
        this.ctx.closePath();
        this.ctx.fill();
        
        // White outline for definition
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Draw selected name display under the pointer
        const selectedName = this.getSelectedName();
        if (selectedName) {
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 20px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText(selectedName, centerX, 75);
        }
    }
    
    lightenColor(color, amount = 50) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    spin() {
        if (this.isSpinning || this.names.length === 0) return;
        
        // Alltid använd samma filtreringlogik som getSelectedName()
        const availableNames = this.names.filter(name => !this.drawnNames.includes(name));
        
        if (availableNames.length === 0) {
            alert('Inga namn kvar att välja!');
            return;
        }
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        
        const spins = 5 + Math.random() * 5; // 5-10 spins
        const randomAngle = Math.random() * 2 * Math.PI;
        const totalRotation = spins * 2 * Math.PI + randomAngle;
        
        let currentFrame = 0;
        const totalFrames = 60; // 60 frames at ~60fps = 1 second
        const startRotation = this.currentRotation;
        
        const animate = () => {
            currentFrame++;
            
            // Easing function (ease-out)
            const progress = currentFrame / totalFrames;
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + totalRotation * easeProgress;
            this.drawWheel();
            
            if (currentFrame < totalFrames) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.spinButton.disabled = false;
                
                // Normalisera currentRotation för att säkerställa vi är mellan 0-2π
                this.currentRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                
                // Snap: align the selected segment's midpoint exactly under the pointer
                const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
                if (displayNames.length > 0) {
                    const sliceAngle = (2 * Math.PI) / displayNames.length;
                    const pointerAngle = -Math.PI / 2;
                    
                    // Compute the currently selected index using the same method as getSelectedName()
                    let normalizedRotation = this.currentRotation % (2 * Math.PI);
                    if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
                    let relativeAngle = (pointerAngle - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
                    const selectedIndex = Math.floor(relativeAngle / sliceAngle) % displayNames.length;
                    
                    // Midpoint angle for the selected segment (in wheel coordinates)
                    const targetSegmentMidAngle = (selectedIndex + 0.5) * sliceAngle;
                    
                    // Rotate so that segment midpoint appears at the pointer angle
                    // angle_on_screen = base_angle + currentRotation => set to pointerAngle
                    this.currentRotation = pointerAngle - targetSegmentMidAngle;
                    
                    // Small epsilon to avoid landing exactly on a boundary due to float error
                    this.currentRotation += 1e-6;
                    
                    // Normalize
                    this.currentRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                }
                
                // After snapping, get the selected name
                const selectedName = this.getSelectedName();
                
                // Lägg till i historik och drawnNames
                if (selectedName) {
                    this.drawingHistory.unshift(selectedName);
                    if (!this.drawnNames.includes(selectedName)) {
                        this.drawnNames.unshift(selectedName);
                    }
                }
                
                // Uppdatera UI
                this.updateUI();
                this.saveToLocalStorage();
            }
        };
        
        animate();
    }
    
    getSelectedName() {
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
    
    saveToLocalStorage() {
        try {
            const data = {
                names: this.names,
                drawnNames: this.drawnNames,
                drawingHistory: this.drawingHistory,
                rotation: this.currentRotation,
                classes: this.classes
            };
            localStorage.setItem('nameWheelData', JSON.stringify(data));
            console.log('✓ Data sparad till localStorage', data);
        } catch (e) {
            console.error('✗ Kunde inte spara till localStorage:', e);
            alert('Varning: Kunde inte spara data. localStorage kan vara disabled eller fullt.');
        }
    }
    
    loadFromLocalStorage() {
        const data = localStorage.getItem('nameWheelData');
        if (data) {
            const parsed = JSON.parse(data);
            this.names = (parsed.names || []).map(n => n.trim());
            this.drawnNames = (parsed.drawnNames || []).map(n => n.trim());
            this.drawingHistory = (parsed.drawingHistory || []).map(n => n.trim());
            this.currentRotation = parsed.rotation || 0;
            this.classes = parsed.classes || {};
            this.updateUI();
        }
    }
    
    saveClass() {
        const className = this.classNameInput.value.trim();
        if (className === '') {
            alert('Skriv ett namn på klassens!');
            return;
        }
        
        if (this.names.length === 0) {
            alert('Du måste ha minst ett namn för att spara en klasslista!');
            return;
        }
        
        this.classes[className] = {
            names: [...this.names],
            savedAt: new Date().toLocaleString('sv-SE')
        };
        
        this.classNameInput.value = '';
        this.updateClassSelector();
        this.saveToLocalStorage();
        alert(`Klasslistan "${className}" sparad!`);
    }
    
    loadClass() {
        const selectedClass = this.classSelector.value;
        if (!selectedClass) {
            alert('Välj en klasslista att ladda!');
            return;
        }
        
        if (this.classes[selectedClass]) {
            this.names = [...this.classes[selectedClass].names];
            this.drawnNames = [];
            this.drawingHistory = [];
            this.currentRotation = 0;
            this.updateUI();
            this.saveToLocalStorage();
            alert(`Klasslistan "${selectedClass}" laddad!`);
        }
    }
    
    copyClass() {
        const selectedClass = this.classSelector.value;
        if (!selectedClass) {
            alert('Välj en klasslista att kopiera!');
            return;
        }
        
        if (this.classes[selectedClass]) {
            const names = this.classes[selectedClass].names;
            const text = names.join('\n');
            
            navigator.clipboard.writeText(text).then(() => {
                alert(`${names.length} namn från "${selectedClass}" kopierad till urklipp!`);
            }).catch(() => {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert(`${names.length} namn från "${selectedClass}" kopierad till urklipp!`);
            });
        }
    }
    
    duplicateClass() {
        const selectedClass = this.classSelector.value;
        if (!selectedClass) {
            alert('Välj en klasslista att duplicera!');
            return;
        }
        
        if (!this.classes[selectedClass]) {
            alert('Klassistan hittades inte!');
            return;
        }
        
        let newName = selectedClass + ' (kopia)';
        let counter = 1;
        
        // If copy already exists, add number
        while (this.classes[newName]) {
            newName = selectedClass + ` (kopia ${counter})`;
            counter++;
        }
        
        this.classes[newName] = {
            names: [...this.classes[selectedClass].names],
            savedAt: new Date().toLocaleString('sv-SE')
        };
        
        this.updateClassSelector();
        this.saveToLocalStorage();
        alert(`Klassilan "${selectedClass}" duplicerad som "${newName}"!`);
    }
    
    deleteClass() {
        const selectedClass = this.classSelector.value;
        if (!selectedClass) {
            alert('Välj en klasslista att radera!');
            return;
        }
        
        if (confirm(`Är du säker på att du vill radera "${selectedClass}"?`)) {
            delete this.classes[selectedClass];
            this.updateClassSelector();
            this.saveToLocalStorage();
            alert('Klasslistan raderad!');
        }
    }
    
    updateClassSelector() {
        this.classSelector.innerHTML = '<option value="">Välj klasslista...</option>';
        
        Object.keys(this.classes).sort().forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            this.classSelector.appendChild(option);
        });
    }
    
    toggleClassesInfo() {
        this.classesInfo.classList.toggle('show');
    }
    
    toggleFullscreen() {
        document.body.classList.toggle('fullscreen-mode');
        
        // Force canvas redraw in fullscreen
        if (document.body.classList.contains('fullscreen-mode')) {
            setTimeout(() => {
                this.setupCanvasSize();
                this.drawWheel();
            }, 0);
        } else {
            this.setupCanvasSize();
            this.drawWheel();
        }
    }

    updateInstructionVisibility() {
        const instruction = document.querySelector('.spinner-instruction');
        if (instruction) {
            instruction.style.display = this.names.length === 0 ? 'block' : 'none';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const wheel = new NameWheel();
});
