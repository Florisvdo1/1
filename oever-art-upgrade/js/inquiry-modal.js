/**
 * Inquiry Modal Form Handler for OEVER.ART
 * Handles form submission with mailto and localStorage fallback
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'oever_inquiry_drafts';
  
  /**
   * Initialize the inquiry modal
   */
  function initInquiryModal() {
    // Find all CTA buttons that should open the modal
    const ctaButtons = document.querySelectorAll('[data-open-inquiry], .open-inquiry-modal, .commission-btn');
    
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close modal handlers
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (overlay) overlay.addEventListener('click', closeModal);
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeModal();
        }
      });
    }

    // Form submission
    const form = document.getElementById('inquiry-form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      
      // Auto-save drafts
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('change', saveDraft);
        input.addEventListener('input', debounce(saveDraft, 500));
      });
      
      // Load draft on init
      loadDraft();
    }
  }

  /**
   * Open the modal
   */
  function openModal() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus first input
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  /**
   * Close the modal
   */
  function closeModal() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle form submission
   */
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      showMessage('Please fill in all required fields.', 'error');
      return;
    }
    
    // Build mailto URL
    const subject = `Inquiry: ${data.inquiry_type || 'General'} - ${data.name}`;
    const body = `Name: ${data.name}
Email: ${data.email}
Inquiry Type: ${data.inquiry_type || 'Not specified'}
Budget Range: ${data.budget || 'Not specified'}

Message:
${data.message}`;
    
    const mailtoUrl = `mailto:floris@oever.art?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Try mailto first
    window.location.href = mailtoUrl;
    
    // Also save to localStorage as backup
    saveSubmission(data);
    
    // Show success state
    showSuccessState(data);
    
    // Clear draft
    clearDraft();
  }

  /**
   * Show success state with copy option
   */
  function showSuccessState(data) {
    const modal = document.getElementById('inquiry-modal');
    const form = document.getElementById('inquiry-form');
    
    if (form && modal) {
      const successHtml = `
        <div class="inquiry-success">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3>Inquiry Sent!</h3>
          <p>Your email client should have opened. If not, you can copy your message below:</p>
          <textarea class="copy-message" readonly>${formatMessageForCopy(data)}</textarea>
          <button type="button" class="btn-copy" onclick="copyMessageToClipboard()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Your Message
          </button>
          <button type="button" class="btn-close-modal" onclick="closeInquiryModal()">Close</button>
        </div>
      `;
      
      form.innerHTML = successHtml;
    }
  }

  /**
   * Format message for copying
   */
  function formatMessageForCopy(data) {
    return `Inquiry from ${data.name} (${data.email})

Type: ${data.inquiry_type || 'General Inquiry'}
Budget: ${data.budget || 'Not specified'}

Message:
${data.message}`;
  }

  /**
   * Copy message to clipboard
   */
  window.copyMessageToClipboard = function() {
    const textarea = document.querySelector('.copy-message');
    if (textarea) {
      textarea.select();
      document.execCommand('copy');
      
      const btn = document.querySelector('.btn-copy');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        setTimeout(() => btn.innerHTML = originalText, 2000);
      }
    }
  };

  /**
   * Close inquiry modal (exposed globally)
   */
  window.closeInquiryModal = function() {
    closeModal();
    // Reset form after a delay
    setTimeout(() => {
      location.reload();
    }, 300);
  };

  /**
   * Save submission to localStorage
   */
  function saveSubmission(data) {
    const submissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    submissions.push({
      ...data,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }

  /**
   * Save draft to localStorage
   */
  function saveDraft() {
    const form = document.getElementById('inquiry-form');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    localStorage.setItem('oever_inquiry_draft', JSON.stringify(data));
  }

  /**
   * Load draft from localStorage
   */
  function loadDraft() {
    const draft = localStorage.getItem('oever_inquiry_draft');
    if (!draft) return;
    
    try {
      const data = JSON.parse(draft);
      const form = document.getElementById('inquiry-form');
      if (!form) return;
      
      Object.entries(data).forEach(([key, value]) => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) field.value = value;
      });
    } catch (e) {
      console.warn('Failed to load draft');
    }
  }

  /**
   * Clear draft from localStorage
   */
  function clearDraft() {
    localStorage.removeItem('oever_inquiry_draft');
  }

  /**
   * Show message to user
   */
  function showMessage(text, type) {
    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();
    
    const message = document.createElement('div');
    message.className = `form-message ${type}`;
    message.textContent = text;
    
    const form = document.getElementById('inquiry-form');
    if (form) {
      form.insertBefore(message, form.firstChild);
      setTimeout(() => message.remove(), 5000);
    }
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
    document.addEventListener('DOMContentLoaded', initInquiryModal);
  } else {
    initInquiryModal();
  }

  // Expose globally
  window.OeverInquiry = {
    open: openModal,
    close: closeModal
  };
})();
