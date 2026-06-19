(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clip(value, length) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= length) {
      return text;
    }
    return text.slice(0, length).replace(/[，。,.\s]+$/g, "") + "…";
  }

  function cardTemplate(movie) {
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "    <span class=\"poster-play\">播放</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "    <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(clip(movie.one, 90)) + "</p>",
      "    <div class=\"tag-row\"><span class=\"badge\">" + escapeHtml(movie.genre) + "</span></div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var activeIndex = 0;
      var setSlide = function (index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === activeIndex);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === activeIndex);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      window.setInterval(function () {
        setSlide(activeIndex + 1);
      }, 5600);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var localSearch = document.querySelector("[data-local-search]");
    var localYear = document.querySelector("[data-local-year]");
    var localRegion = document.querySelector("[data-local-region]");
    var localCategory = document.querySelector("[data-local-category]");
    var emptyState = document.querySelector("[data-empty-state]");
    var filterCards = function () {
      var query = normalize(localSearch && localSearch.value);
      var year = normalize(localYear && localYear.value);
      var region = normalize(localRegion && localRegion.value);
      var category = normalize(localCategory && localCategory.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" "));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
        var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
        var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
        var show = matchQuery && matchYear && matchRegion && matchCategory;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };
    [localSearch, localYear, localRegion, localCategory].forEach(function (item) {
      if (item) {
        item.addEventListener("input", filterCards);
        item.addEventListener("change", filterCards);
      }
    });

    var searchResults = document.getElementById("searchResults");
    if (searchResults) {
      var data = typeof MOVIES_SEARCH_INDEX === "undefined" ? [] : MOVIES_SEARCH_INDEX;
      var params = new URLSearchParams(window.location.search);
      var q = String(params.get("q") || "").trim();
      var input = document.querySelector("[data-search-page-input]");
      var heading = document.querySelector("[data-search-heading]");
      var searchEmpty = document.getElementById("searchEmpty");
      if (input) {
        input.value = q;
      }
      var needle = normalize(q);
      var results = needle ? data.filter(function (movie) {
        return normalize([movie.title, movie.genre, movie.region, movie.year, movie.one, movie.tags].join(" ")).indexOf(needle) !== -1;
      }) : data.slice(0, 60);
      if (heading) {
        heading.textContent = needle ? "与“" + q + "”相关的影片" : "精选影片";
      }
      searchResults.innerHTML = results.slice(0, 120).map(cardTemplate).join("");
      if (searchEmpty) {
        searchEmpty.hidden = results.length !== 0;
      }
    }
  });
})();
