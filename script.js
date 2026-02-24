const prizeData = {
    "吃点好吃的": ["韩餐", "日料", "西班牙菜", "意大利菜", "火锅", "烧烤", "大陆菜"],
    "买点好看的": ["大衣", "外套", "短袖", "裤子", "鞋子"],
    "听点好听的": ["音乐会", "喜剧", "演唱会"],
    "逛点好玩的": ["徐汇区", "浦东区", "宝山区", "杨浦区", "长宁区", "虹口区", "闵行区", "普陀区"]
};

// Prize to Image keyword mapping (using Unsplash source for dynamic matching)
const prizeImageKeywords = {
    "韩餐": "korean-food", "日料": "sushi", "西班牙菜": "paella", "意大利菜": "pasta", "火锅": "hotpot", "烧烤": "bbq", "大陆菜": "chinese-food",
    "大衣": "coat", "外套": "jacket", "短袖": "t-shirt", "裤子": "trousers", "鞋子": "shoes",
    "音乐会": "concert", "喜剧": "comedy", "演唱会": "live-music",
    "徐汇区": "shanghai-city", "浦东区": "shanghai-pudong", "宝山区": "park", "杨浦区": "university", "长宁区": "shopping-mall", "虹口区": "stadium", "闵行区": "suburb", "普陀区": "river"
};

const categories = Object.keys(prizeData);
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const redrawBtn = document.getElementById('redraw-btn');
const closeBtn = document.getElementById('close-btn');
const resultModal = document.getElementById('result-modal');
const resultCategory = document.getElementById('result-category');
const resultPrize = document.getElementById('result-prize');
const prizeImg = document.getElementById('prize-img');
const chanceCountText = document.getElementById('chance-count');
const outerDotsContainer = document.querySelector('.outer-dots');
const blindBoxWrapper = document.getElementById('blind-box-wrapper');
const blindBox = document.getElementById('blind-box');
const prizeCard = document.getElementById('prize-card');

let isSpinning = false;
let currentRotation = 0;
let chancesLeft = 3;
let currentResult = null;

// Fireworks Logic
const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.friction = 0.95;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

function createFirework(x, y) {
    const colors = ['#ff3e78', '#ffdf4c', '#ff9d00', '#ffffff', '#00d2ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animateFireworks() {
    if (particles.length > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, i) => {
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                p.update();
                p.draw();
            }
        });
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(animateFireworks);
}
animateFireworks();

// Wheel & Box Logic
function initDots() {
    const dotCount = 12;
    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.transform = `translateX(-50%) rotate(${i * (360 / dotCount)}deg)`;
        outerDotsContainer.appendChild(dot);
    }
}

function updateChances() {
    // FORCED RESET: Always start with 3 if first time this version is loaded
    if (!sessionStorage.getItem('chances_reset_v5')) {
        localStorage.setItem('chances_left', 3);
        sessionStorage.setItem('chances_reset_v5', 'true');
    }
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const storedWeek = localStorage.getItem('last_spin_week');
    const storedYear = localStorage.getItem('last_spin_year');
    if (storedWeek != currentWeek || storedYear != now.getFullYear()) {
        chancesLeft = 3;
        localStorage.setItem('chances_left', 3);
        localStorage.setItem('last_spin_week', currentWeek);
        localStorage.setItem('last_spin_year', now.getFullYear());
    } else {
        chancesLeft = parseInt(localStorage.getItem('chances_left')) || 0;
    }
    chanceCountText.textContent = `剩余抽奖次数: ${chancesLeft} 次`;
    spinBtn.disabled = chancesLeft <= 0;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function spin() {
    if (isSpinning || chancesLeft <= 0) return;
    isSpinning = true;
    spinBtn.disabled = true;
    chancesLeft--;
    localStorage.setItem('chances_left', chancesLeft);
    chanceCountText.textContent = `剩余抽奖次数: ${chancesLeft} 次`;

    const categoryIndex = Math.floor(Math.random() * 4);
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetAngle = (45 - (categoryIndex * 90));
    currentRotation += (extraSpins * 360) + (targetAngle - (currentRotation % 360));
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        prepareResult(categories[categoryIndex]);
        isSpinning = false;
        if (chancesLeft > 0) spinBtn.disabled = false;
    }, 4000);
}

function prepareResult(category) {
    const prizes = prizeData[category];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    currentResult = { category, prize };
    
    // Set prize content but keep card hidden
    resultCategory.textContent = `建议你这周末：${category}`;
    resultPrize.textContent = prize;
    
    // Auto match image using a more reliable service (Lorem Flickr or similar)
    const keyword = prizeImageKeywords[prize] || "gift";
    // Using Lorem Flickr which is often more stable than the direct Unsplash source redirect
    prizeImg.src = `https://loremflickr.com/300/300/${keyword}`;
    
    // Add error handling for image
    prizeImg.onerror = function() {
        this.src = 'https://via.placeholder.com/300/ffdf4c/ff4c4c?text=' + encodeURIComponent(prize);
    };
    
    // Show modal with box
    resultModal.classList.remove('hidden');
    blindBoxWrapper.classList.remove('hidden');
    blindBox.classList.remove('open');
    prizeCard.classList.remove('show');
    prizeCard.classList.add('hidden');
}

blindBoxWrapper.addEventListener('click', () => {
    if (blindBox.classList.contains('open')) return;
    
    blindBox.classList.add('open');
    
    // 1. Show prize card and fireworks SIMULTANEOUSLY
    blindBoxWrapper.classList.add('hidden');
    prizeCard.classList.remove('hidden');
    prizeCard.classList.add('show');
    
    // 2. Start fireworks celebration immediately
    canvas.classList.add('show');
    const fireworkTimer = setInterval(() => {
        createFirework(
            window.innerWidth / 2 + (Math.random() - 0.5) * 600,
            window.innerHeight / 2 + (Math.random() - 0.5) * 600
        );
    }, 150);

    // 3. Automatically stop and hide fireworks after 3 seconds
    setTimeout(() => {
        clearInterval(fireworkTimer);
        // Fade out or just hide
        canvas.classList.remove('show');
        particles = []; // Clear remaining particles
    }, 3000);
});

spinBtn.addEventListener('click', () => {
    canvas.classList.remove('show');
    particles = [];
    spin();
});

redrawBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    canvas.classList.remove('show');
    particles = [];
    spin();
});

closeBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    canvas.classList.remove('show');
    particles = [];
});

initDots();
updateChances();
