let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let clickPower = localStorage.getItem('clickPower') ? parseInt(localStorage.getItem('clickPower')) : 1;
let currentSkin = localStorage.getItem('currentSkin') || 'your-image.png';

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

// Получаем состояние улучшений и скинов из localStorage
const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades')) || {};
const boughtSkins = JSON.parse(localStorage.getItem('boughtSkins')) || {};
let selectedSkin = localStorage.getItem('selectedSkin') || currentSkin;

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

// Для магазина
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShopModal = document.querySelector('.shop-modal-content .close-shop');

// Устанавливаем начальные значения
scoreElement.textContent = score;

// ================== НОВЫЙ КОД ================== //
// Проверяем, что это Telegram WebApp (обновленная версия)
const isTelegramWebApp = () => {
    // Проверяем параметр URL ?debug=1 для тестирования вне Telegram
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.has('debug');
    
    return isDebugMode || (window.Telegram?.WebApp?.initData);
};

// Функция для показа анимации при покупке
function showStarsAnimation(chads) {
    const successMsg = document.createElement('div');
    successMsg.className = 'stars-success-animation';
    successMsg.textContent = `+${chads} Чадов!`;
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 2000);
}

// Обработчики для покупки за Telegram Stars
document.querySelectorAll('.buy-stars-button').forEach(button => {
    button.addEventListener('click', async () => {
        const chads = parseInt(button.getAttribute('data-chads'));
        const stars = parseInt(button.getAttribute('data-stars'));
        
        // Режим отладки (для тестов вне Telegram)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            if(confirm(`[ТЕСТ] Получить ${chads} Чадов за ${stars} Stars?`)) {
                score += chads;
                scoreElement.textContent = score;
                localStorage.setItem('score', score);
                showStarsAnimation(chads);
            }
            return;
        }

        // Реальный режим (в Telegram)
        if (!window.Telegram?.WebApp?.initData) {
            alert("Откройте игру через Telegram-бота для покупки!");
            return;
        }

        try {
            Telegram.WebApp.openInvoice({
                title: `Купить ${chads} Чадов`,
                description: `Мгновенная доставка ${chads} Чадов в ваш аккаунт`,
                currency: "USD",
                prices: [{ label: `${stars} Stars`, amount: stars * 100 }],
                payload: JSON.stringify({
                    user_id: Telegram.WebApp.initDataUnsafe.user?.id,
                    item: `chads_${stars}`
                }),
                provider_token: "2051251535:TEST:OTk5MDA4ODgxLTAwNQ", // Пример: "123456789:TEST:abcdef"
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false
            }, (status) => {
                if (status === "paid") {
                    score += chads;
                    scoreElement.textContent = score;
                    localStorage.setItem('score', score);
                    showStarsAnimation(chads);
                    Telegram.WebApp.close(); // Закрываем WebApp после оплаты
                } else {
                    showError("Оплата отменена ❌");
                }
            });
        } catch (e) {
            showError("Ошибка: " + e.message);
        }
    });
});
// ================== КОНЕЦ НОВОГО КОДА ================== //

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

initializeUpgradeButtons();

clickableImage.addEventListener('click', (event) => {
    score += clickPower;
    scoreElement.textContent = score;
    localStorage.setItem('score', score);
    showUpgradeAnimation(event);
});

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

function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

function checkForUpgrades() {
    initializeUpgradeButtons();
}

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
            if (nextButton) {
                nextButton.disabled = false;
            }

            checkForUpgrades();
        } else {
            showError(`Недостаточно чадов. У вас ${score}. Вам нужно ${cost}`);
        }
    });
});

shopButton.addEventListener('click', () => {
    shopModal.style.display = 'flex';
    updateShopButtons();
});

closeShopModal.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

document.querySelectorAll('.buy-button').forEach((button) => {
    button.addEventListener('click', () => {
        const cost = parseInt(button.getAttribute('data-cost'));
        const skin = button.getAttribute('data-skin');

        if (score >= cost && !boughtSkins[skin]) {
            score -= cost;
            boughtSkins[skin] = true;
            localStorage.setItem('score', score);
            localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
            scoreElement.textContent = score;
            button.textContent = 'ВЫБРАТЬ';
            button.disabled = false;
        } else if (boughtSkins[skin]) {
            selectedSkin = skin;
            clickableImage.src = selectedSkin;
            localStorage.setItem('selectedSkin', selectedSkin);
            updateShopButtons();
        } else {
            showError(`Недостаточно чадов. У вас ${score}. Вам нужно ${cost}`);
        }
    });
});

function updateShopButtons() {
    document.querySelectorAll('.buy-button').forEach((button) => {
        const skin = button.getAttribute('data-skin');
        if (boughtSkins[skin]) {
            if (selectedSkin === skin) {
                button.textContent = 'ВЫБРАНО';
                button.classList.add('selected-button');
            } else {
                button.textContent = 'ВЫБРАТЬ';
                button.classList.remove('selected-button');
            }
        }
    });
}

promoButton.addEventListener('click', () => {
    promoModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    promoModal.style.display = 'none';
});

activatePromoButton.addEventListener('click', () => {
    const promoCode = promoCodeInput.value.trim();
    const isPromoCodeUsed = localStorage.getItem('promoCodeUsed') === 'true';

    if (promoCode === '') {
        promoMessageElement.textContent = 'Промокод не введен. Попробуйте еще раз.';
        showPromoMessage(promoMessageElement.textContent);
    } else if (promoCode === 'Пупс') {
        if (!isPromoCodeUsed) {
            localStorage.setItem('promoCodeUsed', 'true');
            promoMessageElement.style.color = 'green';
            showPromoMessage('Промокод успешно активирован ждите приз!');
            setTimeout(() => {
                score += 10000;
                scoreElement.textContent = score;
                localStorage.setItem('score', score);
                checkForUpgrades();
            }, 20000);
        } else {
            promoMessageElement.textContent = 'Этот промокод уже был использован';
            showPromoMessage(promoMessageElement.textContent);
        }
    } else {
        promoMessageElement.textContent = 'Неверный промокод. Попробуйте еще раз.';
        showPromoMessage(promoMessageElement.textContent);
    }
    promoModal.style.display = 'none';
});

function showPromoMessage(message) {
    promoMessageElement.textContent = message;
    promoMessageElement.style.display = 'block';
    setTimeout(() => {
        promoMessageElement.style.display = 'none';
    }, 5000);
}

resetButton.addEventListener('click', () => {
    resetModal.style.display = 'flex';
});

closeResetModal.addEventListener('click', () => {
    resetModal.style.display = 'none';
});

confirmResetButton.addEventListener('click', () => {
    score = 0;
    clickPower = 1;
    selectedSkin = 'your-image.png';
    localStorage.setItem('score', score);
    localStorage.setItem('clickPower', clickPower);
    localStorage.removeItem('boughtUpgrades');
    localStorage.removeItem('boughtSkins');
    localStorage.removeItem('promoCodeUsed');
    localStorage.setItem('selectedSkin', selectedSkin);
    clickableImage.src = selectedSkin;
    scoreElement.textContent = score;
    resetModal.style.display = 'none';
    checkForUpgrades();
    updateShopButtons();
});

cancelResetButton.addEventListener('click', () => {
    resetModal.style.display = 'none';
});
