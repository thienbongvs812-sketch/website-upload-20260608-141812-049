(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-menu-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            button.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", carousel);
        var dots = selectAll("[data-hero-dot]", carousel);
        var next = carousel.querySelector("[data-hero-next]");
        var prev = carousel.querySelector("[data-hero-prev]");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        carousel.addEventListener("mouseenter", stopTimer);
        carousel.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function yearMatches(selected, year) {
        if (!selected || selected === "全部年份") {
            return true;
        }
        var number = parseInt(year, 10);
        if (selected.indexOf("-") > -1) {
            var range = selected.split("-").map(function (item) {
                return parseInt(item, 10);
            });
            return number >= range[0] && number <= range[1];
        }
        return String(number) === selected;
    }

    function valueMatches(selected, value) {
        if (!selected || selected.indexOf("全部") === 0) {
            return true;
        }
        return normalize(value).indexOf(normalize(selected)) > -1;
    }

    function setupFilters() {
        var panels = selectAll("[data-filter-panel]");
        panels.forEach(function (panel) {
            var section = panel.closest("section") || document;
            var input = panel.querySelector("[data-filter-input]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var sortSelect = panel.querySelector("[data-sort-select]");
            var count = panel.querySelector("[data-filter-count]");
            var container = section.querySelector("[data-card-container]") || section;
            var cards = selectAll("[data-movie-card]", section);

            function applySort() {
                if (!sortSelect || !container) {
                    return;
                }
                var value = sortSelect.value;
                var sorted = cards.slice();
                if (value === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.year) - Number(a.dataset.year);
                    });
                } else if (value === "year-asc") {
                    sorted.sort(function (a, b) {
                        return Number(a.dataset.year) - Number(b.dataset.year);
                    });
                } else if (value === "score-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.score) - Number(a.dataset.score);
                    });
                } else if (value === "title-asc") {
                    sorted.sort(function (a, b) {
                        return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-Hans-CN");
                    });
                }
                sorted.forEach(function (card) {
                    container.appendChild(card);
                });
            }

            function applyFilter() {
                var query = normalize(input && input.value);
                var selectedYear = yearSelect && yearSelect.value;
                var selectedRegion = regionSelect && regionSelect.value;
                var selectedType = typeSelect && typeSelect.value;
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.year
                    ].join(" "));
                    var matched = true;
                    matched = matched && (!query || haystack.indexOf(query) > -1);
                    matched = matched && yearMatches(selectedYear, card.dataset.year);
                    matched = matched && valueMatches(selectedRegion, card.dataset.region);
                    matched = matched && valueMatches(selectedType, card.dataset.type);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "显示 " + visible + " / " + cards.length + " 部";
                }
            }

            [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
            if (sortSelect) {
                sortSelect.addEventListener("change", function () {
                    applySort();
                    applyFilter();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            applySort();
            applyFilter();
        });
    }

    function setupPlayers() {
        selectAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-play-overlay]");
            var status = player.querySelector("[data-player-status]");
            var source = player.dataset.videoUrl;
            var hlsInstance = null;
            var loaded = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function initializeSource() {
                if (!video || !source || loaded) {
                    return;
                }
                loaded = true;
                setStatus("正在加载播放源");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("视频加载失败，请稍后重试");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源已就绪");
                    }, { once: true });
                } else {
                    setStatus("当前浏览器需要 HLS 支持才能播放");
                }
            }

            function playVideo() {
                initializeSource();
                if (!video) {
                    return;
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function () {
                        player.classList.add("is-playing");
                        setStatus("正在播放");
                    }).catch(function () {
                        setStatus("请再次点击播放器开始播放");
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }
            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                    setStatus("正在播放");
                });
                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                    setStatus("已暂停");
                });
                video.addEventListener("ended", function () {
                    player.classList.remove("is-playing");
                    setStatus("播放结束");
                });
            }
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHeroCarousel();
        setupFilters();
        setupPlayers();
    });
})();
