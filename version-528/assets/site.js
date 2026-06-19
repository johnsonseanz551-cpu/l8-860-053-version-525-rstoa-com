document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var menuPanel = document.querySelector("[data-menu-panel]");
  if (menuButton && menuPanel) {
    menuButton.addEventListener("click", function () {
      menuPanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var grids = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid]"));
  if (grids.length) {
    var input = document.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var currentFilter = "all";
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function normalize(text) {
      return (text || "").toString().trim().toLowerCase();
    }

    function applyFilter() {
      var needle = normalize(input ? input.value : "");
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var group = card.getAttribute("data-filter") || "";
          var byText = !needle || haystack.indexOf(needle) !== -1;
          var byGroup = currentFilter === "all" || group === currentFilter;
          card.style.display = byText && byGroup ? "" : "none";
        });
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter-target") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  }
});
