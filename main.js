/* ======================================================
   AeroVista — Main JS (v2)
   ------------------------------------------------------
   Enhanced vanilla JS with smooth animations, parallax
   effects, and interactive elements. Each HTML page adds
   <body data-page="..."> for targeted functionality.
   ====================================================== */

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
  const card = document.createElement('a');
  card.href = type === 'division' ? `divisions/${slug}.html` : `apps/${slug}.html`;
  card.className = 'card';
  card.setAttribute('data-animate', 'fade-up');
  
  const badgeClass = status ? status.toLowerCase().replace(/\s+/g, '-') : '';
  
  card.innerHTML = `
      <h3 class="glitch" data-text="${name || title}">${name || title}</h3>
      <p>${desc}</p>
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
      if (iterations >= 15) return;
      
      headline.textContent = originalText.split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      iterations++;
      setTimeout(scramble, 50);
    }
    
    // Start the scramble effect with a delay
    setTimeout(scramble, 1000);
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
      // Set random gradient background
      const colors = [
        'var(--color-accent)',
        'var(--color-hot)',
        'var(--color-secondary)'
      ];
      
      const color1 = colors[Math.floor(Math.random() * colors.length)];
      const color2 = colors[Math.floor(Math.random() * colors.length)];
      
      section.style.background = `linear-gradient(135deg, ${color1}33 0%, ${color2}55 100%)`;
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
}

function initDivisionsHub() {
  renderGrid(divisions, 'divisionsHub', 'division');
}

function initAppsHub() {
  renderGrid(apps, 'appsHub', 'app');
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

// 5. BOOTSTRAP ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  
  // Initialize common elements
  initMobileMenu();
  initScrollAnimations();
  initParallaxEffects();
  initDynamicBackgrounds();
  
  // Page-specific initializations
  switch (page) {
    case 'home':
      initHome();
      break;
    case 'divisions-hub':
      initDivisionsHub();
      break;
    case 'apps-hub':
      initAppsHub();
      break;
  }
  
  // Always initialize common components
  initContactForm();
  
  // Add custom cursor effect (for desktop)
  if (window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });
    
    // Enhance cursor on interactive elements
    const interactives = document.querySelectorAll('a, button, input, textarea, .card');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }
  
  // Add CSS for new dynamic elements
  const style = document.createElement('style');
  style.textContent = `
    .particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      animation: float linear infinite, pulse 2s ease-in-out infinite;
    }
    
    @keyframes float {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.5; }
      100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
    
    .shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 80%);
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: overlay;
    }
    
    .custom-cursor {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-accent);
      border-radius: 50%;
      position: fixed;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9999;
      transition: width 0.2s, height 0.2s, background 0.2s;
      mix-blend-mode: difference;
    }
    
    .custom-cursor.active {
      width: 40px;
      height: 40px;
      background: rgba(0, 210, 255, 0.2);
      mix-blend-mode: normal;
    }
    
    .success-message {
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur));
      padding: 1rem;
      border-radius: var(--radius-base);
      margin-top: 1rem;
      border: 1px solid var(--color-success);
      text-align: center;
      color: var(--color-success);
    }
    
    button.loading::after {
      content: '';
      display: inline-block;
      width: 1rem;
      height: 1rem;
      margin-left: 0.5rem;
      border: 2px solid #fff;
      border-bottom-color: transparent;
      border-radius: 50%;
      animation: rotate 1s linear infinite;
    }
    
    input.focused, textarea.focused {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px rgba(0, 210, 255, 0.2);
    }
  `;
  
  document.head.appendChild(style);
});
