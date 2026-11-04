(function () {
  'use strict';

  var services = document.querySelector('.geo-services');
  if (services) {
    if (!('IntersectionObserver' in window)) {
      services.classList.add('is-inview');
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-inview');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
      );
      observer.observe(services);
    }
  }

  var deepTiles = document.querySelectorAll('.geo-deep__tile');
  if (deepTiles.length) {
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    if (!canHover) {
      Array.prototype.forEach.call(deepTiles, function (tile) {
        tile.addEventListener('click', function () {
          var open = tile.classList.contains('is-open');
          Array.prototype.forEach.call(deepTiles, function (other) {
            other.classList.remove('is-open');
          });
          if (!open) tile.classList.add('is-open');
        });
      });
    }
  }

  var flip = document.querySelector('[data-geo-flip]');
  if (flip) {
    var items = Array.prototype.slice.call(
      flip.querySelectorAll('.geo-places__name, .geo-flip__item')
    );
    var reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (items.length >= 2 && !reduceMotion) {
      var styles = window.getComputedStyle(flip);
      var raw = styles.getPropertyValue('--geo-flip-interval').trim();
      var interval = parseFloat(raw);
      if (/ms$/i.test(raw)) {
        /* already ms */
      } else if (/s$/i.test(raw)) {
        interval *= 1000;
      } else if (!interval) {
        interval = 2400;
      }

      var index = items.findIndex(function (el) {
        return el.classList.contains('is-active');
      });
      if (index < 0) index = 0;

      window.setInterval(function () {
        var current = items[index];
        var nextIndex = (index + 1) % items.length;
        var next = items[nextIndex];

        current.classList.remove('is-active');
        current.classList.add('is-exit');
        current.setAttribute('aria-hidden', 'true');

        next.classList.remove('is-exit');
        next.classList.add('is-active');
        next.removeAttribute('aria-hidden');

        window.setTimeout(function () {
          current.classList.remove('is-exit');
        }, 550);

        index = nextIndex;
      }, interval);
    }
  }

  var aboutSection = document.querySelector('.geo-about');
  var aboutDrag = document.querySelector('[data-geo-about-drag]');
  if (!aboutSection || !aboutDrag) return;

  var dragging = false;
  var pointerId = null;
  var grabX = 0;
  var grabY = 0;

  function placeAbout(x, y) {
    var maxX = Math.max(0, aboutSection.clientWidth - aboutDrag.offsetWidth);
    var maxY = Math.max(0, aboutSection.clientHeight - aboutDrag.offsetHeight);
    aboutDrag.style.position = 'absolute';
    aboutDrag.style.margin = '0';
    aboutDrag.style.left = Math.min(Math.max(0, x), maxX) + 'px';
    aboutDrag.style.top = Math.min(Math.max(0, y), maxY) + 'px';
    aboutDrag.style.right = 'auto';
    aboutDrag.style.transform = 'none';
  }

  function armAbsolute() {
    if (aboutDrag.style.left) return;
    var sectionRect = aboutSection.getBoundingClientRect();
    var dragRect = aboutDrag.getBoundingClientRect();
    placeAbout(dragRect.left - sectionRect.left, dragRect.top - sectionRect.top);
  }

  aboutDrag.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    aboutDrag.classList.add('is-dragging');
    aboutDrag.setPointerCapture(e.pointerId);

    armAbsolute();
    var dragRect = aboutDrag.getBoundingClientRect();
    grabX = e.clientX - dragRect.left;
    grabY = e.clientY - dragRect.top;
    e.preventDefault();
  });

  aboutDrag.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var sectionRect = aboutSection.getBoundingClientRect();
    placeAbout(
      e.clientX - sectionRect.left - grabX,
      e.clientY - sectionRect.top - grabY
    );
  });

  function endDrag(e) {
    if (!dragging) return;
    if (e && e.pointerId !== pointerId) return;
    dragging = false;
    aboutDrag.classList.remove('is-dragging');
    try {
      aboutDrag.releasePointerCapture(pointerId);
    } catch (err) {}
    pointerId = null;
  }

  aboutDrag.addEventListener('pointerup', endDrag);
  aboutDrag.addEventListener('pointercancel', endDrag);
})();
