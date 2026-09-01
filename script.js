const supportedLocales = ['en', 'lo', 'th'];
const i18n = window.KT_I18N || { lo: {}, th: {}, meta: {} };
const originalText = new WeakMap();
const originalAria = new WeakMap();
const originalAlt = new WeakMap();

const textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) {
    if (!node.nodeValue.trim() || ['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }
});
const translatableTextNodes = [];
while (textWalker.nextNode()) {
  const node = textWalker.currentNode;
  originalText.set(node, node.nodeValue);
  translatableTextNodes.push(node);
}

const ariaElements = [...document.querySelectorAll('[aria-label]')];
ariaElements.forEach((element) => originalAria.set(element, element.getAttribute('aria-label')));
const altElements = [...document.querySelectorAll('[alt]')];
altElements.forEach((element) => originalAlt.set(element, element.getAttribute('alt')));

function initialLocale() {
  const queryLocale = new URLSearchParams(window.location.search).get('lang');
  if (supportedLocales.includes(queryLocale)) return queryLocale;
  const storedLocale = window.localStorage.getItem('kt-locale');
  if (supportedLocales.includes(storedLocale)) return storedLocale;
  const browserLocale = navigator.language.toLowerCase();
  if (browserLocale.startsWith('lo')) return 'lo';
  if (browserLocale.startsWith('th')) return 'th';
  return 'en';
}

let activeLocale = initialLocale();

function setMeta(locale) {
  const meta = i18n.meta?.[locale] || i18n.meta?.en || {};
  const pitchPage = document.body.dataset.page === 'pitch';
  const title = pitchPage ? meta.pitchTitle : meta.title;
  const description = pitchPage ? meta.pitchDescription : meta.description;
  const ogTitle = pitchPage ? meta.pitchOgTitle : meta.ogTitle;
  const ogDescription = pitchPage ? meta.pitchOgDescription : meta.ogDescription;
  document.title = title || 'Knowledge Transition · Telbiz';
  const values = [
    ['meta[name="description"]', description],
    ['meta[property="og:title"]', ogTitle],
    ['meta[property="og:description"]', ogDescription],
    ['meta[name="twitter:title"]', ogTitle],
    ['meta[name="twitter:description"]', ogDescription]
  ];
  values.forEach(([selector, content]) => {
    if (content) document.querySelector(selector)?.setAttribute('content', content);
  });
}

function applyLocale(locale, persist = true) {
  if (!supportedLocales.includes(locale)) locale = 'en';
  activeLocale = locale;
  const dictionary = locale === 'en' ? {} : i18n[locale] || {};

  translatableTextNodes.forEach((node) => {
    const raw = originalText.get(node) || '';
    const key = raw.trim();
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${dictionary[key] || key}${trailing}`;
  });

  ariaElements.forEach((element) => {
    const key = originalAria.get(element);
    if (key === 'Select language') {
      element.setAttribute('aria-label', i18n.meta?.[locale]?.selectLanguage || key);
    } else {
      element.setAttribute('aria-label', dictionary[key] || key);
    }
  });
  altElements.forEach((element) => {
    const key = originalAlt.get(element);
    element.setAttribute('alt', dictionary[key] || key);
  });

  document.documentElement.lang = locale;
  document.querySelectorAll('[data-locale]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.locale === locale));
  });
  setMeta(locale);

  if (persist) {
    window.localStorage.setItem('kt-locale', locale);
    const url = new URL(window.location.href);
    if (locale === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', locale);
    window.history.replaceState({}, '', url);
  }
}

document.querySelectorAll('[data-locale]').forEach((button) => {
  button.addEventListener('click', () => applyLocale(button.dataset.locale));
});
applyLocale(activeLocale, false);

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

const copyButton = document.querySelector('[data-copy-intro]');
const copyStatus = document.querySelector('[data-copy-status]');

copyButton?.addEventListener('click', async () => {
  const meta = i18n.meta?.[activeLocale] || i18n.meta?.en || {};
  const intro = meta.copyIntro || '';
  try {
    await navigator.clipboard.writeText(intro);
    copyStatus.textContent = meta.copySuccess || 'Investor introduction copied.';
  } catch {
    copyStatus.textContent = intro;
  }
});

const uiGallery = document.querySelector('[data-ui-gallery]');
if (uiGallery) {
  const tabs = [...uiGallery.querySelectorAll('[data-ui-target]')];
  const panels = [...uiGallery.querySelectorAll('[role="tabpanel"]')];
  const lightbox = document.getElementById('ui-lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxTitle = document.getElementById('ui-lightbox-title');

  function activateUiPanel(tab, moveFocus = false) {
    tabs.forEach((item) => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.dataset.uiTarget; });
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateUiPanel(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activateUiPanel(tabs[next], true);
    });
  });

  panels.forEach((panel) => {
    panel.querySelectorAll('[data-ui-zoom]').forEach((button) => button.addEventListener('click', () => {
      const image = panel.querySelector('img');
      const title = panel.querySelector('h3');
      if (!lightbox || !lightboxImage || !image) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxTitle && title) lightboxTitle.textContent = title.textContent;
      lightbox.showModal();
    }));
  });

  lightbox?.querySelector('[data-ui-close]')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
}
