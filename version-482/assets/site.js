(function () {
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
      mobileToggle.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(
      hero.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      hero.querySelectorAll("[data-hero-dot]"),
    );
    var previousButton = hero.querySelector("[data-hero-prev]");
    var nextButton = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(
      document.querySelectorAll("[data-player]"),
    );
    if (!players.length) {
      return;
    }

    window.__movieHls = window.__movieHls || [];

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".player-start");
      if (!video) {
        return;
      }

      var source = video.getAttribute("data-src");
      var isBound = false;

      function bindSource() {
        if (isBound || !source) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          isBound = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          window.__movieHls.push(hls);
          isBound = true;
          return;
        }

        video.src = source;
        isBound = true;
      }

      function playVideo() {
        bindSource();
        shell.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (!isBound) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[character];
    });
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");

    return [
      '<article class="movie-card">',
      '<a class="poster-frame" href="./' +
        escapeHtml(movie.url) +
        '" style="--poster-image: url(\'./' +
        escapeHtml(movie.image) +
        "');\">",
      '<span class="poster-year">' + escapeHtml(movie.year) + "</span>",
      '<span class="poster-title">' + escapeHtml(movie.title) + "</span>",
      "</a>",
      '<div class="movie-card-body">',
      '<div class="movie-meta"><span>' +
        escapeHtml(movie.region) +
        "</span><span>" +
        escapeHtml(movie.type) +
        "</span><span>" +
        escapeHtml(movie.genre) +
        "</span></div>",
      '<h3><a href="./' +
        escapeHtml(movie.url) +
        '">' +
        escapeHtml(movie.title) +
        "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      '<div class="tag-row">' + tags + "</div>",
      '<div class="card-actions"><a class="text-link" href="./' +
        escapeHtml(movie.url) +
        '">查看详情</a><a class="pill-link" href="./' +
        escapeHtml(movie.url) +
        '#player">立即播放</a></div>',
      "</div>",
      "</article>",
    ].join("");
  }

  function setupSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MOVIES) {
      return;
    }

    var form = document.querySelector("[data-search-form]");
    var input = form ? form.querySelector('input[name="q"]') : null;
    var typeSelect = form ? form.querySelector('select[name="type"]') : null;
    var results = page.querySelector("[data-search-results]");
    var title = page.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);

    if (input) {
      input.value = params.get("q") || "";
    }

    if (typeSelect) {
      typeSelect.value = params.get("type") || "";
    }

    function applySearch() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var list = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedType = !type || movie.type.indexOf(type) !== -1;
        return matchedQuery && matchedType;
      }).slice(0, 96);

      if (title) {
        title.textContent = query
          ? "搜索：" + (input ? input.value.trim() : "")
          : "推荐影片";
      }

      if (results) {
        results.innerHTML = list.map(renderSearchCard).join("");
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
      });
      form.addEventListener("input", applySearch);
      form.addEventListener("change", applySearch);
    }

    applySearch();
  }

  setupHero();
  setupPlayers();
  setupSearch();
})();
