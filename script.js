/**
 * Configuration
 */
const CONFIG = {
    folderNames: [
        'HON-1. Bamboo to Chairs',
        'HON-2. Chairs to Lamps',
        'HON-3. Lamps to Brand Text'
    ],
    framesPerSection: 192,
    imagePrefix: 'frame_',
    imageExtension: '.webp',
    totalSections: 3
};

/**
 * State
 */
const state = {
    images: [],
    imagesLoaded: 0,
    totalImages: CONFIG.totalSections * CONFIG.framesPerSection,
    currentSection: 0,
    currentFrame: 0,
    canvas: null,
    ctx: null,
    width: 0,
    height: 0
};

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Force scroll to top on reload
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Initial render attempt (if first image is cached/fast)
    // We'll also rely on the first image's onload to trigger render
    state.canvas = document.getElementById('hero-canvas');
    if (!state.canvas) return;
    state.ctx = state.canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll);

    preloadImages();
});

/**
 * Image Preloading
 */
function preloadImages() {
    console.log('[DEBUG] Starting Image Preloading...');
    for (let s = 0; s < CONFIG.totalSections; s++) {
        state.images[s] = [];
        for (let f = 0; f < CONFIG.framesPerSection; f++) {
            const img = new Image();
            // Pad frame number with leading zeros (e.g., 001)
            const frameStr = (f + 1).toString().padStart(3, '0');
            // Construct path based on folder and naming convention
            // Note: Adjust the filename pattern if your files are named differently (e.g., frame_001.webp vs frame_001_delay...)
            // Based on previous file list, it seems clean: frame_001.webp or similar?
            // Actually, let's verify file names in a moment. 
            // For now assuming: folder/frame_XXX.webp as per CONFIG
            img.src = `${CONFIG.folderNames[s]}/${CONFIG.imagePrefix}${frameStr}${CONFIG.imageExtension}`;

            img.onload = () => {
                state.imagesLoaded++;

                // Render immediately if it's the very first frame of first section
                if (s === 0 && f === 0) {
                    render();
                }

                if (state.imagesLoaded === state.totalImages) {
                    console.log('All images loaded');
                    // render(); // Already rendering on scroll/first frame, but good to ensure
                }
            };
            img.onerror = (e) => console.warn(`Failed to load: ${img.src}`, e);
            state.images[s][f] = img;
        }
    }
}

/**
 * Resize Handling - High DPI Support
 */
function resize() {
    const dpr = window.devicePixelRatio || 1;

    // Logical dimensions
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    state.width = window.innerWidth;
    state.height = window.innerHeight - navbarHeight;

    // Set actual canvas size to physical pixels
    state.canvas.width = state.width * dpr;
    state.canvas.height = state.height * dpr;

    // Ensure CSS matches logical dimensions
    state.canvas.style.width = `${state.width}px`;
    state.canvas.style.height = `${state.height}px`;
    state.canvas.style.top = `${navbarHeight}px`;

    // Scale context to ensure drawing operations use logical coordinates
    state.ctx.scale(dpr, dpr);

    // Force sharper image rendering if possible (optional, but good for pixel art or sharp edges)
    // state.ctx.imageSmoothingEnabled = true; 
    // state.ctx.imageSmoothingQuality = 'high';

    render();
}

/**
 * Scroll Logic
 */
function handleScroll() {
    const scrollY = window.scrollY;

    // Calculate maxScroll based only on the scroll-container height
    // This ensures the animation completes fully before Best Sellers section
    const scrollContainer = document.querySelector('.scroll-container');
    const containerHeight = scrollContainer ? scrollContainer.offsetHeight : document.body.scrollHeight;

    // Total scrollable distance
    const totalScrollRange = containerHeight - window.innerHeight;

    // We want a buffer at the end where animation holds 
    // Corresponds to the padding-bottom added in CSS (approx 25vh)
    const buffer = window.innerHeight * 0.25;

    // The animation should finish BEFORE the buffer
    const animationScrollRange = totalScrollRange - buffer;

    // Normalize scroll 0 to 1 based on the SHORTER range
    let progress = scrollY / animationScrollRange;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Total frames across all sections
    const totalFrames = CONFIG.totalSections * CONFIG.framesPerSection;

    // Calculate global frame index
    let globalFrameIndex = Math.floor(progress * (totalFrames - 1));

    // Determine section and local frame
    state.currentSection = Math.floor(globalFrameIndex / CONFIG.framesPerSection);
    state.currentFrame = globalFrameIndex % CONFIG.framesPerSection;

    if (state.currentSection >= CONFIG.totalSections) {
        state.currentSection = CONFIG.totalSections - 1;
        state.currentFrame = CONFIG.framesPerSection - 1;
    }

    requestAnimationFrame(render);
}

