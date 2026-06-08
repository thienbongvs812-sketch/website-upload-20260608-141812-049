document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play]");
    var stream = box.getAttribute("data-stream");
    var ready = false;
    var hlsInstance = null;

    function attachStream() {
      if (ready || !video || !stream) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlay() {
      attachStream();
      box.classList.add("is-playing");
      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          box.classList.remove("is-playing");
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        startPlay();
      });
    }

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
