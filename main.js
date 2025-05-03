/* ======================================================
   AeroVista — Main JS (v2)
   ------------------------------------------------------
   Enhanced vanilla JS with smooth animations, parallax
   effects, and interactive elements. Each HTML page adds
   <body data-page="..."> for targeted functionality.
   ====================================================== */

// Import image utilities, theme and schema helper
import { initLazyLoading } from './src/imageUtil.js';
import { colors, gradients, shadows } from './src/theme.js';
import { createOrganizationSchema, createDivisionSchema, createAppSchema, injectSchema } from './src/schemaHelper.js';

// 1. CONTENT -----------------------------------------------------------------
export const divisions = [
  {
    slug: 'skyforge-creative',
    name: 'SkyForge Creative',
    desc: 'Immersive game development & virtual storytelling studio.',
    color: 'linear-gradient(135deg, #ff3caf44 0%, #492eff66 100%)'
  },
  {
    slug: 'horizon-aerial-visual',
    name: 'Horizon Aerial & Visual',
    desc: 'Professional drone cinematography & mapping.',
    color: 'linear-gradient(135deg, #008abf44 0%, #00d2ff33 100%)'
  },
  {
    slug: 'vespera-publishing',
    name: 'Vespera Publishing',
    desc: 'Books & educational media for holistic growth.',
    color: 'linear-gradient(135deg, #ff3caf44 0%, #ffb34733 100%)'
  },
  {
    slug: 'summit-learning',
    name: 'Summit Learning',
    desc: 'Personal development & training programs.',
    color: 'linear-gradient(135deg, #ffb34733 0%, #ff3caf44 100%)'
  },
  {
    slug: 'lumina-creative',
    name: 'Lumina Creative',
    desc: 'Branding, marketing & digital media.',
    color: 'linear-gradient(135deg, #3a47d589 0%, #c471ed55 100%)'
  },
  {
    slug: 'nexus-techworks',
    name: 'Nexus TechWorks',
    desc: 'Web, AI & product engineering services.',
    color: 'linear-gradient(135deg, #00d2ff33 0%, #474dff55 100%)'
  },
  {
    slug: 'echoverse-audio',
    name: 'EchoVerse Audio',
    desc: 'AI‑driven music production & sound design.',
    color: 'linear-gradient(135deg, #ff3caf44 0%, #474dff55 100%)'
  }
];

export const apps = [
  {
    slug: 'bytepad',
    title: 'BytePad',
    status: 'Released',
    desc: 'Sticky‑note productivity app that syncs across devices.',
    color: 'linear-gradient(135deg, #00d2ff33 0%, #3a47d589 100%)'
  },
  {
    slug: 'vaultmaster',
    title: 'VaultMaster',
    status: 'Beta',
    desc: 'Local‑first file manager with glitch‑punk UI.',
    color: 'linear-gradient(135deg, #ff3caf44 0%, #3a47d589 100%)'
  },
  {
    slug: 'rydesync',
    title: 'RydeSync',
    status: 'Coming Soon',
    desc: 'Offline‑first ride community with synced music rooms.',
    color: 'linear-gradient(135deg, #474dff55 0%, #00d2ff33 100%)'
  }
];

// 2. RENDER HELPERS -----------------------------------------------------------
function createCard({ name, title, desc, status, slug, color }, type = 'division') {
  // Error handling for missing slug or title
  if (!slug) {
    console.error('Error creating card: missing slug parameter');
    return document.createElement('div'); // Return empty div to avoid breaking the layout
  }
  
  if (!name && !title) {
    console.error(`Error creating card for ${slug}: missing name/title parameter`);
    return document.createElement('div'); // Return empty div to avoid breaking the layout
  }
  
  const card = document.createElement('a');
  card.href = type === 'division' ? `Divisions/${slug}.html` : `Apps/${slug}.html`;
  card.className = 'card';
  card.setAttribute('data-animate', 'fade-up');
  
  const badgeClass = status ? status.toLowerCase().replace(/\s+/g, '-') : '';
  
  card.innerHTML = `
      <h3 class="glitch" data-text="${name || title}">${name || title}</h3>
      <p>${desc || 'No description available'}</p>
      ${status ? `<span class="badge ${badgeClass}">${status}</span>` : ''}
  `;
  
  // Add hover animation effect
  card.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    card.style.transform = `
      translateY(-10px)
      rotateX(${y * -10}deg)
      rotateY(${x * 10}deg)
    `;
    
    // Add dynamic shine effect
    const shine = card.querySelector('.shine') || document.createElement('div');
    if (!card.querySelector('.shine')) {
      shine.className = 'shine';
      card.appendChild(shine);
    }
    
    shine.style.backgroundPosition = `${x * 100 + 50}% ${y * 100 + 50}%`;
  });
  
  // Reset card on mouse leave
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    const shine = card.querySelector('.shine');
    if (shine) shine.remove();
  });
  
  return card;
}

