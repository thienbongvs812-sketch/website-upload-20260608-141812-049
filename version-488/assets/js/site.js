(() => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");

    if (header && toggle) {
        toggle.addEventListener("click", () => {
            const open = header.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    document.querySelectorAll("[data-hero]").forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dot"));
        const previous = hero.querySelector(".hero-prev");
        const next = hero.querySelector(".hero-next");
        let index = 0;
        let timer = null;

        const show = (target) => {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, position) => {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach((dot, position) => {
                dot.classList.toggle("is-active", position === index);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5000);
        };

        previous?.addEventListener("click", () => {
            show(index - 1);
            start();
        });

        next?.addEventListener("click", () => {
            show(index + 1);
            start();
        });

        dots.forEach((dot, position) => {
            dot.addEventListener("click", () => {
                show(position);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-form]").forEach((form) => {
        const section = form.closest(".content-section") || document;
        const cards = Array.from(section.querySelectorAll(".movie-card"));
        const empty = section.querySelector("[data-empty-state]");
        const params = new URLSearchParams(window.location.search);
        const keywordInput = form.querySelector('[name="keyword"]');
        const categoryInput = form.querySelector('[name="category"]');
        const yearInput = form.querySelector('[name="year"]');
        const regionInput = form.querySelector('[name="region"]');

        if (keywordInput && params.get("q")) {
            keywordInput.value = params.get("q");
        }

        const apply = () => {
            const keyword = (keywordInput?.value || "").trim().toLowerCase();
            const category = categoryInput?.value || "";
            const year = yearInput?.value || "";
            const region = regionInput?.value || "";
            let visible = 0;

            cards.forEach((card) => {
                const text = (card.dataset.search || "").toLowerCase();
                const matched = (!keyword || text.includes(keyword))
                    && (!category || card.dataset.category === category)
                    && (!year || card.dataset.year === year)
                    && (!region || card.dataset.region === region);

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            apply();
        });

        form.querySelectorAll("input, select").forEach((field) => {
            field.addEventListener("input", apply);
            field.addEventListener("change", apply);
        });

        apply();
    });
})();
