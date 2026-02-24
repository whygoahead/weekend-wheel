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
    // RESET FOR USER: Always start with 3 if first time this session or forced reset
    if (!sessionStorage.getItem('chances_reset_v2')) {
        localStorage.setItem('chances_left', 3);
        sessionStorage.setItem('chances_reset_v2', 'true');
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

    // Random prize category (0-3)
    const categoryIndex = Math.floor(Math.random() * 4);
    
    /**
     * Calculation logic:
     * Pointer is at the top (0deg).
     * Sector 0: 吃点好吃的 (-90deg) -> Center: -45deg
     * Sector 1: 买点好看的 (0deg) -> Center: 45deg
     * Sector 2: 听点好听的 (90deg) -> Center: 135deg
     * Sector 3: 逛点好玩的 (180deg) -> Center: 225deg
     * 
     * To make the pointer point to sector X center, we rotate wheel by:
     * Sector 0: rotate(45deg)
     * Sector 1: rotate(-45deg)
     * Sector 2: rotate(-135deg)
     * Sector 3: rotate(-225deg)
     */
    
    const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-10 full spins
    const targetAngle = (45 - (categoryIndex * 90));
    
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
