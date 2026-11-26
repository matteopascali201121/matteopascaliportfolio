/* ============================
   NAV: scroll effect
   ============================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.style.background = 'rgba(6, 9, 26, 0.97)';
  } else {
    navbar.style.background = 'rgba(6, 9, 26, 0.82)';
  }
}, { passive: true });

/* ============================
   HAMBURGER MENU
   ============================ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Chiude il menu mobile cliccando un link
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ============================
   YEAR TOGGLE (accordion)
   ============================ */
document.querySelectorAll('.year-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const panelId = btn.dataset.target;
    const panel = document.getElementById(panelId);
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    btn.setAttribute('aria-expanded', !isExpanded);
    panel.classList.toggle('year-panel--collapsed', isExpanded);
  });
});

/* ============================
   ACTIVE NAV LINK (Intersection Observer)
   ============================ */
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--white)'
          : 'var(--text-muted)';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));
