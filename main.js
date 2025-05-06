/* ======================================================
   AeroVista — Main JS (v3)
   ------------------------------------------------------
   Enhanced vanilla JS with smooth animations, parallax
   effects, and interactive elements. Each HTML page adds
   <body data-page="..."> for targeted functionality.
   ====================================================== */

// Remove module imports since we're using regular script tags
// import { initLazyLoading } from './src/imageUtil.js';
// import { colors, gradients, shadows } from './src/theme.js';
// import { createOrganizationSchema, createDivisionSchema, createAppSchema, injectSchema } from './src/schemaHelper.js';

// import { initNavigation } from './src/navigation.js';

// Wrap in IIFE to avoid polluting global scope
(function() {
  'use strict';

  // 1. CONTENT -----------------------------------------------------------------
  const divisions = [
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

  const apps = [
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
    if (!wrap) {
      console.error('Target element not found:', targetId);
      return;
    }
    
    // Check for permanent cards - if they exist, don't clear the grid
    const permanentCards = wrap.querySelectorAll('.permanent-card');
    if (permanentCards.length > 0) {
      console.log('Permanent cards found, preserving them instead of adding dynamic content');
      return; // Exit early - don't try to replace the permanent cards
    }
    
    // Only clear non-permanent content
    const nonPermanentCards = Array.from(wrap.children).filter(
      child => !child.classList.contains('permanent-card')
    );
    nonPermanentCards.forEach(card => card.remove());
    
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
    if (!hero) return;
    
    window.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const x = (window.innerWidth / 2 - clientX) / 20;
      const y = (window.innerHeight / 2 - clientY) / 20;
      
      // Apply subtle movement to hero background
      hero.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    });
    
    // Text scramble effect for headlines with data-scramble attribute
    const scrambleElements = document.querySelectorAll('[data-scramble="true"]');
    scrambleElements.forEach(element => {
      if (!element) return;
      
      const originalText = element.textContent;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,./<>?';
      
      // Add cursor style and hint class to show it's clickable
      element.style.cursor = 'pointer';
      element.classList.add('clickable-scramble');
      
      // Add tooltip hint
      element.setAttribute('title', 'Click me for scramble effect');
      
      // Only trigger scramble on click
      element.addEventListener('click', () => {
        let iterations = 0;
        
        function scramble() {
          if (iterations >= 15) {
            // Force reset to original text after max iterations
            element.textContent = originalText;
            return;
          }
          
          element.textContent = originalText.split('')
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
        
        // Start scramble immediately on click
        scramble();
      });
    });
  }

  function initScrollAnimations() {
    // Navbar background change on scroll with throttling
    const header = document.querySelector('header');
    if (!header) return;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Check current scroll position on page load
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    }
  }

  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    const body = document.body;
    
    if (!menuToggle || !nav) return;
    
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('nav-open');
      body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('nav-open') && 
        !nav.contains(e.target) && 
        !menuToggle.contains(e.target)
      ) {
        menuToggle.classList.remove('active');
        nav.classList.remove('nav-open');
        body.classList.remove('menu-open');
      }
    });
  }

  function initDynamicBackgrounds() {
    const pageSections = document.querySelectorAll('[data-bg]');
    if (!pageSections.length) return;
    
    pageSections.forEach(section => {
      const bgType = section.getAttribute('data-bg');
      if (!bgType) return;
      
      switch (bgType) {
        case 'gradient':
          const colorStart = section.getAttribute('data-color-start') || 'var(--color-accent)';
          const colorEnd = section.getAttribute('data-color-end') || 'var(--color-secondary)';
          section.style.background = `linear-gradient(135deg, ${colorStart}33 0%, ${colorEnd}55 100%)`;
          break;
          
        case 'particles':
          // Create particle background
          const particleContainer = document.createElement('div');
          particleContainer.className = 'particle-field';
          section.appendChild(particleContainer);
          
          // Add particles
          for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particleContainer.appendChild(particle);
          }
          break;
      }
    });
  }

  // 4. PAGE-SPECIFIC INITIALIZATIONS --------------------------------------------
  function initHome() {
    const bodyEl = document.body;
    if (!bodyEl || bodyEl.getAttribute('data-page') !== 'home') return;
    
    // Initialize glitch effect
    initGlitchEffect();
    
    // Reality Grid effect
    initCubeAnimation();
    
    // Mouse follower
    initMouseFollower();
    
    // Check if division-grid exists before trying to render it
    const divisionGrid = document.getElementById('division-grid');
    if (divisionGrid) {
      // Render division cards
      renderGrid(divisions, 'division-grid', 'division');
    }
    
    // Initialize division slider
    const sliderWrap = document.querySelector('.division-slider');
    if (sliderWrap) {
      divisions.forEach(division => {
        const slide = document.createElement('div');
        slide.className = 'division-slide';
        slide.innerHTML = `
          <h3>${division.name}</h3>
          <p>${division.desc}</p>
          <a href="Divisions/${division.slug}.html" class="btn outline">Explore</a>
        `;
        slide.style.background = division.color;
        sliderWrap.appendChild(slide);
      });
    }
  }

  function initDivisionsHub() {
    const bodyEl = document.body;
    if (!bodyEl || bodyEl.getAttribute('data-page') !== 'divisions-hub') return;
    
    renderGrid(divisions, 'division-grid', 'division');
  }

  function initAppsHub() {
    const bodyEl = document.body;
    if (!bodyEl || bodyEl.getAttribute('data-page') !== 'apps-hub') return;
    
    renderGrid(apps, 'app-grid', 'app');
    
    // Initialize app feature section
    const featureApp = apps.find(app => app.status === 'Released' || app.status === 'Beta');
    if (featureApp) {
      const featureSection = document.querySelector('.featured-app');
      if (featureSection) {
        featureSection.innerHTML = `
          <h2>${featureApp.title} <span class="badge ${featureApp.status.toLowerCase().replace(/\s+/g, '-')}">${featureApp.status}</span></h2>
          <p>${featureApp.desc}</p>
          <a href="Apps/${featureApp.slug}.html" class="btn">Learn More</a>
        `;
        
        featureSection.style.background = featureApp.color;
      }
    }
  }

  function initDivisionPage() {
    const bodyEl = document.body;
    const divisionPages = divisions.map(d => d.slug);
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (!bodyEl || !divisionPages.includes(currentPage)) return;
    
    // Find the current division
    const currentDivision = divisions.find(d => d.slug === currentPage);
    if (currentDivision) {
      // Apply division-specific styling
      document.documentElement.style.setProperty('--division-color', currentDivision.color);
      
      // Set schema metadata for the division
      // injectSchema(createDivisionSchema(currentDivision));
    }
  }

  function initAppPage() {
    const bodyEl = document.body;
    const appPages = apps.map(a => a.slug);
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (!bodyEl || !appPages.includes(currentPage)) return;
    
    // Find the current app
    const currentApp = apps.find(a => a.slug === currentPage);
    if (currentApp) {
      // Apply app-specific styling
      document.documentElement.style.setProperty('--app-color', currentApp.color);
      
      // Set schema metadata for the app
      // injectSchema(createAppSchema(currentApp));
    }
  }

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form elements
      const nameInput = contactForm.querySelector('input[type="text"]');
      const emailInput = contactForm.querySelector('input[type="email"]');
      const messageInput = contactForm.querySelector('textarea');
      const submitButton = contactForm.querySelector('button[type="submit"]');
      
      if (!nameInput || !emailInput || !messageInput || !submitButton) {
        console.error('Contact form is missing required elements');
        return;
      }
      
      // Create success message element if it doesn't exist
      let successMessage = document.querySelector('.success-message');
      if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.style.display = 'none';
        contactForm.after(successMessage);
      }
      
      // Create error message element if it doesn't exist
      let errorMessage = document.querySelector('.error-message');
      if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.style.display = 'none';
        contactForm.after(errorMessage);
      }
      
      // Basic validation
      if (nameInput.value.trim() === '' || emailInput.value.trim() === '' || messageInput.value.trim() === '') {
        errorMessage.textContent = 'Please fill out all fields.';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        errorMessage.textContent = 'Please enter a valid email address.';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        return;
      }
      
      // Change button state
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        // Prepare form data
        const formData = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          message: messageInput.value.trim(),
          page: window.location.pathname
        };
        
        // Send form data to server
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          // Show success message
          successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
          successMessage.style.display = 'block';
          errorMessage.style.display = 'none';
          
          // Reset form
          contactForm.reset();
        } else {
          // Handle server error
          const error = await response.json();
          throw new Error(error.message || 'Failed to send message');
        }
      } catch (error) {
        // Show error message
        console.error('Contact form submission error:', error);
        errorMessage.textContent = `An error occurred: ${error.message || 'Could not send your message. Please try again later.'}`;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
      } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }

  function initImageProcessing() {
    // Initialize image processing features
    // initLazyLoading();
    
    // Enhance image accessibility
    enhanceImageAccessibility();
  }

  // 5. INITIALIZATION ----------------------------------------------------
  function init() {
    // Initialize navigation
    // initNavigation();
    
    document.addEventListener('DOMContentLoaded', () => {
      // Add body-loaded class for initial animations
      setTimeout(() => {
        document.body.classList.add('body-loaded');
      }, 100);
      
      // Initialize common features
      initScrollAnimations();
      initMobileMenu();
      initParallaxEffects();
      initDynamicBackgrounds();
      initContactForm();
      initImageProcessing();
      
      // Initialize page-specific features
      initHome();
      initDivisionsHub();
      initAppsHub();
      initDivisionPage();
      initAppPage();
      
      // Set organization schema
      // injectSchema(createOrganizationSchema());
    });
  }

  function enhanceImageAccessibility() {
    // Find all images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      // Extract a filename from src
      const src = img.getAttribute('src') || '';
      const filename = src.split('/').pop().split('.')[0] || '';
      
      // Convert filename to readable text (e.g., convert-to-readable)
      const altText = filename
        .replace(/[-_]/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      // Set the alt attribute with the generated text
      img.setAttribute('alt', altText || 'Image');
    });
  }

  // Handle glitch effect separately for performance reasons
  function initGlitchEffect() {
    const glitchText = document.querySelector('.glitch');
    const glitchEffect = document.querySelector('.glitch-effect');
    if (!glitchText || !glitchEffect) return;
    
    // Track if animation is in progress to avoid stacking
    let isGlitching = false;
    
    // Create random glitch intervals
    setInterval(() => {
      // Only trigger if not already glitching and with random chance
      if (!isGlitching && Math.random() > 0.9) {
        isGlitching = true;
        glitchEffect.classList.add('active');
        
        // Random distortion values
        const skewX = (Math.random() - 0.5) * 10;
        const skewY = (Math.random() - 0.5) * 10;
        const translateX = (Math.random() - 0.5) * 10;
        
        // Apply distortion
        glitchText.style.transform = `skew(${skewX}deg, ${skewY}deg) translateX(${translateX}px)`;
        
        // Reset after short duration
        setTimeout(() => {
          glitchEffect.classList.remove('active');
          glitchText.style.transform = '';
          
          // Allow new animations after a cooldown
          setTimeout(() => {
            isGlitching = false;
          }, 300);
        }, 200);
      }
    }, 2000);
  }

  function initCubeAnimation() {
    const cube = document.querySelector('.reality-cube');
    if (!cube) return;
    
    let rotationX = 0;
    let rotationY = 0;
    let animationFrameId;
    
    function animate() {
      rotationX += 0.2;
      rotationY += 0.4;
      
      cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Clean up animation when leaving page
    window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });
  }
  
  function initMouseFollower() {
    const follower = document.querySelector('.mouse-follower');
    if (!follower) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let animationFrameId;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    function animate() {
      // Calculate distance between mouse and follower
      const distX = mouseX - followerX;
      const distY = mouseY - followerY;
      
      // Smooth follower movement with easing
      followerX += distX * 0.1;
      followerY += distY * 0.1;
      
      // Apply position with transform for better performance
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Clean up animation when leaving page
    window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    });
  }

  // Easter Egg Console Hint
  console.log("%c✨ Psst... Looking for hidden lore? Try clicking the footer while holding Alt. ✨", "color:#FF3CAF;font-weight:bold");
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector(".site-footer").addEventListener("click", (e) => {
      if (e.altKey) alert("AeroVista began with a single spark in a winter storm. More secrets await.");
    });
  });

  // Initialize the application
  init();
})();

