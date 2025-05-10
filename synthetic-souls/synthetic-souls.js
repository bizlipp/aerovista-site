// synthetic-souls.js - Enhanced with interactive elements

document.addEventListener("DOMContentLoaded", () => {
  // Initialize components
  initGlitchTitle();
  initGlitchDial();
  initAudioPlayer();
  initModalControls();
  initNavbarEffects();
  initContactForm();
  initParticleEffects();
  initPageTransitions();
});

/**
 * Initialize glitch effects on the title
 */
function initGlitchTitle() {
  const title = document.querySelector('.glitch-title');
  if (!title) return;
  
  // Set the data-text attribute to match the title text
  title.setAttribute('data-text', title.textContent);
  
  title.addEventListener('mouseenter', () => {
    title.style.animation = 'glitch-offset 0.3s infinite';
    
    // Randomly trigger an intense glitch effect
    if (Math.random() > 0.7) {
      triggerIntenseGlitch(title);
    }
  });
  
  title.addEventListener('mouseleave', () => {
    title.style.animation = 'glitch-flicker 1.2s infinite';
  });
  
  // Create a random glitch effect occasionally
  setInterval(() => {
    if (Math.random() > 0.9) {
      triggerIntenseGlitch(title);
    }
  }, 5000);
}

/**
 * Trigger an intense glitch effect on an element
 */
function triggerIntenseGlitch(element) {
  const originalAnimation = element.style.animation;
  
  // Create a more chaotic glitch
  element.style.animation = 'none';
  
  // Force reflow
  void element.offsetWidth;
  
  // Apply intense glitch for a short duration
  element.style.animation = 'glitch-noise-1 0.2s steps(1) 2, glitch-noise-2 0.3s steps(1) 1';
  
  // Apply a quick position shift
  const originalTransform = element.style.transform;
  element.style.transform = `translate(${(Math.random() * 6) - 3}px, ${(Math.random() * 6) - 3}px)`;
  
  // Reset after effect
  setTimeout(() => {
    element.style.animation = originalAnimation;
    element.style.transform = originalTransform;
  }, 500);
}

/**
 * Initialize particle effects on page
 */
function initParticleEffects() {
  // Create particle container
  const particleContainer = document.createElement('div');
  particleContainer.className = 'particle-container';
  particleContainer.style.position = 'fixed';
  particleContainer.style.top = '0';
  particleContainer.style.left = '0';
  particleContainer.style.width = '100%';
  particleContainer.style.height = '100%';
  particleContainer.style.pointerEvents = 'none';
  particleContainer.style.zIndex = '1';
  
  document.body.appendChild(particleContainer);
  
  // Create data stream particles
  for (let i = 0; i < 20; i++) {
    createDataStreamParticle(particleContainer);
  }
  
  // Track mouse for reactive particles
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Create reactive particles on mouse move
    if (Math.random() > 0.9) {
      createReactiveParticle(mouseX, mouseY, particleContainer);
    }
  });
  
  // Add particles on click
  document.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
      createReactiveParticle(e.clientX, e.clientY, particleContainer);
    }
  });
}

/**
 * Create a data stream particle that flows across the screen
 */
function createDataStreamParticle(container) {
  const particle = document.createElement('div');
  
  // Randomize properties
  const size = Math.random() * 3 + 1;
  const color = Math.random() > 0.5 ? 
    `rgba(255, 49, 176, ${Math.random() * 0.5 + 0.2})` : 
    `rgba(49, 255, 247, ${Math.random() * 0.5 + 0.2})`;
  
  // Set styles
  particle.style.position = 'absolute';
  particle.style.width = `${size}px`;
  particle.style.height = `${Math.random() * 20 + 5}px`;
  particle.style.backgroundColor = color;
  particle.style.borderRadius = '50%';
  particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
  particle.style.opacity = Math.random() * 0.5 + 0.3;
  
  // Set random starting position
  const startX = Math.random() * window.innerWidth;
  const startY = -30;
  particle.style.left = `${startX}px`;
  particle.style.top = `${startY}px`;
  
  // Add to container
  container.appendChild(particle);
  
  // Animate particle
  const speed = Math.random() * 5 + 2;
  const angle = Math.random() * 20 - 10; // Slight angle variation
  
  function moveParticle() {
    const currentTop = parseFloat(particle.style.top);
    const currentLeft = parseFloat(particle.style.left);
    
    particle.style.top = `${currentTop + speed}px`;
    particle.style.left = `${currentLeft + (Math.sin(currentTop / 50) * angle / 10)}px`;
    
    // Remove when off screen and create a new one
    if (currentTop > window.innerHeight) {
      particle.remove();
      createDataStreamParticle(container);
    } else {
      requestAnimationFrame(moveParticle);
    }
  }
  
  requestAnimationFrame(moveParticle);
}

