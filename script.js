// ==========================================
// DEVICE DETECTION & OPTIMIZATION
// ==========================================

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
const isLowEnd = navigator.hardwareConcurrency <= 4 || isMobile;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================
// MATRIX RAIN EFFECT
// ==========================================

const matrixCanvas = document.getElementById('matrixCanvas');
const matrixCtx = matrixCanvas.getContext('2d');

let matrixColumns = [];
const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const matrixFontSize = 14;

function initMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const cols = Math.floor(matrixCanvas.width / matrixFontSize);
    matrixColumns = Array(cols).fill(1);
}

function drawMatrix() {
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    matrixCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    matrixCtx.font = `${matrixFontSize}px monospace`;
    
    for (let i = 0; i < matrixColumns.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * matrixFontSize;
        const y = matrixColumns[i] * matrixFontSize;
        
        matrixCtx.fillText(char, x, y);
        
        if (y > matrixCanvas.height && Math.random() > 0.975) {
            matrixColumns[i] = 0;
        }
        matrixColumns[i]++;
    }
}

if (!isMobile && !prefersReducedMotion) {
    initMatrix();
    setInterval(drawMatrix, 50);
    window.addEventListener('resize', initMatrix);
} else {
    matrixCanvas.style.display = 'none';
}

// ==========================================
// PARTICLE NETWORK BACKGROUND
// ==========================================

const particleCanvas = document.getElementById('particleCanvas');
const particleCtx = particleCanvas.getContext('2d', { 
    alpha: false,
    desynchronized: true 
});

let particles = [];
let animationId;
let lastFrameTime = 0;
const targetFPS = isMobile ? 15 : (isLowEnd ? 24 : 30);
const frameInterval = 1000 / targetFPS;

const primaryColor = {
    particle: 'hsla(206, 100%, 69%, 0.9)',
    line: '131, 196, 255'
};

class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * (isMobile ? 0.3 : 0.6);
        this.vy = (Math.random() - 0.5) * (isMobile ? 0.3 : 0.6);
        this.radius = Math.random() * 1.2 + 0.6;
    }
    
    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvasWidth) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(canvasWidth, this.x));
        }
        if (this.y < 0 || this.y > canvasHeight) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(canvasHeight, this.y));
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = primaryColor.particle;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

let resizeTimeout;
function resizeParticleCanvas() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        particleCanvas.width = window.innerWidth * dpr;
        particleCanvas.height = window.innerHeight * dpr;
        particleCanvas.style.width = window.innerWidth + 'px';
        particleCanvas.style.height = window.innerHeight + 'px';
        particleCtx.scale(dpr, dpr);
        
        initParticles();
    }, 150);
}

function initParticles() {
    const area = window.innerWidth * window.innerHeight;
    let particleCount;
    
    if (isMobile) {
        particleCount = Math.min(Math.floor(area / 35000), 20);
    } else if (isLowEnd) {
        particleCount = Math.min(Math.floor(area / 18000), 50);
    } else {
        particleCount = Math.min(Math.floor(area / 15000), 70);
    }
    
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(window.innerWidth, window.innerHeight));
    }
}

function drawConnections() {
    if (isMobile) return;
    
    const maxDistance = 130;
    const len = particles.length;
    
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            const maxDistSq = maxDistance * maxDistance;
            
            if (distSq < maxDistSq) {
                const distance = Math.sqrt(distSq);
                const opacity = (1 - distance / maxDistance) * 0.35;
                particleCtx.strokeStyle = `rgba(${primaryColor.line}, ${opacity})`;
                particleCtx.lineWidth = 0.6;
                particleCtx.beginPath();
                particleCtx.moveTo(particles[i].x, particles[i].y);
                particleCtx.lineTo(particles[j].x, particles[j].y);
                particleCtx.stroke();
            }
        }
    }
}

function animateParticles(currentTime) {
    animationId = requestAnimationFrame(animateParticles);
    
    const elapsed = currentTime - lastFrameTime;
    
    if (elapsed < frameInterval) return;
    
    lastFrameTime = currentTime - (elapsed % frameInterval);
    
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--background');
    particleCtx.fillStyle = bg;
    particleCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    const len = particles.length;
    for (let i = 0; i < len; i++) {
        particles[i].update(window.innerWidth, window.innerHeight);
        particles[i].draw(particleCtx);
    }
    
    drawConnections();
}

resizeParticleCanvas();
requestAnimationFrame(() => animateParticles(0));

window.addEventListener('resize', resizeParticleCanvas);

if (isMobile) {
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeParticleCanvas, 200);
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

const toastContainer = document.getElementById('toastContainer');

