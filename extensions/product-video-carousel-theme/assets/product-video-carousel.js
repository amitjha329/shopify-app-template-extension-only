/**
 * Product Video Carousel - Interactive Engine
 * Kimaya Homes / Shopify Online Store 2.0
 * 
 * Features:
 * - Active item in portrait 344:573 aspect ratio with auto-playing video
 * - Non-active items in 344:458 aspect ratio with thumbnail preview
 * - Seamless infinite centered carousel with scale transition
 * - Single active video playback guarantee
 * - Sound mute/unmute control
 * - Touch swipe & drag support
 * - Dynamic item addition and removal
 * - Shopify Theme Editor lifecycle integration
 */

class ProductVideoCarousel {
  constructor(containerElement, options = {}) {
    if (!containerElement) return;
    this.container = containerElement;
    this.options = Object.assign({
      autoplay: false,
      autoplayInterval: 5000,
      initialIndex: 0,
      gap: 28,
      soundMuted: true
    }, options);

    this.viewport = this.container.querySelector('.pvc-viewport');
    this.track = this.container.querySelector('.pvc-track');
    this.prevBtn = this.container.querySelector('.pvc-prev-btn');
    this.nextBtn = this.container.querySelector('.pvc-next-btn');
    this.dotsContainer = this.container.querySelector('.pvc-dots-wrapper');
    
    // Store original slide data or elements
    this.originalSlides = Array.from(this.track.querySelectorAll('.pvc-slide:not(.pvc-clone)'));
    this.slideCount = this.originalSlides.length;

    if (this.slideCount === 0) return;

    // Carousel state
    this.currentIndex = 0;
    this.virtualIndex = 0;
    this.isAnimating = false;
    this.isMuted = this.options.soundMuted;
    this.autoplayTimer = null;
    this.resizeObserver = null;
    this.intersectionObserver = null;
    this.isSectionVisible = true;

    // Drag / Touch State
    this.isDragging = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.dragStartTime = 0;

    this.init();
  }

  init() {
    this.buildInfiniteTrack();
    this.bindEvents();
    this.setupObservers();
    
    // Set initial position
    this.goToSlide(this.options.initialIndex, false);

    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }

  /**
   * Builds the infinite loop buffer by cloning original slides
   */
  buildInfiniteTrack() {
    // Clear any previous clones
    this.track.querySelectorAll('.pvc-clone').forEach(el => el.remove());

    // We clone 2 sets before and 2 sets after for seamless loop
    const cloneCount = Math.max(3, this.slideCount);
    
    // Prefix clones
    const prefixFrag = document.createDocumentFragment();
    for (let i = cloneCount - 1; i >= 0; i--) {
      const source = this.originalSlides[i % this.slideCount];
      const clone = source.cloneNode(true);
      clone.classList.add('pvc-clone');
      clone.setAttribute('aria-hidden', 'true');
      prefixFrag.appendChild(clone);
    }
    this.track.insertBefore(prefixFrag, this.track.firstChild);

    // Suffix clones
    const suffixFrag = document.createDocumentFragment();
    for (let i = 0; i < cloneCount; i++) {
      const source = this.originalSlides[i % this.slideCount];
      const clone = source.cloneNode(true);
      clone.classList.add('pvc-clone');
      clone.setAttribute('aria-hidden', 'true');
      suffixFrag.appendChild(clone);
    }
    this.track.appendChild(suffixFrag);

    this.allSlides = Array.from(this.track.querySelectorAll('.pvc-slide'));
    this.cloneOffset = cloneCount; // Starting index of original slides in allSlides array
    this.virtualIndex = this.cloneOffset + this.options.initialIndex;

    this.renderDots();
  }

  /**
   * Render pagination dots
   */
  renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';
    
