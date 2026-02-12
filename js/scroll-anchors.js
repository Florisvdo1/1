/**
 * Scroll Anchor Handler for OEVER.ART
 * Smooth scrolling to section anchors with active state highlighting
 */

(function() {
  'use strict';

  const OFFSET = 100; // Offset for sticky header

  /**
   * Initialize scroll anchors
   */
  function initScrollAnchors() {
    // Handle anchor link clicks
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });

    // Update active state on scroll
    window.addEventListener('scroll', debounce(updateActiveState, 100));
    
    // Check initial hash
    if (window.location.hash) {
      setTimeout(() => scrollToSection(window.location.hash), 100);
    }
  }

  /**
   * Handle anchor link click
   */
  function handleAnchorClick(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    
    e.preventDefault();
    scrollToSection(href);
    
    // Update URL without jumping
    history.pushState(null, null, href);
  }

  /**
   * Scroll to a section
   */
  function scrollToSection(target) {
    const section = document.querySelector(target);
    if (!section) return;
    
    const rect = section.getBoundingClientRect();
    const scrollTop = window.pageYOffset + rect.top - OFFSET;
    
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
    
    // Add highlight effect
    section.classList.add('section-highlight');
    setTimeout(() => section.classList.remove('section-highlight'), 2000);
  }

  /**
   * Update active state for step indicators
   */
  function updateActiveState() {
    const sections = document.querySelectorAll('section[id], .process-section');
    const scrollPos = window.pageYOffset + OFFSET + 100;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        // Update step indicators
        document.querySelectorAll('.step-indicator, .step-item').forEach(step => {
          step.classList.remove('active');
          if (step.dataset.target === id || step.querySelector(`a[href="#${id}"]`)) {
            step.classList.add('active');
          }
        });
        
        // Update nav links
        document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
          link.closest('.step-item, .nav-item')?.classList.add('active');
        });
      }
    });
  }

  /**
   * Debounce utility
   */
  function debounce(fn, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnchors);
  } else {
    initScrollAnchors();
  }

  // Expose globally
  window.OeverScroll = {
    to: scrollToSection
  };
})();
