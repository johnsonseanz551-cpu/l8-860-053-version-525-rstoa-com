
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('input[name="keyword"]');
      var year = scope.querySelector('select[name="year"]');
      var category = scope.querySelector('select[name="category"]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-movie-card'));
      var empty = scope.querySelector('.empty-state');

      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function update() {
        var keyword = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : 'all';
        var selectedCategory = category ? category.value : 'all';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear !== 'all' && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedCategory !== 'all' && cardCategory !== selectedCategory) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', update);
      }
      if (year) {
        year.addEventListener('change', update);
      }
      if (category) {
        category.addEventListener('change', update);
      }
      update();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;

      if (!video || !button || !stream) {
        return;
      }

      function prepare() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

        video.setAttribute('data-ready', 'true');
      }

      function start() {
        prepare();
        button.hidden = true;
        player.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            button.hidden = false;
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', start);
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          start();
        }
      });
      video.addEventListener('play', function () {
        button.hidden = true;
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          button.hidden = false;
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
