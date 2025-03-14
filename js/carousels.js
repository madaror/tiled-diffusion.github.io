document.addEventListener('DOMContentLoaded', function() {
    // Configuration for Many-to-Many carousel (2 images per slide)
    const manyToManyConfig = {
        carouselId: 'many-to-many-carousel',
        prevBtnId: 'many-to-many-prev',
        nextBtnId: 'many-to-many-next',
        imagesPerSlide: 2,
        basePath: 'images/many-to-many/',
        // Format: set1-img1.png, set1-img2.png, set2-img1.png, etc.
        totalSets: 4, // Changed from 3 to 4 sets
        fileExtension: 'png'
    };

    // Configuration for Texture carousel (3 images visible, 1 changes at a time)
    const textureConfig = {
        carouselId: 'texture-carousel',
        prevBtnId: 'texture-prev',
        nextBtnId: 'texture-next',
        visibleItems: 3,
        basePath: 'images/textures/',
        totalImages: 9, // Change this based on how many texture GIFs you have
        fileExtension: 'gif'
    };

    // Configuration for Panorama carousel (1 image per slide)
    const panoramaConfig = {
        carouselId: 'panorama-carousel',
        prevBtnId: 'panorama-prev',
        nextBtnId: 'panorama-next',
        basePath: 'images/panorama/',
        totalImages: 5, // Change this based on how many panorama GIFs you have
        fileExtension: 'gif'
    };

    // Initialize Many-to-Many carousel (group slides)
    initializeGroupCarousel(manyToManyConfig);

    // Initialize Texture carousel (sliding window)
    initializeSlidingWindowCarousel(textureConfig);

    // Initialize Panorama carousel (single image per slide)
    initializeSingleImageCarousel(panoramaConfig);
});

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
    let imagesPerSlide = config.imagesPerSlide;

    // Adjust images per slide based on screen width
    function updateImagesPerSlide() {
        if (window.innerWidth <= 768) {
            imagesPerSlide = 1;
        } else {
            imagesPerSlide = config.imagesPerSlide;
        }
        renderImageSet(currentSetIndex);
    }

    // Initial setup
    updateImagesPerSlide();

    // Listen for window resize
    window.addEventListener('resize', updateImagesPerSlide);

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
    });

    function renderImageSet(setIndex) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';

        for (let i = 1; i <= imagesPerSlide; i++) {
            const img = document.createElement('img');
            img.src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
            img.alt = `Set ${setIndex + 1} Image ${i}`;
            img.loading = 'lazy';
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

        for (let i = 1; i <= imagesPerSlide; i++) {
            const img = document.createElement('img');
            img.src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
            img.alt = `Set ${setIndex + 1} Image ${i}`;
            img.loading = 'lazy';
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

    // Initial setup
    updateVisibleItems();

    // Listen for window resize
    window.addEventListener('resize', function() {
        if (!isAnimating) {
            updateVisibleItems();
        }
    });

    // Event listeners
    prevBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextStartIndex = (startIndex - 1 + config.totalImages) % config.totalImages;
        animateCarousel(startIndex, nextStartIndex, 'prev');
        startIndex = nextStartIndex;
    });

    nextBtn.addEventListener('click', function() {
        if (isAnimating) return;

        const nextStartIndex = (startIndex + 1) % config.totalImages;
        animateCarousel(startIndex, nextStartIndex, 'next');
        startIndex = nextStartIndex;
    });

    function renderVisibleImages(startIdx) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.width = '100%';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';
        imageGroup.style.width = '100%';
        imageGroup.style.display = 'flex';
        imageGroup.style.flexWrap = 'wrap';

        for (let i = 0; i < visibleItems; i++) {
            const index = (startIdx + i) % config.totalImages;
            const img = document.createElement('img');
            img.src = `${config.basePath}texture${index + 1}.${config.fileExtension}`;
            img.alt = `Texture ${index + 1}`;
            img.loading = 'lazy';

            // Ensure proper sizing based on number of visible items
            if (visibleItems === 3) {
                img.style.flexBasis = 'calc(33.333% - 0.667rem)';
                img.style.minWidth = 'calc(33.333% - 0.667rem)';
            } else if (visibleItems === 2) {
                img.style.flexBasis = 'calc(50% - 0.5rem)';
                img.style.minWidth = 'calc(50% - 0.5rem)';
            } else {
                img.style.flexBasis = '100%';
                img.style.minWidth = '100%';
            }

            img.style.flexGrow = '1';
            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        carousel.appendChild(carouselItem);
    }

    function createImageSet(startIdx) {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.width = '100%';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';
        imageGroup.style.width = '100%';
        imageGroup.style.display = 'flex';
        imageGroup.style.flexWrap = 'wrap';

        for (let i = 0; i < visibleItems; i++) {
            const index = (startIdx + i) % config.totalImages;
            const img = document.createElement('img');
            img.src = `${config.basePath}texture${index + 1}.${config.fileExtension}`;
            img.alt = `Texture ${index + 1}`;
            img.loading = 'lazy';

            // Ensure proper sizing based on number of visible items
            if (visibleItems === 3) {
                img.style.flexBasis = 'calc(33.333% - 0.667rem)';
                img.style.minWidth = 'calc(33.333% - 0.667rem)';
            } else if (visibleItems === 2) {
                img.style.flexBasis = 'calc(50% - 0.5rem)';
                img.style.minWidth = 'calc(50% - 0.5rem)';
            } else {
                img.style.flexBasis = '100%';
                img.style.minWidth = '100%';
            }

            img.style.flexGrow = '1';
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