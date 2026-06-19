(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            const isOpen = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const previousButton = hero.querySelector('[data-hero-prev]');
        const nextButton = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        const startTimer = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        if (slides.length > 1) {
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    showSlide(Number(dot.getAttribute('data-hero-dot')));
                    startTimer();
                });
            });

            if (previousButton) {
                previousButton.addEventListener('click', function () {
                    showSlide(current - 1);
                    startTimer();
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', function () {
                    showSlide(current + 1);
                    startTimer();
                });
            }

            startTimer();
        }
    }

    const localFilter = document.querySelector('[data-local-filter]');
    const filterList = document.querySelector('[data-filter-list]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (localFilter && filterList) {
        const cards = Array.from(filterList.querySelectorAll('.movie-card'));

        localFilter.addEventListener('input', function () {
            const value = localFilter.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach(function (card) {
                const target = (card.getAttribute('data-search') || '').toLowerCase();
                const visible = !value || target.indexOf(value) !== -1;
                card.style.display = visible ? '' : 'none';

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visibleCount === 0);
            }
        });
    }

    const playerPanel = document.querySelector('.player-panel');

    if (playerPanel) {
        const video = playerPanel.querySelector('video');
        const cover = playerPanel.querySelector('.player-cover');
        const message = playerPanel.querySelector('.player-message');
        const stream = playerPanel.getAttribute('data-stream');
        let initialized = false;
        let hlsInstance = null;

        const initializePlayer = function () {
            if (initialized) {
                return Promise.resolve();
            }

            if (!video || !stream) {
                return Promise.reject(new Error('empty'));
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                initialized = true;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                initialized = true;

                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    setTimeout(resolve, 1200);
                });
            }

            video.src = stream;
            initialized = true;
            return Promise.resolve();
        };

        const startPlayback = function () {
            initializePlayer()
                .then(function () {
                    return video.play();
                })
                .then(function () {
                    playerPanel.classList.add('is-playing');
                    if (message) {
                        message.textContent = '';
                    }
                })
                .catch(function () {
                    if (message) {
                        message.textContent = '播放暂不可用，请稍后再试。';
                    }
                });
        };

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('play', function () {
                playerPanel.classList.add('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    const searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.SITE_SEARCH_DATA) {
        const form = searchPage.querySelector('[data-search-form]');
        const input = searchPage.querySelector('[data-search-input]');
        const results = searchPage.querySelector('[data-search-results]');
        const summary = searchPage.querySelector('[data-search-summary]');
        const params = new URLSearchParams(window.location.search);

        const createText = function (element, value) {
            element.textContent = value || '';
            return element;
        };

        const createCard = function (movie) {
            const article = document.createElement('article');
            article.className = 'movie-card';

            const poster = document.createElement('a');
            poster.className = 'poster-link';
            poster.href = movie.link;

            const image = document.createElement('img');
            image.src = movie.cover;
            image.alt = movie.title;
            image.loading = 'lazy';

            const shade = document.createElement('span');
            shade.className = 'poster-shade';

            const play = document.createElement('span');
            play.className = 'play-dot';
            play.textContent = '▶';

            poster.appendChild(image);
            poster.appendChild(shade);
            poster.appendChild(play);

            const body = document.createElement('div');
            body.className = 'card-body';

            const meta = document.createElement('div');
            meta.className = 'card-meta';
            [movie.year, movie.region, movie.type].forEach(function (item) {
                meta.appendChild(createText(document.createElement('span'), item));
            });

            const title = document.createElement('h3');
            const link = document.createElement('a');
            link.href = movie.link;
            link.textContent = movie.title;
            title.appendChild(link);

            const desc = createText(document.createElement('p'), movie.oneLine);

            const tags = document.createElement('div');
            tags.className = 'tag-row';
            movie.tags.slice(0, 4).forEach(function (tag) {
                tags.appendChild(createText(document.createElement('span'), tag));
            });

            body.appendChild(meta);
            body.appendChild(title);
            body.appendChild(desc);
            body.appendChild(tags);
            article.appendChild(poster);
            article.appendChild(body);

            return article;
        };

        const render = function (query) {
            const value = (query || '').trim().toLowerCase();
            results.innerHTML = '';

            if (!value) {
                summary.textContent = '输入关键词开始搜索。';
                return;
            }

            const matched = window.SITE_SEARCH_DATA.filter(function (movie) {
                return movie.searchText.indexOf(value) !== -1;
            }).slice(0, 120);

            if (matched.length === 0) {
                summary.textContent = '没有找到匹配的影片。';
                return;
            }

            summary.textContent = '搜索结果如下，点击卡片可进入详情页。';
            matched.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
        };

        const initialQuery = params.get('q') || '';
        input.value = initialQuery;
        render(initialQuery);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const query = input.value.trim();
            const nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            render(query);
        });
    }
})();
