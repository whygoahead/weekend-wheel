const prizeData = {
    "吃点好吃的": ["韩餐", "日料", "西班牙菜", "意大利菜", "火锅", "烧烤", "大陆菜"],
    "买点好看的": ["大衣", "外套", "短袖", "裤子", "鞋子"],
    "听点好听的": ["音乐会", "喜剧", "演唱会"],
    "逛点好玩的": ["徐汇区", "浦东区", "宝山区", "杨浦区", "长宁区", "虹口区", "闵行区", "普陀区"]
};

const categories = Object.keys(prizeData);
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const redrawBtn = document.getElementById('redraw-btn');
const closeBtn = document.getElementById('close-btn');
const resultModal = document.getElementById('result-modal');
const resultCategory = document.getElementById('result-category');
const resultPrize = document.getElementById('result-prize');
const chanceCountText = document.getElementById('chance-count');
const outerDotsContainer = document.querySelector('.outer-dots');

let isSpinning = false;
let currentRotation = 0;
let chancesLeft = 3;

// Initialize dots on the outer ring
function initDots() {
    const dotCount = 12;
    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.transform = `translateX(-50%) rotate(${i * (360 / dotCount)}deg)`;
        outerDotsContainer.appendChild(dot);
    }
}

// Initialize weekly chances
function updateChances() {
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

    // Random prize category (0-3)
    const categoryIndex = Math.floor(Math.random() * 4);
    
    /**
     * Calculation logic:
     * Pointer is at the top (0deg).
     * Sector 0: 吃点好吃的 (-45 to 45 deg) - Center: 0deg
     * Sector 1: 买点好看的 (45 to 135 deg) - Center: 90deg
     * Sector 2: 听点好听的 (135 to 225 deg) - Center: 180deg
     * Sector 3: 逛点好玩的 (225 to 315 deg) - Center: 270deg
     * 
     * To make the pointer point to sector X, we need to rotate by (360 - middle_of_sector)
     * Sector 0 mid: 0deg -> Rotate 0 or 360
     * Sector 1 mid: 90deg -> Rotate 270
     * Sector 2 mid: 180deg -> Rotate 180
     * Sector 3 mid: 270deg -> Rotate 90
     */
    
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const sectorAngle = 90;
    const targetAngle = (360 - (categoryIndex * sectorAngle)) % 360;
    
    currentRotation += (extraSpins * 360) + (targetAngle - (currentRotation % 360));
    if (currentRotation % 360 < 0) currentRotation += 360;

    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        showResult(categories[categoryIndex]);
        isSpinning = false;
        if (chancesLeft > 0) {
            spinBtn.disabled = false;
        }
    }, 4000);
}

function showResult(category) {
    const prizes = prizeData[category];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    
    resultCategory.textContent = `建议你这周末：${category}`;
    resultPrize.textContent = prize;
    resultModal.classList.remove('hidden');
}

spinBtn.addEventListener('click', spin);

redrawBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
    spin();
});

closeBtn.addEventListener('click', () => {
    resultModal.classList.add('hidden');
});

// Initialize
initDots();
updateChances();