/**
 * Create a reactive particle at cursor position
 */
function createReactiveParticle(x, y, container) {
  const particle = document.createElement('div');
  
  // Randomize properties
  const size = Math.random() * 6 + 2;
  const color = Math.random() > 0.5 ? 
    `rgba(255, 49, 176, ${Math.random() * 0.7 + 0.3})` : 
    `rgba(49, 255, 247, ${Math.random() * 0.7 + 0.3})`;
  
  // Set styles
  particle.style.position = 'absolute';
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.backgroundColor = color;
  particle.style.borderRadius = '50%';
  particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
  particle.style.opacity = 1;
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  
  // Add to container
  container.appendChild(particle);
  
  // Calculate random direction
  const angle = Math.random() * 2 * Math.PI;
  const speed = Math.random() * 3 + 1;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  // Track animation progress
  let progress = 0;
  const maxProgress = 100;
  
  function animateParticle() {
    progress += 1;
    
    const currentLeft = parseFloat(particle.style.left);
    const currentTop = parseFloat(particle.style.top);
    
    particle.style.left = `${currentLeft + vx}px`;
    particle.style.top = `${currentTop + vy}px`;
    
    // Fade out
    particle.style.opacity = 1 - (progress / maxProgress);
    
    if (progress < maxProgress) {
      requestAnimationFrame(animateParticle);
    } else {
      particle.remove();
    }
  }
  
  requestAnimationFrame(animateParticle);
}

/**
 * Initialize page transition effects
 */
function initPageTransitions() {
  // Create overlay for transitions
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = '#0e0e11';
  overlay.style.zIndex = '9999';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 0.5s ease';
  
  document.body.appendChild(overlay);
  
  // Add transition effect to all external links
  const externalLinks = document.querySelectorAll('a[href^="http"], a[href^="../"]');
  externalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Only handle external links that open in same window
      if (!link.getAttribute('target')) {
        e.preventDefault();
        
        // Show overlay
        overlay.style.opacity = '1';
        
        // Add glitch lines to overlay
        createGlitchLines(overlay);
        
        // Navigate after transition
        setTimeout(() => {
          window.location.href = href;
        }, 600);
      }
    });
  });
  
  // Add smooth section transitions for internal links
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Subtle flash effect on transition
        overlay.style.opacity = '0.3';
        setTimeout(() => {
          overlay.style.opacity = '0';
        }, 300);
        
        // Scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Create glitch lines for page transitions
 */
function createGlitchLines(overlay) {
  // Clear any existing lines
  overlay.innerHTML = '';
  
  // Create horizontal glitch lines
  for (let i = 0; i < 10; i++) {
    const line = document.createElement('div');
    
    const yPos = Math.random() * 100;
    const height = Math.random() * 5 + 1;
    const color = Math.random() > 0.5 ? 
      `rgba(255, 49, 176, ${Math.random() * 0.8 + 0.2})` : 
      `rgba(49, 255, 247, ${Math.random() * 0.8 + 0.2})`;
    
    line.style.position = 'absolute';
    line.style.top = `${yPos}%`;
    line.style.left = '0';
    line.style.width = '100%';
    line.style.height = `${height}px`;
    line.style.backgroundColor = color;
    line.style.transform = `translateX(${(Math.random() * 10) - 5}%)`;
    line.style.opacity = Math.random() * 0.5 + 0.5;
    line.style.boxShadow = `0 0 10px ${color}`;
    
    overlay.appendChild(line);
    
    // Animate line
    const direction = Math.random() > 0.5 ? 1 : -1;
    let position = parseFloat(line.style.transform.replace('translateX(', '').replace('%)', ''));
    
    function animateLine() {
      position += direction * (Math.random() * 2);
      line.style.transform = `translateX(${position}%)`;
      
      if (overlay.style.opacity !== '0') {
        requestAnimationFrame(animateLine);
      }
    }
    
    animateLine();
  }
}

