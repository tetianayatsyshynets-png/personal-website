// Smooth scrolling (desktop/trackpad only — touch devices keep native
// scroll, since it's already smooth and forcing custom easing onto it
// tends to feel laggy and disconnected from the finger). Skipped entirely
// if the visitor has "reduce motion" turned on at the OS level.
let lenis;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (window.Lenis && !prefersReducedMotion) {
  lenis = new Lenis({
    anchors: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

// Match the intro photo's height to the paragraph beside it (photo is a flex item
// with a large intrinsic size, so pure CSS stretch can't do this without breaking wrap).
const introPhoto = document.querySelector('.intro-photo');
const introCopy = document.querySelector('.intro-copy');

function syncIntroPhotoHeight() {
  if (!introPhoto || !introCopy) return;
  if (window.matchMedia('(max-width: 640px)').matches) {
    introPhoto.style.height = '';
    return;
  }
  introPhoto.style.height = `${introCopy.getBoundingClientRect().height}px`;
}

if (introPhoto && introCopy) {
  syncIntroPhotoHeight();
  window.addEventListener('resize', syncIntroPhotoHeight);
  document.fonts?.ready.then(syncIntroPhotoHeight);
  new ResizeObserver(syncIntroPhotoHeight).observe(introCopy);
}

// On tablets, align the hero text block with the "Case studies" nav item
// instead of the fluid indent used elsewhere — that indent's left offset
// doesn't line up with the nav (whose position depends on the logo + link
// text widths, not something a CSS formula can reference), so measure it.
const heroContent = document.querySelector('.hero-content');
const caseStudiesLink = document.querySelector('.main-nav a[href="#projects"]');
const tabletQuery = window.matchMedia('(min-width: 641px) and (max-width: 1120px)');

function syncHeroIndentToNav() {
  if (!heroContent || !caseStudiesLink) return;
  if (!tabletQuery.matches) {
    heroContent.style.marginLeft = '';
    return;
  }
  // margin-left is relative to hero-content's own natural position (which
  // already includes the section's own padding), not the viewport — so
  // measure the natural position first and apply the difference, rather
  // than setting the nav's viewport-relative position directly as margin.
  heroContent.style.marginLeft = '0px';
  const naturalLeft = heroContent.getBoundingClientRect().left;
  const targetLeft = caseStudiesLink.getBoundingClientRect().left;
  heroContent.style.marginLeft = `${targetLeft - naturalLeft}px`;
}

if (heroContent && caseStudiesLink) {
  syncHeroIndentToNav();
  window.addEventListener('resize', syncHeroIndentToNav);
  document.fonts?.ready.then(syncHeroIndentToNav);
}

// Mobile hamburger menu — logo stays visible; nav, email, and socials
// collapse into one toggleable panel below the 640px breakpoint.
const siteHeader = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');

function closeMenu() {
  if (!siteHeader || !menuToggle) return;
  siteHeader.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  lenis?.start();
}

function openMenu() {
  if (!siteHeader || !menuToggle) return;
  siteHeader.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  // The panel now overlays the page (position: fixed) instead of pushing
  // it down, so lock background scroll while it's open. Lenis intercepts
  // wheel events on the window regardless of body overflow, so it needs
  // to be paused too, or a wheel scroll could still move the page behind
  // the (visually locked) menu.
  document.body.style.overflow = 'hidden';
  lenis?.stop();
}

if (siteHeader && menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (siteHeader.classList.contains('menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  siteHeader.querySelectorAll('.main-nav a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!siteHeader.classList.contains('menu-open')) return;
    if (!siteHeader.contains(event.target)) closeMenu();
  });

  // Close automatically if the viewport grows past the mobile breakpoint,
  // so the panel doesn't stay stuck open after a resize or rotation.
  const mobileMenuQuery = window.matchMedia('(max-width: 640px)');
  mobileMenuQuery.addEventListener('change', (event) => {
    if (!event.matches) closeMenu();
  });
}

// Selected Projects — clicking a name swaps the image, captions, heading,
// description, and Industry/Impact Area to match, without a page reload.
const projects = [
  {
    name: 'Purea',
    image: 'assets/images/project-purea.jpg',
    imageAlt: 'Purea e-commerce website preview',
    captions: ['Under NDA', 'Visuals altered'],
    heading: 'Purea | An e-commerce experience for a modern cosmetics brand',
    description: 'Purea is an e-commerce website built for a cosmetics brand blending minimal design with high-impact product storytelling.',
    industry: 'E-commerce',
    impact: 'Full design circle',
  },
  {
    name: 'MindSweep',
    image: 'assets/images/project-mindsweep.jpg',
    imageAlt: 'MindSweep journaling app preview',
    captions: ['Under NDA', 'Visuals altered'],
    heading: 'MindSweep | A mindful journaling app for emotional clarity',
    description: 'MindSweep is a mobile app designed to help people clear their minds, track their emotions, and reflect on daily thoughts through a calm, guided journaling experience.',
    industry: 'Mental health',
    impact: 'Product design',
  },
  {
    name: 'Domu',
    image: 'assets/images/project-domu.jpg',
    imageAlt: 'Domu smart home dashboard preview',
    captions: ['Under NDA', 'Visuals altered'],
    heading: 'Domu | A smart home dashboard for effortless living',
    description: 'Domu is a smart home management platform that brings climate control, energy monitoring, and device automation into one clear, unified dashboard.',
    industry: 'SaaS / Smart home',
    impact: 'Product design',
  },
  {
    name: 'GoalPod',
    image: 'assets/images/project-goalpod.jpg',
    imageAlt: 'GoalPod goal-tracking platform preview',
    captions: ['Under NDA', 'Details altered'],
    heading: 'GoalPod | A platform for staying consistent with your goals',
    description: 'The app helps users set goals, break them into actionable tasks, and stay on track through progress tracking, check-ins, and reminders.',
    industry: 'SaaS / Productivity',
    impact: 'Product design',
  },
];

const projectNameEls = document.querySelectorAll('.project-names li');
const projectImage = document.getElementById('project-image');
const projectCaption1 = document.getElementById('project-caption-1');
const projectCaption2 = document.getElementById('project-caption-2');
const projectHeading = document.getElementById('project-heading');
const projectDescription = document.getElementById('project-description');
const projectIndustry = document.getElementById('project-industry');
const projectImpact = document.getElementById('project-impact');

let currentProjectIndex = 0;

function showProject(index) {
  const project = projects[index];
  if (!project) return;

  currentProjectIndex = index;

  projectNameEls.forEach((el, i) => {
    el.classList.toggle('is-active', i === index);
  });

  projectImage.src = project.image;
  projectImage.alt = project.imageAlt;
  projectCaption1.textContent = project.captions[0];
  projectCaption2.textContent = project.captions[1];
  projectHeading.textContent = project.heading;
  projectDescription.textContent = project.description;
  projectIndustry.textContent = project.industry;
  projectImpact.textContent = project.impact;
}

if (projectNameEls.length && projectImage) {
  projectNameEls.forEach((el, index) => {
    el.addEventListener('click', () => showProject(index));
    el.style.cursor = 'pointer';
  });

  const [prevProjectBtn, nextProjectBtn] = document.querySelectorAll('.project-nav-btn');
  prevProjectBtn?.addEventListener('click', () => {
    showProject((currentProjectIndex - 1 + projects.length) % projects.length);
  });
  nextProjectBtn?.addEventListener('click', () => {
    showProject((currentProjectIndex + 1) % projects.length);
  });
}

// Submits to Formspree via fetch instead of a full page reload/redirect, so
// visitors get an inline confirmation without leaving the site.
const contactForm = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const submitBtn = contactForm?.querySelector('.submit-btn');

if (contactForm && formStatus && submitBtn) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitBtn.disabled = true;
    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('is-error');

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        formStatus.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      formStatus.textContent = "Something went wrong — please email me directly at tetiana.yatsyshynets@gmail.com.";
      formStatus.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
