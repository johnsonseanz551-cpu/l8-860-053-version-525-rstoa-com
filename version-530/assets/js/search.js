(function () {
  var params = new URLSearchParams(window.location.search);
  var input = document.querySelector('[data-search-input]');
  var region = document.querySelector('[data-region-filter]');
  var year = document.querySelector('[data-year-filter]');
  var genre = document.querySelector('[data-genre-filter]');
  var clear = document.querySelector('[data-search-clear]');
  var status = document.querySelector('[data-search-status]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-results] .movie-filter-card'));

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch() {
    var keyword = normalize(input && input.value);
    var regionValue = normalize(region && region.value);
    var yearValue = normalize(year && year.value);
    var genreValue = normalize(genre && genre.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var matched = true;
      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (regionValue && text.indexOf(regionValue) === -1) {
        matched = false;
      }
      if (yearValue && text.indexOf(yearValue) === -1) {
        matched = false;
      }
      if (genreValue && text.indexOf(genreValue) === -1) {
        matched = false;
      }
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (status) {
      status.textContent = visible ? '已筛选到 ' + visible + ' 部影片' : '没有找到匹配影片';
    }
  }

  [input, region, year, genre].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applySearch);
      element.addEventListener('change', applySearch);
    }
  });

  if (clear) {
    clear.addEventListener('click', function () {
      if (input) {
        input.value = '';
      }
      if (region) {
        region.value = '';
      }
      if (year) {
        year.value = '';
      }
      if (genre) {
        genre.value = '';
      }
      applySearch();
    });
  }

  applySearch();
})();
