(function () {
    const body = document.body;
    const menuButton = document.querySelector("[data-menu-toggle]");

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            const isOpen = body.classList.toggle("menu-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        const railItems = Array.from(slider.querySelectorAll("[data-hero-rail]"));
        let current = 0;
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
            railItems.forEach(function (item, itemIndex) {
                item.classList.toggle("is-active", itemIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                const nextIndex = Number(dot.getAttribute("data-hero-dot"));
                showSlide(nextIndex);
                startTimer();
            });
        });

        railItems.forEach(function (item) {
            item.addEventListener("mouseenter", function () {
                const nextIndex = Number(item.getAttribute("data-hero-rail"));
                showSlide(nextIndex);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    });

    function getCards(targetId) {
        const target = document.getElementById(targetId);
        if (!target) {
            return [];
        }
        return Array.from(target.querySelectorAll(".movie-card"));
    }

    function cardText(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function applySearch(input) {
        const targetId = input.getAttribute("data-search-target");
        const query = input.value.trim().toLowerCase();
        getCards(targetId).forEach(function (card) {
            card.hidden = query !== "" && !cardText(card).includes(query);
        });
    }

    document.querySelectorAll("[data-search-target]").forEach(function (input) {
        input.addEventListener("input", function () {
            applySearch(input);
        });
    });

    function compareCards(mode) {
        return function (a, b) {
            const yearA = Number(a.getAttribute("data-year") || 0);
            const yearB = Number(b.getAttribute("data-year") || 0);
            const heatA = Number(a.getAttribute("data-heat") || 0);
            const heatB = Number(b.getAttribute("data-heat") || 0);
            const orderA = Number(a.getAttribute("data-default-order") || 0);
            const orderB = Number(b.getAttribute("data-default-order") || 0);
            const titleA = (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");

            if (mode === "year-desc") {
                return yearB - yearA || heatB - heatA || orderA - orderB;
            }
            if (mode === "year-asc") {
                return yearA - yearB || orderA - orderB;
            }
            if (mode === "heat-desc") {
                return heatB - heatA || yearB - yearA || orderA - orderB;
            }
            if (mode === "title-asc") {
                return titleA || orderA - orderB;
            }
            return orderA - orderB;
        };
    }

    document.querySelectorAll("[data-sort-target]").forEach(function (select) {
        select.addEventListener("change", function () {
            const targetId = select.getAttribute("data-sort-target");
            const target = document.getElementById(targetId);
            if (!target) {
                return;
            }
            getCards(targetId).sort(compareCards(select.value)).forEach(function (card) {
                target.appendChild(card);
            });
        });
    });
})();
