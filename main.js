// =============================================
// FULGU — JS
// =============================================

(function () {
  'use strict';

  // ---- CURSOR ----
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower) {
    let mx = -100, my = -100;
    let fx = -100, fy = -100;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    function animateFollower() {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    const hoverables = document.querySelectorAll('a, button, .service__card, .work__item, .testi__card, .pricing__card, input, textarea, select');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        follower.style.width = '60px';
        follower.style.height = '60px';
        follower.style.borderColor = 'rgba(232,255,0,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        follower.style.width = '36px';
        follower.style.height = '36px';
        follower.style.borderColor = 'rgba(232,255,0,0.5)';
      });
    });
  }

  // ---- NAV SCROLL ----
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ---- BURGER / MOBILE MENU ----
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let menuOpen = false;

  burger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    burger.style.opacity = menuOpen ? '0.5' : '1';
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      burger.style.opacity = '1';
      document.body.style.overflow = '';
    });
  });

  // ---- REVEAL ON SCROLL ----
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach(el => revealObserver.observe(el));

  // ---- COUNTER ANIMATION ----
  function animateCounter(el, target, duration = 1600) {
    let start = null;
    const startValue = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (target - startValue) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.number__val').forEach(el => {
    counterObserver.observe(el);
  });

  // ---- FORM ----
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Envoi en cours...';
      btn.disabled = true;

      // Simulate async submission
      setTimeout(() => {
        form.reset();
        successMsg.classList.add('show');
        btn.textContent = 'Envoyer le brief →';
        btn.disabled = false;
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }, 1200);
    });
  }

  // ---- SMOOTH ANCHOR SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- HERO PARALLAX (subtle) ----
  const heroGrid = document.querySelector('.hero__grid');
  if (heroGrid) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroGrid.style.transform = `translateY(${y * 0.2}px)`;
    }, { passive: true });
  }

})();
