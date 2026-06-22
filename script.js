/* ============================================================
   BELLA MASSA — script.js
   ============================================================ */

/* ── Utilities ───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Header scroll ────────────────────────────────────────── */
const header = $('#header');

const handleHeaderScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

/* ── Active nav link on scroll ────────────────────────────── */
const sections = $$('section[id]');
const navLinks  = $$('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = navLinks.find(l => l.getAttribute('href') === `#${entry.target.id}`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ── Mobile menu ──────────────────────────────────────────── */
const hamburger = $('#hamburger');
const nav       = $('#nav');

const openMenu  = () => { nav.classList.add('open'); hamburger.classList.add('open'); hamburger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; };
const closeMenu = () => { nav.classList.remove('open'); hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

hamburger.addEventListener('click', () => nav.classList.contains('open') ? closeMenu() : openMenu());

$$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

// Close on outside click
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
});

// Close on Escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ── Fade-in on scroll ────────────────────────────────────── */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

$$('.fade-in').forEach((el, i) => {
  // Stagger siblings inside same parent
  const siblings = $$('.fade-in', el.parentElement);
  if (siblings.length > 1) {
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${idx * 0.1}s`;
  }
  fadeObserver.observe(el);
});

/* ── Gallery Lightbox ─────────────────────────────────────── */
// Create lightbox element
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Visualizador de imagem');
lightbox.innerHTML = `
  <button class="lightbox-close" aria-label="Fechar">&times;</button>
  <img src="" alt="" />
`;
document.body.appendChild(lightbox);

const lbImg   = $('img', lightbox);
const lbClose = $('.lightbox-close', lightbox);

const openLightbox = (src, alt) => {
  lbImg.src = src;
  lbImg.alt = alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
};

$$('.gallery-item img').forEach(img => {
  img.parentElement.addEventListener('click', () => openLightbox(img.src, img.alt));
  img.parentElement.setAttribute('tabindex', '0');
  img.parentElement.setAttribute('role', 'button');
  img.parentElement.setAttribute('aria-label', `Ver: ${img.alt}`);
  img.parentElement.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img.src, img.alt); } });
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox(); });

/* ── Reservation form validation ──────────────────────────── */
const form = $('#reservationForm');

const rules = {
  nome:     { test: v => v.trim().length >= 3,                  msg: 'Informe seu nome completo.' },
  telefone: { test: v => /^[\d\s\(\)\-\+]{8,}$/.test(v.trim()), msg: 'Informe um telefone válido.' },
  email:    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),  msg: 'Informe um e-mail válido.' },
  pessoas:  { test: v => v !== '',                               msg: 'Selecione o número de pessoas.' },
  data:     { test: v => { if (!v) return false; const d = new Date(v); const today = new Date(); today.setHours(0,0,0,0); return d >= today; }, msg: 'Escolha uma data a partir de hoje.' },
  horario:  { test: v => v !== '',                               msg: 'Informe o horário desejado.' },
};

const showError = (fieldId, msg) => {
  const field = $(`#${fieldId}`);
  const errEl = $(`#erro-${fieldId}`);
  if (field)  field.classList.add('invalid');
  if (errEl)  errEl.textContent = msg;
};

const clearError = (fieldId) => {
  const field = $(`#${fieldId}`);
  const errEl = $(`#erro-${fieldId}`);
  if (field)  field.classList.remove('invalid');
  if (errEl)  errEl.textContent = '';
};

// Inline validation on blur
Object.keys(rules).forEach(id => {
  const field = $(`#${id}`);
  if (!field) return;
  field.addEventListener('blur', () => {
    if (!rules[id].test(field.value)) showError(id, rules[id].msg);
    else clearError(id);
  });
  field.addEventListener('input', () => { if (field.classList.contains('invalid')) { if (rules[id].test(field.value)) clearError(id); } });
});

// Phone mask
const telefoneInput = $('#telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', () => {
    let v = telefoneInput.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    telefoneInput.value = v;
  });
}

// Set date min to today
const dataInput = $('#data');
if (dataInput) {
  const today = new Date().toISOString().split('T')[0];
  dataInput.setAttribute('min', today);
}

// Submit
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    Object.keys(rules).forEach(id => {
      const field = $(`#${id}`);
      if (!field) return;
      clearError(id);
      if (!rules[id].test(field.value)) { showError(id, rules[id].msg); valid = false; }
    });

    if (!valid) {
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Success
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    setTimeout(() => {
      // Show success message injected below form
      let success = $('#formSuccess');
      if (!success) {
        success = document.createElement('div');
        success.id = 'formSuccess';
        success.className = 'form-success';
        success.innerHTML = `
          <div class="success-icon">🍽️</div>
          <h3>Reserva enviada!</h3>
          <p>Em breve entraremos em contato para confirmar sua mesa.</p>
        `;
        form.appendChild(success);
      }
      form.querySelector('.form-grid').style.display = 'none';
      submitBtn.style.display = 'none';
      success.classList.add('show');
    }, 900);
  });
}

/* ── Back to top ──────────────────────────────────────────── */
const backBtn = $('#backToTop');

if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Smooth scroll for anchor links ────────────────────────── */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = $(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerH = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
