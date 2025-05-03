/**
 * AeroVista Schema.org Utility
 * Helper functions to inject structured data into the webpage
 */

/**
 * Creates structured data for AeroVista as an Organization
 * @returns {Object} Schema.org Organization object
 */
export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AeroVista",
    "url": "https://aerovista.us",
    "logo": "https://aerovista.us/public/images/AeroVista-Logo.png",
    "description": "A creative technology studio with specialized divisions in game development, audio production, web engineering, aerial cinematography, and more.",
    "sameAs": [
      "https://twitter.com/aerovistaus",
      "https://github.com/aerovista"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "department": divisions.map(division => ({
      "@type": "Organization",
      "name": division.name,
      "description": division.desc,
      "url": `https://aerovista.us/Divisions/${division.slug}.html`
    }))
  };
}

/**
 * Creates schema.org data for an AeroVista division
 * @param {Object} division Division data object
 * @returns {Object} Schema.org Organization object
 */
export function createDivisionSchema(division) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": division.name,
    "url": `https://aerovista.us/Divisions/${division.slug}.html`,
    "logo": "https://aerovista.us/public/images/AeroVista-Logo.png",
    "description": division.desc,
    "parentOrganization": {
      "@type": "Organization",
      "name": "AeroVista",
      "url": "https://aerovista.us"
    }
  };
}

/**
 * Creates schema.org data for an AeroVista app
 * @param {Object} app App data object
 * @returns {Object} Schema.org SoftwareApplication object
 */
export function createAppSchema(app) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.title,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Windows, macOS, iOS, Android, Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "developer": {
      "@type": "Organization",
      "name": "AeroVista",
      "url": "https://aerovista.us"
    },
    "description": app.desc
  };
}

/**
 * Injects schema.org JSON-LD into the page
 * @param {Object} schemaData The schema object to inject
 */
export function injectSchema(schemaData) {
  // Create script element if it doesn't exist
  let script = document.querySelector('script[type="application/ld+json"]');
  
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  // Set the schema data
  script.textContent = JSON.stringify(schemaData);
}

// Division data for reference
const divisions = [
  {
    slug: 'skyforge-creative',
    name: 'SkyForge Creative',
    desc: 'Immersive game development & virtual storytelling studio.'
  },
  {
    slug: 'horizon-aerial-visual',
    name: 'Horizon Aerial & Visual',
    desc: 'Professional drone cinematography & mapping.'
  },
  {
    slug: 'vespera-publishing',
    name: 'Vespera Publishing',
    desc: 'Books & educational media for holistic growth.'
  },
  {
    slug: 'summit-learning',
    name: 'Summit Learning',
    desc: 'Personal development & training programs.'
  },
  {
    slug: 'lumina-creative',
    name: 'Lumina Creative',
    desc: 'Branding, marketing & digital media.'
  },
  {
    slug: 'nexus-techworks',
    name: 'Nexus TechWorks',
    desc: 'Web, AI & product engineering services.'
  },
  {
    slug: 'echoverse-audio',
    name: 'EchoVerse Audio',
    desc: 'AI‑driven music production & sound design.'
  }
]; 