/**
 * Initialize navbar effects and functionality
 */
function initNavbarEffects() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.navbar-nav a');
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarNav = document.querySelector('.navbar-nav');
  
  if (!navbar) return;
  
  // Add data scan line to navbar
  const scanLine = document.createElement('div');
  scanLine.className = 'navbar-scan-line';
  scanLine.style.position = 'absolute';
  scanLine.style.top = '0';
  scanLine.style.left = '0';
  scanLine.style.width = '100%';
  scanLine.style.height = '2px';
  scanLine.style.background = 'linear-gradient(to right, transparent, rgba(49, 255, 247, 0.5), transparent)';
  scanLine.style.opacity = '0';
  scanLine.style.zIndex = '0';
  
  navbar.appendChild(scanLine);
  
  // Animate scan line
  function animateScanLine() {
    scanLine.style.opacity = '0.7';
    scanLine.style.top = '0';
    
    let position = 0;
    const animateScan = () => {
      position += 1;
      scanLine.style.top = `${position}px`;
      
      if (position < navbar.offsetHeight) {
        requestAnimationFrame(animateScan);
      } else {
        scanLine.style.opacity = '0';
        
        // Schedule next scan
        setTimeout(() => {
          if (Math.random() > 0.5) {
            animateScanLine();
          }
        }, Math.random() * 5000 + 3000);
      }
    };
    
    animateScan();
  }
  
  // Start scan line animation
  setTimeout(animateScanLine, 2000);
  
  // Scroll effects for navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(14, 14, 17, 0.95)';
      navbar.style.boxShadow = '0 0 20px rgba(49, 255, 247, 0.3)';
    } else {
      navbar.style.background = 'rgba(14, 14, 17, 0.8)';
      navbar.style.boxShadow = '0 0 20px rgba(49, 255, 247, 0.15)';
    }
  });
  
  // Glitch effect on navbar links
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      applyGlitchEffect(link, 300);
    });
    
    // Smooth scroll for same-page links
    if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Add glitch effect to target section
          applyGlitchEffect(targetElement, 500);
          
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
          
          // Sync active state
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Close mobile menu if open
          if (navbarNav.classList.contains('active')) {
            navbarNav.classList.remove('active');
            navbarToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  });
  
  // Mobile menu toggle with improved animation
  if (navbarToggle && navbarNav) {
    navbarToggle.addEventListener('click', () => {
      const isExpanded = navbarToggle.getAttribute('aria-expanded') === 'true';
      
      if (!isExpanded) {
        // Opening the menu
        navbarNav.style.display = 'flex';
        navbarNav.style.transform = 'translateX(100%)';
        
        // Force reflow
        void navbarNav.offsetWidth;
        
        // Apply transition
        navbarNav.style.transform = 'translateX(0)';
        navbarToggle.setAttribute('aria-expanded', 'true');
        
        // Add glitch effect to menu items
        const menuItems = navbarNav.querySelectorAll('a');
        menuItems.forEach((item, index) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 100 + (index * 70));
        });
      } else {
        // Closing the menu
        navbarNav.style.transform = 'translateX(100%)';
        navbarToggle.setAttribute('aria-expanded', 'false');
        
        // Hide after transition
        setTimeout(() => {
          if (navbarToggle.getAttribute('aria-expanded') === 'false') {
            navbarNav.style.display = 'none';
          }
        }, 300);
      }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navbarNav.classList.contains('active') && 
          !navbarNav.contains(e.target) && 
          !navbarToggle.contains(e.target)) {
        navbarNav.classList.remove('active');
        navbarToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // Track active section on scroll
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 200;
    
    // Get all sections that have an ID
    const sections = document.querySelectorAll('section[id]');
    
    // Find the current section
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current section link
        const correspondingLink = document.querySelector(`.navbar-nav a[href="#${section.id}"]`);
        if (correspondingLink) {
          correspondingLink.classList.add('active');
        }
      }
    });
  });
}

