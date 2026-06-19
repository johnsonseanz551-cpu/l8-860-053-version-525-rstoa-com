(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    qsa('[data-slider]').forEach(function (slider) {
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('[data-slide-to]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
                start();
            });
        });

        show(0);
        start();
    });

    qsa('[data-filter-page]').forEach(function (page) {
        var input = qs('[data-filter-input]', page);
        var year = qs('[data-filter-year]', page);
        var region = qs('[data-filter-region]', page);
        var reset = qs('[data-filter-reset]', page);
        var empty = qs('[data-empty-state]', page);
        var cards = qsa('.movie-card', page);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    ok = false;
                }
                if (regionValue && cardRegion !== regionValue) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                apply();
            });
        }

        apply();
    });

    function playVideo(player) {
        var video = qs('video', player);
        var overlay = qs('.play-overlay', player);
        if (!video) {
            return;
        }

        var source = player.getAttribute('data-source') || video.getAttribute('data-src');
        if (!source) {
            return;
        }

        if (!video.getAttribute('data-loaded')) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                player._hls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            video.setAttribute('data-loaded', 'true');
            video.setAttribute('controls', 'controls');
        }

        if (overlay) {
            overlay.classList.add('hidden');
        }

        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    qsa('.movie-player').forEach(function (player) {
        var video = qs('video', player);
        var overlay = qs('.play-overlay', player);

        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo(player);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.getAttribute('data-loaded')) {
                    playVideo(player);
                    return;
                }
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
    });
})();
