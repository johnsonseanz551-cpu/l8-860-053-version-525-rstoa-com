(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var filterInput = document.querySelector('[data-filter-input]');
  var filterReset = document.querySelector('[data-filter-reset]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-filter-card'));

  function filterCategoryCards() {
    if (!filterInput || !filterCards.length) {
      return;
    }
    var keyword = filterInput.value.trim().toLowerCase();
    filterCards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCategoryCards);
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCategoryCards();
    });
  }

  if (filterReset) {
    filterReset.addEventListener('click', function () {
      setTimeout(filterCategoryCards, 0);
    });
  }
})();