/**
 * Initialize contact form with validation and effects
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    // Create a glitch effect for the form
    const formGlitch = document.createElement('div');
    formGlitch.className = 'form-glitch-overlay';
    formGlitch.style.position = 'absolute';
    formGlitch.style.top = '0';
    formGlitch.style.left = '0';
    formGlitch.style.width = '100%';
    formGlitch.style.height = '100%';
    formGlitch.style.background = 'transparent';
    formGlitch.style.pointerEvents = 'none';
    formGlitch.style.zIndex = '1';
    formGlitch.style.opacity = '0';
    
    contactForm.style.position = 'relative';
    contactForm.appendChild(formGlitch);
    
    // Flag to track if the form is currently glitching
    let isGlitching = false;
    
    // Periodically trigger a subtle glitch on the form
    setInterval(() => {
      if (!isGlitching && Math.random() > 0.7) {
        triggerFormGlitch();
      }
    }, 5000);
    
    function triggerFormGlitch() {
      isGlitching = true;
      formGlitch.style.opacity = '1';
      
      // Create horizontal glitch lines
      formGlitch.innerHTML = '';
      
      for (let i = 0; i < 3; i++) {
        const line = document.createElement('div');
        
        const yPos = Math.random() * 100;
        const height = Math.random() * 3 + 1;
        const color = Math.random() > 0.5 ? 
          `rgba(255, 49, 176, 0.5)` : 
          `rgba(49, 255, 247, 0.5)`;
        
        line.style.position = 'absolute';
        line.style.top = `${yPos}%`;
        line.style.left = '0';
        line.style.width = '100%';
        line.style.height = `${height}px`;
        line.style.backgroundColor = color;
        line.style.opacity = Math.random() * 0.5 + 0.3;
        line.style.transform = `translateX(${(Math.random() * 5) - 2.5}%)`;
        line.style.boxShadow = `0 0 5px ${color}`;
        
        formGlitch.appendChild(line);
      }
      
      // End glitch effect
      setTimeout(() => {
        formGlitch.style.opacity = '0';
        isGlitching = false;
      }, 300);
    }
    
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simple validation
      const formInputs = contactForm.querySelectorAll('input, textarea');
      let isValid = true;
      
      formInputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          isValid = false;
          input.classList.add('error');
          
          // Add error animation
          input.style.animation = 'none';
          setTimeout(() => {
            input.style.animation = 'glitch-offset 0.3s 3';
          }, 10);
        } else {
          input.classList.remove('error');
        }
      });
      
      if (isValid) {
        // Success animation and feedback
        contactForm.classList.add('submitted');
        
        // Trigger bigger glitch effect on successful submit
        triggerFormGlitch();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        
        if (submitBtn) {
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'SIGNAL TRANSMITTED';
          submitBtn.disabled = true;
          
          // Apply success glitch effect
          applyGlitchEffect(submitBtn, 1000);
          
          setTimeout(() => {
            // Reset form after delay
            contactForm.reset();
            contactForm.classList.remove('submitted');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
          }, 3000);
        }
      }
    });
    
    // Input focus effects
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.boxShadow = '0 0 15px rgba(49, 255, 247, 0.5)';
        
        // Small chance to trigger glitch on focus
        if (Math.random() > 0.7) {
          triggerFormGlitch();
        }
      });
      
      input.addEventListener('blur', () => {
        input.style.boxShadow = '';
        
        // Remove error class if field is now valid
        if (input.hasAttribute('required') && input.value.trim()) {
          input.classList.remove('error');
        }
      });
    });
  }
}

/**
 * Initialize the interactive character dial
 */