function renderGrid(items, targetId, type) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;
  
  // Clear any existing content to prevent duplication
  wrap.innerHTML = '';
  
  // Add staggered animation class
  wrap.classList.add('stagger');
  
  items.forEach((item, index) => {
    const card = createCard(item, type);
    card.style.animationDelay = `${index * 0.1}s`;
    wrap.appendChild(card);
  });
}

// 3. ANIMATIONS & EFFECTS ------------------------------------------------------
function initParallaxEffects() {
  // Subtle parallax effect on hero sections
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const x = (window.innerWidth / 2 - clientX) / 20;
      const y = (window.innerHeight / 2 - clientY) / 20;
      
      // Apply subtle movement to hero background
      hero.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    });
  }
  
  // Text scramble effect for headlines
  const headlines = document.querySelectorAll('.hero h1');
  headlines.forEach(headline => {
    const originalText = headline.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,./<>?';
    let iterations = 0;
    
    function scramble() {
      if (iterations >= 15) {
        // Force reset to original text after max iterations
        headline.textContent = originalText;
        return;
      }
      
      headline.textContent = originalText.split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      iterations++;
      
      // Use requestAnimationFrame for smoother animation
      if (iterations < 15) {
        setTimeout(() => requestAnimationFrame(scramble), 50);
      }
    }
    
    // Wait for fonts to load before starting scramble effect
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            setTimeout(scramble, 1000);
          });
        } else {
          setTimeout(scramble, 1000);
        }
      });
    } else {
      // Fallback for browsers that don't support document.fonts
      setTimeout(scramble, 1500); // Slightly longer delay as a precaution
    }
  });
}

function initScrollAnimations() {
  // Navbar background change on scroll
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Animate elements when they scroll into view
  const animatedElems = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  animatedElems.forEach(elem => {
    elem.classList.add(elem.dataset.animate);
    observer.observe(elem);
  });
}

function initMobileMenu() {
  // Add mobile menu button if it doesn't exist
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  
  if (header && nav && !document.querySelector('.menu-toggle')) {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'menu-toggle';
    menuBtn.innerHTML = '<span>☰</span>';
    menuBtn.setAttribute('aria-label', 'Toggle menu');
    
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuBtn.innerHTML = nav.classList.contains('open') ? '<span>✕</span>' : '<span>☰</span>';
    });
    
    header.appendChild(menuBtn);
  }
}

function initDynamicBackgrounds() {
  // Apply dynamic backgrounds based on data attributes
  const sections = document.querySelectorAll('[data-bg]');
  sections.forEach(section => {
    const bgType = section.dataset.bg;
    if (bgType === 'gradient') {
      // Check if section already has inline style
      if (section.style.background) {
        // Replace with CSS class
        section.style.background = '';
        section.classList.add('bg-primary-gradient');
      }
    }
  });
  
  // Replace inline styles on CTA sections with theme classes
  const ctaSections = document.querySelectorAll('section.hero[style*="min-height:auto"]');
  ctaSections.forEach(section => {
    // Replace inline styles with CSS class
    section.removeAttribute('style');
    section.classList.add('cta-section');
    
    // Check if it should be glass
    if (section.style.background && section.style.background.includes('glass-bg')) {
      section.classList.add('glass');
    }
  });
}

// 4. PAGE ROUTER --------------------------------------------------------------
function initHome() {
  renderGrid(divisions, 'divisionGrid', 'division');
  renderGrid(apps, 'appGrid', 'app');
  
  // Add particles background to home hero if not already present
  const hero = document.querySelector('.hero');
  if (hero && !document.getElementById('particles')) {
    const particles = document.createElement('div');
    particles.id = 'particles';
    hero.appendChild(particles);
    
    // Generate random particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const size = Math.random() * 10 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      
      particles.appendChild(particle);
    }
  }
  
  // Inject organization schema
  injectSchema(createOrganizationSchema());
}

function initDivisionsHub() {
  renderGrid(divisions, 'divisionsHub', 'division');
  
  // Inject organization schema with focus on divisions
  injectSchema(createOrganizationSchema());
}

function initAppsHub() {
  renderGrid(apps, 'appsHub', 'app');
  
  // Inject software application collection schema
  const appsCollection = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": apps.map((app, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": createAppSchema(app)
    }))
  };
  
  injectSchema(appsCollection);
}

