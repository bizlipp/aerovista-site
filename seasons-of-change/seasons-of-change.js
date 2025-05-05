// Seasons of Change – Enhanced Interactive Experience
// -----------------------------------------------
// Modern interactions, animations, and immersive seasonal effects

// Global Variables
let currentSeason = 'autumn'; // Default season
const seasons = ['spring', 'summer', 'autumn', 'winter'];

// 1. Enhanced Seasonal Cards Animation with Intersection Observer
function animateSeasonsOnScroll() {
  const cards = document.querySelectorAll('.season-card');
  
  // Only setup if IntersectionObserver is supported
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add both animated class and sequential delay classes
          entry.target.classList.add('animated');
          entry.target.classList.add(`delay-${index + 1}`);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -100px 0px' });
    
    cards.forEach(card => observer.observe(card));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    cards.forEach((card, index) => {
      card.classList.add('animated');
      card.classList.add(`delay-${index + 1}`);
    });
  }
}

// 2. Smooth Scroll with Enhanced Behavior and Accessibility
function enableSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      
      if (target) {
        // Add highlight class temporarily
        target.classList.add('highlight-section');
        
        // Scroll with offset for fixed header
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Move focus to the target for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        
        // Remove highlight after animation completes
        setTimeout(() => {
          target.classList.remove('highlight-section');
        }, 2000);
      }
    });
  });
}

