/**
 * AeroVista Metadata System
 * Implements JSON-LD structured data and enhances metadata
 */

(function() {
  'use strict';

  // Base organization data
  const ORGANIZATION_DATA = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AeroVista",
    "url": "https://aerovista.us",
    "logo": "https://aerovista.us/public/images/logo.png", // Update with actual logo path
    "sameAs": [
      "https://twitter.com/aerovista", // Update with actual social accounts
      "https://instagram.com/aerovista",
      "https://github.com/aerovista"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567", // Update with actual contact info
      "contactType": "customer service",
      "email": "hello@aerovista.us",
      "availableLanguage": "English"
    }
  };

  /**
   * Initialize metadata enhancements
   */
  function initMetadata() {
    const pagePath = window.location.pathname;
    const pageType = getPageType(pagePath);

    // Add basic structured data for all pages
    addOrganizationData();

    // Add page-specific structured data
    switch (pageType) {
      case 'home':
        addHomePageData();
        break;
      case 'about':
        addAboutPageData();
        break;
      case 'divisions':
        addDivisionsPageData();
        break;
      case 'apps':
        addAppsPageData();
        break;
      case 'division-detail':
        addDivisionDetailData();
        break;
      case 'app-detail':
        addAppDetailData();
        break;
    }

    // Add extended metadata for social sharing
    enhanceSocialMetadata();
  }

  /**
   * Determine page type based on path
   * @param {string} path - The page path
   * @returns {string} The page type
   */
  function getPageType(path) {
    if (path === '/' || path.endsWith('index.html')) {
      return 'home';
    } else if (path.includes('about')) {
      return 'about';
    } else if (path.includes('divisions')) {
      if (path.includes('/') && path.split('/').length > 2) {
        return 'division-detail';
      }
      return 'divisions';
    } else if (path.includes('apps')) {
      if (path.includes('/') && path.split('/').length > 2) {
        return 'app-detail';
      }
      return 'apps';
    }
    return 'other';
  }

  /**
   * Add Organization structured data
   */
  function addOrganizationData() {
    addStructuredData(ORGANIZATION_DATA);
  }

  /**
   * Add structured data for the home page
   */
  function addHomePageData() {
    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "AeroVista",
      "url": "https://aerovista.us",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://aerovista.us/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    addStructuredData(websiteData);
  }

  /**
   * Add structured data for the about page
   */
  function addAboutPageData() {
    // About page schema could include things like company founding date,
    // information about the founder, etc.
    const aboutData = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About AeroVista",
      "mainEntity": {
        "@type": "Organization",
        "name": "AeroVista",
        "description": "AeroVista is a collaborative studio powered by creators, educators, developers, and dreamers. We believe in the power of story, visuals, and technology to transform how people learn, play, and grow.",
        "foundingDate": "2023",
        "founders": [
          {
            "@type": "Person",
            "name": "AeroVista Founder" // Update with actual founder info
          }
        ]
      }
    };

    addStructuredData(aboutData);
  }

  /**
   * Add structured data for the divisions overview page
   */
  function addDivisionsPageData() {
    // Get division data from the page
    const divisions = Array.from(document.querySelectorAll('.division-item'))
      .map(div => {
        const name = div.querySelector('.division-item__name')?.textContent || '';
        const desc = div.querySelector('.division-item__desc')?.textContent || '';
        const link = div.querySelector('.division-item__link')?.getAttribute('href') || '';
        
        return {
          "@type": "Organization",
          "name": name,
          "description": desc,
          "url": new URL(link, window.location.origin).toString()
        };
      });

    const divisionsData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "AeroVista Divisions",
      "description": "Explore AeroVista's specialized divisions offering expertise in game development, audio production, creative services, and more.",
      "hasPart": divisions
    };

    addStructuredData(divisionsData);
  }

  /**
   * Add structured data for the apps overview page
   */
  function addAppsPageData() {
    // Get app data from the page
    const apps = Array.from(document.querySelectorAll('.app-card'))
      .map(app => {
        const name = app.querySelector('.app-title')?.textContent || '';
        const desc = app.querySelector('.app-desc')?.textContent || '';
        const link = app.querySelector('a')?.getAttribute('href') || '';
        
        return {
          "@type": "SoftwareApplication",
          "name": name,
          "description": desc,
          "url": new URL(link, window.location.origin).toString(),
          "applicationCategory": "WebApplication",
          "operatingSystem": "All"
        };
      });

    const appsData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "AeroVista Apps",
      "description": "Discover AeroVista's suite of innovative applications, from productivity tools to creative software.",
      "hasPart": apps
    };

    addStructuredData(appsData);
  }

  /**
   * Add structured data for a division detail page
   */
  function addDivisionDetailData() {
    // Get division data from the page
    const name = document.querySelector('.division-hero__title')?.textContent || '';
    const desc = document.querySelector('.division-hero__tagline')?.textContent || '';
    
    // Get services offered by this division
    const services = Array.from(document.querySelectorAll('.service-card'))
      .map(service => {
        const title = service.querySelector('.service-card__title')?.textContent || '';
        const description = service.querySelector('.service-card__desc')?.textContent || '';
        
        return {
          "@type": "Service",
          "name": title,
          "description": description,
          "provider": {
            "@type": "Organization",
            "name": name
          }
        };
      });

    const divisionData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": name,
      "description": desc,
      "parentOrganization": {
        "@type": "Organization",
        "name": "AeroVista",
        "url": "https://aerovista.us"
      },
      "makesOffer": services
    };

    addStructuredData(divisionData);
  }

  /**
   * Add structured data for an app detail page
   */
  function addAppDetailData() {
    // Get app data from the page
    const name = document.querySelector('.app-hero__title')?.textContent || '';
    const desc = document.querySelector('.app-hero__tagline')?.textContent || '';
    const detailedDesc = document.querySelector('.lead-text')?.textContent || '';
    const status = document.querySelector('.app-hero__status .badge')?.textContent || '';
    
    // Get app features
    const features = Array.from(document.querySelectorAll('.feature-box'))
      .map(feature => {
        return feature.querySelector('h3')?.textContent || '';
      });

    const appData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": name,
      "description": detailedDesc || desc,
      "applicationCategory": "WebApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": status === "Released" ? 
          "https://schema.org/InStock" : 
          "https://schema.org/PreOrder"
      },
      "featureList": features.join(", ")
    };

    addStructuredData(appData);
  }

  /**
   * Add structured data to the page
   * @param {Object} data - The structured data object
   */
  function addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  /**
   * Enhance metadata for better social sharing
   */
  function enhanceSocialMetadata() {
    // Get page metadata
    const title = document.title || '';
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    
    // Ensure all necessary meta tags are present for Twitter
    ensureMetaTag('twitter:card', 'summary_large_image');
    ensureMetaTag('twitter:title', title);
    ensureMetaTag('twitter:description', description);
    ensureMetaTag('twitter:image', ogImage);
    
    // Add additional meta tags for better sharing
    ensureMetaTag('theme-color', '#080a12');
    
    // Get page language
    const lang = document.documentElement.lang || 'en';
    ensureMetaTag('og:locale', lang);
    
    // Add article tags if it's a content page
    if (document.querySelector('article')) {
      const publishedTime = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') 
        || new Date().toISOString();
      
      ensureMetaTag('article:published_time', publishedTime);
      ensureMetaTag('og:type', 'article');
    }
  }

  /**
   * Ensure a meta tag exists, add it if it doesn't
   * @param {string} name - The meta tag name or property
   * @param {string} content - The meta tag content
   */
  function ensureMetaTag(name, content) {
    // Check if the tag exists
    const isProperty = name.includes(':');
    const selector = isProperty 
      ? `meta[property="${name}"]` 
      : `meta[name="${name}"]`;
    
    const existingTag = document.querySelector(selector);
    
    if (existingTag) {
      // Update existing tag
      existingTag.setAttribute('content', content);
    } else {
      // Create new tag
      const meta = document.createElement('meta');
      if (isProperty) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  }

  // Public API
  window.AeroVistaMetadata = {
    init: initMetadata
  };

  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMetadata);
  } else {
    initMetadata();
  }
})(); 