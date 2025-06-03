// Инициализация переменных игры
let score = localStorage.getItem('score') ? parseInt(localStorage.getItem('score')) : 0;
let clickPower = localStorage.getItem('clickPower') ? parseInt(localStorage.getItem('clickPower')) : 1;
let currentSkin = localStorage.getItem('currentSkin') || 'your-image.png';
let isPremium = localStorage.getItem('isPremium') === 'true';
let premiumExpires = localStorage.getItem('premiumExpires') ? new Date(localStorage.getItem('premiumExpires')) : null;
let customBackground = localStorage.getItem('customBackground');

// Three.js переменные
let scene, camera, renderer, chadModel;
let is3DMode = false;

// Улучшения и их стоимость
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

// Получение элементов DOM
const scoreElement = document.getElementById('score');
const clickableImage = document.getElementById('clickable-image');
const container3D = document.getElementById('3d-container');
const premiumBadge = document.getElementById('premium-badge');
const errorMessageElement = document.getElementById('error-message');
const promoButton = document.getElementById('promo-button');
const promoModal = document.getElementById('promo-modal');
const closePromoModal = document.querySelector('.close-promo');
const promoCodeInput = document.getElementById('promo-code');
const activatePromoButton = document.getElementById('activate-promo');
const promoMessageElement = document.getElementById('promo-message');
const resetButton = document.getElementById('reset-button');
const resetModal = document.getElementById('reset-modal');
const closeResetModal = document.querySelector('.close-reset');
const confirmResetButton = document.getElementById('confirm-reset');
const cancelResetButton = document.getElementById('cancel-reset');
const shopButton = document.getElementById('shop-button');
const shopModal = document.getElementById('shop-modal');
const closeShopModal = document.querySelector('.close-shop');
const premiumButton = document.getElementById('premium-button');
const premiumModal = document.getElementById('premium-modal');
const closePremiumModal = document.querySelector('.close-premium');
const backgroundUpload = document.getElementById('background-upload');
const setBackgroundButton = document.getElementById('set-background');
const resetBackgroundButton = document.getElementById('reset-background');
const customBackgroundSection = document.getElementById('custom-background-section');

// Состояние игры
const boughtUpgrades = JSON.parse(localStorage.getItem('boughtUpgrades')) || {};
const boughtSkins = JSON.parse(localStorage.getItem('boughtSkins')) || {};
let selectedSkin = localStorage.getItem('selectedSkin') || currentSkin;

// Инициализация игры
function initGame() {
    // Установка начальных значений
    clickableImage.src = selectedSkin;
    scoreElement.textContent = score;
    
    // Проверка статуса премиума
    checkPremiumStatus();
    
    // Активация премиум функций если есть подписка
    if (isPremium) {
        activatePremiumFeatures();
    }
    
    // Установка пользовательского фона если есть
    if (customBackground) {
        document.body.style.backgroundImage = `url('${customBackground}')`;
        customBackgroundSection.classList.remove('hidden');
    }
    
    // Инициализация кнопок улучшений
    initializeUpgradeButtons();
    
    // Настройка PayPal кнопки
    setupPayPalButton();
    
    // Назначение обработчиков событий
    setupEventListeners();
}

// Проверка статуса премиум подписки
function checkPremiumStatus() {
    if (premiumExpires && new Date() > premiumExpires) {
        deactivatePremium();
        showError('Ваша подписка CHAD CLICKER PREMIUM истекла');
    }
}

