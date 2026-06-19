(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('.hero');
    if (!hero) return;
    var slides = $$('.hero-slide', hero);
    var dots = $$('.hero-dot', hero);
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initFilters() {
    var grid = $('[data-filter-grid]');
    if (!grid) return;
    var input = $('[data-filter-text]');
    var category = $('[data-filter-category]');
    var year = $('[data-filter-year]');
    var region = $('[data-filter-region]');
    var type = $('[data-filter-type]');
    var cards = $$('.movie-card', grid);
    var empty = $('.no-results');
    var query = getParam('q');
    if (input && query) input.value = query;

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function match(card) {
      var textValue = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var haystack = normalize([
        card.dataset.title,
        card.dataset.tags,
        card.dataset.year,
        card.dataset.region,
        card.dataset.category,
        card.dataset.type
      ].join(' '));
      if (textValue && haystack.indexOf(textValue) === -1) return false;
      if (categoryValue && normalize(card.dataset.category) !== categoryValue) return false;
      if (yearValue && normalize(card.dataset.year) !== yearValue) return false;
      if (regionValue && normalize(card.dataset.region) !== regionValue) return false;
      if (typeValue && normalize(card.dataset.type).indexOf(typeValue) === -1) return false;
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
    }

    [input, category, year, region, type].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    $$('.player-box').forEach(function (box) {
      var video = $('video', box);
      var button = $('.play-large', box);
      var error = $('.player-error', box);
      if (!video) return;
      var src = video.getAttribute('data-video-src');

      function showError(message) {
        if (!error) return;
        error.textContent = message;
        error.classList.add('show');
      }

      function bindSource() {
        if (!src) {
          showError('视频加载失败，请稍后重试');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) showError('视频加载失败，请稍后重试');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function toggle() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
              showError('请再次点击播放');
            });
          }
        } else {
          video.pause();
        }
      }

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
      video.addEventListener('error', function () {
        showError('视频加载失败，请稍后重试');
      });
      video.addEventListener('click', toggle);
      if (button) button.addEventListener('click', toggle);
      bindSource();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
