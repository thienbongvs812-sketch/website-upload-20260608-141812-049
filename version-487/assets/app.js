(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("active", i === index);
            });
        }
        thumbs.forEach(function (thumb, index) {
            thumb.addEventListener("click", function () {
                show(index);
            });
        });
        setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
        show(0);
    }

    function setupFilters() {
        var filterBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        filterBlocks.forEach(function (scope) {
            var textInput = scope.querySelector("[data-filter-text]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var typeSelect = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".no-result");
            function apply() {
                var text = normalize(textInput && textInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var okText = !text || haystack.indexOf(text) !== -1;
                    var okYear = !year || normalize(card.getAttribute("data-year")) === year;
                    var okType = !type || normalize(card.getAttribute("data-type")) === type;
                    var visible = okText && okYear && okType;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", shown === 0);
                }
            }
            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupSearchPage() {
        var searchPage = document.querySelector("[data-search-page]");
        if (!searchPage) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var input = searchPage.querySelector("[data-filter-text]");
        if (input && q) {
            input.value = q;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function setPlayerMessage(message) {
        var messageBox = document.querySelector(".player-message");
        if (messageBox) {
            messageBox.textContent = message || "";
        }
    }

    function setupPlayer(streamUrl) {
        var frame = document.querySelector(".player-frame");
        var video = document.querySelector(".player-frame video");
        var overlay = document.querySelector(".player-overlay");
        var button = document.querySelector(".player-start");
        if (!frame || !video || !button || !streamUrl) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setPlayerMessage("播放暂时不可用，请稍后重试");
                    }
                });
                return Promise.resolve();
            }
            video.src = streamUrl;
            return Promise.resolve();
        }
        function start() {
            load().then(function () {
                var promise = video.play();
                if (promise && typeof promise.then === "function") {
                    promise.then(function () {
                        if (overlay) {
                            overlay.classList.add("hidden");
                        }
                        setPlayerMessage("");
                    }).catch(function () {
                        setPlayerMessage("点击播放按钮开始播放");
                    });
                }
            });
        }
        button.addEventListener("click", start);
        frame.addEventListener("click", function (event) {
            if (event.target === video || event.target === overlay) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("hidden");
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });

    window.SiteApp = {
        setupPlayer: setupPlayer
    };
}());
