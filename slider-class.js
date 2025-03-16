/**
 * Базовый класс слайдера
 */
class BaseSlider {
    /**
     * Конструктор базового класса слайдера
     * @param {string} selector - CSS-селектор контейнера слайдера
     * @param {Object} options - Объект настроек слайдера
     */
    constructor(selector, options) {
        // Элементы слайдера
        this.container = document.querySelector(selector);
        this.wrapper = this.container.querySelector('.slider-wrapper');
        this.slides = this.container.querySelectorAll('.slider-item');

        this.currentSlide = 0;
        this.sliding = false;
        
        this.defaultOptions = {
            autoplay: false,
            interval: 5000,
            showIndicators: true,
            showArrows: true
        };
        
        this.options = { ...this.defaultOptions, ...options };
    }
    
    /**
     * Инициализация слайдера
     */
    init() {
        this.createControls();
        
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }
    
    /**
     * Создание элементов управления слайдера
     */
    createControls() {
        if (this.options.showIndicators) {
            this.createIndicators();
        }
        
        if (this.options.showArrows) {
            this.createArrows();
        }
    }
    
    /**
     * Создание индикаторов слайдов
     */
    createIndicators() {
        const indicators = document.createElement('div');
        indicators.className = 'slider-controls';
        
        for (let i = 0; i < this.slides.length; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'slider-indicator';
            if (i === this.currentSlide) {
                indicator.classList.add('active');
            }
            
            // Обработчик клика по индикатору
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            indicators.appendChild(indicator);
        }
        
        this.container.appendChild(indicators);
        this.indicators = this.container.querySelectorAll('.slider-indicator');
    }
    
    /**
     * Создание стрелок навигации
     */
    createArrows() {
        const prevArrow = document.createElement('div');
        prevArrow.className = 'slider-arrow prev';
        prevArrow.innerHTML = '&#10094;';
        prevArrow.addEventListener('click', () => {
            this.prevSlide();
        });
        
        const nextArrow = document.createElement('div');
        nextArrow.className = 'slider-arrow next';
        nextArrow.innerHTML = '&#10095;';
        nextArrow.addEventListener('click', () => {
            this.nextSlide();
        });
        
        this.container.appendChild(prevArrow);
        this.container.appendChild(nextArrow);
    }
    
    /**
     * Переключение на предыдущий слайд
     */
    prevSlide() {
        if (this.sliding) return;
        
        let index = this.currentSlide - 1;
        if (index < 0) {
            index = this.slides.length - 1;
        }
        
        this.goToSlide(index);
    }
    
    /**
     * Переключение на следующий слайд
     */
    nextSlide() {
        if (this.sliding) return;
        
        let index = this.currentSlide + 1;
        if (index >= this.slides.length) {
            index = 0;
        }
        
        this.goToSlide(index);
    }
    
    /**
     * Переход к указанному слайду
     * @param {number} index - Индекс слайда
     */
    goToSlide(index) {
        if (this.sliding || index === this.currentSlide) return;
        
        this.sliding = true;
        
        if (this.options.showIndicators && this.indicators) {
            this.indicators[this.currentSlide].classList.remove('active');
            this.indicators[index].classList.add('active');
        }
        
        this.wrapper.style.transform = `translateX(-${index * 100}%)`;
        
        this.currentSlide = index;
        
        setTimeout(() => {
            this.sliding = false;
        }, 500);
        
        if (this.options.autoplay) {
            this.resetAutoplay();
        }
    }
    
    /**
     * Запуск автоматической прокрутки слайдов
     */
    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.options.interval);
    }
    
    /**
     * Сброс таймера автопрокрутки
     */
    resetAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.startAutoplay();
        }
    }
    
    /**
     * Остановка автопрокрутки
     */
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
}

/**
 * Класс слайдера с поддержкой сенсорного управления
 * Расширяет базовый класс слайдера
 */
