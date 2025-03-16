function SliderPrototype(selector, options) {
    this.container = document.querySelector(selector);
    this.wrapper = this.container.querySelector('.slider-wrapper');
    this.slides = this.container.querySelectorAll('.slider-item');
    this.currentSlide = 0;
    this.sliding = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.isDragging = false;
    this.startPosX = 0;
    this.currentTranslate = 0;
    
    this.defaultOptions = {
        autoplay: false,
        interval: 5000,
        showIndicators: true,
        showArrows: true
    };
    
    this.options = Object.assign({}, this.defaultOptions, options || {});
    
    this.init();
}

SliderPrototype.prototype.init = function() {
    this.createControls();
    
    this.setupEventListeners();
    
    if (this.options.autoplay) {
        this.startAutoplay();
    }
};

SliderPrototype.prototype.createControls = function() {
    if (this.options.showIndicators) {
        this.createIndicators();
    }
    
    if (this.options.showArrows) {
        this.createArrows();
    }
};

SliderPrototype.prototype.createIndicators = function() {
    const indicators = document.createElement('div');
    indicators.className = 'slider-controls';
    
    for (let i = 0; i < this.slides.length; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'slider-indicator';
        if (i === this.currentSlide) {
            indicator.classList.add('active');
        }
        
        indicator.addEventListener('click', () => {
            this.goToSlide(i);
        });
        
        indicators.appendChild(indicator);
    }
    
    this.container.appendChild(indicators);
    this.indicators = this.container.querySelectorAll('.slider-indicator');
};

SliderPrototype.prototype.createArrows = function() {
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
};

SliderPrototype.prototype.setupEventListeners = function() {
    this.container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    this.container.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: true });
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
};

SliderPrototype.prototype.prevSlide = function() {
    if (this.sliding) return;
    
    let index = this.currentSlide - 1;
    if (index < 0) {
        index = this.slides.length - 1;
    }
    
    this.goToSlide(index);
};

SliderPrototype.prototype.nextSlide = function() {
    if (this.sliding) return;
    
    let index = this.currentSlide + 1;
    if (index >= this.slides.length) {
        index = 0;
    }
    
    this.goToSlide(index);
};

SliderPrototype.prototype.goToSlide = function(index) {
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
};

SliderPrototype.prototype.startAutoplay = function() {
    this.autoplayInterval = setInterval(() => {
        this.nextSlide();
    }, this.options.interval);
};

SliderPrototype.prototype.resetAutoplay = function() {
    if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.startAutoplay();
    }
};

SliderPrototype.prototype.stopAutoplay = function() {
    if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
    }
};

SliderPrototype.prototype.onTouchStart = function(event) {
    this.touchStartX = event.touches[0].clientX;
};

SliderPrototype.prototype.onTouchMove = function(event) {
    this.touchEndX = event.touches[0].clientX;
};

SliderPrototype.prototype.onTouchEnd = function() {
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            this.nextSlide();
        } else {
            this.prevSlide();
        }
    }
};

SliderPrototype.prototype.onMouseDown = function(event) {
    event.preventDefault();
    
    this.isDragging = true;
    this.startPosX = event.clientX;
    this.container.style.cursor = 'grabbing';
};

SliderPrototype.prototype.onMouseMove = function(event) {
    if (!this.isDragging) return;
    
    const currentPosition = event.clientX;
    const diff = currentPosition - this.startPosX;
    
    this.currentTranslate = diff - (this.currentSlide * this.container.offsetWidth);
    
    const minTranslate = -(this.slides.length - 1) * this.container.offsetWidth;
    if (this.currentTranslate > 0) this.currentTranslate = 0;
    if (this.currentTranslate < minTranslate) this.currentTranslate = minTranslate;
    
    this.wrapper.style.transition = 'none';
    this.wrapper.style.transform = `translateX(${this.currentTranslate}px)`;
};

SliderPrototype.prototype.onMouseUp = function() {
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
};