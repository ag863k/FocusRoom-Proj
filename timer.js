// Ultra-Fast Pomodoro Timer - Optimized for Performance
class FastTimer {
    constructor() {
        // Core state - minimal object creation
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 1;
        this.maxSessions = 4;
        this.isBreak = false;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.timer = null;
        this.currentCycle = 1;
        this.inputTimeout = null;
        
        // Cache DOM elements once
        this.elements = {};
        
        // Settings - load once
        this.settings = this.loadSettings() || { focus: 25, short: 5, long: 15 };
        
        // Stats - minimal tracking
        this.stats = this.loadStats() || {
            sessionsToday: 0,
            totalSessions: 0,
            totalTimeMinutes: 0,
            currentStreak: 0,
            completedCycles: 0,
            lastDate: new Date().toDateString()
        };
        
        this.init();
    }

    init() {
        // Cache all DOM elements at once
        const ids = ['timeDisplay', 'phaseLabel', 'sessionCount', 'cycleCount', 'timerProgress',
                    'startBtn', 'pauseBtn', 'resetBtn', 'focusTime', 'shortBreak', 'longBreak',
                    'todaySessions', 'totalTime', 'currentStreak', 'completedCycles', 'sessionEndAudio'];
        
        ids.forEach(id => this.elements[id] = document.getElementById(id));
        
        this.setupEvents();
        this.setDefaultPreset();
        this.resetTimer();
        this.updateStats();
        
        // Request notification permission silently
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    setupEvents() {
        // Use event delegation for better performance
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('change', this.handleChange.bind(this));
        document.addEventListener('input', this.handleInput.bind(this));
    }

    handleInput(e) {
        const { id } = e.target;
        
        if (['focusTime', 'shortBreak', 'longBreak'].includes(id)) {
            // Debounce the custom settings check to avoid excessive calls
            clearTimeout(this.inputTimeout);
            this.inputTimeout = setTimeout(() => {
                this.updateSettings();
                this.checkForCustomSettings();
            }, 300);
        }
    }

    handleClick(e) {
        const { id, classList } = e.target;
        
        console.log('Click detected on:', e.target.tagName, id, classList);
        
        switch(id) {
            case 'startBtn': this.startTimer(); break;
            case 'pauseBtn': this.pauseTimer(); break;
            case 'resetBtn': this.resetTimer(); break;
        }
        
        // Handle preset button clicks (including clicks on child elements)
        const presetBtn = e.target.closest('.preset-btn');
        if (presetBtn) {
            console.log('Preset button clicked:', presetBtn.dataset);
            this.applyPreset(presetBtn.dataset, presetBtn);
        }
    }

    handleChange(e) {
        const { id, value } = e.target;
        
        if (['focusTime', 'shortBreak', 'longBreak'].includes(id)) {
            this.updateSettings();
            this.checkForCustomSettings();
        }
    }

    setDefaultPreset() {
        this.checkForCustomSettings();
    }

    applyPreset(dataset, targetElement) {
        console.log('applyPreset called with:', dataset, targetElement.id);
        
        // Skip if it's the custom preset being clicked
        if (targetElement.id === 'customPreset') {
            console.log('Custom preset clicked, skipping');
            return;
        }
        
        const focus = parseInt(dataset.focus) || 25;
        const short = parseInt(dataset.short) || 5;
        const long = parseInt(dataset.long) || 15;
        
        console.log('Applying values:', { focus, short, long });
        
        // Apply the preset values to the input fields
        if (this.elements.focusTime) {
            this.elements.focusTime.value = focus;
            console.log('Set focusTime to:', focus);
        }
        if (this.elements.shortBreak) {
            this.elements.shortBreak.value = short;
            console.log('Set shortBreak to:', short);
        }
        if (this.elements.longBreak) {
            this.elements.longBreak.value = long;
            console.log('Set longBreak to:', long);
        }
        
        this.updateSettings();
        
        // Update active preset with visual feedback
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        targetElement.classList.add('active');
        
        // Add a small pulse effect for feedback
        targetElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            targetElement.style.transform = '';
        }, 150);
        
        // Reset timer if not running to show new time
        if (!this.isRunning) {
            this.resetTimer();
        }
        
