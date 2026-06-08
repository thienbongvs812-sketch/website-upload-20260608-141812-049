import { H as Hls } from "./hls-dru42stk.js";

(() => {
    const players = document.querySelectorAll("[data-player]");

    const start = async (wrap) => {
        const video = wrap.querySelector("video");
        const button = wrap.querySelector("[data-url]");
        const url = button?.dataset.url;

        if (!video || !url) {
            return;
        }

        wrap.classList.add("is-playing");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = url;
            }
        } else if (Hls.isSupported()) {
            if (!wrap._hls) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                wrap._hls = hls;
            }
        } else if (!video.src) {
            video.src = url;
        }

        try {
            await video.play();
        } catch (error) {
            window.setTimeout(() => video.play().catch(() => {}), 350);
        }
    };

    players.forEach((wrap) => {
        const button = wrap.querySelector("[data-url]");
        const video = wrap.querySelector("video");

        button?.addEventListener("click", () => start(wrap));
        video?.addEventListener("click", () => {
            if (!wrap.classList.contains("is-playing")) {
                start(wrap);
            }
        });
    });
})();
