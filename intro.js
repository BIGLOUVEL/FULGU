// =============================================
// FULGU — VIDEO INTRO
// PDF §3 : scroll → currentTime, jamais video.play()
// PDF §6 : requestAnimationFrame + lerp pour la fluidité
// =============================================

(function () {

  var video  = document.getElementById('scrollVideo');
  var spacer = document.getElementById('vi-spacer');
  var dots   = Array.from(document.querySelectorAll('.vi-dot'));
  var skip   = document.getElementById('viSkip');

  if (!video || !spacer) return;

  var loader   = document.getElementById('vi-loader');
  var gradient = document.getElementById('vi-gradient');
  var uiEls    = dots.concat(skip ? [skip] : []);

  // PDF §6 — masquer le loader dès que la vidéo est prête à jouer
  if (loader) {
    video.addEventListener('canplaythrough', function () {
      loader.classList.add('vi-loader--hidden');
      setTimeout(function () { loader.style.display = 'none'; }, 400);
    }, { once: true });
  }
  var duration = 0;

  // Lerp : interpolation smooth entre la position scroll et currentTime
  var targetT  = 0;
  var smoothT  = 0;
  var lerpRaf  = null;
  var scrollRaf = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Boucle d'animation lerp — tourne jusqu'à convergence
  function lerpLoop() {
    lerpRaf = null;
    var diff = targetT - smoothT;
    if (Math.abs(diff) < 0.004) {
      video.currentTime = targetT;
      smoothT = targetT;
      return;
    }
    smoothT = lerp(smoothT, targetT, 0.12);
    video.currentTime = smoothT;
    lerpRaf = requestAnimationFrame(lerpLoop);
  }

  // Masque complètement la vidéo (display:none retire du stacking context)
  function hideVideo() {
    video.style.display = 'none';
    if (loader)    loader.style.display = 'none';
    if (gradient)  gradient.style.display = 'none';
    uiEls.forEach(function (el) { el.style.display = 'none'; });
  }

  function showVideo() {
    video.style.display = '';
    if (gradient) gradient.style.display = '';
    uiEls.forEach(function (el) { el.style.display = ''; });
  }

  // Update principal — appelé à chaque scroll (via rAF) ET à l'init
  function update() {
    scrollRaf = null;

    var scrollY     = window.scrollY;
    var spacerH     = spacer.offsetHeight;          // 300vh en px
    var scrollRange = spacerH - window.innerHeight;  // plage de scrub (200vh)

    // Passé la zone intro → cacher complètement
    if (scrollY >= spacerH) {
      hideVideo();
      return;
    }

    // Dans la zone intro
    showVideo();

    // ---- Fade out scroll-driven pendant la remontée du hero ----
    // fadeStart = quand le hero entre par le bas du viewport (scrollY = 200vh)
    // À scrollY = 300vh (spacerH) : hero en haut, vidéo opacity 0 → display:none
    var fadeStart = scrollRange; // = spacerH - innerHeight
    if (scrollY >= fadeStart) {
      var fadeProgress = (scrollY - fadeStart) / window.innerHeight;
      video.style.opacity = String(Math.max(0, 1 - fadeProgress));
      // Masquer aussi les dots/skip pendant le fade
      var uiOpacity = String(Math.max(0, 1 - fadeProgress * 3));
      uiEls.forEach(function (el) { el.style.opacity = uiOpacity; });
    } else {
      video.style.opacity = '1';
      uiEls.forEach(function (el) { el.style.opacity = ''; });
    }

    if (!duration) return;

    // PDF §3 — mapping scroll → targetTime (plafonné à scrollRange)
    var fraction = Math.min(1, Math.max(0, scrollY / scrollRange));
    targetT = fraction * duration;

    if (!lerpRaf) lerpRaf = requestAnimationFrame(lerpLoop);

    // Dots : 3 tiers égaux (cachés pendant le fade)
    var active = fraction < 1 / 3 ? 0 : fraction < 2 / 3 ? 1 : 2;
    dots.forEach(function (d, i) {
      d.classList.toggle('vi-dot--active', i === active);
    });
  }

  function onScroll() {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(update);
  }

  // Vérification immédiate — gère le scroll restoration de Chrome
  update();

  // iOS Safari : video.currentTime ne fonctionne pas sans play() préalable.
  // On déverrouille au premier geste utilisateur, puis on reprend le scrubbing.
  var unlocked = false;
  function unlock() {
    if (unlocked || !duration) return;
    unlocked = true;
    var p = video.play();
    if (p && p.then) {
      p.then(function () {
        video.pause();
        video.currentTime = smoothT;
      }).catch(function () {});
    }
  }
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('click',      unlock, { once: true });

  // PDF §3 — attacher le scroll seulement après loadedmetadata
  video.addEventListener('loadedmetadata', function () {
    duration = video.duration;
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  });

  // Skip
  if (skip) {
    skip.addEventListener('click', function () {
      var doc = document.documentElement;
      doc.style.scrollBehavior = 'auto';
      window.scrollTo(0, spacer.offsetHeight);
      requestAnimationFrame(function () { doc.style.scrollBehavior = ''; });
    });
  }

  // Mobile < 768px — pas de scroll mechanic
  if (window.innerWidth < 768) {
    hideVideo();
  }

})();
