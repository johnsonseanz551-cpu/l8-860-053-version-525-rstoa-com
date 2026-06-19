(function () {
  function setupMoviePlayer(streamUrl) {
    var root = document.querySelector('[data-player-root]');
    if (!root) {
      return;
    }

    var video = root.querySelector('[data-player-video]');
    var layer = root.querySelector('[data-play-layer]');
    var message = root.querySelector('[data-player-message]');
    var hls = null;
    var ready = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('is-visible');
    }

    function attachStream() {
      if (ready || !video || !streamUrl) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频暂时无法播放，请稍后重试。');
          }
        });
        return;
      }
      showMessage('视频暂时无法播放，请稍后重试。');
    }

    function playVideo() {
      attachStream();
      if (!video) {
        return;
      }
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          showMessage('点击播放器即可开始观看。');
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        showMessage('视频暂时无法播放，请稍后重试。');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
