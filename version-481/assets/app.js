(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('.hero-thumb'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function (root) {
      var input = root.querySelector('[data-filter-search]');
      var region = root.querySelector('[data-filter-region]');
      var type = root.querySelector('[data-filter-type]');
      var year = root.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
      var empty = root.querySelector('[data-no-results]');
      var count = root.querySelector('[data-result-count]');

      function apply() {
        var q = normalize(input && input.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre')
          ].join(' '));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) ok = false;
          if (r && normalize(card.getAttribute('data-region')) !== r) ok = false;
          if (t && normalize(card.getAttribute('data-type')) !== t) ok = false;
          if (y && normalize(card.getAttribute('data-year')) !== y) ok = false;
          card.hidden = !ok;
          if (ok) visible += 1;
        });

        if (empty) empty.classList.toggle('is-visible', visible === 0);
        if (count) count.textContent = visible ? '找到 ' + visible + ' 部影片' : '没有找到匹配影片';
      }

      [input, region, type, year].forEach(function (el) {
        if (el) el.addEventListener('input', apply);
        if (el) el.addEventListener('change', apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && input) input.value = q;
      apply();
    });
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  window.initMoviePlayer = function (videoId, source, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !source) return;
    var started = false;

    function attach() {
      if (video.getAttribute('data-ready') === '1') return;
      video.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }

    function begin() {
      attach();
      started = true;
      if (cover) cover.classList.add('is-hidden');
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.muted = true;
          video.play().catch(function () {
            if (cover) cover.classList.remove('is-hidden');
          });
        });
      }
    }

    attach();
    if (cover) cover.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!started || video.paused) begin();
    });
    video.addEventListener('play', function () {
      if (cover) cover.classList.add('is-hidden');
    });
  };

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchForms();
  });
})();