function initGlitchDial() {
  const dialSegments = document.querySelectorAll('.dial-segment');
  const dialCenter = document.querySelector('.dial-center');
  const glitchDial = document.querySelector('.glitch-dial');
  
  // Track rotation state
  let currentRotation = 0;
  let activeCharacter = null;
  
  // Add click events to dial segments
  dialSegments.forEach(segment => {
    segment.addEventListener('click', () => {
      const character = segment.getAttribute('data-character');
      
      // Determine rotation based on character
      let targetRotation = 0;
      
      switch(character) {
        case 'ph4ze':
          targetRotation = 0;
          break;
        case 'vektor':
          targetRotation = 120;
          break;
        case 'x1nth':
          targetRotation = 240;
          break;
      }
      
      // Apply rotation to dial
      glitchDial.style.transform = `rotate(${targetRotation}deg)`;
      currentRotation = targetRotation;
      
      // Set active class on current segment and remove from others
      dialSegments.forEach(s => s.classList.remove('active'));
      segment.classList.add('active');
      
      // Set active character and open modal
      activeCharacter = character;
      openCharacterModal(character);
    });
  });
  
  // Center dial click resets rotation
  dialCenter.addEventListener('click', () => {
    glitchDial.style.transform = 'rotate(0deg)';
    currentRotation = 0;
    activeCharacter = null;
    dialSegments.forEach(s => s.classList.remove('active'));
  });
  
  // Add hover effect to segments
  dialSegments.forEach(segment => {
    segment.addEventListener('mouseenter', () => {
      const character = segment.getAttribute('data-character');
      playCharacterAudio(character, 0.2);
    });
    
    segment.addEventListener('mouseleave', () => {
      const character = segment.getAttribute('data-character');
      stopCharacterAudio(character);
    });
  });
}

/**
 * Initialize character modal controls
 */
function initModalControls() {
  const modals = document.querySelectorAll('.lore-modal');
  const closeButtons = document.querySelectorAll('.modal-close');
  
  // Close modal when clicking the X button
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.lore-modal');
      closeModal(modal);
    });
  });
  
  // Close modal when clicking outside content
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.lore-modal.active');
      if (activeModal) {
        closeModal(activeModal);
      }
    }
  });
}

/**
 * Open character modal
 */
function openCharacterModal(character) {
  const modal = document.getElementById(`${character}-modal`);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  // Play character audio
  playCharacterAudio(character, 0.5);
  
  // Animate modal content
  setTimeout(() => {
    const content = modal.querySelector('.modal-content');
    content.style.opacity = '1';
    content.style.transform = 'translateY(0)';
  }, 10);
}

/**
 * Close character modal
 */
function closeModal(modal) {
  const content = modal.querySelector('.modal-content');
  const character = modal.id.replace('-modal', '');
  
  // Animate out
  content.style.opacity = '0';
  content.style.transform = 'translateY(50px)';
  
  // Stop character audio
  stopCharacterAudio(character);
  
  // Remove active class after animation
  setTimeout(() => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }, 300);
}

/**
 * Play character audio
 */
function playCharacterAudio(character, volume = 0.5) {
  const audio = document.getElementById(`${character}-audio`);
  if (audio) {
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play();
  }
}

/**
 * Stop character audio
 */
