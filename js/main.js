(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
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
    resetHomeScroll();
    if (e.persisted) {
      requestAnimationFrame(resetHomeScroll);
    }
  });
  window.addEventListener('load', resetHomeScroll);

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

  // Hero photo rotation — no duplicate images visible at once
  var photoStacks = Array.prototype.slice.call(
    document.querySelectorAll('.hero-collage__piece--photo')
  );
  var flipInterval = 6500;

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

  if (photoStacks.length && !prefersReducedMotion) {
    ensureUniqueInitialState();

    photoStacks.forEach(function (stack, stackIndex) {
      var photos = stack.querySelectorAll('.hero-collage__photo');
      if (photos.length < 2) return;

      setTimeout(function () {
        setInterval(function () {
          if (!flipStack(stack)) {
            photoStacks.some(function (otherStack) {
              if (otherStack === stack) return false;
              return flipStack(otherStack);
            });
            flipStack(stack);
          }
        }, flipInterval);
      }, stackIndex * 900);
    });
  } else if (photoStacks.length) {
    ensureUniqueInitialState();
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

    var headerLogo = document.querySelector('.site-header--home .logo');
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
  var collagePieces = document.querySelectorAll('.hero-collage__piece');
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

  // Our Story snap page — reset accordion + scroll when landing on page
  window.resetStorySnapView = function () {
    var aboutPanelEl = document.querySelector(
      '#our-story [data-about-accordion] .story-accordion__panel-inner'
    );

    if (aboutPanelEl) {
      aboutPanelEl.scrollTop = 0;
    }
    if (
      typeof window.collapseAboutAccordion === 'function' &&
      !window.matchMedia('(max-width: 768px)').matches
    ) {
      window.collapseAboutAccordion();
    } else if (typeof syncMobileAboutAccordion === 'function') {
      syncMobileAboutAccordion();
    }
  };

  // Home page — full-page scroll snap (after hero)
  if (document.body.classList.contains('page-home') && !prefersReducedMotion) {
    var snapPages = Array.prototype.slice.call(
      document.querySelectorAll('[data-snap-page]')
    );
    var scrollAnimating = false;
    var snapDuration = 900;
    var snapCooldown = 150;
    var lastSnapAt = 0;
    var wheelAccumulator = 0;
    var wheelResetTimer = null;

    var aboutPanelInner = document.getElementById('our-story')
      ? document.querySelector('#our-story [data-about-accordion] .story-accordion__panel-inner')
      : null;
    var aboutAccordionEl = document.querySelector('#our-story [data-about-accordion]');

    function storyScrollTarget() {
      if (aboutAccordionEl && aboutAccordionEl.classList.contains('is-open') && aboutPanelInner) {
        return aboutPanelInner;
      }
      return null;
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
  } else if (document.body.classList.contains('page-home')) {
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

  // Menu page — draggable menu + idle motion (desktop only)
  if (document.body.classList.contains('page-menu')) {
    var menuDrag = document.getElementById('menu-asset-drag');
    var menuSection = document.querySelector('.section--menu-asset');
    var menuMobileQuery = window.matchMedia('(max-width: 768px)');

    function isMenuMobileLayout() {
      return menuMobileQuery.matches;
    }

    function resetMenuMobilePosition() {
      if (!menuDrag) return;
      menuDrag.style.left = '';
      menuDrag.style.top = '';
      menuDrag.style.transform = '';
    }

    if (menuDrag && menuSection) {
      var menuDragging = false;
      var menuPointerId = null;
      var menuGrabOffsetX = 0;
      var menuGrabOffsetY = 0;
      var menuPositioned = false;

      function placeMenu(x, y) {
        var maxX = Math.max(0, menuSection.clientWidth - menuDrag.offsetWidth);
        var maxY = Math.max(0, menuSection.clientHeight - menuDrag.offsetHeight);
        menuDrag.style.left = Math.min(Math.max(0, x), maxX) + 'px';
        menuDrag.style.top = Math.min(Math.max(0, y), maxY) + 'px';
        menuDrag.style.transform = 'none';
        menuPositioned = true;
      }

      function defaultMenuPosition() {
        placeMenu(
          (menuSection.clientWidth - menuDrag.offsetWidth) / 2,
          menuSection.clientHeight * 0.52 - menuDrag.offsetHeight / 2
        );
      }

      function initMenuPosition() {
        if (isMenuMobileLayout()) {
          resetMenuMobilePosition();
          return;
        }
        defaultMenuPosition();
      }

      window.addEventListener('load', initMenuPosition);
      window.addEventListener('resize', function () {
        if (!menuDragging) {
          initMenuPosition();
        }
      });

      menuDrag.addEventListener('pointerdown', function (e) {
        if (isMenuMobileLayout()) return;
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

  // About us — expand upward in story section
  var aboutAccordion = document.querySelector('#our-story [data-about-accordion]');

  function bindStoryColumnAccordion(accordion) {
    if (!accordion) return null;

    var trigger = accordion.querySelector('.story-accordion__trigger');

    function setOpen(open) {
      accordion.classList.toggle('is-open', open);
      accordion.classList.toggle('is-compressed', !open);
      if (trigger) {
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    function collapse() {
      setOpen(false);
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 768px)').matches) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        setOpen(!accordion.classList.contains('is-open'));
      });
    }

    collapse();
    return collapse;
  }

  var collapseAboutAccordion = bindStoryColumnAccordion(aboutAccordion);

  if (collapseAboutAccordion) {
    window.collapseAboutAccordion = collapseAboutAccordion;
  }

  function syncMobileAboutAccordion() {
    var mobileAboutQuery = window.matchMedia('(max-width: 768px)');
    if (!aboutAccordion || !mobileAboutQuery.matches) return;

    aboutAccordion.classList.add('is-open');
    aboutAccordion.classList.remove('is-compressed');
    var aboutTrigger = aboutAccordion.querySelector('.story-accordion__trigger');
    if (aboutTrigger) {
      aboutTrigger.setAttribute('aria-expanded', 'true');
    }
  }

  syncMobileAboutAccordion();
  if (typeof window.matchMedia('(max-width: 768px)').addEventListener === 'function') {
    window.matchMedia('(max-width: 768px)').addEventListener('change', syncMobileAboutAccordion);
  }

  function goToHomeTop() {
    if (typeof window.homeGoToSnapPage === 'function') {
      window.homeGoToSnapPage(0);
      return;
    }
    resetHomeScroll();
  }

  function isHomePageLink(href) {
    if (!href || href.charAt(0) === '#') return false;

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

  // Services page — multi-direction marquee frame
  if (document.body.classList.contains('page-services')) {
    document.documentElement.style.overscrollBehavior = 'none';

    document.querySelectorAll('.page-services .fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });

    function clampServicesScroll() {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll < 0) maxScroll = 0;
      if (window.scrollY > maxScroll) {
        window.scrollTo(0, maxScroll);
      }
    }

    window.addEventListener('scroll', clampServicesScroll, { passive: true });
    window.addEventListener('resize', clampServicesScroll);
    clampServicesScroll();

    var servicesMarqueePhrases = [
      'weddings',
      'private parties',
      'Bar Mitzvah',
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
})();
