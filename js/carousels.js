document.addEventListener('DOMContentLoaded', function() {
    // Configuration for Many-to-Many carousel (3 images per slide)
    const manyToManyConfig = {
        carouselId: 'many-to-many-carousel',
        prevBtnId: 'many-to-many-prev',
        nextBtnId: 'many-to-many-next',
        imagesPerSlide: 3,
        basePath: 'images/many-to-many/',
        // Format: set1-img1.png, set1-img2.png, set1-img3.png, set2-img1.png, etc.
        totalSets: 3, // Change this based on how many sets you have
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

    // Initial render
    renderImageSet(currentSetIndex);

    // Event listeners
    prevBtn.addEventListener('click', function() {
        currentSetIndex = (currentSetIndex - 1 + config.totalSets) % config.totalSets;
        renderImageSet(currentSetIndex);
    });

    nextBtn.addEventListener('click', function() {
        currentSetIndex = (currentSetIndex + 1) % config.totalSets;
        renderImageSet(currentSetIndex);
    });

    function renderImageSet(setIndex) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';
        imageGroup.style.display = 'flex';
        imageGroup.style.gap = '10px';
        imageGroup.style.justifyContent = 'center';

        for (let i = 1; i <= config.imagesPerSlide; i++) {
            const img = document.createElement('img');
            img.src = `${config.basePath}set${setIndex + 1}-img${i}.${config.fileExtension}`;
            img.alt = `Set ${setIndex + 1} Image ${i}`;
            img.loading = 'lazy';
            img.style.width = 'calc((100% - 20px) / 3)'; // Distribute width evenly among 3 images
            img.style.height = 'auto';
            img.style.objectFit = 'cover';
            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        carousel.appendChild(carouselItem);
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

    // Initial render
    renderVisibleImages(startIndex);

    // Event listeners
    prevBtn.addEventListener('click', function() {
        startIndex = (startIndex - 1 + config.totalImages) % config.totalImages;
        renderVisibleImages(startIndex);
    });

    nextBtn.addEventListener('click', function() {
        startIndex = (startIndex + 1) % config.totalImages;
        renderVisibleImages(startIndex);
    });

    function renderVisibleImages(startIdx) {
        carousel.innerHTML = '';

        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';

        const imageGroup = document.createElement('div');
        imageGroup.className = 'carousel-item-group';

        for (let i = 0; i < config.visibleItems; i++) {
            const index = (startIdx + i) % config.totalImages;
            const img = document.createElement('img');
            img.src = `${config.basePath}texture${index + 1}.${config.fileExtension}`;
            img.alt = `Texture ${index + 1}`;
            img.loading = 'lazy';
            imageGroup.appendChild(img);
        }

        carouselItem.appendChild(imageGroup);
        carousel.appendChild(carouselItem);
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

    // Initial render
    renderImage(currentIndex);

    // Event listeners
    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + config.totalImages) % config.totalImages;
        renderImage(currentIndex);
    });

    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % config.totalImages;
        renderImage(currentIndex);
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
}