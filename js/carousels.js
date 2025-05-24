document.addEventListener('DOMContentLoaded', function() {
    // Configuration for Many-to-Many carousel (2 images per slide)
    const manyToManyConfig = {
        carouselId: 'many-to-many-carousel',
        prevBtnId: 'many-to-many-prev',
        nextBtnId: 'many-to-many-next',
        imagesPerSlide: 2,
        basePath: 'images/optimized/many-to-many/',
        // Format: set1-img1.png, set1-img2.png, set2-img1.png, etc.
        totalSets: 4, // Changed from 3 to 4 sets
        fileExtension: 'jpg',
        imageWidth: 450,
        imageHeight: 300
    };

    // Configuration for Texture carousel (3 images visible, 1 changes at a time)
    const textureConfig = {
        carouselId: 'texture-carousel',
        prevBtnId: 'texture-prev',
        nextBtnId: 'texture-next',
        visibleItems: 3,
        basePath: 'images/optimized/textures/',
        totalImages: 9, // Change this based on how many texture GIFs you have
        fileExtension: 'jpg',
        imageWidth: 300,
        imageHeight: 300
    };

    // Configuration for Panorama carousel (1 image per slide)
    const panoramaConfig = {
        carouselId: 'panorama-carousel',
        prevBtnId: 'panorama-prev',
        nextBtnId: 'panorama-next',
        basePath: 'images/optimized/panorama/',
        totalImages: 5, // Change this based on how many panorama GIFs you have
        fileExtension: 'jpg',
        imageWidth: 1000,
        imageHeight: 400
    };

    // Set up Intersection Observer for lazy initialization
    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const carouselId = entry.target.id;

                // Initialize the appropriate carousel based on ID
                switch (carouselId) {
                    case 'many-to-many-carousel':
                        initializeGroupCarousel(manyToManyConfig);
                        break;
                    case 'texture-carousel':
                        initializeSlidingWindowCarousel(textureConfig);
                        break;
                    case 'panorama-carousel':
                        initializeSingleImageCarousel(panoramaConfig);
                        break;
                }

                // Stop observing this carousel once initialized
                carouselObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '100px' // Start loading 100px before carousel is visible
    });

    // Observe all carousels
    document.querySelectorAll('.carousel').forEach(carousel => {
        carouselObserver.observe(carousel);
    });
});

// Preload images for smoother transitions
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
    });
}

// Preload adjacent images when user interacts with carousel
function preloadAdjacentImages(config, currentIndex, type = 'single') {
    const indices = [];

    if (type === 'single' || type === 'sliding') {
        // Preload next and previous images
        const prevIndex = (currentIndex - 1 + config.totalImages) % config.totalImages;
        const nextIndex = (currentIndex + 1) % config.totalImages;
        indices.push(prevIndex, nextIndex);

        if (type === 'sliding' && config.visibleItems) {
            // For sliding carousel, preload images that might become visible
            for (let i = 2; i < config.visibleItems + 2; i++) {
                indices.push((currentIndex + i) % config.totalImages);
                indices.push((currentIndex - i + config.totalImages) % config.totalImages);
            }
        }
    } else if (type === 'group') {
        // For group carousel, preload next and previous sets
        const prevSet = (currentIndex - 1 + config.totalSets) % config.totalSets;
        const nextSet = (currentIndex + 1) % config.totalSets;

        [prevSet, nextSet].forEach(setIndex => {
            for (let i = 1; i <= config.imagesPerSlide; i++) {
                const src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
                preloadImage(src);
            }
        });
        return;
    }

    // Preload the calculated indices
    indices.forEach(index => {
        const prefix = type === 'sliding' ? 'texture' : 'panorama';
        const src = `${config.basePath}${prefix}${index + 1}.${config.fileExtension}`;
        preloadImage(src);
    });
}

/**
 * Initialize a carousel where multiple images are shown together as a group
 * and the entire group changes when navigating
 */
