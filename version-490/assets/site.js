(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length && dots.length) {
    var current = 0;
    var timer = null;
    var setSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    var play = function () {
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        setSlide(index);
        play();
      });
    });
    setSlide(0);
    play();
  }

  var filterInput = document.querySelector('.filter-input');
  var filterSelect = document.querySelector('.filter-select');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-region][data-genre]'));
  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var yearMode = filterSelect ? filterSelect.value : 'all';
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var year = parseInt(card.getAttribute('data-year'), 10) || 0;
      var passText = !query || haystack.indexOf(query) !== -1;
      var passYear = true;
      if (yearMode === 'new') {
        passYear = year >= 2020;
      }
      if (yearMode === 'classic') {
        passYear = year < 2020;
      }
      card.style.display = passText && passYear ? '' : 'none';
    });
  };
  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilter);
  }

  var searchForm = document.querySelector('.search-main');
  var searchInput = document.querySelector('.search-main input[name="q"]');
  var searchResults = document.querySelector('.search-results');
  var params = new URLSearchParams(window.location.search);
  if (searchInput && params.get('q')) {
    searchInput.value = params.get('q');
  }
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  };
  var renderSearch = function () {
    if (!searchResults || !window.MOVIES_INDEX) {
      return;
    }
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!query) {
      searchResults.innerHTML = '<div class="search-empty">输入影片名称、类型、地区或标签，即可快速查找高清内容。</div>';
      return;
    }
    var result = window.MOVIES_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase().indexOf(query) !== -1;
    });
    if (!result.length) {
      searchResults.innerHTML = '<div class="search-empty">没有找到匹配影片，换一个关键词试试。</div>';
      return;
    }
    searchResults.innerHTML = '<div class="search-result-grid">' + result.slice(0, 120).map(function (movie) {
      return '<article class="movie-card compact-card">' +
        '<a class="movie-cover" href="./' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="cover-shade"></span><span class="year-badge">' + escapeHtml(movie.year) + '</span></a>' +
        '<div class="movie-info"><h3><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p class="movie-genre">' + escapeHtml(movie.genre) + '</p>' +
        '<p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div></div>' +
        '</article>';
    }).join('') + '</div>';
  };
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
      renderSearch();
    });
    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }
})();

window.initMoviePlayer = function (sourceUrl) {
  var video = document.getElementById('player-video');
  var overlay = document.querySelector('.player-overlay');
  var playButton = document.querySelector('.player-play-button');
  if (!video || !overlay || !playButton || !sourceUrl) {
    return;
  }
  var ready = false;
  var hlsInstance = null;
  var bind = function () {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    ready = true;
  };
  var start = function () {
    bind();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  };
  overlay.addEventListener('click', start);
  playButton.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!ready) {
      start();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
};