// Инициализация кнопок улучшений
function initializeUpgradeButtons() {
    const upgradeButtons = [
        'upgrade-1', 'upgrade-2', 'upgrade-3', 'upgrade-4', 
        'upgrade-5', 'upgrade-6', 'upgrade-7', 'upgrade-8',
        'upgrade-9', 'upgrade-10', 'upgrade-11', 'upgrade-12'
    ];
    
    upgradeButtons.forEach((buttonId, index) => {
        const button = document.getElementById(buttonId);
        const cost = Object.keys(upgrades)[index];
        
        if (boughtUpgrades[cost]) {
            button.disabled = true;
            button.textContent = `Улучшение ${index + 1} - Куплено`;
        } else if (index > 0 && !boughtUpgrades[Object.keys(upgrades)[index - 1]]) {
            button.disabled = true;
        } else {
            button.disabled = false;
        }
        
        // Добавляем обработчик клика
        button.addEventListener('click', () => {
            if (score >= cost) {
                score -= parseInt(cost);
                clickPower = upgrades[cost];
                boughtUpgrades[cost] = true;
                
                // Сохраняем в localStorage
                localStorage.setItem('score', score);
                localStorage.setItem('clickPower', clickPower);
                localStorage.setItem('boughtUpgrades', JSON.stringify(boughtUpgrades));
                
                // Обновляем интерфейс
                scoreElement.textContent = score;
                button.disabled = true;
                button.textContent = `Улучшение ${index + 1} - Куплено`;
                
                // Разблокируем следующее улучшение если есть
                if (index < upgradeButtons.length - 1) {
                    const nextButton = document.getElementById(`upgrade-${index + 2}`);
                    if (nextButton && nextButton.disabled && !boughtUpgrades[Object.keys(upgrades)[index + 1]]) {
                        nextButton.disabled = false;
                    }
                }
            } else {
                showError(`Недостаточно чадов. У вас ${score}. Вам нужно ${cost}`);
            }
        });
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Клик по главному изображению
    clickableImage.addEventListener('click', (event) => {
        score += clickPower;
        scoreElement.textContent = score;
        localStorage.setItem('score', score);
        
        // Премиум эффект если есть подписка
        if (isPremium) {
            clickableImage.classList.add('rainbow-effect');
            setTimeout(() => {
                clickableImage.classList.remove('rainbow-effect');
            }, 500);
        }
        
        showUpgradeAnimation(event);
    });
    
    // Кнопка премиума
    premiumButton.addEventListener('click', () => {
        premiumModal.style.display = 'flex';
    });
    
    // Закрытие модальных окон
    closePremiumModal.addEventListener('click', () => {
        premiumModal.style.display = 'none';
    });
    
    closeShopModal.addEventListener('click', () => {
        shopModal.style.display = 'none';
    });
    
    closePromoModal.addEventListener('click', () => {
        promoModal.style.display = 'none';
    });
    
    closeResetModal.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });
    
    // Кнопка магазина
    shopButton.addEventListener('click', () => {
        shopModal.style.display = 'flex';
        updateShopButtons();
    });
    
    // Кнопка промокодов
    promoButton.addEventListener('click', () => {
        promoModal.style.display = 'flex';
    });
    
    // Активация промокода
    activatePromoButton.addEventListener('click', () => {
        const promoCode = promoCodeInput.value.trim();
        const isPromoCodeUsed = localStorage.getItem('promoCodeUsed') === 'true';
        
        if (promoCode === 'Пупс') {
            if (!isPromoCodeUsed) {
                localStorage.setItem('promoCodeUsed', 'true');
                promoMessageElement.textContent = 'Промокод активирован! Через 20 секунд вы получите 10000 Чадов!';
                promoMessageElement.style.color = 'green';
                
                setTimeout(() => {
                    score += 10000;
                    scoreElement.textContent = score;
                    localStorage.setItem('score', score);
                    checkForUpgrades();
                    promoModal.style.display = 'none';
                }, 20000);
            } else {
                promoMessageElement.textContent = 'Этот промокод уже был использован';
                promoMessageElement.style.color = 'red';
            }
        } else {
            promoMessageElement.textContent = 'Неверный промокод';
            promoMessageElement.style.color = 'red';
        }
    });
    
    // Сброс игры
    resetButton.addEventListener('click', () => {
        resetModal.style.display = 'flex';
    });
    
    confirmResetButton.addEventListener('click', () => {
        resetGame();
        resetModal.style.display = 'none';
    });
    
    cancelResetButton.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });
    
    // Покупка скинов
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function() {
            const cost = parseInt(this.getAttribute('data-cost'));
            const skin = this.getAttribute('data-skin');
            
            if (boughtSkins[skin]) {
                // Скин уже куплен - выбираем его
                selectedSkin = skin;
                localStorage.setItem('selectedSkin', selectedSkin);
                clickableImage.src = selectedSkin;
                
                // Обновляем 3D модель если она активна
                if (is3DMode) {
                    init3DScene();
                }
                
                updateShopButtons();
            } else if (score >= cost) {
                // Покупаем скин
                score -= cost;
                boughtSkins[skin] = true;
                selectedSkin = skin;
                
                localStorage.setItem('score', score);
                localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
                localStorage.setItem('selectedSkin', selectedSkin);
                
                scoreElement.textContent = score;
                clickableImage.src = selectedSkin;
                
                // Обновляем 3D модель если она активна
                if (is3DMode) {
                    init3DScene();
                }
                
                updateShopButtons();
            } else {
                showError(`Недостаточно Чадов. Нужно: ${cost}`);
            }
        });
    });
    
    // Загрузка пользовательского фона
    setBackgroundButton.addEventListener('click', () => {
        const file = backgroundUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                customBackground = e.target.result;
                localStorage.setItem('customBackground', customBackground);
                document.body.style.backgroundImage = `url('${customBackground}')`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    resetBackgroundButton.addEventListener('click', () => {
        customBackground = null;
        localStorage.removeItem('customBackground');
        document.body.style.backgroundImage = 'url("hand-holding-money-through-hole-yellow-paper-wall-vertical-image_253401-7181.png")';
    });
}

// Анимация при клике
function showUpgradeAnimation(event) {
    const animation = document.createElement('div');
    animation.className = 'upgrade-animation';
    animation.textContent = `+${clickPower}`;
    animation.style.left = `${event.clientX}px`;
    animation.style.top = `${event.clientY}px`;
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 1000);
}