class TouchSlider extends BaseSlider {
    /**
     * Конструктор класса слайдера с сенсорным управлением
     * @param {string} selector - CSS-селектор контейнера слайдера
     * @param {Object} options - Объект настроек слайдера
     */
    constructor(selector, options) {
        super(selector, options);
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
        this.setupTouchEvents();
    }
    
    /**
     * Установка обработчиков событий для сенсорного управления
     */
    setupTouchEvents() {
        this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
        this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
        this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
    
    /**
     * Обработчик начала касания
     * @param {TouchEvent} event - Событие касания
     */
    onTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }
    
    /**
     * Обработчик движения при касании
     * @param {TouchEvent} event - Событие касания
     */
    onTouchMove(event) {
        this.touchEndX = event.touches[0].clientX;
    }
    
    /**
     * Обработчик окончания касания
     */
    onTouchEnd() {
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
}

/**
 * Класс слайдера с поддержкой управления мышью
 * Расширяет класс слайдера с сенсорным управлением
 */
class DragSlider extends TouchSlider {
    /**
     * Конструктор класса слайдера с управлением мышью
     * @param {string} selector - CSS-селектор контейнера слайдера
     * @param {Object} options - Объект настроек слайдера
     */
    constructor(selector, options) {
        super(selector, options);
        
        this.isDragging = false;
        this.startPosX = 0;
        this.currentTranslate = 0;
        
        this.setupMouseEvents();
    }
    
    /**
     * Установка обработчиков событий для управления мышью
     */
    setupMouseEvents() {
        this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    
    /**
     * Обработчик нажатия кнопки мыши
     * @param {MouseEvent} event - Событие мыши
     */
    onMouseDown(event) {
        event.preventDefault();
        
        this.isDragging = true;
        this.startPosX = event.clientX;
        this.container.style.cursor = 'grabbing';
    }
    
    /**
     * Обработчик движения мыши
     * @param {MouseEvent} event - Событие мыши
     */
    onMouseMove(event) {
        if (!this.isDragging) return;
        
        const currentPosition = event.clientX;
        const diff = currentPosition - this.startPosX;
        
        this.currentTranslate = diff - (this.currentSlide * this.container.offsetWidth);
        
        const minTranslate = -(this.slides.length - 1) * this.container.offsetWidth;
        if (this.currentTranslate > 0) this.currentTranslate = 0;
        if (this.currentTranslate < minTranslate) this.currentTranslate = minTranslate;
        
        this.wrapper.style.transition = 'none';
        this.wrapper.style.transform = `translateX(${this.currentTranslate}px)`;
    }
    
    /**
     * Обработчик отпускания кнопки мыши
     */
    onMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.style.cursor = '';
        
        this.wrapper.style.transition = 'transform 0.5s ease';
        
        const movedPercent = Math.abs(this.currentTranslate - (-this.currentSlide * this.container.offsetWidth)) / this.container.offsetWidth;
        
        if (movedPercent > 0.2) {
            if (this.currentTranslate > -this.currentSlide * this.container.offsetWidth) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        } else {
            this.goToSlide(this.currentSlide);
        }
    }
}

/**
 * Конечный класс слайдера с дополнительной функциональностью
 * Расширяет класс слайдера с управлением мышью
 */
class SliderClass extends DragSlider {
    /**
     * Конструктор конечного класса слайдера
     * @param {string} selector - CSS-селектор контейнера слайдера
     * @param {Object} options - Объект настроек слайдера
     */
    constructor(selector, options) {
        const extendedDefaultOptions = {
            pauseOnHover: false
        };
        
        const mergedOptions = { ...extendedDefaultOptions, ...options };
        
        super(selector, mergedOptions);
        
        if (this.options.pauseOnHover) {
            this.setupHoverEvents();
        }
    }
    
    /**
     * Установка обработчиков событий для паузы при наведении
     */
    setupHoverEvents() {
        this.container.addEventListener('mouseenter', this.stopAutoplay.bind(this));
        this.container.addEventListener('mouseleave', this.startAutoplay.bind(this));
    }
} 