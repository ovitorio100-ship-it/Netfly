/*
  Ai Atende - Interactive Scripts
  UTM Capture, Masks, Accordion, Dynamic Tabs, Modal, n8n Integration
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. UTM & GCLID Tracking
  captureTrackingParameters();

  // 2. Sticky Header scroll behavior
  setupStickyHeader();

  // 3. Mobile Navigation Menu Toggle
  setupMobileMenu();

  // 4. Interactive Features Tabs (Section 6)
  setupFeatureTabs();

  // 5. FAQ Accordion (Section 12)
  setupFaqAccordion();

  // 6. WhatsApp Input Mask
  setupPhoneMask();

  // 7. Modal Control (Open/Close)
  setupModal();

  // 8. Form Submission via AJAX/Fetch to n8n
  setupFormSubmission();
});

/**
 * Capture UTM parameters from URL and save them in sessionStorage
 */
function captureTrackingParameters() {
  const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];
  const urlParams = new URLSearchParams(window.location.search);
  
  params.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      sessionStorage.setItem(param, value);
    }
  });
}

/**
 * Sticky header visual change on scroll
 */
function setupStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Initial check
}

/**
 * Handle mobile navigation hamburger menu toggle
 */
function setupMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking navigation links
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    });
  });
}

/**
 * Handle resource tab clicking and SVG swapping
 */
function setupFeatureTabs() {
  const tabButtons = document.querySelectorAll('.feature-tab-btn');
  const featurePanes = document.querySelectorAll('.feature-pane');

  if (tabButtons.length === 0) return;

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active classes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      featurePanes.forEach(pane => pane.classList.remove('active'));

      // Set active
      button.classList.add('active');
      const targetId = button.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/**
 * Setup FAQ accordion triggers
 */
function setupFaqAccordion() {
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  if (faqTriggers.length === 0) return;

  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const faqItem = trigger.closest('.faq-item');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      
      // Close other active questions (optional, matching original accordion feel)
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      faqItem.classList.toggle('active');
      trigger.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

/**
 * Format phone input dynamically: (XX) XXXXX-XXXX
 */
function setupPhoneMask() {
  const phoneInput = document.getElementById('lead-phone');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value;
    
    // Remove non-numeric characters
    value = value.replace(/\D/g, '');
    
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // Apply masking layout
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    e.target.value = value;
  });
}

/**
 * Handle conversion modal open, close, escape key
 */
function setupModal() {
  const modal = document.getElementById('diagnostic-modal');
  const openButtons = document.querySelectorAll('.open-modal-btn');
  const closeButton = document.getElementById('modal-close');
  const overlay = document.getElementById('modal-overlay');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent page scrolling
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // restore scrolling
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  // Close on Escape Key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/**
 * Submit form data to n8n webhook and handle responses
 */
function setupFormSubmission() {
  const form = document.getElementById('diagnostic-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check HTML5 validation state
    if (!form.checkValidity()) {
      // Trigger native validation display for inputs
      form.reportValidity();
      return;
    }

    // Set button visual state to Loading
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="spinner" style="animation: spin 1s linear infinite; margin-right: 8px;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M4 12a8 8 0 0 1 8-8"></path>
      </svg>
      <span>Enviando dados...</span>
    `;

    // Inline CSS animation rule for spinner (avoids bloating stylesheet)
    if (!document.getElementById('spinner-anim')) {
      const style = document.createElement('style');
      style.id = 'spinner-anim';
      style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // Capture values
    const name = document.getElementById('lead-name').value.trim();
    const phone = document.getElementById('lead-phone').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const segment = document.getElementById('lead-segment').value;
    const revenue = document.getElementById('lead-revenue').value;

    // Capture saved UTM / GCLID parameters
    const getStorageItem = (key) => sessionStorage.getItem(key) || '';
    
    const payload = {
      name,
      phone,
      email,
      segment,
      revenue,
      origin: 'lp_botconversa_style',
      gclid: getStorageItem('gclid'),
      utm_source: getStorageItem('utm_source'),
      utm_medium: getStorageItem('utm_medium'),
      utm_campaign: getStorageItem('utm_campaign'),
      utm_content: getStorageItem('utm_content'),
      utm_term: getStorageItem('utm_term')
    };

    try {
      const response = await fetch('https://n8n.aiatende.dev.br/webhook/aiatende_lp2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network error or server returned error status.');
      }

      // Fire Analytics dataLayer event
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'lead_form_submit',
        lead_segment: segment,
        lead_revenue: revenue
      });

      // Pushing gtag event if tracking script loaded directly
      if (typeof gtag === 'function') {
        gtag('event', 'lead_form_submit', {
          'lead_segment': segment,
          'lead_revenue': revenue
        });
      }

      // Redirect to thank-you confirmation page
      window.location.href = 'obrigado.html';

    } catch (error) {
      console.error('Error submitting form to n8n:', error);
      
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      
      // Display visual error message near the button
      let errorMsg = document.getElementById('form-error-msg');
      if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.id = 'form-error-msg';
        errorMsg.style.color = '#EF4444';
        errorMsg.style.fontSize = '0.85rem';
        errorMsg.style.fontWeight = '600';
        errorMsg.style.marginTop = '12px';
        errorMsg.style.textAlign = 'center';
        form.appendChild(errorMsg);
      }
      errorMsg.textContent = 'Erro ao enviar dados. Por favor, tente novamente ou fale conosco no WhatsApp.';
    }
  });
}
