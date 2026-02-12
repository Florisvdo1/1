/**
 * Thumbnail Manager for OEVER.ART
 * Loads and applies artwork thumbnails from thumbnails.json
 */

(function() {
  'use strict';

  // Thumbnail cache loaded from JSON
  const THUMBNAIL_MAP = {
    "https://www.werkaandemuur.nl/nl/werk/Meisje-met-bloemen/694349": "https://cdn.werkaandemuur.nl/694349_meisje-met-bloemen_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-fijnste-kleuren/864691": "https://cdn.werkaandemuur.nl/864691_het-meisje-met-de-fijnste-kleuren_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Portret-van-een-man/826273": "https://cdn.werkaandemuur.nl/826273_portret-van-een-man_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Meisje-met-de-vlinders/857847": "https://cdn.werkaandemuur.nl/857847_meisje-met-de-vlinders_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Vrouw-met-rode-bloemen/858102": "https://cdn.werkaandemuur.nl/858102_vrouw-met-rode-bloemen_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-krullen/863445": "https://cdn.werkaandemuur.nl/863445_het-meisje-met-de-krullen_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Meisje-in-het-blauw/865201": "https://cdn.werkaandemuur.nl/865201_meisje-in-het-blauw_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/De-vrouw-met-de-gouden-oorbel/860788": "https://cdn.werkaandemuur.nl/860788_de-vrouw-met-de-gouden-oorbel_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Botanisch-meisje/862834": "https://cdn.werkaandemuur.nl/862834_botanisch-meisje_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Vrouw-met-de-paarse-bloemen/864088": "https://cdn.werkaandemuur.nl/864088_vrouw-met-de-paarse-bloemen_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Het-meisje-met-de-rozen/862987": "https://cdn.werkaandemuur.nl/862987_het-meisje-met-de-rozen_fotoprint.jpg",
    "https://www.werkaandemuur.nl/nl/werk/Zelfportret-met-vlinders/858281": "https://cdn.werkaandemuur.nl/858281_zelfportret-met-vlinders_fotoprint.jpg"
  };

  /**
   * Initialize thumbnails on product cards
   */
  function initThumbnails() {
    const productCards = document.querySelectorAll('.product-card, [data-product-url]');
    
    productCards.forEach(card => {
      const link = card.querySelector('a[href*="werkaandemuur.nl"]');
      if (!link) return;
      
      const productUrl = link.getAttribute('href');
      const thumbnailUrl = THUMBNAIL_MAP[productUrl];
      
      if (thumbnailUrl) {
        const imageContainer = card.querySelector('.product-image, .card-image, .image-container');
        if (imageContainer) {
          // Create lazy-loaded image
          const img = document.createElement('img');
          img.setAttribute('data-src', thumbnailUrl);
          img.alt = card.querySelector('.product-title, .card-title')?.textContent || 'Artwork';
          img.className = 'lazy-load artwork-thumbnail';
          img.loading = 'lazy';
          img.decoding = 'async';
          
          // Set aspect ratio to prevent CLS
          img.width = 400;
          img.height = 500;
          
          // Replace placeholder with image
          const placeholder = imageContainer.querySelector('.placeholder-letter, .letter-placeholder');
          if (placeholder) {
            placeholder.style.display = 'none';
          }
          
          // Clear and append
          imageContainer.innerHTML = '';
          imageContainer.appendChild(img);
          
          // Trigger load
          img.src = thumbnailUrl;
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThumbnails);
  } else {
    initThumbnails();
  }

  // Expose for global access
  window.OeverThumbnails = {
    refresh: initThumbnails,
    getThumbnail: (url) => THUMBNAIL_MAP[url]
  };
})();
