/**
 * NeuralNova - Main JavaScript Module
 * Modern ES6+ JavaScript với cấu trúc modular
 */

// Utility functions
const utils = {
  /**
   * Debounce function để tối ưu performance
   */
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  },

  /**
   * Throttle function để kiểm soát tần suất thực thi
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Animation observer với Intersection Observer API
   */
  observeAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe các elements cần animation
    document.querySelectorAll('.service-card, .portfolio-item, .stat').forEach(el => {
      observer.observe(el);
    });
  },

  /**
   * Smooth scroll to element
   */
  scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Navigation Module
const navigation = {
  init() {
    this.navbar = document.querySelector('.navbar');
    this.toggleBtn = document.querySelector('.navbar__toggle');
    this.menu = document.querySelector('.navbar__menu');
    this.links = document.querySelectorAll('.navbar__link[href^="#"]');

    this.bindEvents();
    this.setupSmoothScroll();
  },

  bindEvents() {
    // Mobile menu toggle
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.menu?.classList.contains('active') &&
          !this.navbar?.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Handle resize events
    window.addEventListener('resize', utils.debounce(() => {
      if (window.innerWidth >= 768) {
        this.closeMobileMenu();
      }
    }, 250));
  },

  toggleMobileMenu() {
    const isOpen = this.menu?.classList.contains('active');

    if (isOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  },

  openMobileMenu() {
    this.menu?.classList.add('active');
    this.toggleBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  closeMobileMenu() {
    this.menu?.classList.remove('active');
    this.toggleBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },

  setupSmoothScroll() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          utils.scrollToElement(targetElement, 80);
          this.closeMobileMenu();

          // Update active link
          this.updateActiveLink(link);
        }
      });
    });
  },

  updateActiveLink(activeLink) {
    this.links.forEach(link => link.classList.remove('navbar__link--active'));
    activeLink.classList.add('navbar__link--active');
  }
};

// Contact Form Module
const contactForm = {
  init() {
    this.form = document.getElementById('contactForm');
    if (!this.form) return;

    this.bindEvents();
  },

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.form.addEventListener('input', (e) => this.validateField(e.target));
  },

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);

    // Validate form
    if (!this.validateForm()) {
      this.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Show loading state
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Đang gửi...';
    submitBtn.disabled = true;

    try {
      // Simulate API call
      await this.submitForm(data);
      this.showSuccess('Tin nhắn đã được gửi thành công!');
      this.form.reset();
    } catch (error) {
      this.showError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  validateForm() {
    const fields = this.form.querySelectorAll('input[required], textarea[required]');
    return Array.from(fields).every(field => field.value.trim() !== '');
  },

  validateField(field) {
    const isValid = field.value.trim() !== '';
    field.classList.toggle('form-input--error', !isValid);
    return isValid;
  },

  async submitForm(data) {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure (90% success rate)
        if (Math.random() > 0.1) {
          resolve(data);
        } else {
          reject(new Error('Network error'));
        }
      }, 1000);
    });
  },

  showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessage = this.form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;

    // Insert before form
    this.form.parentNode.insertBefore(messageEl, this.form);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  },

  showSuccess(message) {
    this.showMessage(message, 'success');
  },

  showError(message) {
    this.showMessage(message, 'error');
  }
};

// Theme Module (for future dark mode support)
const theme = {
  init() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme(this.currentTheme);
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.currentTheme = newTheme;
    this.applyTheme(newTheme);
  }
};

// Performance Module
const performance = {
  init() {
    this.measureLoadTime();
    this.lazyLoadImages();
    this.preloadCriticalResources();
  },

  measureLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${Math.round(loadTime)}ms`);
    });
  },

  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  preloadCriticalResources() {
    // Preload critical CSS if not already loaded
    const criticalCSS = document.querySelector('link[href*="main.css"]');
    if (criticalCSS && !criticalCSS.hasAttribute('data-loaded')) {
      criticalCSS.addEventListener('load', () => {
        criticalCSS.setAttribute('data-loaded', 'true');
      });
    }
  }
};

// Scroll Effects Module
const scrollEffects = {
  init() {
    this.lastScrollY = window.scrollY;
    this.navbar = document.querySelector('.navbar');

    this.bindEvents();
    this.updateNavbarOnScroll();
  },

  bindEvents() {
    window.addEventListener('scroll', utils.throttle(() => {
      this.updateNavbarOnScroll();
      this.updateScrollProgress();
    }, 16));
  },

  updateNavbarOnScroll() {
    const currentScrollY = window.scrollY;

    if (this.navbar) {
      if (currentScrollY > 100) {
        this.navbar.classList.add('navbar--scrolled');
      } else {
        this.navbar.classList.remove('navbar--scrolled');
      }
    }

    this.lastScrollY = currentScrollY;
  },

  updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Update CSS custom property for scroll progress
    document.documentElement.style.setProperty('--scroll-progress', `${scrollPercent}%`);
  }
};

// Accessibility Module
const accessibility = {
  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLabels();
  },

  setupKeyboardNavigation() {
    // ESC key to close mobile menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navigation.closeMobileMenu();
      }
    });
  },

  setupFocusManagement() {
    // Focus management for modals and dropdowns
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  },

  setupAriaLabels() {
    // Dynamic aria-labels for interactive elements
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
      const text = button.textContent.trim();
      if (text) {
        button.setAttribute('aria-label', text);
      }
    });
  }
};

// Application initialization
class NeuralNova {
  constructor() {
    this.modules = [
      utils,
      navigation,
      contactForm,
      theme,
      performance,
      scrollEffects,
      accessibility
    ];
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('🚀 NeuralNova initialized');

    // Initialize all modules
    this.modules.forEach(module => {
      if (module.init) {
        module.init();
      }
    });

    // Initialize animations after a short delay
    setTimeout(() => {
      utils.observeAnimations();
    }, 100);

    console.log('✅ NeuralNova ready');
  }
}

// Start the application
const app = new NeuralNova();
app.init();

// Export for potential future use
window.NeuralNova = app;
