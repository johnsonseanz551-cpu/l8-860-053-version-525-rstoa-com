(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var categoryFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
        var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-result]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInputs[0] ? searchInputs[0].value : "");
            var category = normalize(categoryFilters[0] ? categoryFilters[0].value : "");
            var year = normalize(yearFilters[0] ? yearFilters[0].value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-category")
                ].join(" "));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchCategory = !category || normalize(card.getAttribute("data-category")) === category;
                var matchYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
                var match = matchKeyword && matchCategory && matchYear;
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", applyFilters);
        });
        categoryFilters.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
        yearFilters.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        if (searchInputs.length) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                searchInputs.forEach(function (input) {
                    input.value = q;
                });
            }
            applyFilters();
        }
    });
})();
