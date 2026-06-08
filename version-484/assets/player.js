(function () {
    const configElement = document.getElementById("player-config");
    const video = document.getElementById("movie-player");
    const button = document.querySelector("[data-play-button]");
    const shell = document.querySelector(".player-card");
    let sourceUrl = "";
    let prepared = false;

    if (configElement) {
        try {
            const config = JSON.parse(configElement.textContent || "{}");
            sourceUrl = config.source || "";
        } catch (error) {
            sourceUrl = "";
        }
    }

    function prepareVideo() {
        if (!video || !sourceUrl || prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    }

    function startVideo() {
        if (!video) {
            return;
        }

        prepareVideo();

        if (button) {
            button.classList.add("is-hidden");
        }

        if (shell) {
            shell.classList.add("is-playing");
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", startVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            }
        });
    }
})();
