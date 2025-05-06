/**
 * AeroVista Analytics System
 * Implements privacy-focused analytics with Google Analytics 4
 */

(function() {
  'use strict';

  // Configuration (these values should be set from environment variables in production)
  const CONFIG = {
    GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with actual GA4 Measurement ID
    COOKIE_CONSENT_NAME: 'aerovista_analytics_consent',
    COOKIE_CONSENT_DURATION_DAYS: 365,
    ENABLE_DEBUG: false
  };

  /**
   * Initialize analytics based on user consent
   */
  function initAnalytics() {
    // Check if user has given consent
    if (hasAnalyticsConsent()) {
      loadGoogleAnalytics();
    } else {
      // Set up consent UI if not already present
      setupConsentUI();
    }

    // Always set up event tracking
    setupEventTracking();
  }

  /**
   * Check if the user has given consent for analytics
   * @returns {boolean} Whether the user has consented
   */
  function hasAnalyticsConsent() {
    return getCookie(CONFIG.COOKIE_CONSENT_NAME) === 'true';
  }

  /**
   * Load Google Analytics script
   */
  function loadGoogleAnalytics() {
    if (document.getElementById('ga-script')) return;

    // Add Google Analytics script
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    if (CONFIG.ENABLE_DEBUG) {
      console.log('Analytics initialized');
    }
  }

  /**
   * Set up the consent UI if not already present
   */
  function setupConsentUI() {
    if (document.getElementById('consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="consent-content">
        <p>We use cookies to improve your experience and analyze site usage. 
        Read our <a href="privacy-policy.html">Privacy Policy</a> for more information.</p>
        <div class="consent-actions">
          <button id="accept-cookies" class="btn-sm">Accept</button>
          <button id="reject-cookies" class="btn-sm alt">Decline</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners to the buttons
    document.getElementById('accept-cookies').addEventListener('click', () => {
      acceptAnalyticsConsent();
      banner.style.display = 'none';
    });

    document.getElementById('reject-cookies').addEventListener('click', () => {
      rejectAnalyticsConsent();
      banner.style.display = 'none';
    });
  }

  /**
   * Accept analytics consent
   */
  function acceptAnalyticsConsent() {
    setCookie(CONFIG.COOKIE_CONSENT_NAME, 'true', CONFIG.COOKIE_CONSENT_DURATION_DAYS);
    loadGoogleAnalytics();
  }

  /**
   * Reject analytics consent
   */
  function rejectAnalyticsConsent() {
    setCookie(CONFIG.COOKIE_CONSENT_NAME, 'false', CONFIG.COOKIE_CONSENT_DURATION_DAYS);
    // Could optionally remove existing cookies here
  }

  /**
   * Set up event tracking for important user interactions
   */
  function setupEventTracking() {
    // Only track events if consent is given
    if (!hasAnalyticsConsent()) return;

    // Track navigation clicks
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', function() {
        trackEvent('navigation', 'click', this.textContent);
      });
    });

    // Track CTA button clicks
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', function() {
        trackEvent('cta', 'click', this.textContent);
      });
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        trackEvent('form', 'submit', this.id || 'unknown-form');
      });
    });

    // Track scroll depth
    setupScrollDepthTracking();
  }

  /**
   * Track scroll depth
   */
  function setupScrollDepthTracking() {
    let scrollMarks = [25, 50, 75, 100];
    let marks = new Set();

    window.addEventListener('scroll', function() {
      // Calculate scroll percentage
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;

      // Track scroll marks
      scrollMarks.forEach(mark => {
        if (!marks.has(mark) && scrollPercent >= mark) {
          marks.add(mark);
          trackEvent('scroll', 'depth', `${mark}%`);
        }
      });
    }, { passive: true });
  }

  /**
   * Track an event
   * @param {string} category - The event category
   * @param {string} action - The event action
   * @param {string} label - The event label
   * @param {Object} [value] - The event value (optional)
   */
  function trackEvent(category, action, label, value) {
    if (!hasAnalyticsConsent() || !window.gtag) return;

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });

    if (CONFIG.ENABLE_DEBUG) {
      console.log(`Event tracked: ${category} - ${action} - ${label}`);
    }
  }

  /**
   * Get a cookie value
   * @param {string} name - The cookie name
   * @returns {string|null} The cookie value or null if not found
   */
  function getCookie(name) {
    const cookieArray = document.cookie.split(';');
    const cookieName = name + '=';
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return null;
  }

  /**
   * Set a cookie
   * @param {string} name - The cookie name
   * @param {string} value - The cookie value
   * @param {number} days - The cookie expiration in days
   */
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
  }

  // Public API
  window.AeroVistaAnalytics = {
    init: initAnalytics,
    trackEvent: trackEvent,
    hasConsent: hasAnalyticsConsent,
    acceptConsent: acceptAnalyticsConsent,
    rejectConsent: rejectAnalyticsConsent
  };

  // Initialize on load if autoInit is true
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    initAnalytics();
  }
})(); 