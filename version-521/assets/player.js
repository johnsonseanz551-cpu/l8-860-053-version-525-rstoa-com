(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var trigger = document.querySelector("[data-player-trigger]");
    if (!video || !trigger) {
      return;
    }
    var stream = trigger.getAttribute("data-stream") || "";
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      trigger.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          trigger.classList.remove("is-hidden");
        });
      }
    }

    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
