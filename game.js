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

// ... ваш существующий код в начале файла ...

// Добавляем новые элементы
const withdrawButton = document.getElementById('withdraw-button');
const withdrawModal = document.getElementById('withdraw-modal');
const closeWithdrawModal = document.querySelector('.withdraw-modal-content .close-withdraw');
const submitWithdrawButton = document.getElementById('submit-withdraw');
const amountInput = document.getElementById('amount');
const cardInput = document.getElementById('card');
const nameInput = document.getElementById('name');
const availableAmountSpan = document.getElementById('available-amount');
const availableUahSpan = document.getElementById('available-uah');
const historyButton = document.getElementById('history-button');
const historyModal = document.getElementById('history-modal');
const closeHistoryModal = document.querySelector('.history-modal-content .close-history');
const historyList = document.getElementById('history-list');

// Минимальная сумма для вывода (749 млрд)
const MIN_WITHDRAW_AMOUNT = 749000000000;
const CHAD_TO_UAH_RATE = 0.05 / 749000000000; // 749 млрд = 0.05 грн

// История выводов из localStorage
let withdrawHistory = JSON.parse(localStorage.getItem('withdrawHistory')) || [];

// Обновляем доступную сумму для вывода
function updateAvailableAmount() {
    availableAmountSpan.textContent = score.toLocaleString();
    const uahAmount = score * CHAD_TO_UAH_RATE;
    availableUahSpan.textContent = uahAmount.toFixed(2);
}

// Открытие модального окна вывода
withdrawButton.addEventListener('click', () => {
    updateAvailableAmount();
    withdrawModal.style.display = 'flex';
});

// Закрытие модального окна вывода
closeWithdrawModal.addEventListener('click', () => {
    withdrawModal.style.display = 'none';
});

// Открытие истории выводов
historyButton.addEventListener('click', () => {
    renderWithdrawHistory();
    historyModal.style.display = 'flex';
});

// Закрытие истории выводов
closeHistoryModal.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

// Отрисовка истории выводов
function renderWithdrawHistory() {
    historyList.innerHTML = '';
    
    if (withdrawHistory.length === 0) {
        historyList.innerHTML = '<p>У вас еще не было выводов</p>';
        return;
    }
    
    withdrawHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleString();
        
        historyItem.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-amount">${item.amount.toLocaleString()} Чадов (${item.uahAmount.toFixed(2)} грн)</div>
            <div class="history-card">${item.card}</div>
            <div class="history-name">${item.name}</div>
            <div class="history-status">Статус: ${item.status || 'В обработке'}</div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Обработка вывода средств
submitWithdrawButton.addEventListener('click', () => {
    const amount = parseInt(amountInput.value);
    const card = cardInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!amount || isNaN(amount)) {
        showError('Введите корректную сумму');
        return;
    }
    
    if (amount < MIN_WITHDRAW_AMOUNT) {
        showError(`Минимальная сумма для вывода: ${MIN_WITHDRAW_AMOUNT.toLocaleString()} Чадов`);
        return;
    }
    
    if (amount > score) {
        showError('Недостаточно Чадов для вывода');
        return;
    }
    
    if (!card || card.replace(/\s/g, '').length < 16) {
        showError('Введите корректный номер карты');
        return;
    }
    
    if (!name || name.split(' ').length < 2) {
        showError('Введите имя и фамилию');
        return;
    }
    
    // Рассчитываем сумму в гривнах
    const uahAmount = amount * CHAD_TO_UAH_RATE;
    
    // Создаем запись в истории
    const withdrawRecord = {
        timestamp: Date.now(),
        amount: amount,
        uahAmount: uahAmount,
        card: card,
        name: name,
        status: 'В обработке'
    };
    
    // Добавляем в историю
    withdrawHistory.unshift(withdrawRecord);
    localStorage.setItem('withdrawHistory', JSON.stringify(withdrawHistory));
    
    // Выводим в консоль данные для Telegram бота
    console.log(JSON.stringify({
        type: 'withdraw_request',
        data: withdrawRecord
    }));
    
    // Обновляем интерфейс
    score -= amount;
    scoreElement.textContent = score;
    localStorage.setItem('score', score);
    
    // Закрываем модальное окно
    withdrawModal.style.display = 'none';
    
    // Показываем уведомление
    showError(`Заявка на вывод ${amount.toLocaleString()} Чадов (${uahAmount.toFixed(2)} грн) успешно отправлена!`, 'success');
});

// Модифицированная функция showError для отображения успешных сообщений
function showError(message, type = 'error') {
    errorMessageElement.textContent = message;
    errorMessageElement.style.backgroundColor = type === 'error' ? '#f44336' : '#4CAF50';
    errorMessageElement.style.display = 'block';
    
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

// Обновляем историю при загрузке
renderWithdrawHistory();

// ... остальной ваш существующий код ...

// Для магазина
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShopModal = document.querySelector('.shop-modal-content .close-shop');

// Устанавливаем начальные значения
scoreElement.textContent = score;

function initializeUpgradeButtons() {
    document.querySelectorAll('#upgrade-info button').forEach((button, index) => {
        const cost = Object.keys(upgrades)[index];
        if (boughtUpgrades[cost]) {
            button.disabled = true; // Блокируем купленные улучшения
        } else if (index > 0 && !boughtUpgrades[Object.keys(upgrades)[index - 1]]) {
            button.disabled = true; // Блокируем улучшения, пока предыдущее не куплено
        } else {
            button.disabled = false; // Разблокируем доступные улучшения
        }
    });
}

// Запускаем начальную инициализацию кнопок
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

// Обработчики для кнопок улучшений
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

// Открытие и закрытие модального окна магазина
shopButton.addEventListener('click', () => {
    shopModal.style.display = 'flex';
    updateShopButtons();
});

closeShopModal.addEventListener('click', () => {
    shopModal.style.display = 'none';
});

// Покупка скинов
document.querySelectorAll('.buy-button').forEach((button) => {
    button.addEventListener('click', () => {
        const cost = parseInt(button.getAttribute('data-cost'));
        const skin = button.getAttribute('data-skin');

        // Проверяем, хватает ли денег и не куплен ли скин ранее
        if (score >= cost && !boughtSkins[skin]) {
            score -= cost;  // Уменьшаем счет только если хватает денег
            boughtSkins[skin] = true;  // Отмечаем, что скин куплен

            localStorage.setItem('score', score);
            localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
            scoreElement.textContent = score;

            button.textContent = 'ВЫБРАТЬ'; // Меняем текст кнопки после покупки
            button.disabled = false;
        } else if (boughtSkins[skin]) {
            selectedSkin = skin;
            clickableImage.src = selectedSkin;
            localStorage.setItem('selectedSkin', selectedSkin);

            updateShopButtons(); // Обновляем кнопки в магазине
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
                button.textContent = 'ВЫБРАНО';
                button.classList.remove('selected-button');
            }
        }
    });
}

// Промокод
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
promoMessageElement.style.color = 'green'; // Устанавливаем зеленый цвет
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

// Сброс игры
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