function stopCharacterAudio(character) {
  const audio = document.getElementById(`${character}-audio`);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

/**
 * Initialize the custom audio player
 */
function initAudioPlayer() {
  const audioPlayer = document.querySelector('.audio-player');
  const mainAudio = document.getElementById('main-audio');
  const playPauseBtn = document.querySelector('.play-pause');
  const playIcon = document.getElementById('play-icon');
  const prevBtn = document.querySelector('.previous');
  const nextBtn = document.querySelector('.next');
  const progressBar = document.querySelector('.progress-bar');
  const progressContainer = document.querySelector('.progress-container');
  const currentTimeEl = document.querySelector('.current-time');
  const totalTimeEl = document.querySelector('.total-time');
  const volumeBtn = document.querySelector('.volume');
  const artworkImg = document.getElementById('current-artwork');
  const playerArtwork = document.querySelector('.player-artwork');
  const playlistItems = document.querySelectorAll('.playlist-item');
  
  let currentTrack = 0;
  let isPlaying = false;
  let updateTimer;
  
  // Create equalizer bars for visualization
  function createEqualizer() {
    // Remove any existing equalizer bars
    const existingBars = playerArtwork.querySelectorAll('.equalizer-bar');
    existingBars.forEach(bar => bar.remove());
    
    // Create new equalizer bars
    for (let i = 0; i < 16; i++) {
      const bar = document.createElement('div');
      bar.className = 'equalizer-bar';
      bar.style.setProperty('--bar-index', i);
      bar.style.height = `${Math.floor(Math.random() * 20) + 5}px`;
      playerArtwork.appendChild(bar);
    }
  }
  
  // Update equalizer animation
  function updateEqualizer() {
    if (isPlaying) {
      playerArtwork.classList.add('playing');
      const bars = playerArtwork.querySelectorAll('.equalizer-bar');
      bars.forEach(bar => {
        bar.style.height = `${Math.floor(Math.random() * 20) + 5}px`;
      });
    } else {
      playerArtwork.classList.remove('playing');
    }
  }
  
  // Start equalizer animation
  let equalizerInterval;
  function startEqualizer() {
    createEqualizer();
    if (equalizerInterval) clearInterval(equalizerInterval);
    equalizerInterval = setInterval(updateEqualizer, 100);
  }
  
  // Stop equalizer animation
  function stopEqualizer() {
    if (equalizerInterval) clearInterval(equalizerInterval);
    playerArtwork.classList.remove('playing');
  }
  
  // Initialize with first track
  loadTrack(currentTrack);
  
  // Play/Pause button click
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  });
  
  // Previous track
  prevBtn.addEventListener('click', () => {
    if (currentTrack > 0) {
      currentTrack--;
    } else {
      currentTrack = playlistItems.length - 1;
    }
    loadTrack(currentTrack);
    playTrack();
  });
  
  // Next track
  nextBtn.addEventListener('click', () => {
    if (currentTrack < playlistItems.length - 1) {
      currentTrack++;
    } else {
      currentTrack = 0;
    }
    loadTrack(currentTrack);
    playTrack();
  });
  
  // Volume button toggle
  let isMuted = false;
  volumeBtn.addEventListener('click', () => {
    if (isMuted) {
      mainAudio.volume = 0.7;
      volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      isMuted = false;
    } else {
      mainAudio.volume = 0;
      volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      isMuted = true;
    }
  });
  
  // Progress bar click to seek
  progressContainer.addEventListener('click', (e) => {
    const clickPosition = e.offsetX / progressContainer.offsetWidth;
    mainAudio.currentTime = clickPosition * mainAudio.duration;
  });
  
  // Track ended event
  mainAudio.addEventListener('ended', () => {
    if (currentTrack < playlistItems.length - 1) {
      currentTrack++;
      loadTrack(currentTrack);
      playTrack();
    } else {
      currentTrack = 0;
      loadTrack(currentTrack);
      pauseTrack();
    }
  });
  
  // Click on playlist item
  playlistItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentTrack = index;
      loadTrack(currentTrack);
      playTrack();
    });
  });
  
  // Load track
  function loadTrack(trackIndex) {
    clearInterval(updateTimer);
    resetValues();
    
    // Update active class in playlist
    playlistItems.forEach(item => item.classList.remove('active'));
    playlistItems[trackIndex].classList.add('active');
    
    // Get track details
    const currentItem = playlistItems[trackIndex];
    const trackSrc = currentItem.getAttribute('data-src');
    const artworkSrc = currentItem.getAttribute('data-artwork');
    
    // Set audio source and load
    mainAudio.src = trackSrc;
    mainAudio.load();
    
    // Update artwork
    artworkImg.src = artworkSrc;
    
    // Apply glitch effect to artwork
    applyGlitchEffect(artworkImg);
    
    // Start progress tracking
    updateTimer = setInterval(updateProgress, 1000);
    
    // Update track metadata when loaded
    mainAudio.addEventListener('loadedmetadata', updateTrackInfo);
  }
  
  // Play track
  function playTrack() {
    mainAudio.play();
    isPlaying = true;
    playIcon.classList.remove('fa-play');
    playIcon.classList.add('fa-pause');
    startEqualizer();
    playerArtwork.classList.add('playing');
  }
  
  // Pause track
  function pauseTrack() {
    mainAudio.pause();
    isPlaying = false;
    playIcon.classList.remove('fa-pause');
    playIcon.classList.add('fa-play');
    stopEqualizer();
    playerArtwork.classList.remove('playing');
  }
  
  // Reset values
  function resetValues() {
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    progressBar.style.width = '0%';
  }
  
  // Update track progress
  function updateProgress() {
    if (!isNaN(mainAudio.duration)) {
      const currentTime = mainAudio.currentTime;
      const duration = mainAudio.duration;
      
      // Update progress bar
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      
      // Update time displays
      currentTimeEl.textContent = formatTime(currentTime);
      totalTimeEl.textContent = formatTime(duration);
    }
  }
  
  // Update track metadata info
  function updateTrackInfo() {
    totalTimeEl.textContent = formatTime(mainAudio.duration);
  }
  
  // Format time to MM:SS
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  }
}

