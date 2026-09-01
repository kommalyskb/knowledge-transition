const header = document.querySelector('[data-header]');
const nav = document.getElementById('site-nav');
const navToggle = document.querySelector('.nav-toggle');

function setHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 12);
}

function closeNav() {
  nav?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

navToggle?.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('nav-open', open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
window.addEventListener('scroll', setHeader, { passive: true });
setHeader();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = new Date().getFullYear(); });

const intro = 'I am interested in learning more about Knowledge Transition by Telbiz Co., LTD — a Lao-first, multilingual B2B platform designed to preserve operational know-how and reduce continuity risk.';
const copyButton = document.querySelector('[data-copy-intro]');
const copyStatus = document.querySelector('[data-copy-status]');

copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(intro);
    copyStatus.textContent = 'Investor introduction copied. Send it through your preferred Telbiz contact channel.';
  } catch {
    copyStatus.textContent = intro;
  }
});