// Main JavaScript for AeroVista website
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', function() {
      navList.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
  
  // Glitch effect for elements with data-scramble="true"
  const glitchElements = document.querySelectorAll('[data-scramble="true"]');
  
  glitchElements.forEach(element => {
    const originalText = element.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    
    element.addEventListener('mouseover', () => {
      let iterations = 0;
      const interval = setInterval(() => {
        element.textContent = originalText
          .split('')
          .map((letter, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        
        if (iterations >= originalText.length) {
          clearInterval(interval);
          element.textContent = originalText;
        }
        
        iterations += 1 / 3;
      }, 30);
    });
  });
  
  // Easter egg: Konami code for synthwave mode
  // Sequence: ↑ ↑ ↓ ↓ ← → ← → B A
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    const requiredKey = konamiCode[konamiIndex].toLowerCase();
    
    if (key.toLowerCase() === requiredKey) {
      konamiIndex++;
      
      if (konamiIndex === konamiCode.length) {
        activateSynthwaveMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
  
  function activateSynthwaveMode() {
    document.body.classList.toggle('synthwave-mode');
    showSecretMessage('Synthwave Mode ' + (document.body.classList.contains('synthwave-mode') ? 'Activated' : 'Deactivated') + ' 🌈');
  }
  
  // Easter egg: Logo click
  const logo = document.querySelector('.logo');
  let logoClickCount = 0;
  
  if (logo) {
    logo.addEventListener('click', (e) => {
      // Only count clicks that are on the actual logo element, not its children
      if (e.target === logo || e.target.classList.contains('logo-icon') || e.target.classList.contains('logo-text')) {
        logoClickCount++;
        
        if (logoClickCount === 3) {
          e.preventDefault();
          const logoIcon = document.querySelector('.logo-icon');
          const logoText = document.querySelector('.logo-text');
          
          if (logoIcon) logoIcon.classList.add('logo-glitched');
          if (logoText) logoText.classList.add('logo-glitched');
          
          showSecretMessage('AeroVista Signal Intercepted... 📡');
          
          setTimeout(() => {
            if (logoIcon) logoIcon.classList.remove('logo-glitched');
            if (logoText) logoText.classList.remove('logo-glitched');
            logoClickCount = 0;
          }, 3000);
        }
      }
    });
  }
  
  // Easter egg: Hidden trigger in footer
  const easterEggTrigger = document.querySelector('.easter-egg-trigger');
  
  if (easterEggTrigger) {
    easterEggTrigger.addEventListener('mouseenter', () => {
      setTimeout(() => {
        if (document.querySelector('.easter-egg-trigger:hover')) {
          showSecretMessage('You found a hidden spot! 🔍');
        }
      }, 2000);
    });
  }
  
  // Function to show secret message notification
  function showSecretMessage(message) {
    // Create or get notification element
    let notification = document.querySelector('.secret-found');
    
    if (!notification) {
      notification = document.createElement('div');
      notification.classList.add('secret-found');
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  // Console Easter Egg
  setTimeout(() => {
    console.log('%cHello Curious Developer! 👀', 'font-size:20px; color:#00AEEF; font-weight:bold;');
    console.log('%cYou found the first easter egg.', 'font-size:14px; color:#FF0090;');
    console.log('%cType "%crevealSecrets()" %cto see what else is hidden...', 'font-size:14px; color:#FFD700;', 'font-size:14px; background:#111; padding:2px 5px; border-radius:4px; color:#00FF7F;', 'font-size:14px; color:#FFD700;');
  }, 1000);
  
  // Define the reveal function
  window.revealSecrets = function() {
    console.log('%c🔓 Hidden Features Guide 🔓', 'font-size:18px; color:#00AEEF; font-weight:bold;');
    console.log('1. Press ↑ ↑ ↓ ↓ ← → ← → B A for Synthwave Mode');
    console.log('2. Click the AeroVista logo 3 times quickly');
    console.log('3. Hover on the bottom right corner for 2+ seconds');
    console.log('4. There is a hidden page at /the-vault.html');
    console.log('5. Try clicking all division logos in order from top to bottom');
  };
});

// Add any additional functionality below