function initializeGroupCarousel(config) {
    const carousel = document.getElementById(config.carouselId);
    const prevBtn = document.getElementById(config.prevBtnId);
    const nextBtn = document.getElementById(config.nextBtnId);

    let currentSetIndex = 0;
    let isAnimating = false;

    // Initial render
    renderImageSet(currentSetIndex);

    // Preload adjacent sets
    preloadAdjacentImages(config, currentSetIndex, 'group');

    // Event listeners
    prevBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextSetIndex = (currentSetIndex - 1 + config.totalSets) % config.totalSets;
        animateCarousel(currentSetIndex, nextSetIndex, 'prev');
        currentSetIndex = nextSetIndex;
    });

    nextBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextSetIndex = (currentSetIndex + 1) % config.totalSets;
        animateCarousel(currentSetIndex, nextSetIndex, 'next');
        currentSetIndex = nextSetIndex;
        preloadAdjacentImages(config, nextSetIndex, 'group');
    });

    function renderImageSet(setIndex) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';

        // Always create all images for the set regardless of screen size
        for (let i = 1; i <= config.imagesPerSlide; i++) {
            const img = document.createElement('img');
            img.src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
            img.alt = `Set ${setIndex + 1} Image ${i}`;
            img.loading = 'lazy';
            img.width = config.imageWidth;
            img.height = config.imageHeight;
            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        carousel.appendChild(carouselItem);
    }

    function createImageSet(setIndex) {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';

        // Always create all images for the set regardless of screen size
        for (let i = 1; i <= config.imagesPerSlide; i++) {
            const img = document.createElement('img');
            img.src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
            img.alt = `Set ${setIndex + 1} Image ${i}`;
            img.loading = 'lazy';
            img.width = config.imageWidth;
            img.height = config.imageHeight;
            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        return carouselItem;
    }

    function animateCarousel(currentIdx, nextIdx, direction) {
        isAnimating = true;

        // Get the current item
        const currentItem = carousel.querySelector('.carousel-item');

        // Create the next item
        const nextItem = createImageSet(nextIdx);

        // Add appropriate classes for animation
        if (direction === 'next') {
            nextItem.classList.add('slide-next-in');
            currentItem.classList.add('slide-next-out');
        } else {
            nextItem.classList.add('slide-prev-in');
            currentItem.classList.add('slide-prev-out');
        }

        // Add the next item to the carousel
        carousel.appendChild(nextItem);

        // Force reflow to ensure transitions work
        void nextItem.offsetWidth;

        // Start the animation
        nextItem.classList.add('active');

        // Clean up after animation completes
        setTimeout(() => {
            carousel.removeChild(currentItem);
            nextItem.classList.remove('slide-next-in', 'slide-prev-in', 'active');
            isAnimating = false;
        }, 500);
    }
}

/**
 * Initialize a carousel where multiple images are visible
 * but only one image changes at a time when navigating
 */
function initializeSlidingWindowCarousel(config) {
    const carousel = document.getElementById(config.carouselId);
    const prevBtn = document.getElementById(config.prevBtnId);
    const nextBtn = document.getElementById(config.nextBtnId);

    let startIndex = 0;
    let isAnimating = false;
    let visibleItems = config.visibleItems;

    // Initial render
    renderVisibleImages(startIndex);

    // Adjust visible items based on screen width
    function updateVisibleItems() {
        if (window.innerWidth <= 480) {
            visibleItems = 1;
        } else if (window.innerWidth <= 768) {
            visibleItems = 2;
        } else {
            visibleItems = config.visibleItems;
        }
        renderVisibleImages(startIndex);
    }

    // Listen for window resize
    window.addEventListener('resize', function() {
        if (!isAnimating) {
            updateVisibleItems();
        }
    });

    // Event listeners
    prevBtn.addEventListener('click', function() {
        if (isAnimating) return;
        slideWithIndividualFading('prev');
    });

    nextBtn.addEventListener('click', function() {
        if (isAnimating) return;
        slideWithIndividualFading('next');
    });

    function renderVisibleImages(startIdx) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.position = 'relative';
        carouselItem.style.overflow = 'hidden';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';
        imageGroup.style.display = 'flex';
        imageGroup.style.flexWrap = 'nowrap';
        imageGroup.style.gap = '1rem';

        for (let i = 0; i < visibleItems; i++) {
            const index = (startIdx + i) % config.totalImages;
            const img = document.createElement('img');
            img.src = `${config.basePath}texture${index + 1}.${config.fileExtension}`;
            img.alt = `Texture ${index + 1}`;
            img.dataset.index = index;
            img.loading = 'lazy';
            img.width = config.imageWidth;
            img.height = config.imageHeight;

            // Apply flex sizing based on number of visible items
            if (visibleItems === 3) {
                img.style.flex = '0 0 calc(33.333% - 0.667rem)';
            } else if (visibleItems === 2) {
                img.style.flex = '0 0 calc(50% - 0.5rem)';
            } else {
                img.style.flex = '0 0 100%';
            }

            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        carousel.appendChild(carouselItem);
    }

    function slideWithIndividualFading(direction) {
        isAnimating = true;

        // Calculate new start index
        let newStartIndex;
        if (direction === 'next') {
            newStartIndex = (startIndex + 1) % config.totalImages;
        } else {
            newStartIndex = (startIndex - 1 + config.totalImages) % config.totalImages;
        }

        // Get current container and images
        const currentContainer = carousel.querySelector('.carousel-item');
        const imageGroup = currentContainer.querySelector('.carousel-item-group');
        const currentImages = Array.from(imageGroup.querySelectorAll('img'));

        // Calculate position shift based on number of visible items
        let positionShift;
        if (visibleItems === 3) {
            positionShift = '33.333%';
        } else if (visibleItems === 2) {
            positionShift = '50%';
        } else {
            positionShift = '100%';
        }

        // Determine which image is leaving and needs to fade out
        let leavingImageIndex, newImageIndex;
        if (direction === 'next') {
            // First image leaves, new image comes at the end
            leavingImageIndex = parseInt(currentImages[0].dataset.index);
            newImageIndex = (newStartIndex + visibleItems - 1) % config.totalImages;
        } else {
            // Last image leaves, new image comes at the beginning
            leavingImageIndex = parseInt(currentImages[currentImages.length - 1].dataset.index);
            newImageIndex = newStartIndex;
        }

        // Find the leaving image and apply fade-out
        const leavingImage = currentImages.find(img => parseInt(img.dataset.index) === leavingImageIndex);
        if (leavingImage) {
            leavingImage.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
            leavingImage.style.opacity = '0';

            if (direction === 'next') {
                // Move the leaving image left
                leavingImage.style.transform = `translateX(-${positionShift})`;
            } else {
                // Move the leaving image right
                leavingImage.style.transform = `translateX(${positionShift})`;
            }
        }

        // Create new image that will enter
        const newImg = document.createElement('img');
        newImg.src = `${config.basePath}texture${newImageIndex + 1}.${config.fileExtension}`;
        newImg.alt = `Texture ${newImageIndex + 1}`;
        newImg.dataset.index = newImageIndex;
        newImg.loading = 'lazy';
        newImg.width = config.imageWidth;
        newImg.height = config.imageHeight;
        newImg.style.opacity = '0';
        newImg.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';

        // Apply flex sizing based on number of visible items
        if (visibleItems === 3) {
            newImg.style.flex = '0 0 calc(33.333% - 0.667rem)';
        } else if (visibleItems === 2) {
            newImg.style.flex = '0 0 calc(50% - 0.5rem)';
        } else {
            newImg.style.flex = '0 0 100%';
        }

        // Position the new image
        if (direction === 'next') {
            // Position new image to come from right
            newImg.style.transform = `translateX(${positionShift})`;
            imageGroup.appendChild(newImg);
        } else {
            // Position new image to come from left
            newImg.style.transform = `translateX(-${positionShift})`;
            imageGroup.insertBefore(newImg, imageGroup.firstChild);
        }

        // For remaining images that stay visible, apply only position shift
        currentImages.forEach(img => {
            // Skip the leaving image, already handled
            if (parseInt(img.dataset.index) === leavingImageIndex) return;

            // Apply transition to remaining images (just position, not opacity)
            img.style.transition = 'transform 0.5s ease-in-out';

            // Move each remaining image by exactly one position
            if (direction === 'next') {
                img.style.transform = `translateX(-${positionShift})`;
            } else {
                img.style.transform = `translateX(${positionShift})`;
            }
        });

        // Force reflow to ensure transitions start properly
        void newImg.offsetWidth;

        // Start the transitions
        newImg.style.opacity = '1';
        newImg.style.transform = 'translateX(0)';

        // After animation completes
        setTimeout(() => {
            // Update the start index
            startIndex = newStartIndex;
            // Recreate the carousel with the new start index
            renderVisibleImages(startIndex);
            isAnimating = false;
        }, 500);
    }
}