/**
 * Apply glitch effects to elements
 */
function applyGlitchEffect(element, duration = 500) {
  // Store original styles
  const originalFilter = element.style.filter || '';
  const originalTransform = element.style.transform || '';
  const originalTransition = element.style.transition || '';
  
  // Disable transitions temporarily
  element.style.transition = 'none';
  
  // Apply glitch effect
  element.style.filter = 'brightness(1.3) contrast(1.4) hue-rotate(5deg)';
  element.style.transform = originalTransform + ' scale(1.02) translate(2px, -2px)';
  
  // Force reflow
  void element.offsetWidth;
  
  // Create a more intense effect for important elements
  const isHeading = element.tagName === 'H1' || element.tagName === 'H2' || 
                    element.tagName === 'H3' || element.classList.contains('glitch-title');
  
  if (isHeading || Math.random() > 0.7) {
    // Add clip-path glitch for headings
    const clipPathValues = [
      'inset(10% 0 80% 0)',
      'inset(40% 0 40% 0)',
      'inset(80% 0 10% 0)',
      'inset(10% 80% 10% 10%)'
    ];
    
    let clipIndex = 0;
    const clipInterval = setInterval(() => {
      element.style.clipPath = clipPathValues[clipIndex % clipPathValues.length];
      clipIndex++;
    }, 50);
    
    setTimeout(() => {
      clearInterval(clipInterval);
      element.style.clipPath = 'none';
    }, duration / 2);
  }
  
  // Reset to original state with smooth transition
  setTimeout(() => {
    element.style.transition = originalTransition || 'all 0.3s ease';
    element.style.filter = originalFilter;
    element.style.transform = originalTransform;
  }, duration);
}

/**
 * Initialize dark mode toggle with enhanced effects
 */
