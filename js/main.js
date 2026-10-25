(() => {
  // Sticky nav shadow
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  const burger = document.querySelector('.burger'), menu = document.querySelector('.menu');
  burger && burger.addEventListener('click', () => menu.classList.toggle('open'));

  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Animated counters
  const fmt = n => n.toLocaleString('en-IN');
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 2000;
    const step = t => { const p = Math.min((t - t0) / dur, 1), v = Math.floor(end * (1 - Math.pow(1 - p, 4)));
      el.textContent = fmt(v) + (el.dataset.suffix || ''); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); co.unobserve(el);
  }), { threshold: .5 });
  document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

  // 3D tilt cards
  if (matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  // Lightbox
  const lb = document.querySelector('.lightbox');
  if (lb) {
    const li = lb.querySelector('img');
    document.querySelectorAll('[data-zoom]').forEach(f => f.addEventListener('click', () => {
      li.src = f.dataset.zoom || f.querySelector('img').src; lb.classList.add('open');
    }));
    lb.addEventListener('click', () => lb.classList.remove('open'));
    addEventListener('keydown', e => e.key === 'Escape' && lb.classList.remove('open'));
  }

  // Image fallback (keeps layout pretty if a remote image fails)
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => { if (img.dataset.r) return; img.classList.add('broken'); img.parentElement && img.parentElement.classList.add('ph'); });
  });

  // Forms -> WhatsApp (no backend needed)
  document.querySelectorAll('form[data-wa]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form), lines = [form.dataset.wa];
    for (const [k, v] of d.entries()) if (v) lines.push(`${k}: ${v}`);
    window.open('https://wa.me/919919006800?text=' + encodeURIComponent(lines.join('\n')), '_blank');
  }));

  // Year
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();

// When opened straight from disk (file://), folder links need an explicit index.html
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (/^(https?:|tel:|mailto:|#)/.test(h)) return;
    const [p, frag] = h.split('#');
    if (p.endsWith('/')) a.setAttribute('href', p + 'index.html' + (frag ? '#' + frag : ''));
  });
}
