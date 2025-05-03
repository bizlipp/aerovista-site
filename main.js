/* ======================================================
   AeroVista — Main JS (v1)
   ------------------------------------------------------
   Pure vanilla JS powering dynamic content across all
   static pages. Each HTML page adds <body data-page="...">
   so we can run only what’s needed.
   ====================================================== */

// 1. CONTENT -----------------------------------------------------------------
export const divisions = [
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

export const apps = [
  {
    slug: 'bytepad',
    title: 'BytePad',
    status: 'Released',
    desc: 'Sticky‑note productivity app that syncs across devices.'
  },
  {
    slug: 'vaultmaster',
    title: 'VaultMaster',
    status: 'Beta',
    desc: 'Local‑first file manager with glitch‑punk UI.'
  },
  {
    slug: 'rydesync',
    title: 'RydeSync',
    status: 'Coming Soon',
    desc: 'Offline‑first ride community with synced music rooms.'
  }
];

// 2. RENDER HELPERS -----------------------------------------------------------
function createCard({ name, title, desc, status, slug }, type = 'division') {
  const card = document.createElement('a');
  card.href = type === 'division' ? `divisions/${slug}.html` : `apps/${slug}.html`;
  card.className = 'card';
  card.setAttribute('data-animate', 'fade-up');
  card.innerHTML = `
      <h3>${name || title}</h3>
      <p>${desc}</p>
      ${status ? `<span class="badge">${status}</span>` : ''}
  `;
  return card;
}

function renderGrid(items, targetId, type) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;
  items.forEach(item => wrap.appendChild(createCard(item, type)));
}

// 3. PAGE ROUTER --------------------------------------------------------------
function initHome() {
  renderGrid(divisions, 'divisionGrid', 'division');
  renderGrid(apps, 'appGrid', 'app');
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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! We\'ll be in touch soon.');
    form.reset();
  });
}

// 4. BOOTSTRAP ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
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
  // Always
  initContactForm();
});
