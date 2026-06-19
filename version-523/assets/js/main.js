(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function initSearchForms() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';

        if (!value) {
          event.preventDefault();
          return;
        }

        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var activeFilters = {
        type: '全部',
        year: '全部'
      };
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

      function applyFilters() {
        cards.forEach(function (card) {
          var typeMatched = activeFilters.type === '全部' || card.getAttribute('data-type') === activeFilters.type;
          var yearMatched = activeFilters.year === '全部' || card.getAttribute('data-year') === activeFilters.year;
          card.classList.toggle('is-hidden-card', !(typeMatched && yearMatched));
        });
      }

      scope.querySelectorAll('[data-filter-button]').forEach(function (button) {
        if (button.getAttribute('data-filter-value') === '全部') {
          button.classList.add('is-active');
        }

        button.addEventListener('click', function () {
          var kind = button.getAttribute('data-filter-kind');
          var value = button.getAttribute('data-filter-value');
          activeFilters[kind] = value;

          scope.querySelectorAll('[data-filter-kind="' + kind + '"]').forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });

          applyFilters();
        });
      });
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');

    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var status = page.querySelector('[data-search-status]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card'));
    var inputs = page.querySelectorAll('input[name="q"]');

    inputs.forEach(function (input) {
      input.value = query;
    });

    if (!query) {
      cards.forEach(function (card) {
        card.classList.remove('is-hidden-card');
      });
      return;
    }

    var lower = query.toLowerCase();
    var matched = 0;

    cards.forEach(function (card) {
      var ok = card.textContent.toLowerCase().indexOf(lower) !== -1;
      card.classList.toggle('is-hidden-card', !ok);
      if (ok) {
        matched += 1;
      }
    });

    if (status) {
      status.textContent = '搜索“' + query + '”找到 ' + matched + ' 部影片';
    }
  }

  function bindPlayer(source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.getElementById('playOverlay');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      loadSource();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.startMoviePlayer = function (source) {
    ready(function () {
      bindPlayer(source);
    });
  };

  ready(function () {
    initNavigation();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