function initDivisionPage() {
  // Get current division data from URL
  const path = window.location.pathname;
  const divisionSlug = path.split('/').pop().replace('.html', '');
  
  const currentDivision = divisions.find(div => div.slug === divisionSlug);
  if (currentDivision) {
    // Update hero background based on division
    const hero = document.querySelector('.hero');
    if (hero) {
      // Replace inline style with CSS class
      hero.style.background = '';
      hero.classList.add(`${divisionSlug}-bg`);
    }
    
    // Inject division-specific schema
    injectSchema(createDivisionSchema(currentDivision));
  }
}

function initAppPage() {
  // Get current app data from URL
  const path = window.location.pathname;
  const appSlug = path.split('/').pop().replace('.html', '');
  
  const currentApp = apps.find(app => app.slug === appSlug);
  if (currentApp) {
    // Update hero background based on app
    const hero = document.querySelector('.hero');
    if (hero) {
      // Replace inline style with CSS class
      hero.style.background = '';
      hero.classList.add(`${appSlug}-bg`);
    }
    
    // Inject app-specific schema
    injectSchema(createAppSchema(currentApp));
  }
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  // Add form animations
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach((input, index) => {
    input.setAttribute('data-animate', 'fade-up');
    input.style.animationDelay = `${index * 0.1 + 0.2}s`;
    
    // Add label animation
    input.addEventListener('focus', () => {
      input.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.classList.remove('focused');
      }
    });
  });
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Animate button on submit
    const btn = form.querySelector('button');
    btn.innerHTML = 'Sending...';
    btn.classList.add('loading');
    
    // Simulate send (replace with actual AJAX in production)
    setTimeout(() => {
      btn.innerHTML = 'Sent!';
      btn.classList.remove('loading');
      btn.classList.add('success');
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.innerHTML = '<p>Thanks! We\'ll be in touch soon.</p>';
      successMsg.setAttribute('data-animate', 'fade-up');
      
      form.appendChild(successMsg);
      
      // Reset form after delay
      setTimeout(() => {
        form.reset();
        btn.innerHTML = 'Send Message';
        btn.classList.remove('success');
        successMsg.remove();
        inputs.forEach(input => input.classList.remove('focused'));
      }, 3000);
    }, 1500);
  });
}

// Initialize image processing
function initImageProcessing() {
  // Initialize lazy loading for all images with data-src attribute
  initLazyLoading();
}

// Include image processing in the init function
function init() {
  // Get page type from body attribute
  const pageType = document.body.dataset.page;
  
  // Common initializations for all pages
  initScrollAnimations();
  initMobileMenu();
  initDynamicBackgrounds();
  initParallaxEffects();
  initImageProcessing();
  
  // Page-specific initializations
  if (pageType === 'home') {
    initHome();
  } else if (pageType === 'divisions-hub') {
    initDivisionsHub();
  } else if (pageType === 'apps-hub') {
    initAppsHub();
  } else if (pageType && pageType.includes('division-')) {
    initDivisionPage();
  } else if (pageType && pageType.includes('app-')) {
    initAppPage();
  }
  
  // Forms can be on multiple pages
  initContactForm();
  
  // Add alt text variation to enhance accessibility
  enhanceImageAccessibility();
}

/**
 * Enhances image accessibility by improving alt text descriptions
 */
function enhanceImageAccessibility() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    const currentAlt = img.getAttribute('alt') || '';
    const src = img.getAttribute('src') || '';
    
    // Skip if the image already has a decent alt text (longer than 10 chars)
    if (currentAlt.length > 10 && !currentAlt.includes('placeholder')) {
      return;
    }
    
    // Generate better alt text based on image context
    if (src.includes('portfolio')) {
      // Handle portfolio images
      const parentHeading = img.closest('section').querySelector('h2, h3, h4')?.textContent;
      if (parentHeading) {
        img.setAttribute('alt', `Visual representation of ${parentHeading} project`);
      } else {
        img.setAttribute('alt', 'Portfolio showcase image of creative work');
      }
    } else if (src.includes('apps/bytepad')) {
      img.setAttribute('alt', 'BytePad sticky note productivity app interface showing organized notes');
    } else if (src.includes('apps/mobile-view')) {
      img.setAttribute('alt', 'Mobile app interface showing responsive design on smartphone screen');
    } else if (src.includes('apps/coming-soon')) {
      img.setAttribute('alt', 'Preview of upcoming application or feature');
    } else if (src.includes('apps/reflection-journal')) {
      img.setAttribute('alt', 'Reflection journal app interface with prompts and writing space');
    } else if (src.includes('division-highlights')) {
      img.setAttribute('alt', 'Highlight of division expertise and capabilities');
    } else if (currentAlt.includes('placeholder')) {
      // Replace generic placeholder text
      img.setAttribute('alt', 'Visual representation of ' + (img.closest('section')?.querySelector('h2, h3')?.textContent || 'content'));
    }
  });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', init);
