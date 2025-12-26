class NameWheel {
    constructor() {
        this.names = [];
        this.drawnNames = [];
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
        // Adjust canvas size based on viewport
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
            this.currentRotation = 0;
            this.updateUI();
            this.saveToLocalStorage();
        }
    }
    
    clearHistory() {
        if (this.drawnNames.length === 0) return;
        if (confirm('Är du säker på att du vill rensa historiken?')) {
            this.drawnNames = [];
            this.updateUI();
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
        
        if (this.drawnNames.length === 0) {
            this.historyList.innerHTML = '<p class="empty-message">Ingen historia ännu</p>';
            return;
        }
        
        this.drawnNames.forEach(name => {
            const div = document.createElement('div');
            div.className = 'history-item drawn';
            div.textContent = name;
            this.historyList.appendChild(div);
        });
    }
    
    drawWheel() {
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        const radius = (this.canvasWidth * 0.4); // 40% of canvas width
        
        // Clear canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.names.length === 0) {
            this.ctx.fillStyle = '#999';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Lägg till namn för att börja!', centerX, centerY);
            return;
        }
        
        const sliceAngle = (2 * Math.PI) / this.names.length;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation);
        
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#30b0fe', '#feca57'
        ];
        
        const displayNames = this.showDrawn.checked ? this.names : 
            this.names.filter(name => !this.drawnNames.includes(name));
        
        displayNames.forEach((name, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;
            
            // Draw slice
            const color = colors[index % colors.length];
            this.ctx.fillStyle = this.drawnNames.includes(name) ? 
                this.lightenColor(color) : color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw text
            const textAngle = startAngle + sliceAngle / 2;
            const textX = Math.cos(textAngle) * (radius * 0.65);
            const textY = Math.sin(textAngle) * (radius * 0.65);
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const text = name.substring(0, 15);
            this.ctx.fillText(text, 0, 0);
            this.ctx.restore();
        });
        
        this.ctx.restore();
        
        // Draw pointer at top
        this.ctx.fillStyle = '#667eea';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 15, 20);
        this.ctx.lineTo(centerX + 15, 20);
        this.ctx.lineTo(centerX, 50);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    lightenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 50);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 50);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 50);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    spin() {
        if (this.isSpinning || this.names.length === 0) return;
        
        const availableNames = this.excludeDrawn.checked ? 
            this.names.filter(name => !this.drawnNames.includes(name)) : 
            this.names;
        
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
                if (selectedName && !this.drawnNames.includes(selectedName)) {
                    this.drawnNames.unshift(selectedName);
                }
                
                this.updateUI();
                this.saveToLocalStorage();
                
                if (selectedName) {
                    alert(`🎉 ${selectedName} vald!`);
                }
            }
        };
        
        animate();
    }
    
    getSelectedName() {
        const displayNames = this.showDrawn.checked ? this.names : 
            this.names.filter(name => !this.drawnNames.includes(name));
        
        if (displayNames.length === 0) return null;
        
        const sliceAngle = (2 * Math.PI) / displayNames.length;
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        
        // Pointer is at top (0 degrees)
        const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        const selectedIndex = Math.floor(pointerAngle / sliceAngle) % displayNames.length;
        
        return displayNames[selectedIndex];
    }
    
    saveToLocalStorage() {
        const data = {
            names: this.names,
            drawnNames: this.drawnNames,
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