/**
 * Initialize a carousel where only one image is shown per slide
 */
function initializeSingleImageCarousel(config) {
    const carousel = document.getElementById(config.carouselId);
    const prevBtn = document.getElementById(config.prevBtnId);
    const nextBtn = document.getElementById(config.nextBtnId);

    let currentIndex = 0;
    let isAnimating = false;

    // Initial render
    renderImage(currentIndex);

    // Event listeners
    prevBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextIndex = (currentIndex - 1 + config.totalImages) % config.totalImages;
        animateCarousel(currentIndex, nextIndex, 'prev');
        currentIndex = nextIndex;
    });

    nextBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextIndex = (currentIndex + 1) % config.totalImages;
        animateCarousel(currentIndex, nextIndex, 'next');
        currentIndex = nextIndex;
    });

    function renderImage(index) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const img = document.createElement('img');
        img.src = `${config.basePath}panorama${index + 1}.${config.fileExtension}`;
        img.alt = `Panorama ${index + 1}`;
        img.loading = 'lazy';
        img.width = config.imageWidth;
        img.height = config.imageHeight;

        carouselItem.appendChild(img);
        carousel.appendChild(carouselItem);
    }

    function createImage(index) {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const img = document.createElement('img');
        img.src = `${config.basePath}panorama${index + 1}.${config.fileExtension}`;
        img.alt = `Panorama ${index + 1}`;
        img.loading = 'lazy';
        img.width = config.imageWidth;
        img.height = config.imageHeight;

        carouselItem.appendChild(img);
        return carouselItem;
    }

    function animateCarousel(currentIdx, nextIdx, direction) {
        isAnimating = true;

        // Get the current item
        const currentItem = carousel.querySelector('.carousel-item');

        // Create the next item
        const nextItem = createImage(nextIdx);

        // Add appropriate classes for animation
        if (direction === 'next') {
            nextItem.classList.add('slide-next-in');
            currentItem.classList.add('slide-next-out');
        } else {
            nextItem.classList.add('slide-prev-in');
            currentItem.classList.add('slide-prev-out');
        }

        // Add the next item to the carousel
        carousel.appendChild(nextItem);

        // Force reflow to ensure transitions work
        void nextItem.offsetWidth;

        // Start the animation
        nextItem.classList.add('active');

        // Clean up after animation completes
        setTimeout(() => {
            carousel.removeChild(currentItem);
            nextItem.classList.remove('slide-next-in', 'slide-prev-in', 'active');
            isAnimating = false;
        }, 500);
    }
}