        console.log('Preset applied successfully');
    }

    updateSettings() {
        this.settings.focus = parseInt(this.elements.focusTime.value) || 25;
        this.settings.short = parseInt(this.elements.shortBreak.value) || 5;
        this.settings.long = parseInt(this.elements.longBreak.value) || 15;
        
        localStorage.setItem('focusroom_settings', JSON.stringify(this.settings));
        
        if (!this.isRunning) this.resetTimer();
    }

    checkForCustomSettings() {
        const currentFocus = parseInt(this.elements.focusTime.value) || 25;
        const currentShort = parseInt(this.elements.shortBreak.value) || 5;
        const currentLong = parseInt(this.elements.longBreak.value) || 15;
        
        // Check if current settings match any preset
        const presetBtns = document.querySelectorAll('.preset-btn:not(#customPreset)');
        let matchingPreset = null;
        
        presetBtns.forEach(btn => {
            const focus = parseInt(btn.dataset.focus);
            const short = parseInt(btn.dataset.short);
            const long = parseInt(btn.dataset.long);
            
            if (focus === currentFocus && short === currentShort && long === currentLong) {
                matchingPreset = btn;
            }
        });
        
        // Update active preset
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        
        if (matchingPreset) {
            // Existing preset matches
            matchingPreset.classList.add('active');
        } else {
            // Custom settings - highlight custom preset and update its description
            const customPreset = document.getElementById('customPreset');
            if (customPreset) {
                customPreset.classList.add('active');
                // Update custom preset description with current values
                const descSpan = customPreset.querySelector('.preset-desc');
                if (descSpan) {
                    descSpan.textContent = `${currentFocus}/${currentShort}/${currentLong}min`;
                }
            }
        }
    }

    startTimer() {
        if (!this.isRunning && !this.isPaused) {
            this.setupSession();
        }
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.elements.startBtn.classList.add('hidden');
        this.elements.pauseBtn.classList.remove('hidden');
        
        this.timer = setInterval(() => this.tick(), 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        
        clearInterval(this.timer);
        this.timer = null;
        
        this.elements.startBtn.classList.remove('hidden');
        this.elements.pauseBtn.classList.add('hidden');
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.isBreak = false;
        this.currentSession = 1;
        this.setupSession();
        
        this.elements.startBtn.classList.remove('hidden');
        this.elements.pauseBtn.classList.add('hidden');
    }

    setupSession() {
        if (this.isBreak) {
            const isLongBreak = this.currentSession > this.maxSessions;
            this.timeLeft = (isLongBreak ? this.settings.long : this.settings.short) * 60;
            this.elements.phaseLabel.textContent = isLongBreak ? 'LONG BREAK' : 'SHORT BREAK';
        } else {
            this.timeLeft = this.settings.focus * 60;
            this.elements.phaseLabel.textContent = 'FOCUS';
        }
        
        this.totalTime = this.timeLeft;
        this.updateDisplay();
        this.updateSessionInfo();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();
        
        if (this.timeLeft <= 0) {
            this.completeSession();
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.elements.timeDisplay.textContent = timeString;
        
        // Update progress circle efficiently
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const offset = 283 - (progress * 283);
        this.elements.timerProgress.style.strokeDashoffset = offset;
        
        // Update page title
        document.title = `${timeString} - ${this.elements.phaseLabel.textContent} | FocusRoom`;
    }

    updateSessionInfo() {
        this.elements.sessionCount.textContent = `${this.currentSession}/${this.maxSessions}`;
        this.elements.cycleCount.textContent = `Cycle ${this.currentCycle}`;
    }

    completeSession() {
        this.isRunning = false;
        clearInterval(this.timer);
        this.timer = null;
        
        // Play notification
        if (this.elements.sessionEndAudio) {
            this.elements.sessionEndAudio.currentTime = 0;
            this.elements.sessionEndAudio.play().catch(() => {});
        }
        
        // Browser notification
        const message = this.isBreak ? 
            'Focus session complete! Time for a break.' : 
            'Break time over! Ready for your next focus session?';
            
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('FocusRoom Timer', {
                body: message,
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%238B4513"/%3E%3Ctext x="50" y="60" text-anchor="middle" font-size="30" fill="white"%3EF%3C/text%3E%3C/svg%3E'
            });
        }
        
        // Update stats only for focus sessions
        if (!this.isBreak) {
            this.stats.sessionsToday++;
            this.stats.totalSessions++;
            this.stats.totalTimeMinutes += this.settings.focus;
            this.stats.currentStreak++;
            
            if (this.stats.currentStreak > this.stats.bestStreak) {
                this.stats.bestStreak = this.stats.currentStreak;
            }
        }
        
        // Move to next phase
        if (this.isBreak) {
            this.isBreak = false;
            this.currentSession++;
            
            if (this.currentSession > this.maxSessions) {
                this.currentSession = 1;
                this.currentCycle++;
                this.stats.completedCycles++;
            }
        } else {
            this.isBreak = true;
        }
        
        this.saveStats();
        this.updateStats();
        this.setupSession();
        
        this.elements.startBtn.classList.remove('hidden');
        this.elements.pauseBtn.classList.add('hidden');
    }

    updateStats() {
        this.elements.todaySessions.textContent = this.stats.sessionsToday;
        this.elements.totalTime.textContent = `${Math.floor(this.stats.totalTimeMinutes / 60)}h`;
        this.elements.currentStreak.textContent = this.stats.currentStreak;
        this.elements.completedCycles.textContent = this.stats.completedCycles;
    }

    loadSettings() {
        const saved = localStorage.getItem('focusroom_settings');
        return saved ? JSON.parse(saved) : null;
    }

    loadStats() {
        const today = new Date().toDateString();
        const saved = localStorage.getItem('focusroom_stats');
        
        if (saved) {
            const stats = JSON.parse(saved);
            if (stats.lastDate !== today) {
                stats.sessionsToday = 0;
                stats.lastDate = today;
            }
            return stats;
        }
        return null;
    }

    saveStats() {
        this.stats.lastDate = new Date().toDateString();
        localStorage.setItem('focusroom_stats', JSON.stringify(this.stats));
    }
}

// Initialize when DOM is ready - fastest method
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new FastTimer());
} else {
    new FastTimer();
}
