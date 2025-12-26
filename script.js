class NameWheel {
    constructor() {
        this.names = [];
        this.drawnNames = [];
        this.drawingHistory = [];  // Sparar alla drag i ordning (kan ha duplikater)
        this.isSpinning = false;
        this.currentRotation = 0;
        this.classes = {}; // Spara klasslistor
        
        // Canvas size - will be updated based on screen
        this.canvasWidth = 600;
        this.canvasHeight = 600;
        
        // DOM Elements
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nameInput = document.getElementById('nameInput');
        this.addButton = document.getElementById('addButton');
        this.spinButton = document.getElementById('spinButton');
        this.clearButton = document.getElementById('clearButton');
        this.resetButton = document.getElementById('resetButton');
        this.namesList = document.getElementById('namesList');
        this.historyList = document.getElementById('historyList');
        this.nameCount = document.getElementById('nameCount');
        this.excludeDrawn = document.getElementById('excludeDrawn');
        this.showDrawn = document.getElementById('showDrawn');
        this.clearHistoryButton = document.getElementById('clearHistoryButton');
        
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
                this.canvasWidth = 300;
                this.canvasHeight = 300;
            } else if (window.innerWidth < 1200) {
                this.canvasWidth = 450;
                this.canvasHeight = 450;
            } else {
                this.canvasWidth = 600;
                this.canvasHeight = 600;
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
        this.clearHistoryButton.addEventListener('click', () => this.clearHistory());
        
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
        
        // Debug: Log what we got
        console.log('Input length:', input.length);
        console.log('Input:', JSON.stringify(input));
        console.log('Contains newline:', input.includes('\n'));
        console.log('Contains carriage return:', input.includes('\r'));
        
        // Split on ANY whitespace (spaces, tabs, newlines, carriage returns)
        // This regex matches one or more whitespace characters
        namesToAdd = input.split(/[\s\n\r]+/).filter(n => n.trim() !== '');
        
        console.log('Parsed names:', namesToAdd);
        console.log('Number of names:', namesToAdd.length);
        
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
    
    clearHistory() {
        if (this.drawingHistory.length === 0) return;
        if (confirm('Är du säker på att du vill rensa historiken?')) {
            this.drawingHistory = [];
            this.updateHistory();
            this.saveToLocalStorage();
        }
    }
    
    updateUI() {
        this.updateNamesList();
        this.updateHistory();
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
    
    updateHistory() {
        this.historyList.innerHTML = '';
        
        if (this.drawingHistory.length === 0) {
            this.historyList.innerHTML = '<p class="empty-message">Ingen historia ännu</p>';
            return;
        }
        
        this.drawingHistory.forEach(name => {
            const div = document.createElement('div');
            div.className = 'history-item drawn';
            div.textContent = name;
            this.historyList.appendChild(div);
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
            const isDrawn = this.drawnNames.includes(name);
            
            // Draw segment with modern gradient
            const gradient = this.ctx.createLinearGradient(
                Math.cos(startAngle) * radius, Math.sin(startAngle) * radius,
                Math.cos(endAngle) * radius, Math.sin(endAngle) * radius
            );
            
            const lightColor = isDrawn ? this.lightenColor(colorPair.light, 100) : colorPair.light;
            const darkColor = isDrawn ? this.lightenColor(colorPair.dark, 80) : colorPair.dark;
            
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
            const textX = Math.cos(textAngle) * (radius * 0.62);
            const textY = Math.sin(textAngle) * (radius * 0.62);
            
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
                
                // Get selected name
                const selectedName = this.getSelectedName();
                if (selectedName) {
                    this.drawingHistory.unshift(selectedName);  // Lägg till i historik
                    if (!this.drawnNames.includes(selectedName)) {
                        this.drawnNames.unshift(selectedName);
                    }
                }
                
                this.updateUI();
                this.saveToLocalStorage();
            }
        };
        
        animate();
    }
    
    getSelectedName() {
        // Alltid exkludera redan dragna namn
        const displayNames = this.names.filter(name => !this.drawnNames.includes(name));
        
        if (displayNames.length === 0) return null;
        
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        // Pointer is at top (3π/2 in canvas coordinates)
        // Canvas.rotate() rotates the content, so segment at (pointer_angle + rotation) is now at pointer
        const selectedIndex = Math.floor((3 * Math.PI / 2 + normalizedRotation) / sliceAngle) % displayNames.length;
        const selectedName = displayNames[selectedIndex];
        
        return selectedName;
    }
    
    saveToLocalStorage() {
        const data = {
            names: this.names,
            drawnNames: this.drawnNames,
            drawingHistory: this.drawingHistory,
            rotation: this.currentRotation,
            classes: this.classes
        };
        localStorage.setItem('nameWheelData', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const data = localStorage.getItem('nameWheelData');
        if (data) {
            const parsed = JSON.parse(data);
            this.names = parsed.names || [];
            this.drawnNames = parsed.drawnNames || [];
            this.drawingHistory = parsed.drawingHistory || [];
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

    setupHistoryToggle() {
        const historyToggle = document.getElementById('historyToggle');
        const historyContent = document.getElementById('historyContent');
        
        historyToggle.addEventListener('click', () => {
            historyContent.classList.toggle('collapsed');
            historyToggle.classList.toggle('collapsed');
        });

        // Start collapsed
        historyContent.classList.add('collapsed');
        historyToggle.classList.add('collapsed');
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
    wheel.setupHistoryToggle();
});
