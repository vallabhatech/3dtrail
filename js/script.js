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
    
    // Lightbox Functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeButton = document.querySelector('.close-button');
    const body = document.body;

    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const img = this.querySelector('img');
            const caption = this.querySelector('figcaption');
            
            // Set the image source and alt text for the lightbox
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption ? caption.textContent : '';
            
            // Show lightbox with animation
            lightbox.classList.add('show');
            body.classList.add('no-scroll');
            
            // Prevent body scroll on touch devices
            document.addEventListener('touchmove', preventScroll, { passive: false });
        });
    });

    // Close lightbox when the close button is clicked
    closeButton.addEventListener('click', closeLightbox);

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && lightbox.classList.contains('show')) {
            closeLightbox();
        }
        
        // Keyboard navigation
        if (lightbox.classList.contains('show')) {
            const currentImg = Array.from(galleryItems).findIndex(item => 
                item.querySelector('img').src === lightboxImg.src
            );
            
            if (e.key === "ArrowLeft" && currentImg > 0) {
                navigateToImage(currentImg - 1);
            } else if (e.key === "ArrowRight" && currentImg < galleryItems.length - 1) {
                navigateToImage(currentImg + 1);
            }
        }
    });
    
    function closeLightbox() {
        lightbox.classList.remove('show');
        body.classList.remove('no-scroll');
        document.removeEventListener('touchmove', preventScroll);
        
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
        const caption = item.querySelector('figcaption');
        
        // Add transition effect
        lightboxImg.style.opacity = '0';
        lightboxCaption.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption ? caption.textContent : '';
            
            // Trigger reflow for smooth animation
            lightboxImg.offsetHeight;
            
            lightboxImg.style.opacity = '1';
            lightboxCaption.style.opacity = '1';
        }, 200);
    }
    
    function preventScroll(e) {
        e.preventDefault();
    }
    
    // Add smooth scroll behavior for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Performance optimization: Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    
                    img.addEventListener('load', function() {
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = '1';
                    });
                    
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('.gallery-item img').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Add loading states for better perceived performance
    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        
        img.addEventListener('load', function() {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        });
        
        img.addEventListener('error', function() {
            item.style.opacity = '0.5';
            item.style.border = '2px dashed var(--border)';
        });
        
        // Initial state
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
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
    
    // Add hover effect sound feedback (optional, for enhanced UX)
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
});