function showToast(title, message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================
// ACHIEVEMENTS SYSTEM
// ==========================================

const achievements = [
    { id: 'first', icon: '🎯', title: 'First Access', desc: 'First portal access', target: 1 },
    { id: 'regular', icon: '📚', title: 'Regular User', desc: '10 accesses', target: 10 },
    { id: 'veteran', icon: '⭐', title: 'Veteran', desc: '50 accesses', target: 50 },
    { id: 'master', icon: '👑', title: 'Master', desc: '100 accesses', target: 100 },
    { id: 'explorer', icon: '🔍', title: 'Explorer', desc: 'Try all themes', target: 3 },
    { id: 'gamer', icon: '🎮', title: 'Gamer', desc: 'Play the game', target: 1 }
];

function getStats() {
    try {
        const stats = localStorage.getItem('stats');
        return stats ? JSON.parse(stats) : { 
            totalAccesses: 0, 
            themesUsed: ['dark'],
            gamePlayed: false,
            unlockedAchievements: []
        };
    } catch (e) {
        return { totalAccesses: 0, themesUsed: ['dark'], gamePlayed: false, unlockedAchievements: [] };
    }
}

function saveStats(stats) {
    try {
        localStorage.setItem('stats', JSON.stringify(stats));
    } catch (e) {
        console.warn('Could not save stats');
    }
}

function checkAchievements(stats) {
    achievements.forEach(ach => {
        if (stats.unlockedAchievements.includes(ach.id)) return;
        
        let unlock = false;
        
        if (ach.id === 'first' && stats.totalAccesses >= 1) unlock = true;
        if (ach.id === 'regular' && stats.totalAccesses >= 10) unlock = true;
        if (ach.id === 'veteran' && stats.totalAccesses >= 50) unlock = true;
        if (ach.id === 'master' && stats.totalAccesses >= 100) unlock = true;
        if (ach.id === 'explorer' && stats.themesUsed.length >= 3) unlock = true;
        if (ach.id === 'gamer' && stats.gamePlayed) unlock = true;
        
        if (unlock) {
            stats.unlockedAchievements.push(ach.id);
            saveStats(stats);
            showToast('🏆 Achievement Unlocked!', `${ach.title}: ${ach.desc}`, 'success', 4000);
        }
    });
}

function renderAchievements() {
    const stats = getStats();
    const grid = document.getElementById('achievementsGrid');
    
    grid.innerHTML = achievements.map(ach => {
        const unlocked = stats.unlockedAchievements.includes(ach.id);
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `;
    }).join('');
}

// ==========================================
// THEME SWITCHING
// ==========================================

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('theme', theme);
        
        const stats = getStats();
        if (!stats.themesUsed.includes(theme)) {
            stats.themesUsed.push(theme);
            saveStats(stats);
            checkAchievements(stats);
        }
    } catch (e) {}
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

try {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
} catch (e) {}

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
        showToast('Theme Changed', `Switched to ${btn.dataset.theme} mode`, 'info', 2000);
    });
});

// ==========================================
// HISTORY MANAGEMENT
// ==========================================

const MAX_HISTORY = 20;

function getHistory() {
    try {
        const history = localStorage.getItem('regHistory');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        return [];
    }
}

function saveHistory(regNumber) {
    try {
        let history = getHistory();
        history = history.filter(num => num !== regNumber);
        history.unshift(regNumber);
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }
        localStorage.setItem('regHistory', JSON.stringify(history));
    } catch (e) {
        console.warn('Could not save history');
    }
}

function deleteFromHistory(regNumber) {
    try {
        let history = getHistory();
        history = history.filter(num => num !== regNumber);
        localStorage.setItem('regHistory', JSON.stringify(history));
        renderHistory();
        showToast('Deleted', 'Item removed from history', 'info', 2000);
    } catch (e) {
        console.warn('Could not delete from history');
    }
}

function renderHistory() {
    const history = getHistory();
    const dropdown = document.getElementById('historyDropdown');
    
    if (history.length === 0) {
        dropdown.innerHTML = '<div class="history-empty">No history yet</div>';
    } else {
        dropdown.innerHTML = history.map(num => `
            <div class="history-item" data-number="${num}">
                <span>${num}</span>
                <button class="delete-btn" data-number="${num}" onclick="event.stopPropagation(); deleteFromHistory('${num}')">×</button>
            </div>
        `).join('');
        
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', function() {
                const number = this.getAttribute('data-number');
                regInput.value = number;
                historyDropdown.classList.remove('show');
                showToast('Loaded', 'Registration number loaded', 'success', 2000);
            });
        });
    }
}

// ==========================================
// UI FUNCTIONALITY
// ==========================================

const regInput = document.getElementById('regInput');
const accessBtn = document.getElementById('accessBtn');
const attendanceBtn = document.getElementById('attendanceBtn');
const resultBtn = document.getElementById('resultBtn');
const closeBtn = document.getElementById('closeBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const modal = document.getElementById('modal');
const historyBtn = document.getElementById('historyBtn');
const historyDropdown = document.getElementById('historyDropdown');
const copyBtn = document.getElementById('copyBtn');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const gameMenuItem = document.getElementById('gameMenuItem');

let clickSound, popupSound;

function initSounds() {
    if (!clickSound) {
        clickSound = new Audio('https://actions.google.com/sounds/v1/ui/click.ogg');
        popupSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        clickSound.volume = 0.3;
        popupSound.volume = 0.3;
    }
}

let encodedRegNumber = '';
let currentRegNumber = '';

function playSound(sound) {
    if (!sound) return;
    try {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    } catch (e) {}
}

function showProgress() {
    progressBar.classList.add('active');
    progressFill.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', '0');
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            progressFill.style.width = '100%';
            progressBar.setAttribute('aria-valuenow', '100');
        }, 50);
    });
    
    setTimeout(() => {
        progressBar.classList.remove('active');
        progressFill.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', '0');
    }, 2100);
}

function showModal() {
    playSound(popupSound);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function showMenu() {
    renderAchievements();
    menuModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideMenu() {
    menuModal.classList.remove('show');
    document.body.style.overflow = '';
}

copyBtn.addEventListener('click', async () => {
    initSounds();
    playSound(clickSound);
    const text = regInput.value.trim();
    
    if (!text) {
        showToast('Error', 'Nothing to copy', 'error', 2000);
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied!', 'Registration number copied to clipboard', 'success', 2000);
    } catch (e) {
        showToast('Error', 'Failed to copy', 'error', 2000);
    }
});

historyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    initSounds();
    playSound(clickSound);
    historyDropdown.classList.toggle('show');
    renderHistory();
}, { passive: true });

document.addEventListener('click', (e) => {
    if (!historyDropdown.contains(e.target) && e.target !== historyBtn && !e.target.closest('.icon-btn')) {
        historyDropdown.classList.remove('show');
    }
}, { passive: true });

menuBtn.addEventListener('click', () => {
    initSounds();
    playSound(clickSound);
    showMenu();
});

closeMenuBtn.addEventListener('click', () => {
    playSound(clickSound);
    hideMenu();
});

menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) {
        hideMenu();
    }
});

gameMenuItem.addEventListener('click', () => {
    const stats = getStats();
    stats.gamePlayed = true;
    saveStats(stats);
    checkAchievements(stats);
    
    window.open('snake-game.html', '_blank', 'noopener,noreferrer');
    showToast('Game Opened', 'Enjoy the Snake game!', 'info', 2000);
});

accessBtn.addEventListener('click', () => {
    initSounds();
    playSound(clickSound);
    
    const regNumber = regInput.value.trim();
    
    if (!regNumber) {
        showToast('Error', 'Please enter a registration number', 'error', 3000);
        return;
    }
    
    currentRegNumber = regNumber;
    encodedRegNumber = btoa(regNumber);
    
    saveHistory(regNumber);
    
    const stats = getStats();
    stats.totalAccesses++;
    saveStats(stats);
    checkAchievements(stats);
    
    showProgress();
    
    setTimeout(() => {
        showModal();
    }, 2000);
});

attendanceBtn.addEventListener('click', () => {
    playSound(clickSound);
    const url = `http://115.241.194.20/sis/Examination/Reports/StudentSearchHTMLReport_student.aspx?R=${encodedRegNumber}&T=-8584723613578166740`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening', 'Attendance page opened', 'info', 2000);
});

resultBtn.addEventListener('click', () => {
    playSound(clickSound);
    const url = `https://narayanagroup.co.in/patient/EngAutonomousReport.aspx/${encodedRegNumber}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('Opening', 'Results page opened', 'info', 2000);
});

closeBtn.addEventListener('click', () => {
    playSound(clickSound);
    hideModal();
    regInput.value = currentRegNumber;
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
        regInput.value = currentRegNumber;
    }
}, { passive: true });

regInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        accessBtn.click();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modal.classList.contains('show')) {
            hideModal();
            regInput.value = currentRegNumber;
        } else if (menuModal.classList.contains('show')) {
            hideMenu();
        }
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

window.deleteFromHistory = deleteFromHistory;

renderAchievements();