    this.originalSlides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `pvc-dot ${idx === this.currentIndex ? 'is-active' : ''}`;
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        this.stopAutoplay();
        this.goToOriginalIndex(idx);
      });
      this.dotsContainer.appendChild(dot);
    });
  }

  /**
   * Update active dot indicator
   */
  updateDots() {
    if (!this.dotsContainer) return;
    const dots = this.dotsContainer.querySelectorAll('.pvc-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === this.currentIndex);
    });
  }

  /**
   * Calculate track offset to position active slide at horizontal center of viewport
   */
  getCenterOffset(slideElement) {
    if (!slideElement || !this.viewport) return 0;
    const viewportWidth = this.viewport.clientWidth;
    const slideLeft = slideElement.offsetLeft;
    const slideWidth = slideElement.offsetWidth;
    // Centering formula: viewportCenter - slideCenter
    return (viewportWidth / 2) - (slideLeft + (slideWidth / 2));
  }

  /**
   * Navigate to a slide by virtual index
   */
  goToSlide(virtualIndex, animate = true) {
    if (this.allSlides.length === 0) return;

    this.virtualIndex = virtualIndex;
    const targetSlide = this.allSlides[this.virtualIndex];
    if (!targetSlide) return;

    // Calculate real original index
    this.currentIndex = ((this.virtualIndex - this.cloneOffset) % this.slideCount + this.slideCount) % this.slideCount;

    const targetOffset = this.getCenterOffset(targetSlide);
    this.currentTranslate = targetOffset;
    this.prevTranslate = targetOffset;

    if (animate) {
      this.isAnimating = true;
      this.track.classList.add('is-animating');
    } else {
      this.track.classList.remove('is-animating');
    }

    this.setTrackPosition(targetOffset);
    this.updateCardStates();
    this.updateDots();

    if (!animate) {
      this.handleSlideActivated();
    }
  }

  /**
   * Navigate to original slide index (0 to slideCount - 1)
   */
  goToOriginalIndex(originalIndex, animate = true) {
    const diff = originalIndex - this.currentIndex;
    this.goToSlide(this.virtualIndex + diff, animate);
  }

  next() {
    if (this.isAnimating) return;
    this.goToSlide(this.virtualIndex + 1, true);
  }

  prev() {
    if (this.isAnimating) return;
    this.goToSlide(this.virtualIndex - 1, true);
  }

  /**
   * Sets CSS transform on track
   */
  setTrackPosition(offset) {
    this.track.style.transform = `translate3d(${offset}px, 0, 0)`;
  }

  /**
   * Handles scale, aspect-ratio, video, and thumbnail states for all slides
   */
  updateCardStates() {
    this.allSlides.forEach((slide, idx) => {
      const card = slide.querySelector('.pvc-card');
      if (!card) return;

      const isActive = idx === this.virtualIndex;
      const video = card.querySelector('video.pvc-video');
      const audioBtn = card.querySelector('.pvc-audio-toggle');

      if (isActive) {
        card.classList.remove('is-inactive');
        card.classList.add('is-active');
        slide.setAttribute('aria-current', 'true');

        // Play video
        if (video) {
          video.muted = this.isMuted;
          if (this.isSectionVisible) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay was prevented; ensure muted fallback
                video.muted = true;
                video.play().catch(() => {});
              });
            }
          }
          this.attachVideoProgress(video, card);
        }

        // Update audio toggle icon state
        this.updateAudioIcon(audioBtn);

      } else {
        card.classList.remove('is-active');
        card.classList.add('is-inactive');
        slide.removeAttribute('aria-current');

        // Stop & reset inactive video to guarantee ONLY active one plays
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }

  /**
   * Attach video progress bar updater
   */
  attachVideoProgress(video, card) {
    const progressBar = card.querySelector('.pvc-progress-bar');
    if (!progressBar) return;

    if (!video._hasProgressHandler) {
      video.addEventListener('timeupdate', () => {
        if (video.duration) {
          const percent = (video.currentTime / video.duration) * 100;
          progressBar.style.width = `${percent}%`;
        }
      });
      video._hasProgressHandler = true;
    }
  }

  /**
   * Post-animation cleanup & infinite wrap jump
   */
  handleTransitionEnd() {
    this.isAnimating = false;
    this.track.classList.remove('is-animating');

    // Check if virtual index moved into clone territory
    const totalOriginals = this.slideCount;
    const lowerBound = this.cloneOffset;
    const upperBound = this.cloneOffset + totalOriginals - 1;

    if (this.virtualIndex < lowerBound || this.virtualIndex > upperBound) {
      // Wrap virtual index to matching original slide without animation
      const normalizedOriginal = ((this.virtualIndex - this.cloneOffset) % totalOriginals + totalOriginals) % totalOriginals;
      const newVirtualIndex = this.cloneOffset + normalizedOriginal;
      
      this.goToSlide(newVirtualIndex, false);
    } else {
      this.handleSlideActivated();
    }
  }

  handleSlideActivated() {
    // Ensure active video is playing
    const activeSlide = this.allSlides[this.virtualIndex];
    if (activeSlide) {
      const video = activeSlide.querySelector('video.pvc-video');
      if (video && this.isSectionVisible) {
        video.muted = this.isMuted;
        video.play().catch(() => {});
      }
    }
  }

  /**
   * Audio mute/unmute toggle
   */
  toggleAudio() {
    this.isMuted = !this.isMuted;
    const activeSlide = this.allSlides[this.virtualIndex];
    if (activeSlide) {
      const video = activeSlide.querySelector('video.pvc-video');
      if (video) {
        video.muted = this.isMuted;
        if (video.paused && this.isSectionVisible) {
          video.play().catch(() => {});
        }
      }
      const audioBtn = activeSlide.querySelector('.pvc-audio-toggle');
      this.updateAudioIcon(audioBtn);
    }
  }

  updateAudioIcon(audioBtn) {
    if (!audioBtn) return;
    const unmutedSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;
    const mutedSvg = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
    `;
    audioBtn.innerHTML = this.isMuted ? mutedSvg : unmutedSvg;
    audioBtn.setAttribute('aria-label', this.isMuted ? 'Unmute video' : 'Mute video');
  }

  /**
   * Event listeners binding
   */
  bindEvents() {
    // Nav Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAutoplay();
        this.prev();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAutoplay();
        this.next();
      });
    }

    // Transition end on track
    this.track.addEventListener('transitionend', (e) => {
      if (e.target === this.track && e.propertyName === 'transform') {
        this.handleTransitionEnd();
      }
    });

    // Clicking non-active slide centers & activates it
    this.track.addEventListener('click', (e) => {
      const slide = e.target.closest('.pvc-slide');
      if (!slide) return;

      // If clicked the product card link or audio button, let it perform its native action
      if (e.target.closest('.pvc-product-card') || e.target.closest('.pvc-audio-toggle')) {
        return;
      }

      const slideIdx = this.allSlides.indexOf(slide);
      if (slideIdx !== -1 && slideIdx !== this.virtualIndex) {
        e.preventDefault();
        this.stopAutoplay();
        this.goToSlide(slideIdx, true);
      }
    });

    // Audio toggle button clicks
    this.track.addEventListener('click', (e) => {
      const audioBtn = e.target.closest('.pvc-audio-toggle');
      if (audioBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAudio();
      }
    });

    // Touch & Mouse Dragging
    this.bindDragEvents();

    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.stopAutoplay();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        this.stopAutoplay();
        this.next();
      }
    });
  }

  /**
   * Touch and pointer drag gestures
   */
  bindDragEvents() {
    const handleStart = (clientX) => {
      if (this.isAnimating) return;
      this.isDragging = true;
      this.startX = clientX;
      this.dragStartTime = Date.now();
      this.viewport.classList.add('is-dragging');
      this.track.classList.remove('is-animating');
      this.stopAutoplay();
    };

    const handleMove = (clientX) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.startX;
      this.setTrackPosition(this.prevTranslate + deltaX);
    };

    const handleEnd = (clientX) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.viewport.classList.remove('is-dragging');

      const deltaX = clientX - this.startX;
      const deltaTime = Date.now() - this.dragStartTime;
      const velocity = Math.abs(deltaX) / (deltaTime || 1);

      // Threshold for slide trigger: > 60px or fast flick > 0.35px/ms
      if (deltaX < -60 || (deltaX < -20 && velocity > 0.35)) {
        this.next();
      } else if (deltaX > 60 || (deltaX > 20 && velocity > 0.35)) {
        this.prev();
      } else {
        // Snap back to current slide
        this.goToSlide(this.virtualIndex, true);
      }
    };

    // Pointer Events
    this.viewport.addEventListener('pointerdown', (e) => {
      // Don't drag if clicking buttons or product link
      if (e.target.closest('.pvc-nav-btn') || e.target.closest('.pvc-audio-toggle') || e.target.closest('.pvc-product-card')) return;
      handleStart(e.clientX);
    });

    window.addEventListener('pointermove', (e) => handleMove(e.clientX));
    window.addEventListener('pointerup', (e) => handleEnd(e.clientX));
    window.addEventListener('pointercancel', (e) => handleEnd(e.clientX));

    // Touch Events Fallback
    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      handleStart(e.touches[0].clientX);
    }, { passive: true });

    this.viewport.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      handleMove(e.touches[0].clientX);
    }, { passive: true });

    this.viewport.addEventListener('touchend', (e) => {
      handleEnd(e.changedTouches[0].clientX);
    });
  }

  /**
   * Observers for viewport resize and section visibility
   */
  setupObservers() {
    // Recalibrate center offset on resize
    this.resizeObserver = new ResizeObserver(() => {
      this.goToSlide(this.virtualIndex, false);
    });
    this.resizeObserver.observe(this.container);

    // Pause video when section is not visible on screen
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isSectionVisible = entry.isIntersecting;
          const activeSlide = this.allSlides[this.virtualIndex];
          if (!activeSlide) return;
          const video = activeSlide.querySelector('video.pvc-video');
          if (video) {
            if (this.isSectionVisible) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        });
      }, { threshold: 0.25 });
      this.intersectionObserver.observe(this.container);
    }
  }

  /**
   * Autoplay management
   */
  startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (this.isSectionVisible && !this.isDragging) {
        this.next();
      }
    }, this.options.autoplayInterval);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  /**
   * Dynamic Slide Management: Add item
   */
  addSlide(slideData) {
    const slideElement = this.createSlideElement(slideData);
    this.originalSlides.push(slideElement);
    this.track.appendChild(slideElement);
    this.slideCount = this.originalSlides.length;
    this.buildInfiniteTrack();
    this.goToSlide(this.virtualIndex, false);
  }

  /**
   * Dynamic Slide Management: Remove item
   */
  removeSlide(index) {
    if (this.originalSlides.length <= 1) return;
    if (index < 0 || index >= this.originalSlides.length) return;

    const removedSlide = this.originalSlides.splice(index, 1)[0];
    if (removedSlide) removedSlide.remove();

    this.slideCount = this.originalSlides.length;
    this.buildInfiniteTrack();
    this.goToOriginalIndex(Math.min(index, this.slideCount - 1), false);
  }

  /**
   * Helper to construct DOM element for dynamic slide
   */
  createSlideElement(data) {
    const slide = document.createElement('div');
    slide.className = 'pvc-slide';
    slide.innerHTML = `
      <div class="pvc-card is-inactive">
        <div class="pvc-media-wrapper">
          <video class="pvc-video" src="${data.videoUrl || ''}" playsinline loop muted preload="metadata"></video>
          <img class="pvc-thumbnail" src="${data.thumbnailUrl || ''}" alt="${data.productTitle || 'Product Video'}" loading="lazy" />
          <div class="pvc-scrim"></div>
          ${data.badge ? `<span class="pvc-top-badge">${data.badge}</span>` : ''}
          <div class="pvc-play-indicator">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <button type="button" class="pvc-audio-toggle" aria-label="Unmute video">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </button>
          <div class="pvc-video-progress"><div class="pvc-progress-bar"></div></div>
        </div>
        <div class="pvc-compact-pill">
          <span class="pvc-compact-pill-title">${data.productTitle || ''}</span>
          <span class="pvc-compact-pill-price">${data.productPrice || ''}</span>
        </div>
        <a href="${data.productUrl || '#'}" class="pvc-product-card">
          <div class="pvc-product-info">
            <div class="pvc-product-text">
              <h3 class="pvc-product-title">${data.productTitle || ''}</h3>
              <div class="pvc-price-container">
                <span class="pvc-price">${data.productPrice || ''}</span>
                ${data.comparePrice ? `<span class="pvc-compare-price">${data.comparePrice}</span>` : ''}
                ${data.discount ? `<span class="pvc-discount-tag">${data.discount}</span>` : ''}
              </div>
            </div>
          </div>
          <span class="pvc-cta-btn">
            View Product
            <svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </span>
        </a>
      </div>
    `;
    return slide;
  }

  destroy() {
    this.stopAutoplay();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
  }
}

// Auto-initialize all carousel sections on the page
function initAllProductVideoCarousels() {
  document.querySelectorAll('[data-product-video-carousel]').forEach(el => {
    if (!el._pvcInstance) {
      const autoplay = el.dataset.autoplay === 'true';
      const interval = parseInt(el.dataset.autoplayInterval, 10) || 5000;
      el._pvcInstance = new ProductVideoCarousel(el, {
        autoplay: autoplay,
        autoplayInterval: interval
      });
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllProductVideoCarousels);
} else {
  initAllProductVideoCarousels();
}

// Shopify Theme Customizer Live Integration
document.addEventListener('shopify:section:load', (e) => {
  const section = e.target.querySelector('[data-product-video-carousel]');
  if (section) {
    section._pvcInstance = new ProductVideoCarousel(section);
  }
});

document.addEventListener('shopify:section:unload', (e) => {
  const section = e.target.querySelector('[data-product-video-carousel]');
  if (section && section._pvcInstance) {
    section._pvcInstance.destroy();
    section._pvcInstance = null;
  }
});

document.addEventListener('shopify:block:select', (e) => {
  const carousel = e.target.closest('[data-product-video-carousel]');
  if (carousel && carousel._pvcInstance) {
    const slide = e.target.closest('.pvc-slide');
    if (slide) {
      const idx = carousel._pvcInstance.originalSlides.indexOf(slide);
      if (idx !== -1) {
        carousel._pvcInstance.goToOriginalIndex(idx);
      }
    }
  }
});

window.ProductVideoCarousel = ProductVideoCarousel;
