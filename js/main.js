(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  function resetHomeScroll() {
    if (!document.body.classList.contains('page-home')) return;
    window.scrollTo(0, 0);
  }

  resetHomeScroll();
  window.addEventListener('pageshow', resetHomeScroll);
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
    var headerUsesAnywhere = false;

    function updateHeaderTaglineMode() {
      if (document.body.classList.contains('is-page-scroll-animating')) return;
      if (!headerAnytimeTrigger || !heroAnywhereTrigger) return;

      var headerY = headerAnytimeTrigger.getBoundingClientRect().top;
      var anywhereY = heroAnywhereTrigger.getBoundingClientRect().top;

      if (!headerUsesAnywhere && anywhereY <= headerY + 2) {
        headerUsesAnywhere = true;
      } else if (headerUsesAnywhere && anywhereY > headerY + 24) {
        headerUsesAnywhere = false;
      }

      document.body.classList.toggle('is-header-anywhere', headerUsesAnywhere);
      if (headerAnywhereBlock) {
        headerAnywhereBlock.setAttribute('aria-hidden', headerUsesAnywhere ? 'false' : 'true');
      }
    }

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

    function setTaglineBrandActive(active) {
      clearTimeout(brandHideTimer);
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
    if (headerLogo) {
      headerLogo.addEventListener('pointerenter', function () {
        setTaglineBrandActive(false);
      });
      headerLogo.addEventListener('pointerdown', function () {
        setTaglineBrandActive(false);
      });
    }

    document.addEventListener('pointerdown', function (e) {
      if (!document.body.classList.contains('is-tagline-brand')) return;
      if (e.target.closest('[data-tagline-brand]')) return;
      setTaglineBrandActive(false);
    });
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

    if (aboutPeek) {
      aboutPeek.addEventListener('mouseenter', showAboutPeek);
      aboutPeek.addEventListener('mouseleave', scheduleCloseOurStory);
      aboutPeek.addEventListener('focusin', showAboutPeek);
      aboutPeek.addEventListener('focusout', scheduleCloseOurStory);
    }
  }

  // Home page — full-page scroll + numbered index (1–3 after hero)
  if (document.body.classList.contains('page-home') && !prefersReducedMotion) {
    var snapPages = Array.prototype.slice.call(
      document.querySelectorAll('[data-snap-page]')
    );
    var pageIndexEl = document.getElementById('page-index');
    var pageIndexNumber = document.getElementById('page-index-number');
    var scrollAnimating = false;
    var snapDuration = 900;
    var snapCooldown = 150;
    var lastSnapAt = 0;
    var wheelAccumulator = 0;
    var wheelResetTimer = null;

    var storyCopy = document.getElementById('our-story')
      ? document.querySelector('#our-story .story-editorial__copy')
      : null;

    function storyCopyCanScrollDown() {
      if (!storyCopy) return false;
      return storyCopy.scrollTop + storyCopy.clientHeight < storyCopy.scrollHeight - 2;
    }

    function storyCopyCanScrollUp() {
      if (!storyCopy) return false;
      return storyCopy.scrollTop > 2;
    }

    function resetStoryPageView() {
      if (storyCopy) {
        storyCopy.scrollTop = 0;
      }
      if (typeof window.collapseStoryAccordion === 'function') {
        window.collapseStoryAccordion();
      }
    }

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

    function updatePageIndex(forcedIndex) {
      if (!pageIndexNumber) return;

      var idx = typeof forcedIndex === 'number' ? forcedIndex : getActivePageIndex();
      var pageNum = Number(snapPages[idx].getAttribute('data-snap-page')) || 0;

      document.body.classList.toggle('is-page-index-visible', pageNum > 0);
      pageIndexNumber.textContent = String(pageNum);

      if (pageIndexEl) {
        pageIndexEl.setAttribute('aria-hidden', pageNum > 0 ? 'false' : 'true');
      }
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
      updatePageIndex(index);

      animateScrollTo(pageTop(snapPages[index]), snapDuration, function () {
        scrollAnimating = false;
        document.body.classList.remove('is-page-scroll-animating');
        updatePageIndex();
        if (index === 1) {
          resetStoryPageView();
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
            storyCopy.scrollTop += scrollDelta;
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
            storyCopy.scrollTop += scrollDelta;
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
          updatePageIndex();
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
    updatePageIndex(0);
  } else if (document.body.classList.contains('page-home')) {
    var snapPagesReduced = Array.prototype.slice.call(
      document.querySelectorAll('[data-snap-page]')
    );
    var pageIndexNumberReduced = document.getElementById('page-index-number');
    var pageIndexElReduced = document.getElementById('page-index');

    function updatePageIndexReduced() {
      if (!pageIndexNumberReduced) return;

      var scrollY = window.scrollY;
      var active = 0;

      snapPagesReduced.forEach(function (page, i) {
        if (scrollY >= page.getBoundingClientRect().top + window.scrollY - 64) {
          active = i;
        }
      });

      var pageNum = Number(snapPagesReduced[active].getAttribute('data-snap-page')) || 0;
      document.body.classList.toggle('is-page-index-visible', pageNum > 0);
      pageIndexNumberReduced.textContent = String(pageNum);

      if (pageIndexElReduced) {
        pageIndexElReduced.setAttribute('aria-hidden', pageNum > 0 ? 'false' : 'true');
      }
    }

    window.addEventListener('scroll', updatePageIndexReduced, { passive: true });
    resetHomeScroll();
    updatePageIndexReduced();
  }

  // Menu page — draggable menu + idle motion
  if (document.body.classList.contains('page-menu')) {
    var menuDrag = document.getElementById('menu-asset-drag');
    var menuSection = document.querySelector('.section--menu-asset');

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
        defaultMenuPosition();
      }

      window.addEventListener('load', initMenuPosition);
      window.addEventListener('resize', function () {
        if (!menuDragging) {
          defaultMenuPosition();
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

  // Our Story accordion — expand on tap, compress on scroll
  var storyAccordion = document.querySelector('[data-story-accordion]');

  if (storyAccordion) {
    var storyTrigger = storyAccordion.querySelector('.story-accordion__trigger');

    function setStoryAccordionOpen(open) {
      storyAccordion.classList.toggle('is-open', open);
      storyAccordion.classList.toggle('is-compressed', !open);
      if (storyTrigger) {
        storyTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    function collapseStoryAccordion() {
      setStoryAccordionOpen(false);
    }

    if (storyTrigger) {
      storyTrigger.addEventListener('click', function () {
        setStoryAccordionOpen(!storyAccordion.classList.contains('is-open'));
      });
    }

    collapseStoryAccordion();
    window.collapseStoryAccordion = collapseStoryAccordion;
  }

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
})();
