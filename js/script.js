document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const html = document.documentElement;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Update ARIA pressed state
        themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
        
        // Add a little animation feedback
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        themeIcon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeIcon.style.transform = '';
        }, 300);
    }
    
    // Dynamic Gallery Functionality
    const galleryContainer = document.getElementById('gallery-container');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const retryButton = document.getElementById('retry-button');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeButton = document.getElementById('lightbox-close');
    const body = document.body;
    
    let galleryData = [];
    let galleryItems = [];
    let lastFocusedElement = null;
    
    // Fetch gallery data from JSON
    async function loadGalleryData() {
        try {
            showLoadingState();
            
            const response = await fetch('images.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            galleryData = data.gallery || [];
            
            if (galleryData.length === 0) {
                throw new Error('No images found in gallery data');
            }
            
            renderGallery(galleryData);
            hideLoadingState();
            initializeLightbox();
            initializeLazyLoading();
            
        } catch (error) {
            console.error('Error loading gallery data:', error);
            showErrorState(error.message);
        }
    }
    
    // Show loading state
    function showLoadingState() {
        loadingState.style.display = 'block';
        errorState.style.display = 'none';
        loadingState.setAttribute('aria-busy', 'true');
    }
    
    // Hide loading state
    function hideLoadingState() {
        loadingState.style.display = 'none';
        loadingState.setAttribute('aria-busy', 'false');
    }
    
    // Show error state
    function showErrorState(message = 'Unable to load gallery. Please try again later.') {
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        errorState.setAttribute('aria-live', 'assertive');
        
        const errorContent = errorState.querySelector('.error-content p');
        if (errorContent) {
            errorContent.textContent = message;
        }
    }
    
    // Render gallery items
    function renderGallery(images) {
        // Clear existing gallery items (keep loading and error states)
        const existingItems = galleryContainer.querySelectorAll('.gallery-item');
        existingItems.forEach(item => item.remove());
        
        // Create and append gallery items
        images.forEach((imageData, index) => {
            const galleryItem = createGalleryItem(imageData, index);
            galleryContainer.appendChild(galleryItem);
            galleryItems.push(galleryItem);
        });
    }
    
    // Create individual gallery item
    function createGalleryItem(imageData, index) {
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';
        figure.setAttribute('data-index', index);
        figure.setAttribute('role', 'figure');
        figure.setAttribute('aria-label', imageData.title);
        figure.setAttribute('tabindex', '0');
        
        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt || imageData.title;
        img.loading = 'lazy';
        img.setAttribute('data-title', imageData.title);
        img.setAttribute('data-description', imageData.description || '');
        img.setAttribute('role', 'img');
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = imageData.title;
        figcaption.setAttribute('role', 'caption');
        
        figure.appendChild(img);
        figure.appendChild(figcaption);
        
        // Add loading state for individual images
        img.addEventListener('load', function() {
            figure.style.opacity = '1';
            figure.style.transform = 'translateY(0)';
            figure.setAttribute('aria-busy', 'false');
        });
        
        img.addEventListener('error', function() {
            figure.style.opacity = '0.5';
            figure.style.border = '2px dashed var(--border)';
            figcaption.textContent = 'Image failed to load';
            figure.setAttribute('aria-invalid', 'true');
        });
        
        // Initial state for animation
        figure.style.opacity = '0';
        figure.style.transform = 'translateY(20px)';
        figure.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        figure.setAttribute('aria-busy', 'true');
        
        // Add keyboard support for gallery items
        figure.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this);
            }
        });
        
        return figure;
    }
    
    // Open lightbox with proper accessibility
    function openLightbox(item) {
        const img = item.querySelector('img');
        const title = img.getAttribute('data-title');
        const description = img.getAttribute('data-description');
        
        // Store last focused element for return
        lastFocusedElement = document.activeElement;
        
        // Set lightbox content
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = description || title;
        
        // Show lightbox with proper ARIA attributes
        lightbox.classList.remove('hidden');
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
        body.classList.add('no-scroll');
        
        // Focus management
        setTimeout(() => {
            closeButton.focus();
        }, 100);
        
        // Prevent body scroll on touch devices
        document.addEventListener('touchmove', preventScroll, { passive: false });
    }
    
    // Initialize lightbox functionality
    function initializeLightbox() {
        galleryItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                openLightbox(this);
            });
        });
        
        // Close lightbox when the close button is clicked
        closeButton.addEventListener('click', closeLightbox);
        closeButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeLightbox();
            }
        });
        
        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', function(e) {
            // Trap focus within lightbox when open
            if (lightbox.classList.contains('show')) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    closeLightbox();
                    return;
                }
                
                // Tab navigation within lightbox
                if (e.key === "Tab") {
                    const focusableElements = lightbox.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                    return;
                }
                
                // Image navigation with arrow keys
                const currentImg = Array.from(galleryItems).findIndex(item => 
                    item.querySelector('img').src === lightboxImg.src
                );
                
                if (e.key === "ArrowLeft" && currentImg > 0) {
                    e.preventDefault();
                    navigateToImage(currentImg - 1);
                } else if (e.key === "ArrowRight" && currentImg < galleryItems.length - 1) {
                    e.preventDefault();
                    navigateToImage(currentImg + 1);
                }
            }
        });
    }
    
    function closeLightbox() {
        lightbox.classList.remove('show');
        lightbox.classList.add('hidden');
        lightbox.setAttribute('aria-hidden', 'true');
        body.classList.remove('no-scroll');
        document.removeEventListener('touchmove', preventScroll);
        
        // Return focus to last focused element
        if (lastFocusedElement) {
            lastFocusedElement.focus();
            lastFocusedElement = null;
        }
        
        // Reset animations
        setTimeout(() => {
            lightboxImg.style.transform = '';
            lightboxImg.style.opacity = '';
            lightboxCaption.style.transform = '';
            lightboxCaption.style.opacity = '';
        }, 400);
    }
    
    function navigateToImage(index) {
        const item = galleryItems[index];
        const img = item.querySelector('img');
        const title = img.getAttribute('data-title');
        const description = img.getAttribute('data-description');
        
        // Add transition effect
        lightboxImg.style.opacity = '0';
        lightboxCaption.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = description || title;
            
            // Trigger reflow for smooth animation
            lightboxImg.offsetHeight;
            
            lightboxImg.style.opacity = '1';
            lightboxCaption.style.opacity = '1';
        }, 200);
    }
    
    function preventScroll(e) {
        e.preventDefault();
    }
    
    // Initialize lazy loading
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Start loading image
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        img.addEventListener('load', function() {
                            img.style.opacity = '1';
                            img.style.transform = 'scale(1)';
                        });
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            document.querySelectorAll('.gallery-item img').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // Retry button functionality
    if (retryButton) {
        retryButton.addEventListener('click', function() {
            loadGalleryData();
        });
        
        retryButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadGalleryData();
            }
        });
    }
    
    // Add smooth scroll behavior for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add subtle parallax effect on scroll (performance optimized)
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.gallery-header');
        if (parallax) {
            const speed = 0.5;
            parallax.style.transform = `translateY(${scrolled * speed}px)`;
        }
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Add hover effect for better UX
    function addHoverEffects() {
        galleryItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.zIndex = '';
            });
        });
    }
    
    // Initialize gallery when page loads
    loadGalleryData().then(() => {
        addHoverEffects();
    });
    
    // Handle online/offline status
    window.addEventListener('online', function() {
        if (galleryData.length === 0) {
            loadGalleryData();
        }
    });
    
    window.addEventListener('offline', function() {
        console.log('App is offline. Some features may not work.');
    });
});
