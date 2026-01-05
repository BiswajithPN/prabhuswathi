// Gallery page functionality

const albumData = {
    'traditional': {
        name: 'Reception Images',
        description: 'Reception and celebration moments',
        folder: 'traditional',
        count: 1886
    },
    'candid': {
        name: 'Marriage Images',
        description: 'Marriage ceremony and special moments',
        folder: 'candid',
        count: 1374
    },
    'ceremony': {
        name: 'Ceremony',
        description: 'Our sacred vows and beautiful ceremony moments',
        folder: 'ceremony',
        count: 0
    },
    'reception': {
        name: 'Reception',
        description: 'Dancing, dinner, and celebration',
        folder: 'reception',
        count: 0
    },
    'couple-portraits': {
        name: 'Couple Portraits',
        description: 'Intimate moments together',
        folder: 'couple-portraits',
        count: 0
    }
};

let currentAlbum = null;
let currentImageIndex = 0;
let currentImages = [];
let imageManifest = null;

document.addEventListener('DOMContentLoaded', function() {
    loadImageManifest().then(() => {
        loadFeaturedImages();
        loadAllImages();
        setupLightbox();
    });
});

function loadImageManifest() {
    return fetch('images/image-manifest.json')
        .then(response => response.json())
        .then(data => {
            imageManifest = data;
            return data;
        })
        .catch(error => {
            console.error('Error loading image manifest:', error);
            return null;
        });
}

function loadFeaturedImages() {
    const featuredGrid = document.getElementById('featuredImagesGrid');
    const featuredSection = document.getElementById('featuredSection');
    if (!featuredGrid || !featuredSection) return;
    
    // Check if featured folder exists and has images
    if (imageManifest && imageManifest.albums && imageManifest.albums.featured && imageManifest.albums.featured.images.length > 0) {
        const featuredImages = imageManifest.albums.featured.images;
        
        featuredImages.forEach((imageName, index) => {
            const imagePath = `images/albums/featured/${imageName}`;
            createFeaturedImageCard(imagePath, index, featuredGrid);
        });
        
        featuredSection.style.display = 'block';
    } else {
        // Hide featured section if no images
        featuredSection.style.display = 'none';
    }
}

function createFeaturedImageCard(imagePath, index, container) {
    const card = document.createElement('div');
    card.className = 'featured-image-card';
    
    card.innerHTML = `
        <div class="featured-badge">Featured</div>
        <img src="${imagePath}" alt="Featured moment ${index + 1}" class="featured-image" onerror="this.style.display='none'" loading="lazy">
    `;
    
    card.addEventListener('click', () => {
        // Open in lightbox
        if (imageManifest && imageManifest.albums && imageManifest.albums.featured) {
            const featuredImages = imageManifest.albums.featured.images.map(img => `images/albums/featured/${img}`);
            currentImages = featuredImages;
            currentImageIndex = index;
            showLightbox(featuredImages[index], index);
        }
    });
    
    container.appendChild(card);
}

function loadAllImages() {
    const allImagesGrid = document.getElementById('allImagesGrid');
    if (!allImagesGrid) return;
    
    allImagesGrid.innerHTML = '<div class="loading">Loading all wedding photos...</div>';
    
    if (imageManifest && imageManifest.albums) {
        let allImages = [];
        let imageIndex = 0;
        
        // Collect all images from all albums
        Object.keys(imageManifest.albums).forEach(albumKey => {
            const album = imageManifest.albums[albumKey];
            if (album && album.images && album.images.length > 0) {
                album.images.forEach(imageName => {
                    allImages.push({
                        path: `images/albums/${albumKey}/${imageName}`,
                        album: albumKey,
                        index: imageIndex++
                    });
                });
            }
        });
        
        // Shuffle all images for variety
        shuffleArray(allImages);
        
        // Clear loading message
        allImagesGrid.innerHTML = '';
        
        // Create image cards
        allImages.forEach((imageData, displayIndex) => {
            createImageCard(imageData.path, displayIndex, allImages.map(img => img.path), allImagesGrid);
        });
        
        // Update global currentImages for lightbox navigation
        currentImages = allImages.map(img => img.path);
    }
}

function createImageCard(imagePath, index, allImagePaths, container) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    card.innerHTML = `
        <img src="${imagePath}" alt="Wedding photo ${index + 1}" class="gallery-image" onerror="this.style.display='none'" loading="lazy">
    `;
    
    card.addEventListener('click', () => {
        currentImages = allImagePaths;
        currentImageIndex = index;
        showLightbox(imagePath, index);
    });
    
    container.appendChild(card);
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateImage(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateImage(1));
    }
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateImage(-1);
            if (e.key === 'ArrowRight') navigateImage(1);
        }
    });
}

function showLightbox(imagePath, index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const caption = lightbox.querySelector('.lightbox-caption');
    
    if (!lightbox || !lightboxImage) return;
    
    lightboxImage.src = imagePath;
    lightboxImage.alt = `Image ${index + 1} of ${currentImages.length}`;
    
    if (caption) {
        caption.textContent = `${index + 1} / ${currentImages.length}`;
    }
    
    lightbox.classList.add('active');
    currentImageIndex = index;
    
    // Update navigation buttons visibility
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    if (prevBtn) prevBtn.style.display = index > 0 ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = index < currentImages.length - 1 ? 'block' : 'none';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
}

function navigateImage(direction) {
    if (currentImages.length === 0) return;
    
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }
    
    showLightbox(currentImages[currentImageIndex], currentImageIndex);
}

// Helper function to get image list from album folder
// This would typically be done server-side
function getImageListFromFolder(folder) {
    // In a real implementation, this would make an API call to list files
    // For now, return empty array - this needs server-side support
    return [];
}