function initDarkModeToggle() {
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  if (!darkModeToggle) return;
  
  // Default to dark theme for this project
  if (!localStorage.getItem('theme')) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    const savedTheme = localStorage.getItem('theme');
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    document.body.classList.toggle('light-theme', savedTheme === 'light');
  }
  
  darkModeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('light-theme')) {
      // Switching to dark theme
      
      // Create a transition overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(255, 49, 176, 0.1)';
      overlay.style.zIndex = '9998';
      overlay.style.pointerEvents = 'none';
      
      document.body.appendChild(overlay);
      
      // Create glitch lines
      for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.top = `${Math.random() * 100}%`;
        line.style.left = '0';
        line.style.width = '100%';
        line.style.height = `${Math.random() * 3 + 1}px`;
        line.style.backgroundColor = 'rgba(49, 255, 247, 0.5)';
        line.style.transform = `translateX(${(Math.random() * 5) - 2.5}%)`;
        
        overlay.appendChild(line);
      }
      
      // Apply change with animation
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
      
      // Apply glitch effect to body
      document.body.style.transition = 'none';
      document.body.style.filter = 'hue-rotate(180deg) brightness(0.8)';
      
      setTimeout(() => {
        document.body.style.transition = 'all 0.5s ease';
        document.body.style.filter = 'none';
        
        // Remove overlay after transition
        setTimeout(() => {
          overlay.remove();
        }, 500);
      }, 100);
      
    } else {
      // Switching to light theme
      
      // Create a transition overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(49, 255, 247, 0.1)';
      overlay.style.zIndex = '9998';
      overlay.style.pointerEvents = 'none';
      
      document.body.appendChild(overlay);
      
      // Create glitch lines
      for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.top = `${Math.random() * 100}%`;
        line.style.left = '0';
        line.style.width = '100%';
        line.style.height = `${Math.random() * 3 + 1}px`;
        line.style.backgroundColor = 'rgba(255, 49, 176, 0.5)';
        line.style.transform = `translateX(${(Math.random() * 5) - 2.5}%)`;
        
        overlay.appendChild(line);
      }
      
      // Apply change with animation
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      
      // Apply glitch effect to body
      document.body.style.transition = 'none';
      document.body.style.filter = 'hue-rotate(-180deg) brightness(1.2)';
      
      setTimeout(() => {
        document.body.style.transition = 'all 0.5s ease';
        document.body.style.filter = 'none';
        
        // Remove overlay after transition
        setTimeout(() => {
          overlay.remove();
        }, 500);
      }, 100);
    }
  });
  
  // Add hover effect to toggle
  darkModeToggle.addEventListener('mouseenter', () => {
    darkModeToggle.style.transform = 'scale(1.1)';
  });
  
  darkModeToggle.addEventListener('mouseleave', () => {
    darkModeToggle.style.transform = 'scale(1)';
  });
}

/**
 * Initialize scroll to top button with enhanced effects
 */
function initScrollToTop() {
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (!scrollTopBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
  
  scrollTopBtn.addEventListener('click', () => {
    // Add glitch effect to the button
    applyGlitchEffect(scrollTopBtn, 300);
    
    // Create temporary overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.zIndex = '9997';
    overlay.style.pointerEvents = 'none';
    
    // Create horizontal glitch lines
    for (let i = 0; i < 10; i++) {
      const line = document.createElement('div');
      
      const yPos = (i / 10) * 100;
      const height = Math.random() * 2 + 1;
      const color = Math.random() > 0.5 ? 
        'rgba(255, 49, 176, 0.3)' : 
        'rgba(49, 255, 247, 0.3)';
      
      line.style.position = 'absolute';
      line.style.top = `${yPos}%`;
      line.style.left = '0';
      line.style.width = '100%';
      line.style.height = `${height}px`;
      line.style.backgroundColor = color;
      line.style.transform = `translateY(${window.scrollY}px)`;
      line.style.opacity = '0.5';
      
      overlay.appendChild(line);
    }
    
    document.body.appendChild(overlay);
    
    // Apply glitch effect to page before scrolling
    document.body.style.filter = 'brightness(1.2) contrast(1.3) hue-rotate(5deg)';
    
    // Animate lines during scroll
    let scrollPos = window.scrollY;
    const scrollStep = scrollPos / 40;
    
    function animateScroll() {
      scrollPos -= scrollStep;
      window.scrollTo(0, Math.max(0, scrollPos));
      
      // Update line positions
      const lines = overlay.querySelectorAll('div');
      lines.forEach(line => {
        line.style.transform = `translateY(${scrollPos * 0.5}px)`;
      });
      
      if (scrollPos > 0) {
        requestAnimationFrame(animateScroll);
      } else {
        // Clean up
        document.body.style.filter = 'none';
        overlay.remove();
      }
    }
    
    animateScroll();
  });
}
  