// Активация премиум функций
function activatePremiumFeatures() {
    isPremium = true;
    premiumBadge.style.display = 'inline-block';
    customBackgroundSection.classList.remove('hidden');
    
    // Устанавливаем срок действия подписки (1 месяц)
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    premiumExpires = expires;
    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumExpires', expires.toISOString());
    
    // Показываем 3D модель если выбрана
    if (is3DMode) {
        init3DScene();
    }
}

// Деактивация премиум функций
function deactivatePremium() {
    isPremium = false;
    premiumBadge.style.display = 'none';
    customBackgroundSection.classList.add('hidden');
    localStorage.removeItem('isPremium');
    localStorage.removeItem('premiumExpires');
    
    // Возвращаем стандартный фон
    if (customBackground) {
        document.body.style.backgroundImage = 'url("hand-holding-money-through-hole-yellow-paper-wall-vertical-image_253401-7181.png")';
        localStorage.removeItem('customBackground');
        customBackground = null;
    }
    
    // Отключаем 3D режим
    if (is3DMode) {
        clickableImage.style.display = 'block';
        container3D.style.display = 'none';
        is3DMode = false;
        
        if (renderer) {
            renderer.dispose();
            scene = null;
            camera = null;
            renderer = null;
            chadModel = null;
        }
    }
}

// Инициализация 3D сцены
function init3DScene() {
    is3DMode = true;
    clickableImage.style.display = 'none';
    container3D.style.display = 'block';
    
    // Очищаем контейнер
    container3D.innerHTML = '';
    
    // Создаем сцену
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 200);
    container3D.appendChild(renderer.domElement);
    
    // Создаем куб с текстурой
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(selectedSkin);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    chadModel = new THREE.Mesh(geometry, material);
    scene.add(chadModel);
    
    // Настройка камеры
    camera.position.z = 3;
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        chadModel.rotation.x += 0.01;
        chadModel.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

// Настройка PayPal кнопки
function setupPayPalButton() {
    paypal.Buttons({
        style: {
            shape: 'pill',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
        },
        createSubscription: function(data, actions) {
            return actions.subscription.create({
                plan_id: 'P-5EN4692683213743BNA7XMZA'
            });
        },
        onApprove: function(data, actions) {
            activatePremiumFeatures();
            showError('Подписка CHAD CLICKER PREMIUM активирована!');
            localStorage.setItem('premiumSubscriptionId', data.subscriptionID);
        },
        onCancel: function(data) {
            showError('Подписка отменена');
        },
        onError: function(err) {
            showError('Ошибка при оформлении подписки: ' + err.message);
        }
    }).render('#paypal-button-container');
}

// Обновление кнопок в магазине
function updateShopButtons() {
    document.querySelectorAll('.buy-button').forEach(button => {
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

// Проверка доступных улучшений
function checkForUpgrades() {
    initializeUpgradeButtons();
}

// Сброс игры
function resetGame() {
    score = 0;
    clickPower = 1;
    selectedSkin = 'your-image.png';
    
    // Сбрасываем улучшения
    for (const key in boughtUpgrades) {
        delete boughtUpgrades[key];
    }
    
    // Сбрасываем скины
    for (const key in boughtSkins) {
        delete boughtSkins[key];
    }
    
    // Сбрасываем премиум если был
    if (isPremium) {
        deactivatePremium();
    }
    
    // Сбрасываем пользовательский фон
    document.body.style.backgroundImage = 'url("hand-holding-money-through-hole-yellow-paper-wall-vertical-image_253401-7181.png")';
    localStorage.removeItem('customBackground');
    customBackground = null;
    
    // Сохраняем изменения
    localStorage.setItem('score', score);
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('boughtUpgrades', JSON.stringify(boughtUpgrades));
    localStorage.setItem('boughtSkins', JSON.stringify(boughtSkins));
    localStorage.setItem('selectedSkin', selectedSkin);
    localStorage.removeItem('promoCodeUsed');
    
    // Обновляем интерфейс
    scoreElement.textContent = score;
    clickableImage.src = selectedSkin;
    
    // Перезагружаем улучшения
    initializeUpgradeButtons();
    updateShopButtons();
    
    // Возвращаем 2D изображение если было 3D
    if (is3DMode) {
        clickableImage.style.display = 'block';
        container3D.style.display = 'none';
        is3DMode = false;
        
        if (renderer) {
            renderer.dispose();
            scene = null;
            camera = null;
            renderer = null;
            chadModel = null;
        }
    }
}

// Показ ошибок
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

// Проверка статуса премиума каждую минуту
setInterval(checkPremiumStatus, 60000);

// Запуск игры
initGame();