/**
 * Rendering
 */
function render() {
    if (!state.ctx) return;

    // Clear canvas
    state.ctx.clearRect(0, 0, state.width, state.height);

    // Check image array
    if (!state.images[state.currentSection]) {
        return;
    }

    // Safety check for frame index
    const frameIndex = state.currentFrame || 0;
    const img = state.images[state.currentSection][frameIndex];

    if (img && img.complete && img.naturalWidth !== 0) {
        // "Cover" fit logic
        const aspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = state.width / state.height;

        let drawW, drawH, offsetX, offsetY;

        if (canvasAspect > aspect) {
            drawW = state.width;
            drawH = state.width / aspect;
            offsetX = 0;
            offsetY = (state.height - drawH) / 2;
        } else {
            drawW = state.height * aspect;
            drawH = state.height;
            offsetX = (state.width - drawW) / 2;
            offsetY = 0;
        }

        state.ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    } else {
        // If image not ready, try to draw previous frame?
        // Or show a placeholder?
        // For now, let's just log if it's missing IF we are expecting it
    }
}

/**
 * Dynamic Product Loading & Interaction Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration & State ---
    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- DOM Elements ---
    const bestSellerGrid = document.getElementById('best-seller-grid');
    const giftTrack = document.getElementById('giftTrack');

    // Modal Elements
    const fullPageModal = document.getElementById('product-full-page');
    const closeBtn = document.getElementById('close-full-page-btn');
    const fullPageImage = document.getElementById('full-page-product-image');
    const fullPageTitle = document.getElementById('full-page-product-title');
    const fullPagePrice = document.getElementById('full-page-product-price');
    const qtyInput = document.getElementById('qty-input-full');
    const qtyMinus = document.getElementById('qty-minus-full');
    const qtyPlus = document.getElementById('qty-plus-full');
    const addToCartBtn = document.getElementById('add-to-cart-btn-full');
    const buyNowBtn = document.getElementById('buy-now-btn-full');

    // Gallery Elements
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const itemsContainer = document.querySelector('.gallery-thumbnails');

    // Cart & Nav Elements
    const cartCountEl = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const menuBtn = document.getElementById('menu-btn');
    const leftPanel = document.getElementById('left-side-panel');
    const closeLeftBtn = document.getElementById('close-left-panel-btn');
    const overlay = document.getElementById('overlay');

    // Current Product State
    let currentProduct = null;
    let currentImageIndex = 0;
    let productImages = [];

    // --- Initialization ---
    await initializeCart(); // Load user-specific cart first
    updateCartIcon();
    setupNavEvents();
    setupCartEvents();
    setupModalEvents();

    // Fetch and render LAST to ensure elements are ready and listeners can be attached
    await fetchAndRenderProducts();
    setupCarousel();

    // --- Functions ---

    async function fetchAndRenderProducts() {
        try {
            // Try fetching from API first, fallback to file if needed (though API is preferred)
            const response = await fetch('/api/products');
            if (response.ok) {
                allProducts = await response.json();
            } else {
                // Should not happen if server.py is running, but handling mainly for robustness
                const res = await fetch('products.json');
                allProducts = await res.json();
            }
            console.log('Products loaded:', allProducts.length); // DEBUG
        } catch (error) {
            console.error("Error loading products:", error);
            // Optional: Show error on UI
            return;
        }

        // Render Best Sellers
        if (bestSellerGrid) {
            // Filter logic can be added here. For now, using all valid products.
            // If specific IDs are best sellers, we can add a flag in JSON.
            // Assuming first 8 or tagged 'isBestSeller'
            const bestSellers = allProducts.filter(p => p.isBestSeller).slice(0, 8);
            bestSellerGrid.innerHTML = bestSellers.map(p => createProductCardHTML(p)).join('');
        }

        // Render Carousel (Bamboo Gifts)
        if (giftTrack) {
            // Filter by isBambooGift
            const bambooGifts = allProducts.filter(p => p.isBambooGift);
            giftTrack.innerHTML = bambooGifts.map(p => createProductCardHTML(p, true)).join('');
        }

        // Render Category Page Grids
        const categoryGrid = document.getElementById('product-grid');
        if (categoryGrid && categoryGrid.dataset.category) {
            const category = categoryGrid.dataset.category;
            const categoryProducts = allProducts.filter(p => p.category === category);
            categoryGrid.innerHTML = categoryProducts.map(p => createProductCardHTML(p)).join('');
        }
    }

    function createProductCardHTML(product, isCarousel = false) {
        // Ensure images exist
        const defaultImg = product.images[0] || 'placeholder.png';
        const hoverImg = product.images[1] || defaultImg;

        const cardHtml = `
            <div class="product-card ${isCarousel ? 'carousel-card' : ''}" data-id="${product.id}" onclick="openProductModal('${product.id}')">
                <div class="product-image">
                    <img src="${defaultImg}" alt="${product.title}" class="img-default">
                    <img src="${hoverImg}" alt="${product.title} Hover" class="img-hover">
                </div>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">₹ ${product.price.toFixed(2)}</p>
            </div>
        `;
        return cardHtml;
    }

    // Event Delegation for Product Cards (Handles both initial and dynamic content)
    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.getAttribute('data-id');
            // Redundant if onclick is present, but good for safety
            window.location.href = `product-details.html?id=${productId}`;
        }
    });

    window.openProductModal = function (productId) {
        console.log('Navigating to product page for:', productId);
        window.location.href = `product-details.html?id=${productId}`;
    };

    // Kept for backward compatibility if called elsewhere, but we prefer navigation now.
    function openFullPageModal(product) {
        // Redirecting even if this internal function is called
        window.location.href = `product-details.html?id=${product.id}`;
    }

    // --- Carousel Logic ---
    function setupCarousel() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        if (!giftTrack || !prevBtn || !nextBtn) return;

        let currentSlide = 0;
        // 4 visible items per view on desktop usually.
        // If we have 8 items, slides = 2.
        // We can make this dynamic.
        const itemsPerView = 4; // Simplified
        const totalSlides = Math.ceil(allProducts.length / itemsPerView);

        function updateCarouselView() {
            const percentage = currentSlide * -100;
            giftTrack.style.transform = `translateX(${percentage}%)`;

            prevBtn.style.display = currentSlide === 0 ? 'none' : 'flex';
            nextBtn.style.display = currentSlide >= totalSlides - 1 ? 'none' : 'flex';
        }

        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateCarouselView();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateCarouselView();
            }
        });

        // Initial state
        updateCarouselView();
    }

    // --- Toast Notification Logic ---
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 10000;
                display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'error' ? '#ffdddd' : '#333'};
            color: ${type === 'error' ? '#d8000c' : '#fff'};
            padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: 'Outfit', sans-serif; opacity: 0; transform: translateY(20px);
            transition: all 0.3s ease; min-width: 250px;
        `;
        toast.innerText = message;

        container.appendChild(toast);

        // Animate In
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Modal Logic ---
    function setupModalEvents() {
        if (closeBtn) closeBtn.addEventListener('click', closeFullPage);

        // Gallery Nav
        if (galleryNext) galleryNext.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % productImages.length;
            updateGallery();
        });

        if (galleryPrev) galleryPrev.addEventListener('click', () => {
            // Correct modulo for negative numbers
            currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
            updateGallery();
        });

        // Quantity
        if (qtyMinus) qtyMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) {
                qtyInput.value = val - 1;
                currentProduct.quantity = val - 1;
            }
        });

        if (qtyPlus) qtyPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            qtyInput.value = val + 1;
            currentProduct.quantity = val + 1;
        });

        // Add to Cart
        if (addToCartBtn) addToCartBtn.addEventListener('click', () => {
            if (!currentProduct) return;
            const existingItemIndex = cart.findIndex(item => item.title === currentProduct.title);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += currentProduct.quantity;
            } else {
                cart.push({
                    title: currentProduct.title,
                    price: currentProduct.price,
                    image: currentProduct.images[0],
                    quantity: currentProduct.quantity
                });
            }
            saveCart();
            closeFullPage();
            showToast('Added to cart successfully!');
        });

        if (buyNowBtn) buyNowBtn.addEventListener('click', () => showToast('Proceeding to checkout...'));
    }

    function closeFullPage() {
        fullPageModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function updateGallery() {
        const currentSrc = productImages[currentImageIndex];
        if (currentSrc) {
            fullPageImage.src = currentSrc;
            fullPageImage.style.opacity = '1';
        } else {
            fullPageImage.src = '';
            fullPageImage.style.opacity = '0';
        }
        renderThumbnails();
    }

    function renderThumbnails() {
        if (!itemsContainer) return;
        itemsContainer.innerHTML = '';
        productImages.forEach((src, index) => {
            const thumb = document.createElement('div');
            thumb.className = `thumb ${index === currentImageIndex ? 'active' : ''}`;
            if (src) {
                const img = document.createElement('img');
                img.src = src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                thumb.appendChild(img);
            } else {
                thumb.classList.add('placeholder');
            }
            thumb.addEventListener('click', () => {
                currentImageIndex = index;
                updateGallery();
            });
            itemsContainer.appendChild(thumb);
        });
    }

    // --- Cart & Nav Logic ---
    // --- Cart & Nav Logic ---
    function setupCartEvents() {
        if (cartBtn) cartBtn.addEventListener('click', () => window.location.href = 'cart.html');
    }

    /*
     * STRICT AUTH & CART LOGIC
     * 1. Guest: LocalStorage only ('guestCart').
     * 2. LoggedIn: Server Source of Truth.
     *    - On Login: Fetch from server -> Overwrite Local.
     *    - On Action: Update Local -> Sync Server.
     *    - On Logout: Clear Local.
     */

    async function initializeCart() {
        const userToken = localStorage.getItem('userToken');

        if (userToken) {
            // USER MODE
            try {
                // Fetch User Cart from Server (Source of Truth)
                const response = await fetch(`/api/user/cart/load?userId=${userToken}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // REPLACES any local state with Server state
                        cart = data.cart || [];
                        localStorage.setItem('cart', JSON.stringify(cart)); // Persist for this session/refresh
                        console.log('[Auth] User cart loaded from server:', cart.length, 'items');
                    }
                } else {
                    console.warn('[Auth] Failed to load user cart, clearing local to avoid stale data.');
                    // If server fetch fails, we should probably start empty or retry, 
                    // but to look "production-grade" and safe, we might default to empty 
                    // rather than showing potentially wrong data.  
                    // However, for robustness, we'll keep what's in local if it matches user expectation (offline mode?),
                    // BUT requirement says "Login... replaces any local cart".
                    // So we assume local might be stale if server fetch failed? 
                    // Let's rely on cached 'cart' in localStorage IF it was saved while logged in.
                    cart = JSON.parse(localStorage.getItem('cart')) || [];
                }
            } catch (error) {
                console.error('[Auth] Error loading user cart:', error);
                cart = JSON.parse(localStorage.getItem('cart')) || [];
            }
        } else {
            // GUEST MODE
            // Load from 'guestCart' to ensure it survives refresh but doesn't leak to users.
            // Note: script.js previously used 'cart' key for everything.
            // To separate cleanly:
            // - We will use 'cart' as the active key for the CURRENT session (Guest or User).
            // - But on Logout, we wipe 'cart'. 
            // - Guests rely on 'cart' persisting.
            // - Users rely on Server.

            // So 'cart' key in localStorage IS the Guest Cart when no token is present.
            cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('[Auth] Guest cart loaded:', cart.length, 'items');
        }
        updateCartIcon();
    }

    function saveCart() {
        // ALWAYS update local display/storage first for UI responsiveness
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartIcon();

        // If User, SYNC to Server
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            syncCartToServer();
        }
    }

    async function syncCartToServer() {
        const userToken = localStorage.getItem('userToken');
        if (!userToken) return;

        try {
            await fetch('/api/user/cart/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userToken,
                    cart: cart
                })
            });
            console.log('[Auth] Cart synced to server');
        } catch (error) {
            console.error('[Auth] Error syncing cart:', error);
        }
    }

    // --- Search & Auth Logic ---
    // Search Logic
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const closeSearch = document.getElementById('close-search');

    if (searchBtn && searchContainer) {
        searchBtn.addEventListener('click', () => {
            searchContainer.style.display = 'flex';
            searchInput.focus();
        });

        closeSearch.addEventListener('click', () => {
            searchContainer.style.display = 'none';
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // Account Logic
    const accountBtn = document.getElementById('account-btn');
    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
});
