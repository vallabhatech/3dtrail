document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeButton = document.querySelector('.close-button');
    const body = document.body; // Reference to the body element

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Display the lightbox
            lightbox.style.display = 'flex';
            // Add fade-in class for animation (optional)
            lightbox.classList.add('fade-in');

            // Set the image source and alt text for the lightbox
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;

            // Get the caption from the sibling figcaption
            const captionText = this.nextElementSibling ? this.nextElementSibling.textContent : '';
            lightboxCaption.textContent = captionText;

            // Add no-scroll class to body
            body.classList.add('no-scroll');
        });
    });

    // Close lightbox when the close button is clicked
    closeButton.addEventListener('click', function() {
        lightbox.classList.remove('fade-in'); // Remove fade-in before hiding
        // Give a slight delay before hiding to allow fade-out if desired (can be added with CSS transition on display property)
        setTimeout(() => {
            lightbox.style.display = 'none';
            body.classList.remove('no-scroll');
        }, 100); // Small delay to allow fade-out (adjust as needed)
    });

    // Close lightbox when clicking outside the image (on the overlay)
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) { // Check if the click was directly on the lightbox background
            lightbox.classList.remove('fade-in');
            setTimeout(() => {
                lightbox.style.display = 'none';
                body.classList.remove('no-scroll');
            }, 100); // Small delay
        }
    });

    // Optional: Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && lightbox.style.display === 'flex') {
            lightbox.classList.remove('fade-in');
            setTimeout(() => {
                lightbox.style.display = 'none';
                body.classList.remove('no-scroll');
            }, 100); // Small delay
        }
    });
});