// Игровые переменные
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let clickPower = localStorage.getItem('clickPower') ? parseInt(localStorage.getItem('clickPower')) : 1;
let currentSkin = localStorage.getItem('currentSkin') || 'your-image.png';
let referralCount = localStorage.getItem('referralCount') || 0;
let referralEarned = localStorage.getItem('referralEarned') || 0;
const userId = localStorage.getItem('userId') || generateUserId();

// Улучшения
const upgrades = {
    9000: 3,
    50000: 9,
    100000: 15,
    250000: 23,
    400000: 43,
    1000000: 101,
    1500000: 148,
    3000000: 500,
    4000000: 614,
    5000000: 777,
    7777777: 1487,
    1000000000: 2999
};

// DOM элементы
const scoreElement = document.getElementById('score');
const clickableImage = document.getElementById('clickable-image');
const errorMessageElement = document.getElementById('error-message');
const referralLink = document.getElementById('referral-link');
const referralCountElement = document.getElementById('referral-count');
const referralEarnedElement = document.getElementById('referral-earned');
const openTelegramBtn = document.getElementById('open-telegram');

// Инициализация игры
function initGame() {
    scoreElement.textContent = score;
    clickableImage.src = currentSkin;
    referralLink.value = `https://t.me/YourBotName?start=ref_${userId}`;
    updateReferralStats();
    checkTelegramReferral();
    initUpgradeButtons();
    setupEventListeners();
}

// Генерация ID пользователя
function generateUserId() {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', id);
    return id;
}

// Обработка кликов
function setupEventListeners() {
    // Клик по изображению
    clickableImage.addEventListener('click', (event) => {
        score += clickPower;
        updateScore();
        createClickEffect(event);
    });

    // Кнопка открытия в Telegram
    openTelegramBtn.addEventListener('click', () => {
        window.open(`https://t.me/YourBotName?start=ref_${userId}`, '_blank');
    });

    // Кнопка копирования реферальной ссылки
    document.getElementById('copy-referral').addEventListener('click', () => {
        referralLink.select();
        document.execCommand('copy');
        showMessage('Ссылка скопирована в буфер обмена!');
    });

    // Инициализация кнопок улучшений
    document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
        const cost = Object.keys(upgrades)[index];
        button.addEventListener('click', () => buyUpgrade(cost, index));
    });

    // Другие обработчики...
}

// Покупка улучшения
function buyUpgrade(cost, index) {
    if (score >= cost) {
        score -= cost;
        clickPower = upgrades[cost];
        updateScore();
        localStorage.setItem('clickPower', clickPower);
        
        // Помечаем улучшение как купленное
        const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades') || '{}');
        boughtUpgrades[cost] = true;
        localStorage.setItem('boughtUpgrades', JSON.stringify(boughtUpgrades));
        
        // Блокируем купленное улучшение
        document.getElementById(`upgrade-${index+1}`).disabled = true;
        
        // Разблокируем следующее улучшение
        if (index < Object.keys(upgrades).length - 1) {
            document.getElementById(`upgrade-${index+2}`).disabled = false;
        }
    } else {
        showError(`Недостаточно Чадов! Нужно: ${cost}`);
    }
}

// Проверка реферальной ссылки из Telegram
function checkTelegramReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const tgRef = urlParams.get('tg_ref');
    const amount = urlParams.get('amount');
    
    if (tgRef && amount && !localStorage.getItem(`tg_ref_${tgRef}_processed`)) {
        score += parseInt(amount);
        updateScore();
        localStorage.setItem(`tg_ref_${tgRef}_processed`, 'true');
        showMessage(`🎉 Вы получили ${amount} Чадов из Telegram!`);
        
        // Сохраняем информацию о реферале
        const referrals = JSON.parse(localStorage.getItem('referrals') || '[]');
        referrals.push({ referrer: tgRef, amount: amount, date: new Date().toISOString() });
        localStorage.setItem('referrals', JSON.stringify(referrals));
    }
}

// Обновление статистики рефералов
function updateReferralStats() {
    const referrals = JSON.parse(localStorage.getItem('referrals') || '[]');
    referralCount = referrals.length;
    referralEarned = referrals.reduce((sum, ref) => sum + (ref.amount || 0), 0);
    
    referralCountElement.textContent = referralCount;
    referralEarnedElement.textContent = referralEarned;
    
    localStorage.setItem('referralCount', referralCount);
    localStorage.setItem('referralEarned', referralEarned);
}

// Вспомогательные функции
function updateScore() {
    scoreElement.textContent = score;
    localStorage.setItem('score', score);
}

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 3000);
}

function showMessage(message) {
    const msgElement = document.createElement('div');
    msgElement.className = 'bonus-message';
    msgElement.textContent = message;
    document.body.appendChild(msgElement);
    setTimeout(() => msgElement.remove(), 3000);
}

function createClickEffect(event) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = `+${clickPower}`;
    effect.style.left = `${event.clientX}px`;
    effect.style.top = `${event.clientY}px`;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

function initUpgradeButtons() {
    const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades') || {});
    
    Object.keys(upgrades).forEach((cost, index) => {
        const button = document.getElementById(`upgrade-${index+1}`);
        if (boughtUpgrades[cost]) {
            button.disabled = true;
        } else if (index > 0 && !boughtUpgrades[Object.keys(upgrades)[index-1]]) {
            button.disabled = true;
        }
    });
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
