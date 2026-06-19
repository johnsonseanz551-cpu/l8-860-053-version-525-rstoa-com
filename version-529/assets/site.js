(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = $('[data-menu-button]');
    var mobileNav = $('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', mobileNav.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    $all('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = 'search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movieVideo');
        var layer = document.querySelector('[data-player-layer]');
        var button = document.querySelector('[data-player-button]');
        if (!video || !source) {
            return;
        }
        var hls = null;
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }
        if (layer) {
            layer.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    window.initMovieSearch = function () {
        var root = document.querySelector('[data-search-root]');
        if (!root || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = root.querySelector('[data-search-input]');
        var typeSelect = root.querySelector('[data-type-filter]');
        var yearSelect = root.querySelector('[data-year-filter]');
        var results = root.querySelector('[data-search-results]');
        var empty = root.querySelector('[data-empty]');
        if (input && params.get('q')) {
            input.value = params.get('q');
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="' + movie.url + '">',
                '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
                '<span class="card-badge">' + movie.year + '</span>',
                '<span class="play-float"></span>',
                '</a>',
                '<div class="card-body">',
                '<h2 class="card-title"><a href="' + movie.url + '">' + movie.title + '</a></h2>',
                '<p class="card-desc">' + movie.oneLine + '</p>',
                '<div class="card-meta"><span>' + movie.region + '</span><span>·</span><span>' + movie.genre + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
                var ok = !q || haystack.indexOf(q) !== -1;
                if (ok && typeValue) {
                    ok = movie.type === typeValue;
                }
                if (ok && yearValue) {
                    ok = movie.year === yearValue;
                }
                return ok;
            }).slice(0, 120);
            if (results) {
                results.innerHTML = matched.map(card).join('');
            }
            if (empty) {
                empty.hidden = matched.length > 0;
            }
        }

        [input, typeSelect, yearSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    };
})();
