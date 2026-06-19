(function () {
    window.initMoviePlayer = function (videoUrl) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !overlay || !videoUrl) {
            return;
        }

        var started = false;
        var hlsPlayer = null;

        function begin() {
            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;
            overlay.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsPlayer.loadSource(videoUrl);
                hlsPlayer.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            video.play().catch(function () {
                video.setAttribute("controls", "controls");
            });
        }

        overlay.addEventListener("click", begin);
        video.addEventListener("click", begin);
        window.addEventListener("pagehide", function () {
            if (hlsPlayer && typeof hlsPlayer.destroy === "function") {
                hlsPlayer.destroy();
            }
        });
    };
})();
