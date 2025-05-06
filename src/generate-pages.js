/**
 * AeroVista Page Generator
 * Generates HTML pages from templates and data
 */

const fs = require('fs');
const path = require('path');
const templating = require('./templating');

// Path constants
const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = ROOT_DIR;

console.log('Starting page generation...');
console.log('Templates directory:', path.join(ROOT_DIR, 'templates'));
console.log('Output directory:', OUTPUT_DIR);

// Site-wide data
const siteData = {
  site_name: 'AeroVista',
  site_domain: 'aerovista.us',
  copyright_year: new Date().getFullYear()
};

/**
 * Generate the home page
 */
function generateHomePage() {
  const data = {
    ...siteData,
    title: 'Home',
    description: 'AeroVista is a visionary creative and technology studio uniting talent across immersive media, learning innovation, and future-forward development.',
    og_description: 'AeroVista is a future-forward studio blending creativity and technology to shape immersive media, learning innovation, and digital experiences across seven divisions.',
    canonical_url: '/',
    page_id: 'home',
    is_home: true,
    include_contact: true
  };
  
  templating.generatePage('home', data, path.join(OUTPUT_DIR, 'index.html'));
}

/**
 * Generate the about page
 */
function generateAboutPage() {
  const data = {
    ...siteData,
    title: 'About',
    description: 'Learn about AeroVista\'s journey from garage-level prototypes to a multi-division powerhouse in tech and creative services.',
    og_description: 'Discover our story, milestones, and the team behind AeroVista\'s creative tech solutions.',
    canonical_url: '/about.html',
    page_id: 'about',
    is_about: true,
    page_title: 'About AeroVista',
    include_contact: true,
    custom_css: `
      /* Simple vertical timeline */
      .timeline { position: relative; margin: 2rem 0; padding-left: 2rem; }
      .timeline::before { content:''; position: absolute; left:0; top:0; width:4px; height:100%; background:var(--color-accent); }
      .timeline-entry { position: relative; margin-bottom:2rem; }
      .timeline-entry h4 { margin-bottom:0.25rem; font-family:var(--font-heading); }
      .timeline-entry::before { content:''; position:absolute; left:-12px; top:4px; width:14px; height:14px; border-radius:50%; background:var(--color-accent); }
      .team-grid { display:grid; gap:2rem; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); margin-top:2rem; }
      .team-card { text-align:center; }
      .team-card img { width:120px; height:120px; object-fit:cover; border-radius:50%; margin-inline:auto 1rem; margin-bottom:1rem; }
    `,
    page_content: `
      <div class="text-center" data-animate="fade-up">
        <p style="font-size:1.2rem;max-width:800px;margin:0 auto 3rem;">
          We blend artistry with technical mastery, combining agility with vision to bring bold ideas to life. Every challenge is a canvas, every solution a crafted expression of our values.
        </p>
      </div>
      
      <h2>Milestones</h2>
      <div class="timeline">
        <div class="timeline-entry">
          <h4>2019 — First Drone Footage Project</h4>
          <p>Horizon Aerial & Visual captures cinematic landscapes, sparking the vision for a multi‑disciplinary studio.</p>
        </div>
        <div class="timeline-entry">
          <h4>2021 — BytePad Alpha</h4>
          <p>Our local‑first sticky notes prototype sets the foundation for user‑centric productivity tools.</p>
        </div>
        <div class="timeline-entry">
          <h4>2023 — AeroVista LLC Formation</h4>
          <p>Seven divisions unite under a single banner with cohesive branding and shared resources.</p>
        </div>
        <div class="timeline-entry">
          <h4>2025 — First Public Product Launch</h4>
          <p>BytePad Pro hits the store, marking the beginning of our commercial lineup.</p>
        </div>
      </div>
    `
  };
  
  templating.generatePage('page', data, path.join(OUTPUT_DIR, 'about.html'));
}

/**
 * Generate the divisions overview page
 */
function generateDivisionsPage() {
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

  const data = {
    ...siteData,
    title: 'Divisions',
    description: 'Explore AeroVista\'s seven specialist divisions, each bringing unique expertise in tech, media, and creative services.',
    og_description: 'Discover our seven specialized divisions offering expertise in game development, audio production, creative services, and more.',
    canonical_url: '/divisions.html',
    page_id: 'divisions-hub',
    is_divisions: true,
    divisions,
    include_contact: true
  };
  
  // TODO: Create a proper divisions template - for now using page template
  templating.generatePage('page', data, path.join(OUTPUT_DIR, 'divisions.html'));
}

/**
 * Generate the apps overview page
 */
function generateAppsPage() {
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

  const data = {
    ...siteData,
    title: 'Apps',
    description: 'Discover AeroVista\'s suite of innovative applications, from productivity tools to creative software.',
    og_description: 'Explore our collection of thoughtfully designed apps built with modern technology and attention to user experience.',
    canonical_url: '/apps.html',
    page_id: 'apps-hub',
    is_apps: true,
    apps,
    include_contact: true
  };
  
  // TODO: Create a proper apps template - for now using page template
  templating.generatePage('page', data, path.join(OUTPUT_DIR, 'apps.html'));
}

/**
 * Generate all pages
 */
function generateAllPages() {
  // Make sure the output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Generate main pages
  generateHomePage();
  generateAboutPage();
  generateDivisionsPage();
  generateAppsPage();
  
  console.log('All pages generated successfully!');
}

// Run the generator if this file is executed directly
if (require.main === module) {
  generateAllPages();
}

module.exports = {
  generateAllPages,
  generateHomePage,
  generateAboutPage,
  generateDivisionsPage,
  generateAppsPage
}; 