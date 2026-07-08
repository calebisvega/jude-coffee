(function () {
  var host = document.getElementById('flashquotes-widget');
  if (!host) return;

  var formId = host.getAttribute('data-form-id');
  if (!formId) return;

  var embedInstanceId = 'fq-embed-' + formId + '-' + Math.random().toString(36).slice(2, 10);
  var baseUrl = 'https://app.flashquotes.com';
  var allowedOrigin = baseUrl;
  var cardWidth = 400;
  var desktopScale = 1.28;
  var minHeight = 520;
  var maxHeight = 920;
  var scale = desktopScale;
  var mobileQuery = window.matchMedia('(max-width: 768px)');

  function getScale() {
    var widget = host.closest('.booking-widget');
    var available = widget ? widget.clientWidth : document.documentElement.clientWidth;
    if (available <= 0) {
      available = document.documentElement.clientWidth;
    }

    if (mobileQuery.matches) {
      var gutter = 8;
      var maxScaledWidth = Math.max(260, available - gutter);
      return Math.min(desktopScale, maxScaledWidth / cardWidth);
    }

    return desktopScale;
  }

  function applyScaledDimensions(contentHeight) {
    var height = Math.min(Math.max(contentHeight, minHeight), maxHeight);
    scale = getScale();

    iframe.style.height = height + 'px';
    iframe.style.minHeight = minHeight + 'px';
    iframe.style.maxHeight = maxHeight + 'px';
    iframe.style.transform = 'scale(' + scale + ')';
    host.style.width = Math.ceil(cardWidth * scale) + 'px';
    host.style.height = Math.ceil(height * scale) + 'px';
    host.style.maxWidth = '100%';
  }

  function setScaledHeight(contentHeight) {
    applyScaledDimensions(contentHeight);
  }

  function extractMarketingParams(urlString) {
    try {
      var url = new URL(urlString);
      var params = url.searchParams;
      var result = {};
      [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'rdt_cid'
      ].forEach(function (key) {
        var value = params.get(key);
        if (value) result[key] = value;
      });
      return result;
    } catch (e) {
      return {};
    }
  }

  function getGaClientIdFromCookie() {
    var gaCookie = document.cookie.split('; ').find(function (cookie) {
      return cookie.startsWith('_ga=');
    });
    if (!gaCookie) return undefined;
    var segments = gaCookie.split('.');
    if (segments.length < 4) return undefined;
    return segments.slice(2).join('.');
  }

  function getGaSessionIdFromCookie() {
    var gaSessionCookie = document.cookie.split('; ').find(function (cookie) {
      return cookie.startsWith('_ga_');
    });
    if (!gaSessionCookie) return undefined;
    var value = gaSessionCookie.split('=')[1];
    if (!value) return undefined;
    var gs2Match = value.match(/(?:^|[.$])s(\d{4,})/);
    if (gs2Match && gs2Match[1]) return gs2Match[1];
    var segments = value.split('.');
    if (segments.length >= 3 && /^\d{4,}$/.test(segments[2])) return segments[2];
    return segments.find(function (segment) {
      return /^\d{4,}$/.test(segment);
    });
  }

  function getEmbedContextPayload() {
    return Object.assign({
      embedInstanceId: embedInstanceId,
      parentUrl: window.location.href,
      parentReferrer: document.referrer || undefined,
      parentOrigin: window.location.origin,
      gaClientId: getGaClientIdFromCookie(),
      gaSessionId: getGaSessionIdFromCookie()
    }, extractMarketingParams(window.location.href));
  }

  function postEmbedContextToIframe(targetWindow) {
    if (!targetWindow) return;
    try {
      targetWindow.postMessage({
        type: 'FLASHQUOTES_EMBED_CONTEXT',
        payload: getEmbedContextPayload()
      }, allowedOrigin);
    } catch (e) {
      // iframe may not be ready yet
    }
  }

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/forms/public/quote/' + formId;
  iframe.title = 'Request a quote';
  iframe.style.border = 'none';
  iframe.style.width = cardWidth + 'px';
  iframe.style.minWidth = cardWidth + 'px';
  iframe.style.maxWidth = cardWidth + 'px';
  iframe.style.display = 'block';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.backgroundColor = 'transparent';
  iframe.style.transform = 'scale(' + scale + ')';
  iframe.style.transformOrigin = 'top left';

  setScaledHeight(minHeight);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var currentHeight = parseInt(iframe.style.height, 10) || minHeight;
      applyScaledDimensions(currentHeight);
    }, 120);
  });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', function () {
      var currentHeight = parseInt(iframe.style.height, 10) || minHeight;
      applyScaledDimensions(currentHeight);
    });
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(function () {
      var currentHeight = parseInt(iframe.style.height, 10) || minHeight;
      applyScaledDimensions(currentHeight);
    });
  }

  iframe.addEventListener('load', function () {
    postEmbedContextToIframe(iframe.contentWindow);
  });

  window.addEventListener('message', function (event) {
    if (
      event.origin !== allowedOrigin ||
      event.source !== iframe.contentWindow ||
      !event.data ||
      typeof event.data !== 'object'
    ) {
      return;
    }

    if (event.data.type === 'FLASHQUOTES_EMBED_CONTEXT_REQUEST') {
      postEmbedContextToIframe(event.source);
    } else if (event.data.type === 'REDIRECT') {
      window.top.location.href = event.data.url;
    } else if (event.data.type === 'FLASHQUOTES_ANALYTICS') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: event.data.event }, event.data.data || {}));
      if (typeof window.gtag === 'function') {
        var gtagParams = Object.assign({}, event.data.data || {}, { transport_type: 'beacon' });
        if (event.data.measurementId) {
          gtagParams.send_to = event.data.measurementId;
        }
        window.gtag('event', event.data.event, gtagParams);
      }
    } else if (event.data.type === 'RESIZE' && event.data.height) {
      setScaledHeight(event.data.height);
    }
  });

  window.setTimeout(function () {
    postEmbedContextToIframe(iframe.contentWindow);
  }, 0);

  host.appendChild(iframe);
})();
