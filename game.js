// Инициализация переменных
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let clickPower = localStorage.getItem('clickPower') ? parseInt(localStorage.getItem('clickPower')) : 1;
let currentSkin = localStorage.getItem('currentSkin') || 'your-image.png';
let userId = new URLSearchParams(window.location.search).get('user_id');
let refBonusReceived = localStorage.getItem('refBonusReceived') === 'true';

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

const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades')) || {};
const boughtSkins = JSON.parse(localStorage.getItem('boughtSkins')) || {};
let selectedSkin = localStorage.getItem('selectedSkin') || currentSkin;

// Элементы DOM
const scoreElement = document.getElementById('score');
const clickableImage = document.getElementById('clickable-image');
clickableImage.src = selectedSkin;

const errorMessageElement = document.getElementById('error-message');
const promoButton = document.getElementById('promo-button');
const promoModal = document.getElementById('promo-modal');
const closeModal = document.querySelector('.promo-modal-content .close');
const promoCodeInput = document.getElementById('promo-code');
const activatePromoButton = document.getElementById('activate-promo');
const promoMessageElement = document.getElementById('promo-message');
const resetButton = document.getElementById('reset-button');
const resetModal = document.getElementById('reset-modal');
const closeResetModal = document.querySelector('.reset-modal-content .close-reset');
const confirmResetButton = document.getElementById('confirm-reset');
const cancelResetButton = document.getElementById('cancel-reset');
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShopModal = document.querySelector('.shop-modal-content .close-shop');
const syncButton = document.getElementById('sync-button');

// Проверка реферальной ссылки
function checkReferral() {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam && !refBonusReceived) {
        score += 3000;
        scoreElement.textContent = score;
        localStorage.setItem('score', score);
        refBonusReceived = true;
        localStorage.setItem('refBonusReceived', 'true');
        showError("🎉 Вы получили 3,000 Чадов за реферальную регистрацию!");
        notifyReferrerBonus(refParam);
    }
}

// Уведомление бота о реферале
function notifyReferrerBonus(referrerId) {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
            action: "referral_bonus",
            referrerId: referrerId,
            bonusAmount: 3000
        }));
    }
}

// Синхронизация с ботом
function syncWithBot() {
    if (window.Telegram && Telegram.WebApp) {
        const data = {
            action: "sync_data",
            score: score,
            clickPower: clickPower,
            skin: selectedSkin,
            upgrades: boughtUpgrades
        };
        Telegram.WebApp.sendData(JSON.stringify(data));
        showError("Данные синхронизированы с ботом!");
    } else {
        showError("Откройте игру через Telegram бота для синхронизации");
    }
}

// Обработчик клика по изображению
clickableImage.addEventListener('click', (event) => {
    score += clickPower;
    scoreElement.textContent = score;
    localStorage.setItem('score', score);
    showUpgradeAnimation(event);
    syncWithBot();
});

// Анимация клика
function showUpgradeAnimation(event) {
    const upgradeAnimation = document.createElement('div');
    upgradeAnimation.className = 'upgrade-animation';
    upgradeAnimation.innerText = `+${clickPower}`;
    document.body.appendChild(upgradeAnimation);
    upgradeAnimation.style.left = `${event.clientX}px`;
    upgradeAnimation.style.top = `${event.clientY}px`;

    setTimeout(() => {
        upgradeAnimation.remove();
    }, 1000);
}

// Показ ошибок
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

// Инициализация кнопок улучшений
function initializeUpgradeButtons() {
    document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
        const cost = Object.keys(upgrades)[index];
        if (boughtUpgrades[cost]) {
            button.disabled = true;
        } else if (index > 0 && !boughtUpgrades[Object.keys(upgrades)[index - 1]]) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    });
}

// Обработчики улучшений
document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
    button.addEventListener('click', () => {
        const cost = Object.keys(upgrades)[index];
        if (score >= cost) {
            score -= cost;
            clickPower = upgrades[cost];
            boughtUpgrades[cost] = true;
            localStorage.setItem('score', score);
            localStorage.setItem('clickPower', clickPower);
            localStorage.setItem('boughtUpgrades', JSON.stringify(boughtUpgrades));
            scoreElement.textContent = score;
            button.disabled = true;
            
            const nextButton = document.querySelector(`#upgrade-${index + 2}`);
            if (nextButton) nextButton.disabled = false;
            
            syncWithBot();
        } else {
            showError(`Недостаточно чадов. Нужно: ${cost}`);
        }
    });
});

// Магазин скинов
function updateShopButtons() {
    document.querySelectorAll('.buy-button').forEach((button) => {
        const skin = button.getAttribute('data-skin');
        if (boughtSkins[skin]) {
            button.textContent = selectedSkin === skin ? 'ВЫБРАНО' : 'ВЫБРАТЬ';
            button.style.backgroundColor = selectedSkin === skin ? '#FFA500' : '#4CAF50';
        }
    });
}

document.querySelectorAll('.buy-button').forEach((button) => {
    button.addEventListener('click', () => {
        const cost = parseInt(button.getAttribute('data-cost'));
        const skin = button.getAttribute('data-skin');

        if (!boughtSkins[skin] && score >= cost) {
            score -= cost;
            boughtSkins[skin] = true;
            localStorage.setItem('score', score);
            localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
            button.textContent = 'ВЫБРАТЬ';
        }
        
        if (boughtSkins[skin]) {
            selectedSkin = skin;
            clickableImage.src = selectedSkin;
            localStorage.setItem('selectedSkin', selectedSkin);
            updateShopButtons();
            syncWithBot();
        } else {
            showError(`Недостаточно Чадов: ${cost} требуется`);
        }
    });
});

// Промокоды
promoButton.addEventListener('click', () => {
    promoModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    promoModal.style.display = 'none';
});

activatePromoButton.addEventListener('click', () => {
    const promoCode = promoCodeInput.value.trim();
    const isPromoCodeUsed = localStorage.getItem('promoCodeUsed') === 'true';

    if (promoCode === 'Пупс' && !isPromoCodeUsed) {
        localStorage.setItem('promoCodeUsed', 'true');
        score += 10000;
        scoreElement.textContent = score;
        localStorage.setItem('score', score);
        promoMessageElement.textContent = 'Промокод активирован! +10,000 Чадов';
        promoMessageElement.style.color = 'green';
        syncWithBot();
    } else {
        promoMessageElement.textContent = 'Неверный или уже использованный промокод';
        promoMessageElement.style.color = 'red';
    }
});

// Сброс игры
resetButton.addEventListener('click', () => {
    resetModal.style.display = 'flex';
});

confirmResetButton.addEventListener('click', () => {
    score = 0;
    clickPower = 1;
    selectedSkin = 'your-image.png';
    localStorage.clear();
    scoreElement.textContent = score;
    clickableImage.src = selectedSkin;
    initializeUpgradeButtons();
    updateShopButtons();
    resetModal.style.display = 'none';
    syncWithBot();
});

cancelResetButton.addEventListener('click', () => {
    resetModal.style.display = 'none';
});

// Магазин
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'flex';
    updateShopButtons();
});

closeShopModal.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

// Синхронизация
syncButton.addEventListener('click', syncWithBot);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initializeUpgradeButtons();
    updateShopButtons();
    checkReferral();
    scoreElement.textContent = score;
});
