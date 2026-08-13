(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  var mobileLockMq = window.matchMedia('(max-width: 768px)');

  function syncMobilePageLocks() {
    var isMobile = mobileLockMq.matches;
    var isHome = document.body.classList.contains('page-home');
    var canLockMobile =
      isHome ||
      document.body.classList.contains('page-menu') ||
      document.body.classList.contains('page-about') ||
      document.body.classList.contains('page-services') ||
      document.body.classList.contains('page-contact');
    // Viewport locks are mobile-only (desktop keeps normal scroll).
    var pageLocked = isMobile && canLockMobile;

    document.documentElement.classList.toggle('is-home-locked', isMobile && isHome);
    document.documentElement.classList.toggle('is-page-locked', pageLocked);
    document.body.classList.toggle('is-home-locked', isMobile && isHome);
    document.body.classList.toggle('is-page-locked', pageLocked);

    var locked = document.body.classList.contains('is-home-locked') || document.body.classList.contains('is-page-locked');
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  syncMobilePageLocks();
  if (typeof mobileLockMq.addEventListener === 'function') {
    mobileLockMq.addEventListener('change', syncMobilePageLocks);
  } else if (typeof mobileLockMq.addListener === 'function') {
    mobileLockMq.addListener(syncMobilePageLocks);
  }

  function resetHomeScroll() {
    if (!document.body.classList.contains('page-home')) return;
    window.scrollTo(0, 0);
    if (typeof window.resetHomePageState === 'function') {
      window.resetHomePageState();
    }
  }

  resetHomeScroll();
  window.addEventListener('pageshow', function (e) {
    syncMobilePageLocks();
    resetHomeScroll();
    if (e.persisted) {
      requestAnimationFrame(resetHomeScroll);
    }
  });
  window.addEventListener('load', function () {
    syncMobilePageLocks();
    resetHomeScroll();
  });

  // Current year in footer (if present)
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Sticky header shrink on scroll
  var header = document.getElementById('header');
  var scrollThreshold = 50;

  function handleScroll() {
    if (!header) return;
    if (header.classList.contains('site-header--home')) return;
    if (document.body.classList.contains('page-menu')) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Header tagline — switch Anytime → Anywhere when corner Anywhere meets header Anytime
  if (document.body.classList.contains('page-home')) {
    var headerAnytimeTrigger = document.querySelector(
      '.header-tagline--mode-anytime .tagline-trigger'
    );
    var heroAnywhereTrigger = document.querySelector(
      '.hero-tagline__word--br .tagline-trigger'
    );
    var headerAnywhereBlock = document.querySelector('.header-tagline--mode-anywhere');
    var heroSnapPage = document.querySelector('[data-snap-page="0"]');
    var headerUsesAnywhere = false;

    function resetHeaderTaglineMode() {
      headerUsesAnywhere = false;
      document.body.classList.remove('is-header-anywhere');
      if (headerAnywhereBlock) {
        headerAnywhereBlock.setAttribute('aria-hidden', 'true');
      }
    }

    function isHeroSnapActive() {
      if (!heroSnapPage) return true;
      return heroSnapPage.getBoundingClientRect().top > -window.innerHeight * 0.35;
    }

    function updateHeaderTaglineMode() {
      if (!headerAnytimeTrigger || !heroAnywhereTrigger) return;

      if (!isHeroSnapActive()) {
        resetHeaderTaglineMode();
        document.body.classList.remove('is-tagline-brand');
        return;
      }

      var headerY = headerAnytimeTrigger.getBoundingClientRect().top;
      var anywhereY = heroAnywhereTrigger.getBoundingClientRect().top;

      if (!headerUsesAnywhere && anywhereY <= headerY) {
        headerUsesAnywhere = true;
      } else if (headerUsesAnywhere && anywhereY > headerY + 8) {
        headerUsesAnywhere = false;
      }

      document.body.classList.toggle('is-header-anywhere', headerUsesAnywhere);
      if (headerAnywhereBlock) {
        headerAnywhereBlock.setAttribute('aria-hidden', headerUsesAnywhere ? 'false' : 'true');
      }
    }

    window.resetHeaderTaglineMode = resetHeaderTaglineMode;
    window.updateHeaderTaglineMode = updateHeaderTaglineMode;

    window.addEventListener('scroll', updateHeaderTaglineMode, { passive: true });
    window.addEventListener('resize', updateHeaderTaglineMode);
    updateHeaderTaglineMode();
  }

  // Fade-in on scroll
  var fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // Hero collage video
  var collageVideo = document.querySelector('.hero-collage__video');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (collageVideo) {
    collageVideo.muted = true;
    collageVideo.defaultMuted = true;
    collageVideo.playsInline = true;
    collageVideo.loop = true;
    collageVideo.setAttribute('playsinline', '');

    function tryPlay() {
      if (prefersReducedMotion) return;
      var promise = collageVideo.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    collageVideo.addEventListener('loadeddata', tryPlay);
    if (collageVideo.readyState >= 2) {
      tryPlay();
    }
  }

  // Background videos (services panels, CTA, etc.)
  document.querySelectorAll('.media-backdrop__video').forEach(function (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('playsinline', '');

    function tryPlayBackdrop() {
      if (prefersReducedMotion) return;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    video.addEventListener('loadeddata', tryPlayBackdrop);
    if (video.readyState >= 2) {
      tryPlayBackdrop();
    }
  });

  // Hero photo rotation — desktop: multi-stack; mobile: single-frame flip of all media
  var photoStacks = Array.prototype.slice.call(
    document.querySelectorAll('.hero-collage__piece--photo')
  );
  var collagePieces = Array.prototype.slice.call(
    document.querySelectorAll('.hero-collage__piece')
  );
  var flipInterval = 6500;
  var mobileFlipInterval = 4200;
  var homeMobileQuery = window.matchMedia('(max-width: 768px)');
  var desktopFlipTimers = [];
  var mobileFlipTimer = null;
  var mobileSlideIndex = 0;

  function photoSrc(photo) {
    return photo.getAttribute('src');
  }

  function activePhoto(stack) {
    return stack.querySelector('.hero-collage__photo.is-active');
  }

  function setActivePhoto(stack, photo) {
    stack.querySelectorAll('.hero-collage__photo').forEach(function (img) {
      img.classList.toggle('is-active', img === photo);
    });
  }

  function usedSrcs(excludeStack) {
    var used = {};
    photoStacks.forEach(function (stack) {
      if (stack === excludeStack) return;
      var active = activePhoto(stack);
      if (active) used[photoSrc(active)] = true;
    });
    return used;
  }

  function ensureUniqueInitialState() {
    var used = {};

    photoStacks.forEach(function (stack) {
      var photos = stack.querySelectorAll('.hero-collage__photo');
      var chosen = null;

      Array.prototype.forEach.call(photos, function (photo) {
        if (!chosen && !used[photoSrc(photo)]) {
          chosen = photo;
        }
      });

      if (!chosen) {
        chosen = photos[0];
      }

      setActivePhoto(stack, chosen);
      used[photoSrc(chosen)] = true;
    });
  }

  function flipStack(stack) {
    var photos = stack.querySelectorAll('.hero-collage__photo');
    if (photos.length < 2) return false;

    var current = activePhoto(stack);
    var next = photos[0] === current ? photos[1] : photos[0];
    var inUse = usedSrcs(stack);

    if (inUse[photoSrc(next)]) {
      return false;
    }

    setActivePhoto(stack, next);
    return true;
  }

  function clearDesktopFlipTimers() {
    desktopFlipTimers.forEach(function (id) {
      clearTimeout(id);
      clearInterval(id);
    });
    desktopFlipTimers = [];
  }

  function stopMobileFlip() {
    if (mobileFlipTimer) {
      clearInterval(mobileFlipTimer);
      mobileFlipTimer = null;
    }
    collagePieces.forEach(function (piece) {
      piece.classList.remove('is-mobile-slide-active');
    });
  }

  function getMobileSlides() {
    var slides = [];
    var usedSrc = {};

    collagePieces.forEach(function (piece) {
      if (piece.classList.contains('hero-collage__piece--video')) {
        slides.push({ piece: piece, photo: null });
        return;
      }

      Array.prototype.forEach.call(
        piece.querySelectorAll('.hero-collage__photo'),
        function (photo) {
          var src = photoSrc(photo);
          if (!src || usedSrc[src]) return;
          usedSrc[src] = true;
          slides.push({ piece: piece, photo: photo });
        }
      );
    });

    return slides;
  }

  function showMobileSlide(slides, index) {
    if (!slides.length) return;
    var slide = slides[index % slides.length];

    collagePieces.forEach(function (piece) {
      piece.classList.toggle('is-mobile-slide-active', piece === slide.piece);
    });

    if (slide.photo) {
      setActivePhoto(slide.piece, slide.photo);
    }

    if (!slide.photo && collageVideo && !prefersReducedMotion) {
      var playPromise = collageVideo.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }
  }

  function startMobileFlip() {
    stopMobileFlip();
    clearDesktopFlipTimers();

    var slides = getMobileSlides();
    if (!slides.length) return;

    mobileSlideIndex = 0;
    showMobileSlide(slides, mobileSlideIndex);

    if (prefersReducedMotion || slides.length < 2) return;

    mobileFlipTimer = setInterval(function () {
      mobileSlideIndex = (mobileSlideIndex + 1) % slides.length;
      showMobileSlide(slides, mobileSlideIndex);
    }, mobileFlipInterval);
  }

  function startDesktopFlip() {
    stopMobileFlip();
    clearDesktopFlipTimers();
    ensureUniqueInitialState();

    if (prefersReducedMotion || !photoStacks.length) return;

    photoStacks.forEach(function (stack, stackIndex) {
      var photos = stack.querySelectorAll('.hero-collage__photo');
      if (photos.length < 2) return;

      var startId = setTimeout(function () {
        var intervalId = setInterval(function () {
          if (!flipStack(stack)) {
            photoStacks.some(function (otherStack) {
              if (otherStack === stack) return false;
              return flipStack(otherStack);
            });
            flipStack(stack);
          }
        }, flipInterval);
        desktopFlipTimers.push(intervalId);
      }, stackIndex * 900);

      desktopFlipTimers.push(startId);
    });
  }

  function syncHeroMediaFlip() {
    if (homeMobileQuery.matches) {
      /* Mobile uses text nav instead of collage flip-through */
      stopMobileFlip();
      clearDesktopFlipTimers();
    } else {
      startDesktopFlip();
    }
  }

  if (collagePieces.length) {
    syncHeroMediaFlip();
    if (homeMobileQuery.addEventListener) {
      homeMobileQuery.addEventListener('change', syncHeroMediaFlip);
    } else if (homeMobileQuery.addListener) {
      homeMobileQuery.addListener(syncHeroMediaFlip);
    }
  }

  // Tagline hover — sage + cream brand moment (home)
  if (document.querySelector('.site-header--home')) {
    var brandTargets = document.querySelectorAll('[data-tagline-brand]');
    var brandHideTimer = null;

    function isHomeHeroSnapActive() {
      var heroSnap = document.querySelector('[data-snap-page="0"]');
      if (!heroSnap) {
        return window.scrollY < window.innerHeight * 0.5;
      }
      return heroSnap.getBoundingClientRect().top > -window.innerHeight * 0.35;
    }

    function setTaglineBrandActive(active) {
      clearTimeout(brandHideTimer);
      if (active && !isHomeHeroSnapActive()) {
        document.body.classList.remove('is-tagline-brand');
        return;
      }
      document.body.classList.toggle('is-tagline-brand', active);
    }

    function syncTaglineBrand() {
      var active = document.querySelector(
        '[data-tagline-brand]:hover, [data-tagline-brand]:focus-within'
      );
      setTaglineBrandActive(!!active);
    }

    brandTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        setTaglineBrandActive(true);
      });
      el.addEventListener('mouseleave', function () {
        clearTimeout(brandHideTimer);
        brandHideTimer = setTimeout(syncTaglineBrand, 0);
      });
      el.addEventListener('focusin', function () {
        setTaglineBrandActive(true);
      });
      el.addEventListener('focusout', function () {
        clearTimeout(brandHideTimer);
        brandHideTimer = setTimeout(syncTaglineBrand, 0);
      });
    });

    var headerLogo = document.querySelector('.hero-scroll-logo') || document.querySelector('.site-header--home .logo');
    var homeMobileQuery = window.matchMedia('(max-width: 768px)');

    function isHomeMobileLayout() {
      return homeMobileQuery.matches;
    }

    function scrollHomeToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function activateHomeBrandMoment() {
      if (!isHomeHeroSnapActive()) return;
      setTaglineBrandActive(true);
    }

    if (headerLogo) {
      headerLogo.addEventListener('pointerenter', function () {
        if (isHomeMobileLayout()) return;
        setTaglineBrandActive(false);
      });
      headerLogo.addEventListener('pointerdown', function () {
        if (isHomeMobileLayout()) return;
        setTaglineBrandActive(false);
      });
      headerLogo.addEventListener('click', function (e) {
        if (!isHomeMobileLayout()) return;

        var onHome =
          window.location.pathname === '/' ||
          window.location.pathname === '/index.html';

        if (onHome) {
          e.preventDefault();
          scrollHomeToTop();
          if (typeof window.resetStorySnapView === 'function') {
            window.resetStorySnapView();
          }
          if (typeof window.resetHeaderTaglineMode === 'function') {
            window.resetHeaderTaglineMode();
          }
          activateHomeBrandMoment();
        }
      });
    }

    brandTargets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (!isHomeMobileLayout()) return;
        if (el.getAttribute('data-tagline-brand') !== 'coffee-anytime') return;
        if (e.target.closest('.tagline-reveal a')) return;

        e.preventDefault();
        scrollHomeToTop();

        var isActive = document.body.classList.contains('is-tagline-brand');
        if (isActive) {
          setTaglineBrandActive(false);
        } else {
          activateHomeBrandMoment();
        }
      });
    });

    document.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('is-tagline-brand')) return;
      if (e.target.closest('[data-tagline-brand]')) return;
      if (e.target.closest('.hero-scroll-logo')) return;
      if (e.target.closest('.site-header--home .logo')) return;
      setTaglineBrandActive(false);
    });

    window.setTaglineBrandInactive = function () {
      setTaglineBrandActive(false);
    };

    function syncMobileHeroStory() {
      if (!isHomeMobileLayout()) return;
      document.body.classList.add('is-our-story-open');
    }

    syncMobileHeroStory();
    if (typeof homeMobileQuery.addEventListener === 'function') {
      homeMobileQuery.addEventListener('change', syncMobileHeroStory);
    } else if (typeof homeMobileQuery.addListener === 'function') {
      homeMobileQuery.addListener(syncMobileHeroStory);
    }
  }

  // Our Story — keep link clickable while moving from collage to peek illustration
  var ourStoryLink = document.querySelector('.hero-collage__about');
  var aboutPeek = document.querySelector('.hero-about-peek');
  var heroCollage = document.querySelector('.hero-collage');

  if (ourStoryLink) {
    var storyOpenTimer = null;
    var storyCloseDelay = 500;

    function openOurStory() {
      clearTimeout(storyOpenTimer);
      document.body.classList.add('is-our-story-open');
    }

    function closeOurStory() {
      if (window.matchMedia('(max-width: 768px)').matches) {
        return;
      }
      clearTimeout(storyOpenTimer);
      document.body.classList.remove('is-our-story-open');
      if (aboutPeek) {
        aboutPeek.classList.remove('is-visible');
      }
    }

    function scheduleCloseOurStory() {
      clearTimeout(storyOpenTimer);
      storyOpenTimer = setTimeout(function () {
        var pieceActive = heroCollage && heroCollage.querySelector('.hero-collage__piece:hover');
        var linkActive =
          ourStoryLink.matches(':hover') || ourStoryLink.matches(':focus-within');
        var peekActive =
          aboutPeek &&
          (aboutPeek.matches(':hover') || aboutPeek.matches(':focus-within'));
        if (!pieceActive && !linkActive && !peekActive) {
          closeOurStory();
        }
      }, storyCloseDelay);
    }

    function showAboutPeek() {
      openOurStory();
      if (aboutPeek) {
        aboutPeek.classList.add('is-visible');
      }
    }

    collagePieces.forEach(function (piece) {
      piece.addEventListener('mouseenter', openOurStory);
      piece.addEventListener('mouseleave', scheduleCloseOurStory);
      piece.addEventListener('focusin', openOurStory);
      piece.addEventListener('focusout', scheduleCloseOurStory);
      piece.addEventListener('click', openOurStory);
    });

    if (heroCollage) {
      heroCollage.addEventListener('mouseleave', scheduleCloseOurStory);
    }

    ourStoryLink.addEventListener('mouseenter', showAboutPeek);
    ourStoryLink.addEventListener('mouseleave', scheduleCloseOurStory);
    ourStoryLink.addEventListener('focusin', showAboutPeek);
    ourStoryLink.addEventListener('focusout', scheduleCloseOurStory);
    ourStoryLink.addEventListener('pointerdown', openOurStory);

    window.closeOurStoryHero = closeOurStory;

    if (aboutPeek) {
      aboutPeek.addEventListener('mouseenter', showAboutPeek);
      aboutPeek.addEventListener('mouseleave', scheduleCloseOurStory);
      aboutPeek.addEventListener('focusin', showAboutPeek);
      aboutPeek.addEventListener('focusout', scheduleCloseOurStory);
    }
  }

  // Our Story snap page — reset copy scroll when landing on page
  window.resetStorySnapView = function () {
    var aboutColumnsEl = document.querySelector('#our-story .story-about__columns');

    if (aboutColumnsEl) {
      aboutColumnsEl.scrollTop = 0;
    }
  };

  // Home page — full-page scroll snap (after hero; desktop only; skipped when locked)
  if (
    document.body.classList.contains('page-home') &&
    !document.body.classList.contains('is-home-locked') &&
    !prefersReducedMotion &&
    !window.matchMedia('(max-width: 768px)').matches
  ) {
    var snapPages = Array.prototype.slice.call(
      document.querySelectorAll('[data-snap-page]')
    );
    var scrollAnimating = false;
    var snapDuration = 900;
    var snapCooldown = 150;
    var lastSnapAt = 0;
    var wheelAccumulator = 0;
    var wheelResetTimer = null;

    var aboutColumnsEl = document.querySelector('#our-story .story-about__columns');

    function storyScrollTarget() {
      return aboutColumnsEl || null;
    }

    function storyCopyCanScrollDown() {
      var target = storyScrollTarget();
      if (!target) return false;
      return target.scrollTop + target.clientHeight < target.scrollHeight - 2;
    }

    function storyCopyCanScrollUp() {
      var target = storyScrollTarget();
      if (!target) return false;
      return target.scrollTop > 2;
    }

    function resetStoryPageView() {
      if (typeof window.resetStorySnapView === 'function') {
        window.resetStorySnapView();
      }
    }

    var lastSnapActivePage = 0;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function pageTop(page) {
      return page.getBoundingClientRect().top + window.scrollY;
    }

    function pageBottom(page) {
      return pageTop(page) + page.offsetHeight;
    }

    function getActivePageIndex() {
      var scrollY = window.scrollY;
      var active = 0;

      snapPages.forEach(function (page, i) {
        if (scrollY >= pageTop(page) - 64) {
          active = i;
        }
      });

      return active;
    }

    function animateScrollTo(targetY, duration, done) {
      var startY = window.scrollY;
      var distance = targetY - startY;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else if (done) {
          done();
        }
      }

      requestAnimationFrame(step);
    }

    function goToPage(index) {
      if (!snapPages.length) return;

      index = Math.max(0, Math.min(snapPages.length - 1, index));
      scrollAnimating = true;
      lastSnapAt = Date.now();
      document.body.classList.add('is-page-scroll-animating');

      animateScrollTo(pageTop(snapPages[index]), snapDuration, function () {
        scrollAnimating = false;
        document.body.classList.remove('is-page-scroll-animating');
        if (index === 0) {
          if (typeof window.resetHomePageState === 'function') {
            window.resetHomePageState();
          }
        } else if (index === 1) {
          resetStoryPageView();
        }
        if (typeof window.updateHeaderTaglineMode === 'function') {
          window.updateHeaderTaglineMode();
        }
      });
    }

    window.addEventListener(
      'wheel',
      function (e) {
        if (scrollAnimating) {
          e.preventDefault();
          return;
        }

        if (Date.now() - lastSnapAt < snapCooldown) {
          e.preventDefault();
          return;
        }

        if (Math.abs(e.deltaY) < 4) return;

        wheelAccumulator += e.deltaY;
        clearTimeout(wheelResetTimer);
        wheelResetTimer = setTimeout(function () {
          wheelAccumulator = 0;
        }, 120);

        if (Math.abs(wheelAccumulator) < 36) return;

        var idx = getActivePageIndex();
        var page = snapPages[idx];
        var scrollingDown = wheelAccumulator > 0;
        var scrollDelta = wheelAccumulator;
        wheelAccumulator = 0;

        if (scrollingDown) {
          if (idx === 1 && storyCopyCanScrollDown()) {
            e.preventDefault();
            var scrollTarget = storyScrollTarget();
            if (scrollTarget) {
              scrollTarget.scrollTop += scrollDelta;
            }
            return;
          }
          if (window.scrollY + window.innerHeight < pageBottom(page) - 8) {
            return;
          }
          if (idx < snapPages.length - 1) {
            e.preventDefault();
            goToPage(idx + 1);
          }
        } else {
          if (idx === 1 && storyCopyCanScrollUp()) {
            e.preventDefault();
            var scrollTargetUp = storyScrollTarget();
            if (scrollTargetUp) {
              scrollTargetUp.scrollTop += scrollDelta;
            }
            return;
          }
          if (window.scrollY > pageTop(page) + 8) {
            return;
          }
          if (idx > 0) {
            e.preventDefault();
            goToPage(idx - 1);
          }
        }
      },
      { passive: false }
    );

    window.addEventListener(
      'scroll',
      function () {
        if (!scrollAnimating) {
          var idx = getActivePageIndex();
          if (idx === 0 && lastSnapActivePage !== 0) {
            if (typeof window.resetHomePageState === 'function') {
              window.resetHomePageState();
            }
          } else if (idx === 1 && lastSnapActivePage !== 1) {
            if (typeof window.resetStorySnapView === 'function') {
              window.resetStorySnapView();
            }
          }
          if (idx !== 0) {
            document.body.classList.remove('is-tagline-brand');
          }
          lastSnapActivePage = idx;
          if (idx === 0 && typeof window.updateHeaderTaglineMode === 'function') {
            window.updateHeaderTaglineMode();
          }
        }
      },
      { passive: true }
    );

    window.addEventListener('keydown', function (e) {
      if (scrollAnimating) return;
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'PageDown' && e.key !== 'PageUp') {
        return;
      }

      var idx = getActivePageIndex();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        if (window.scrollY + window.innerHeight < pageBottom(snapPages[idx]) - 8) {
          window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
          return;
        }
        goToPage(idx + 1);
      } else {
        e.preventDefault();
        if (window.scrollY > pageTop(snapPages[idx]) + 8) {
          window.scrollBy({ top: -window.innerHeight * 0.85, behavior: 'smooth' });
          return;
        }
        goToPage(idx - 1);
      }
    });

    window.homeGoToSnapPage = goToPage;
    resetHomeScroll();
  } else if (
    document.body.classList.contains('page-home') &&
    !document.body.classList.contains('is-home-locked')
  ) {
    var snapPagesReduced = Array.prototype.slice.call(
      document.querySelectorAll('[data-snap-page]')
    );

    var lastReducedActivePage = 0;

    function updateScrollPageState() {
      var scrollY = window.scrollY;
      var active = 0;

      snapPagesReduced.forEach(function (page, i) {
        if (scrollY >= page.getBoundingClientRect().top + window.scrollY - 64) {
          active = i;
        }
      });

      if (active === 0 && lastReducedActivePage !== 0) {
        if (typeof window.resetHomePageState === 'function') {
          window.resetHomePageState();
        }
      } else if (active === 1 && lastReducedActivePage !== 1) {
        if (typeof window.resetStorySnapView === 'function') {
          window.resetStorySnapView();
        }
      }
      lastReducedActivePage = active;
    }

    window.addEventListener('scroll', updateScrollPageState, { passive: true });
    resetHomeScroll();
    updateScrollPageState();
  }

  // Menu page — draggable menu over editorial type (desktop + mobile)
  if (document.body.classList.contains('page-menu')) {
    var menuDrag = document.getElementById('menu-asset-drag');
    var menuSection = document.querySelector('.section--menu-asset');
    var menuEditorial = document.querySelector('.menu-editorial');
    var menuEditorialBody = document.querySelector('.menu-editorial__body');

    function fitMenuEditorialType() {
      if (!menuEditorial || !menuEditorialBody) return;

      // Desktop keeps the original large type CSS — only fit on mobile locked menu
      if (!window.matchMedia('(max-width: 768px)').matches) {
        menuEditorialBody.style.fontSize = '';
        menuEditorialBody.style.letterSpacing = '';
        menuEditorialBody.style.textAlign = '';
        menuEditorialBody.style.width = '';
        return;
      }

      var availableHeight = menuEditorial.clientHeight;
      var availableWidth = menuEditorial.clientWidth;
      if (availableHeight <= 0 || availableWidth <= 0) return;

      // Prefer a solid bottom-weighted block; leave slack for descenders (g/y/p)
      var targetHeight = Math.floor(availableHeight * 0.84);
      var minPx = 10;
      var maxPx = Math.min(240, Math.round(availableHeight * 0.5));
      var editorialBottom = menuEditorial.getBoundingClientRect().bottom;

      menuEditorialBody.style.width = '100%';
      menuEditorialBody.style.textAlign = 'left';
      menuEditorialBody.style.letterSpacing = '';

      function lastLineFillRatio() {
        var range = document.createRange();
        range.selectNodeContents(menuEditorialBody);
        var rects = range.getClientRects();
        if (!rects.length) return 1;
        return rects[rects.length - 1].width / availableWidth;
      }

      function overflowsEditorial() {
        var range = document.createRange();
        range.selectNodeContents(menuEditorialBody);
        var rects = range.getClientRects();
        if (!rects.length) return menuEditorialBody.scrollHeight > targetHeight;
        var last = rects[rects.length - 1];
        // Extra 2px slack so glyph margins don't kiss the clip edge
        return last.bottom > editorialBottom - 2 || menuEditorialBody.scrollHeight > targetHeight;
      }

      function scoreSize(px, tracking) {
        menuEditorialBody.style.fontSize = px + 'px';
        menuEditorialBody.style.letterSpacing = tracking;

        if (overflowsEditorial()) {
          return -1;
        }

        var fill = menuEditorialBody.scrollHeight / targetHeight;
        var lastFill = lastLineFillRatio();
        // Penalize orphans (short last line)
        if (lastFill < 0.45) {
          return fill * 0.3 + lastFill * 0.25;
        }
        return fill * 0.65 + Math.min(lastFill, 1) * 0.35;
      }

      var lo = minPx;
      var hi = maxPx;
      var maxFit = minPx;

      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2);
        menuEditorialBody.style.fontSize = mid + 'px';
        menuEditorialBody.style.letterSpacing = '-0.05em';
        if (!overflowsEditorial()) {
          maxFit = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      var bestPx = maxFit;
      var bestTrack = '-0.05em';
      var bestScore = -1;
      var trackOpts = ['-0.06em', '-0.05em', '-0.04em', '-0.03em'];
      var windowStart = Math.max(minPx, maxFit - 20);

      for (var px = windowStart; px <= maxFit; px++) {
        for (var t = 0; t < trackOpts.length; t++) {
          var s = scoreSize(px, trackOpts[t]);
          if (s > bestScore) {
            bestScore = s;
            bestPx = px;
            bestTrack = trackOpts[t];
          }
        }
      }

      menuEditorialBody.style.fontSize = bestPx + 'px';
      menuEditorialBody.style.letterSpacing = bestTrack;
    }

    if (menuEditorial && menuEditorialBody) {
      window.addEventListener('load', fitMenuEditorialType);
      window.addEventListener('resize', fitMenuEditorialType);

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fitMenuEditorialType);
      }

      requestAnimationFrame(fitMenuEditorialType);
    }

    if (menuDrag && menuSection) {
      var menuDragging = false;
      var menuPointerId = null;
      var menuGrabOffsetX = 0;
      var menuGrabOffsetY = 0;

      function placeMenu(x, y) {
        var maxX = Math.max(0, menuSection.clientWidth - menuDrag.offsetWidth);
        var maxY = Math.max(0, menuSection.clientHeight - menuDrag.offsetHeight);
        menuDrag.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        menuDrag.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        menuDrag.style.transform = 'none';
      }

      function defaultMenuPosition() {
        placeMenu(
          (menuSection.clientWidth - menuDrag.offsetWidth) / 2,
          Math.max(0, menuSection.clientHeight * 0.42 - menuDrag.offsetHeight / 2)
        );
      }

      function initMenuPosition() {
        defaultMenuPosition();
      }

      window.addEventListener('load', initMenuPosition);
      window.addEventListener('resize', function () {
        fitMenuEditorialType();
        if (!menuDragging) {
          initMenuPosition();
        }
      });

      menuDrag.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;

        menuDragging = true;
        menuPointerId = e.pointerId;
        menuDrag.classList.add('is-dragging');
        menuDrag.setPointerCapture(e.pointerId);

        var dragRect = menuDrag.getBoundingClientRect();
        var sectionRect = menuSection.getBoundingClientRect();
        menuGrabOffsetX = e.clientX - dragRect.left;
        menuGrabOffsetY = e.clientY - dragRect.top;

        placeMenu(
          dragRect.left - sectionRect.left,
          dragRect.top - sectionRect.top
        );

        e.preventDefault();
      });

      menuDrag.addEventListener('pointermove', function (e) {
        if (!menuDragging || e.pointerId !== menuPointerId) return;

        var sectionRect = menuSection.getBoundingClientRect();
        placeMenu(
          e.clientX - sectionRect.left - menuGrabOffsetX,
          e.clientY - sectionRect.top - menuGrabOffsetY
        );
      });

      function endMenuDrag(e) {
        if (!menuDragging) return;
        if (e && e.pointerId !== menuPointerId) return;

        menuDragging = false;
        menuDrag.classList.remove('is-dragging');

        try {
          menuDrag.releasePointerCapture(menuPointerId);
        } catch (err) {}

        menuPointerId = null;
      }

      menuDrag.addEventListener('pointerup', endMenuDrag);
      menuDrag.addEventListener('pointercancel', endMenuDrag);

      requestAnimationFrame(initMenuPosition);
    }
  }

  // Home about copy is always visible (no accordion)

  function goToHomeTop() {
    if (typeof window.homeGoToSnapPage === 'function') {
      window.homeGoToSnapPage(0);
      return;
    }
    resetHomeScroll();
  }

  function isHomePageLink(href) {
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto|tel|sms):/i.test(href)) return false;

    try {
      var resolved = new URL(href, window.location.href);
      if (resolved.origin !== window.location.origin) return false;
      var path = resolved.pathname.replace(/\/index\.html$/i, '/');
      if (path.length > 1 && path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
      }
      return path === '' || path === '/';
    } catch (err) {
      return false;
    }
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    if (!isHomePageLink(link.getAttribute('href'))) return;

    if (document.body.classList.contains('page-home')) {
      e.preventDefault();
      goToHomeTop();
    }
  });

  // Smooth scroll for same-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        if (aboutPeek) {
          aboutPeek.classList.remove('is-visible');
          document.body.classList.remove('is-our-story-open');
        }
        if (typeof window.homeGoToSnapPage === 'function' && target.hasAttribute('data-snap-page')) {
          window.homeGoToSnapPage(Number(target.getAttribute('data-snap-page')));
        } else if (typeof window.homeGoToSnapPage === 'function' && target.id === 'our-story') {
          window.homeGoToSnapPage(1);
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Services / home marquees — shared phrase builder
  var servicesMarqueePhrases = [
    'weddings',
    'corporate events',
    'pop-ups',
    'Bar Mitzvahs',
    'private parties',
    'teacher appreciation',
    'birthdays',
    'product launch',
    'rodeos',
    'conferences',
    'baby shower',
    'Secret Society hangout',
    'executive meeting',
    'pool party',
    'gator wrestling competition',
    'bachelorette trip',
    'run club',
    'grand opening',
    'world domination'
  ];

  function buildServicesMarqueeItems(phrases, passes) {
    var html = '';
    var count = passes || 2;

    for (var p = 0; p < count; p++) {
      phrases.forEach(function (phrase) {
        html += '<span class="services-marquee__phrase">' + phrase + '</span>';
        html += '<span class="services-marquee__sep" aria-hidden="true">·</span>';
      });
    }

    return html;
  }

  document.querySelectorAll('[data-services-marquee-track]').forEach(function (track) {
    track.innerHTML = buildServicesMarqueeItems(servicesMarqueePhrases, 2);
  });

  // Services page — multi-direction marquee frame
  if (document.body.classList.contains('page-services')) {
    document.documentElement.style.overscrollBehavior = 'none';

    document.querySelectorAll('.page-services .fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });

    // Mobile stage — stacked titles + slow image flip
    var servicesItems = Array.prototype.slice.call(
      document.querySelectorAll('.services-mobile [data-services-slide]')
    );
    var servicesSlides = Array.prototype.slice.call(
      document.querySelectorAll('.services-mobile [data-services-slide-img]')
    );
    var servicesIndex = 0;
    var servicesTimer = null;
    var servicesIntervalMs = 5500;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setServicesSlide(nextIndex) {
      if (!servicesSlides.length) return;
      servicesIndex =
        ((nextIndex % servicesSlides.length) + servicesSlides.length) % servicesSlides.length;

      servicesItems.forEach(function (item, i) {
        var active = i === servicesIndex;
        item.classList.toggle('is-active', active);
        if (active) {
          item.setAttribute('aria-current', 'true');
          // Retrigger settle animation on each selection / auto-flip
          var name = item.querySelector('.services-mobile__name');
          if (name) {
            name.style.animation = 'none';
            void name.offsetWidth;
            name.style.animation = '';
          }
        } else {
          item.removeAttribute('aria-current');
        }
      });

      servicesSlides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === servicesIndex);
      });
    }

    function stopServicesFlip() {
      if (servicesTimer) {
        window.clearInterval(servicesTimer);
        servicesTimer = null;
      }
    }

    function startServicesFlip() {
      stopServicesFlip();
      if (!mobileLockMq.matches || prefersReducedMotion.matches || servicesSlides.length < 2) {
        return;
      }
      servicesTimer = window.setInterval(function () {
        setServicesSlide(servicesIndex + 1);
      }, servicesIntervalMs);
    }

    servicesItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var idx = parseInt(item.getAttribute('data-services-slide'), 10);
        if (isNaN(idx)) return;
        setServicesSlide(idx);
        startServicesFlip();
      });
    });

    if (typeof prefersReducedMotion.addEventListener === 'function') {
      prefersReducedMotion.addEventListener('change', startServicesFlip);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
      prefersReducedMotion.addListener(startServicesFlip);
    }

    mobileLockMq.addEventListener
      ? mobileLockMq.addEventListener('change', startServicesFlip)
      : mobileLockMq.addListener && mobileLockMq.addListener(startServicesFlip);

    setServicesSlide(0);
    startServicesFlip();

    // Continuous path marquee — canvas glyphs along rounded bevel (no SVG textPath seam)
    (function initServicesPathMarquee() {
      var stage = document.querySelector('.services-mobile__stage');
      var canvas = document.querySelector('[data-services-path-marquee-canvas]');
      if (!stage || !canvas || !canvas.getContext) return;

      var ctx = canvas.getContext('2d');
      var svgNS = 'http://www.w3.org/2000/svg';
      var measurePath = document.createElementNS(svgNS, 'path');
      var offset = 0;
      var pathLen = 0;
      var rafId = 0;
      var lastTs = 0;
      var speedPxPerSec = 9;
      var resizeTimer = null;
      var phrase = '';
      var fontSize = 11;
      var cream = '#F4F7EE';
      var typeOpacity = 0.62;
      var dpr = 1;
      var charWidths = null;

      function readPxVar(name, fallback) {
        var probe = document.createElement('div');
        probe.style.cssText =
          'position:absolute;visibility:hidden;pointer-events:none;width:var(' +
          name +
          ');height:1px;';
        stage.appendChild(probe);
        var px = probe.getBoundingClientRect().width;
        stage.removeChild(probe);
        return px > 0 ? px : fallback;
      }

      function roundedRectPath(w, h, radius, inset) {
        var x = inset;
        var y = inset;
        var rw = Math.max(0, w - inset * 2);
        var rh = Math.max(0, h - inset * 2);
        var r = Math.max(0, Math.min(radius - inset, rw / 2, rh / 2));
        // Start mid-bottom — seam sits under the CTA where it's least noticeable
        var midX = x + rw / 2;
        return (
          'M ' +
          midX +
          ',' +
          (y + rh) +
          ' H ' +
          (x + r) +
          ' A ' +
          r +
          ',' +
          r +
          ' 0 0 1 ' +
          x +
          ',' +
          (y + rh - r) +
          ' V ' +
          (y + r) +
          ' A ' +
          r +
          ',' +
          r +
          ' 0 0 1 ' +
          (x + r) +
          ',' +
          y +
          ' H ' +
          (x + rw - r) +
          ' A ' +
          r +
          ',' +
          r +
          ' 0 0 1 ' +
          (x + rw) +
          ',' +
          (y + r) +
          ' V ' +
          (y + rh - r) +
          ' A ' +
          r +
          ',' +
          r +
          ' 0 0 1 ' +
          (x + rw - r) +
          ',' +
          (y + rh) +
          ' H ' +
          midX
        );
      }

      function buildPhrase() {
        var unit = '';
        servicesMarqueePhrases.forEach(function (item) {
          unit += item.toUpperCase() + '   ·   ';
        });
        return unit;
      }

      function setFont() {
        ctx.font =
          '700 ' + fontSize + 'px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = cream;
        ctx.globalAlpha = typeOpacity;
      }

      function draw() {
        var w = canvas.width;
        var h = canvas.height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, w, h);
        if (pathLen < 8 || !phrase) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        setFont();

        var traveled = 0;
        var charIndex = 0;
        var guard = 0;
        var maxChars = 4000;
        var prevAngle = null;

        while (traveled < pathLen && guard < maxChars) {
          var ch = phrase.charAt(charIndex % phrase.length);
          var chWidth =
            charWidths && charWidths[ch] != null
              ? charWidths[ch]
              : ctx.measureText(ch).width;
          if (chWidth < 0.01) chWidth = fontSize * 0.35;

          var pos = (offset + traveled) % pathLen;
          var p1 = measurePath.getPointAtLength(pos);
          var sample = Math.min(1.5, Math.max(0.75, chWidth * 0.4));
          var angle;
          if (pos + sample <= pathLen) {
            var p2 = measurePath.getPointAtLength(pos + sample);
            angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          } else if (pos - sample >= 0) {
            var p0 = measurePath.getPointAtLength(pos - sample);
            angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
          } else {
            var p3 = measurePath.getPointAtLength((pos + sample) % pathLen);
            angle = Math.atan2(p3.y - p1.y, p3.x - p1.x);
          }

          // Soften abrupt corner turns
          if (prevAngle != null) {
            var delta = angle - prevAngle;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            angle = prevAngle + delta * 0.55;
          }
          prevAngle = angle;

          ctx.save();
          ctx.translate(p1.x, p1.y);
          ctx.rotate(angle);
          ctx.fillText(ch, 0, 0);
          ctx.restore();

          traveled += chWidth;
          charIndex += 1;
          guard += 1;
        }
      }

      function layout() {
        if (!mobileLockMq.matches) {
          stopAnim();
          ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        var rect = stage.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        if (w < 8 || h < 8) return;

        var outerR = readPxVar(
          '--services-mobile-radius',
          readPxVar('--services-marquee-radius', 44)
        );
        var inset = readPxVar('--services-marquee-path-inset', 11.2);
        fontSize = Math.max(7, inset * 0.48);

        try {
          cream =
            getComputedStyle(stage).getPropertyValue('--cream').trim() || '#F4F7EE';
        } catch (err) {
          cream = '#F4F7EE';
        }

        var opacityRaw = getComputedStyle(stage)
          .getPropertyValue('--services-marquee-type-opacity')
          .trim();
        var opacityNum = parseFloat(opacityRaw);
        typeOpacity = isFinite(opacityNum) ? opacityNum : 0.62;

        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        var d = roundedRectPath(w, h, outerR, inset);
        measurePath.setAttribute('d', d);
        try {
          pathLen = measurePath.getTotalLength();
        } catch (err) {
          pathLen = 0;
        }
        if (!pathLen) return;

        phrase = buildPhrase();
        setFont();
        charWidths = Object.create(null);
        for (var ci = 0; ci < phrase.length; ci++) {
          var c = phrase.charAt(ci);
          if (charWidths[c] == null) {
            charWidths[c] = ctx.measureText(c).width;
          }
        }
        if (offset > pathLen) offset = offset % pathLen;

        draw();

        if (!prefersReducedMotion.matches) {
          startAnim();
        } else {
          stopAnim();
        }
      }

      function tick(ts) {
        if (!lastTs) lastTs = ts;
        var dt = Math.min(0.032, (ts - lastTs) / 1000);
        lastTs = ts;
        if (pathLen > 0) {
          offset += speedPxPerSec * dt;
          if (offset >= pathLen) offset -= pathLen;
          draw();
        }
        rafId = window.requestAnimationFrame(tick);
      }

      function startAnim() {
        if (rafId || prefersReducedMotion.matches) return;
        lastTs = 0;
        rafId = window.requestAnimationFrame(tick);
      }

      function stopAnim() {
        if (!rafId) return;
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        lastTs = 0;
      }

      function scheduleLayout() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(layout, 60);
      }

      layout();

      if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(scheduleLayout);
        ro.observe(stage);
      } else {
        window.addEventListener('resize', scheduleLayout);
      }

      mobileLockMq.addEventListener
        ? mobileLockMq.addEventListener('change', layout)
        : mobileLockMq.addListener && mobileLockMq.addListener(layout);

      if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', layout);
      } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(layout);
      }
    })();

    // Arrow PNG (612×936): tail ≈ (28,28), tip ≈ y=907 — used for precise layout
    var ARROW_IMG_W = 612;
    var ARROW_IMG_H = 936;
    var ARROW_TAIL_Y_FRAC = 28 / ARROW_IMG_H;
    var ARROW_TAIL_X_FRAC = 28 / ARROW_IMG_W;
    var ARROW_TIP_Y_FRAC = 907 / ARROW_IMG_H;
    var ARROW_ASPECT = ARROW_IMG_W / ARROW_IMG_H;

    function measureServicesCssLength(root, customProp, dimension) {
      var axis = dimension === 'width' ? 'left' : 'top';
      var probe = document.createElement('div');
      probe.style.cssText =
        'position:absolute;visibility:hidden;pointer-events:none;' +
        axis +
        ':var(' +
        customProp +
        ');width:1px;height:1px';
      root.appendChild(probe);
      var rootRect = root.getBoundingClientRect();
      var probeRect = probe.getBoundingClientRect();
      var px =
        dimension === 'width'
          ? probeRect.left - rootRect.left
          : probeRect.top - rootRect.top;
      root.removeChild(probe);
      return px;
    }

    function layoutServicesArrow() {
      if (mobileLockMq.matches) return;

      var root = document.querySelector('.page-services');
      var main = document.getElementById('main');
      var forall = document.querySelector('.services-brand-banner__forall');
      var arrow = document.querySelector('.services-scroll-arrow');
      var weddingsImg = document.querySelector('.split-panel--weddings .split-panel__media img');

      if (!root || !main || !forall || !arrow || !weddingsImg) return;

      var mainRect = main.getBoundingClientRect();
      var forallRect = forall.getBoundingClientRect();
      var imgRect = weddingsImg.getBoundingClientRect();
      var gap = measureServicesCssLength(main, '--services-arrow-gap-after-all', 'width');
      var shiftRight = measureServicesCssLength(main, '--services-arrow-shift-right', 'width');
      var lift = measureServicesCssLength(main, '--services-arrow-lift', 'height');
      var tipInset = measureServicesCssLength(main, '--services-arrow-tip-inset', 'height');
      var scale =
        parseFloat(getComputedStyle(root).getPropertyValue('--services-arrow-scale')) || 1;

      if (forallRect.width < 1 || imgRect.height < 1) return;

      var tailX = forallRect.right - mainRect.left + gap + shiftRight;
      var tailY =
        forallRect.top - mainRect.top + forallRect.height * 0.34 - lift;
      var tipY = imgRect.top - mainRect.top + tipInset;
      var span = ARROW_TIP_Y_FRAC - ARROW_TAIL_Y_FRAC;
      var baseHeight = (tipY - tailY) / span;
      var height = baseHeight * scale;
      if (!isFinite(height) || height < 80) return;

      var top = tailY - height * ARROW_TAIL_Y_FRAC;
      var imgWidth = height * ARROW_ASPECT;
      var left = tailX - imgWidth * ARROW_TAIL_X_FRAC;

      root.style.setProperty('--services-arrow-top', top + 'px');
      root.style.setProperty('--services-arrow-left', left + 'px');
      root.style.setProperty('--services-arrow-width', imgWidth + 'px');
      root.style.setProperty('--services-arrow-height', height + 'px');
      arrow.dataset.positioned = 'true';
    }

    function scheduleServicesArrowLayout() {
      requestAnimationFrame(function () {
        layoutServicesArrow();
        requestAnimationFrame(layoutServicesArrow);
      });
    }

    scheduleServicesArrowLayout();
    window.addEventListener('resize', scheduleServicesArrowLayout);
    window.addEventListener('load', scheduleServicesArrowLayout);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleServicesArrowLayout);
    }

    var weddingsImgEl = document.querySelector('.split-panel--weddings .split-panel__media img');
    if (weddingsImgEl) {
      if (weddingsImgEl.complete) {
        scheduleServicesArrowLayout();
      } else {
        weddingsImgEl.addEventListener('load', scheduleServicesArrowLayout);
      }
    }

    if (typeof ResizeObserver !== 'undefined') {
      var servicesArrowObserver = new ResizeObserver(scheduleServicesArrowLayout);
      var observeArrowTarget = document.querySelector('.services-opening');
      var observeBrandTarget = document.querySelector('.services-brand-banner');
      var observeMediaTarget = document.querySelector('.split-panel--weddings .split-panel__media');
      if (observeArrowTarget) servicesArrowObserver.observe(observeArrowTarget);
      if (observeBrandTarget) servicesArrowObserver.observe(observeBrandTarget);
      if (observeMediaTarget) servicesArrowObserver.observe(observeMediaTarget);
    }

    function scrollToServicesWeddings() {
      var servicesScrollTarget = document.querySelector('.split-panel--weddings');
      if (!servicesScrollTarget) return;
      var targetY =
        servicesScrollTarget.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }

    var servicesScrollHint = document.querySelector('.services-scroll-arrow');

    if (servicesScrollHint) {
      servicesScrollHint.addEventListener('click', scrollToServicesWeddings);
    }
  }

  window.resetHomePageState = function () {
    if (typeof window.resetStorySnapView === 'function') {
      window.resetStorySnapView();
    }
    if (typeof window.resetHeaderTaglineMode === 'function') {
      window.resetHeaderTaglineMode();
    }
    if (typeof window.closeOurStoryHero === 'function') {
      window.closeOurStoryHero();
    }
    if (typeof window.setTaglineBrandInactive === 'function') {
      window.setTaglineBrandInactive();
    }
  };

  /* Reach out — slow photo crossfade behind the form */
  if (document.body.classList.contains('page-reach-out')) {
    var reachPhotos = document.querySelectorAll('.reach-out-stage__photo');
    if (reachPhotos.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var reachIndex = 0;
      window.setInterval(function () {
        reachPhotos[reachIndex].classList.remove('is-active');
        reachIndex = (reachIndex + 1) % reachPhotos.length;
        reachPhotos[reachIndex].classList.add('is-active');
      }, 9000);
    }
  }
})();