// 3. Advanced Interactive Card Effects with Performance Optimizations
function initSeasonInteractions() {
  const cards = document.querySelectorAll('.season-card');
  
  cards.forEach(card => {
    // Add keyboard accessibility
    card.setAttribute('tabindex', '0');
    
    // Optimized 3D Tilt Effect with debounce
    let tiltTimeout;
    
    card.addEventListener('mousemove', e => {
      // Cancel any pending updates
      cancelAnimationFrame(tiltTimeout);
      
      // Schedule the tilt effect update using requestAnimationFrame
      tiltTimeout = requestAnimationFrame(() => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        
        // Calculate mouse position relative to card center (in percentage)
        const mouseX = ((e.clientX - cardCenterX) / (cardRect.width / 2)) * 5;
        const mouseY = ((e.clientY - cardCenterY) / (cardRect.height / 2)) * 5;
        
        // Apply 3D transform with will-change hint for better performance
        card.style.willChange = 'transform';
        card.style.transform = `perspective(1000px) rotateX(${-mouseY}deg) rotateY(${mouseX}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Apply highlight effect
        const glarePos = `${50 + mouseX * 4}% ${50 + mouseY * 4}%`;
        card.style.backgroundImage = `radial-gradient(circle at ${glarePos}, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)`;
      });
    });
    
    // Reset on mouse leave
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(tiltTimeout);
      card.style.willChange = 'auto';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      card.style.backgroundImage = 'none';
      
      // Return to normal with smooth transition
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, background-image 0.5s ease';
    });
    
    // Remove transition during mouse move for smoother effect
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    });
    
    // Add keyboard accessibility for season switching
    card.addEventListener('keydown', (e) => {
      // Enter or Space key to activate
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const seasonName = card.querySelector('h3').textContent.toLowerCase().split("'")[0]; // Extract season name
        switchSeason(seasonName);
      }
    });
    
    // Season switcher (when clicking on season cards)
    card.addEventListener('click', () => {
      const seasonName = card.querySelector('h3').textContent.toLowerCase().split("'")[0]; // Extract season name
      switchSeason(seasonName);
    });
  });
}

// 4. Season Theme Switcher with improved transitions
function switchSeason(season) {
  // Only proceed if it's a valid season and different from current
  if (!seasons.includes(season) || season === currentSeason) return;
  
  // Update current season
  const previousSeason = currentSeason;
  currentSeason = season;
  
  // Create a custom event for other components to listen to
  const seasonChangeEvent = new CustomEvent('seasonChange', {
    detail: { 
      season: season,
      previousSeason: previousSeason
    }
  });
  
  // Add transition class before changing
  document.body.classList.add('theme-transition');
  
  // Remove all season theme classes from body
  seasons.forEach(s => document.body.classList.remove(`${s}-theme`));
  
  // Add new season theme class
  document.body.classList.add(`${season}-theme`);
  
  // Update hero section background
  updateSeasonalHeroBackground(season);
  
  // Update any season-specific content
  updateSeasonalContent(season);
  
  // Update active state on season cards
  updateActiveSeasonCard(season);
  
  // Dispatch the custom event
  document.dispatchEvent(seasonChangeEvent);
  
  // Remove transition class after animation completes
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 1000);
}

// Helper function to update active state on season cards
function updateActiveSeasonCard(season) {
  // Remove active class from all cards
  document.querySelectorAll('.season-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to current season card
  const seasonClass = `${season}-card`;
  const activeCard = document.querySelector(`.${seasonClass}`);
  if (activeCard) {
    activeCard.classList.add('active');
    
    // Scroll the card into view if not visible
    if (!isElementInViewport(activeCard)) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// 5. Dynamic Seasonal Hero Background with improved performance
function updateSeasonalHeroBackground(season) {
  const hero = document.querySelector('.hero');
  
  // Define seasonal gradients and effects
  const seasonStyles = {
    spring: {
      gradient: `
        radial-gradient(circle at top right, var(--spring-light) 0%, transparent 70%),
        radial-gradient(circle at bottom left, var(--spring-light) 0%, transparent 70%),
        linear-gradient(135deg, var(--spring-light) 0%, var(--spring-dark) 100%)
      `,
      image: '../public/images/reflection_journal.png',
      opacity: 0.3
    },
    summer: {
      gradient: `
        radial-gradient(circle at top left, var(--summer-light) 0%, transparent 70%),
        radial-gradient(circle at bottom right, var(--summer-light) 0%, transparent 70%),
        linear-gradient(135deg, var(--summer-light) 0%, var(--summer-dark) 100%)
      `,
      image: '../public/images/horizon.png',
      opacity: 0.2
    },
    autumn: {
      gradient: `
        radial-gradient(circle at center, var(--autumn-light) 0%, transparent 70%),
        radial-gradient(circle at bottom left, var(--autumn-light) 0%, transparent 70%),
        linear-gradient(135deg, var(--autumn-light) 0%, var(--autumn-dark) 100%)
      `,
      image: '../public/images/autumns_harvest.png',
      opacity: 0.2
    },
    winter: {
      gradient: `
        radial-gradient(circle at top, var(--winter-light) 0%, transparent 70%),
        radial-gradient(circle at bottom, var(--winter-light) 0%, transparent 70%),
        linear-gradient(135deg, var(--winter-light) 0%, var(--winter-dark) 100%)
      `,
      image: '../public/images/vespera.png',
      opacity: 0.15
    }
  };
  
  // Apply seasonal background styles
  if (seasonStyles[season] && hero) {
    // Add will-change for better performance during transition
    hero.style.willChange = 'background-image';
    
    hero.style.backgroundImage = seasonStyles[season].gradient;
    
    // Update the ::before pseudo-element with seasonal image
    // We need to add a style tag for this since we can't directly modify pseudo-elements
    const styleId = 'seasonal-hero-style';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    styleTag.textContent = `
      .hero::before {
        background-image: url('${seasonStyles[season].image}');
        opacity: ${seasonStyles[season].opacity};
      }
    `;
    
    // Reset will-change after transition
    setTimeout(() => {
      hero.style.willChange = 'auto';
    }, 1000);
  }
}

// 6. Update Seasonal Content with section highlighting
function updateSeasonalContent(season) {
  // Update page title with current season
  const seasonTitles = {
    spring: "Spring's Awakening",
    summer: "Summer's Radiance",
    autumn: "Autumn's Harvest",
    winter: "Winter's Wisdom"
  };
  
  const seasonDescriptions = {
    spring: "Plant seeds of growth and intention through renewal and creativity.",
    summer: "Shine brightly and harness joy, vitality, and expressive abundance.",
    autumn: "Reflect and release while celebrating wisdom, gratitude, and transition.",
    winter: "Embrace stillness and cultivate resilience, rest, and inner clarity."
  };
  
  // Update hero title and description if they exist
  const heroTitle = document.querySelector('.hero h1');
  const heroDesc = document.querySelector('.hero p');
  
  if (heroTitle) {
    heroTitle.textContent = `Seasons of Change: ${seasonTitles[season]}`;
    heroTitle.classList.add('animated');
    
    // Reset animation
    setTimeout(() => {
      heroTitle.classList.remove('animated');
      void heroTitle.offsetWidth; // Trigger reflow
      heroTitle.classList.add('animated');
    }, 10);
  }
  
  if (heroDesc) {
    heroDesc.textContent = seasonDescriptions[season];
    heroDesc.classList.add('animated');
    
    // Reset animation
    setTimeout(() => {
      heroDesc.classList.remove('animated');
      void heroDesc.offsetWidth; // Trigger reflow
      heroDesc.classList.add('animated');
    }, 10);
  }
  
  // Update active seasonal section
  updateActiveSeasonalSection(season);
}

// New helper function to update active seasonal section
function updateActiveSeasonalSection(season) {
  // Remove active class from all sections
  document.querySelectorAll('.seasonal-section').forEach(section => {
    section.classList.remove('active-season');
  });
  
  // Add active class to current season section
  const sectionClass = `${season}-section`;
  const activeSection = document.querySelector(`.${sectionClass}`);
  if (activeSection) {
    activeSection.classList.add('active-season');
    
    // Update the "Currently Available" text to match the season
    const availableLabel = activeSection.querySelector('.active-season::after');
    if (availableLabel) {
      activeSection.style.setProperty('--active-season-color', `var(--${season}-dark)`);
    }
    
    // Scroll the section into view if not visible and user has explicitly changed seasons
    if (!isElementInViewport(activeSection) && currentSeason !== season) {
      // Add a slight delay to let other animations complete
      setTimeout(() => {
        activeSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }
  
  // Update CTA button color based on season
  const ctaButtons = document.querySelectorAll('.seasonal-section .btn');
  if (ctaButtons.length) {
    ctaButtons.forEach(btn => {
      // Reset all seasonal classes
      btn.classList.remove('spring-btn', 'summer-btn', 'autumn-btn', 'winter-btn');
      
      // Add current season class
      btn.classList.add(`${season}-btn`);
    });
  }
}

// 7. Add Seasonal Particle Effects with optimized rendering
function initSeasonalParticles() {
  const seasonContainer = document.createElement('div');
  seasonContainer.className = 'seasonal-decor';
  document.body.appendChild(seasonContainer);
  
  // Create seasonal particles based on current season
  updateSeasonalParticles(currentSeason);
  
  // Update particles when season changes
  document.addEventListener('seasonChange', (e) => {
    updateSeasonalParticles(e.detail.season);
  });
}

// 8. Update Seasonal Particles with performance enhancements
function updateSeasonalParticles(season) {
  const container = document.querySelector('.seasonal-decor');
  if (!container) return;
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Clear existing particles
  container.innerHTML = '';
  
  // Reduce particle count on mobile
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 15 : 30;
  
  // Particle characteristics by season
  const particleTypes = {
    spring: { class: 'particle-blossom', sizes: [10, 15, 20], speeds: [20, 30, 40] },
    summer: { class: 'particle-sun', sizes: [5, 8, 12], speeds: [15, 25, 35] },
    autumn: { class: 'particle-leaf', sizes: [12, 18, 24], speeds: [10, 20, 30] },
    winter: { class: 'particle-snow', sizes: [3, 6, 10], speeds: [20, 40, 60] }
  };
  
  // Create new particles for the season
  const type = particleTypes[season] || particleTypes.autumn;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = type.class;
    
    // Random size from available options
    const sizeIndex = Math.floor(Math.random() * type.sizes.length);
    const size = type.sizes[sizeIndex];
    
    // Random position
    const posX = Math.random() * 100; // Percentage across viewport width
    const posY = Math.random() * 100; // Percentage across viewport height
    
    // Random animation duration (speed)
    const speed = type.speeds[sizeIndex];
    const duration = 10 + (Math.random() * speed);
    
    // Apply styles with will-change for better performance
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    particle.style.willChange = 'transform, opacity';
    
    fragment.appendChild(particle);
  }
  
  container.appendChild(fragment);
}

// 9. Initialize Everything with performance detection
function initSeasonsPage() {
  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Set initial season theme
  document.body.classList.add(`${currentSeason}-theme`);
  
  // Init interactions regardless of motion preference
  enableSmoothScroll();
  initSeasonInteractions();
  setupResponsiveMenuToggle();
  
  // Conditional initialization based on motion preference
  if (!prefersReducedMotion) {
    // Full animations
    animateSeasonsOnScroll();
    initSeasonalParticles();
    updateSeasonalHeroBackground(currentSeason);
  } else {
    // Simplified animations for reduced motion preference
    document.body.classList.add('reduced-motion');
    
    // Make static seasonal elements visible without animation
    document.querySelectorAll('.season-card').forEach(card => {
      card.style.opacity = 1;
    });
  }
  
  // Add loaded class to body for entrance animation
  setTimeout(() => {
    document.body.classList.add('content-loaded');
  }, 200);
}

// 10. Responsive Menu Toggle with accessibility improvements
function setupResponsiveMenuToggle() {
  // Only add if we're on mobile size
  const header = document.querySelector('header');
  if (window.innerWidth < 768 && header) {
    const nav = document.querySelector('nav');
    const logo = document.querySelector('.logo');
    
    if (nav && logo) {
      // Create menu toggle button with proper accessibility attributes
      const menuToggle = document.createElement('button');
      menuToggle.className = 'menu-toggle';
      menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', 'nav-menu');
      menuToggle.innerHTML = '<span></span><span></span><span></span>';
      
      // Add id to nav for ARIA reference
      nav.id = 'nav-menu';
      
      // Add toggle functionality
      menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        menuToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Update ARIA attributes
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      
      // Add toggle button to header
      header.insertBefore(menuToggle, nav);
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('nav-open') && 
            !e.target.closest('nav') && 
            !e.target.closest('.menu-toggle')) {
          nav.classList.remove('nav-open');
          menuToggle.classList.remove('active');
          document.body.classList.remove('menu-open');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Close menu when pressing escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
          nav.classList.remove('nav-open');
          menuToggle.classList.remove('active');
          document.body.classList.remove('menu-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          
          // Return focus to the menu button
          menuToggle.focus();
        }
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSeasonsPage);

// Debounced resize handler for better performance
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Only recreate menu toggle if it doesn't exist yet
    if (window.innerWidth < 768 && !document.querySelector('.menu-toggle')) {
      setupResponsiveMenuToggle();
    }
  }, 250);
});
  