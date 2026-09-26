// Capa dinamica del blog CAS: progreso, apariciones, colores, visor de fotos y RA animado
(function () {
    'use strict';
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var STAGE_COLORS = ['#7cc6f2', '#ffd166', '#ff7b6b', '#b69cf2'];

    function scrollProgress() {
        var bar = document.createElement('div');
        bar.className = 'scroll-bar';
        document.body.appendChild(bar);
        var update = function () {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function stageColors() {
        document.querySelectorAll('.stage-section').forEach(function (section, i) {
            section.style.setProperty('--sc', STAGE_COLORS[i % STAGE_COLORS.length]);
        });
    }

    function stageShortcuts() {
        var sections = document.querySelectorAll('.stage-section');
        document.querySelectorAll('.cas-stage').forEach(function (chip, i) {
            var target = sections[i];
            if (!target) return;
            chip.setAttribute('role', 'link');
            chip.setAttribute('tabindex', '0');
            var go = function () { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); };
            chip.addEventListener('click', go);
            chip.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
        });
    }

    function reveals() {
        var items = document.querySelectorAll('.content-section, .stage-photo, .stage-mini, .stat, .photo-grid .photo-item, .ra-final, .filmstrip');
        if (reduceMotion || !('IntersectionObserver' in window)) return;
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el, i) {
            el.classList.add('reveal');
            el.style.transitionDelay = (el.classList.contains('stat') || el.classList.contains('photo-item')) ? ((i % 4) * 90) + 'ms' : '0ms';
            io.observe(el);
        });
    }

    function raScore() {
        document.querySelectorAll('.ra-final').forEach(function (box) {
            var dots = box.querySelectorAll('.ra-dots span');
            var score = box.querySelectorAll('.ra-dots span.on').length;
            if (!score || reduceMotion || !('IntersectionObserver' in window)) return;
            dots.forEach(function (d) { d.classList.remove('on'); });
            var colors = ['#ffd166', '#ff7b6b', '#7cc6f2', '#b8e986', '#b69cf2'];
            for (var c = 0; c < 18; c++) {
                var piece = document.createElement('span');
                piece.className = 'confetti';
                piece.style.left = (5 + Math.random() * 90) + '%';
                piece.style.background = colors[c % colors.length];
                piece.style.animationDelay = (Math.random() * 0.4) + 's';
                box.appendChild(piece);
            }
            var io = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting) return;
                io.disconnect();
                for (var i = 0; i < score; i++) {
                    (function (k) {
                        setTimeout(function () {
                            dots[k].classList.add('on', 'pop');
                            setTimeout(function () { dots[k].classList.remove('pop'); }, 250);
                            if (k === score - 1) box.classList.add('party');
                        }, 300 + k * 180);
                    })(i);
                }
            }, { threshold: 0.4 });
            io.observe(box);
        });
    }

    var ZOOM_SELECTOR = '.stage-photo img, .stage-mini img, .photo-grid img, .filmstrip img, .hero-stack img, .side-photo img, .desc-photo img';

    function lightbox() {
        var lb = document.createElement('div');
        lb.className = 'lb';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
            '<button class="lb-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>' +
            '<button class="lb-prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>' +
            '<button class="lb-next" aria-label="Siguiente"><i class="fas fa-chevron-right"></i></button>';
        document.body.appendChild(lb);
        var big = lb.querySelector('img'), cap = lb.querySelector('figcaption'), list = [], idx = 0;
        var show = function (i) {
            idx = (i + list.length) % list.length;
            big.src = list[idx].src;
            big.alt = list[idx].alt;
            cap.textContent = list[idx].alt;
            var fig = lb.querySelector('figure');
            fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
        };
        var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
        document.addEventListener('click', function (e) {
            var img = e.target.closest ? e.target.closest(ZOOM_SELECTOR) : null;
            if (!img || lb.contains(img)) return;
            var seen = {};
            list = [];
            document.querySelectorAll('.filmstrip-track img:not([aria-hidden])').forEach(function (el) {
                var src = el.getAttribute('src');
                if (!seen[src]) { seen[src] = 1; list.push({ src: src, alt: el.alt }); }
            });
            var src = img.getAttribute('src');
            if (!seen[src]) list.unshift({ src: src, alt: img.alt });
            var start = 0;
            list.forEach(function (it, i) { if (it.src === src) start = i; });
            list[start].alt = img.alt || list[start].alt;
            show(start);
            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
        lb.querySelector('.lb-close').addEventListener('click', close);
        lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
        document.addEventListener('keydown', function (e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(idx - 1);
            if (e.key === 'ArrowRight') show(idx + 1);
        });
    }

    var DOODLES = [
        '<svg viewBox="0 0 64 64"><path d="M32 6l6.5 16.5L56 24l-13.5 11L47 53 32 43 17 53l4.5-18L8 24l17.5-1.5z"/></svg>',
        '<svg viewBox="0 0 64 64"><path d="M6 36c8-16 16 16 24 0s16 16 24 0 8-8 8-8"/></svg>',
        '<svg viewBox="0 0 64 64"><path d="M32 32m-4 0a4 4 0 1 0 8 0a8 8 0 1 0-16 0a12 12 0 1 0 24 0a16 16 0 1 0-32 0"/></svg>',
        '<svg viewBox="0 0 64 64"><path d="M10 50C22 40 30 28 44 16M44 16l-12 2M44 16l-2 12"/></svg>',
        '<svg viewBox="0 0 64 64"><path d="M32 54S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 30-24 30z"/></svg>'
    ];
    var DOODLE_COLORS = ['#ff7b6b', '#7cc6f2', '#ffd166', '#b69cf2', '#b8e986'];
    var TAPES = ['rgba(255,209,102,0.8)', 'rgba(124,198,242,0.8)', 'rgba(255,123,107,0.75)', 'rgba(184,233,134,0.85)'];

    function sideLayer() {
        var source = Array.prototype.slice.call(document.querySelectorAll('.filmstrip-track img:not([aria-hidden])'));
        var container = document.querySelector('.container');
        if (!source.length || !container) return;
        var layer = document.createElement('div');
        layer.className = 'side-layer';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
        var items = [];

        function build() {
            layer.innerHTML = '';
            items = [];
            var docH = document.documentElement.scrollHeight;
            layer.style.height = docH + 'px';
            var gutter = (window.innerWidth - container.offsetWidth) / 2;
            if (gutter < 150) { layer.style.display = 'none'; return; }
            layer.style.display = '';
            var w = Math.min(250, gutter - 36);
            var top = container.getBoundingClientRect().top + window.scrollY + 380;
            var bottom = docH - 520;
            var i = 0;
            for (var y = top; y < bottom; y += 330) {
                var left = i % 2 === 0;
                var x = left ? (gutter - w) / 2 : window.innerWidth - gutter + (gutter - w) / 2;
                var jitterX = (i * 37 % 30) - 15;
                if (i % 3 === 2) {
                    var d = document.createElement('div');
                    d.className = 'side-doodle';
                    d.innerHTML = DOODLES[i % DOODLES.length];
                    d.querySelector('svg').style.stroke = DOODLE_COLORS[i % DOODLE_COLORS.length];
                    d.style.left = (left ? gutter / 2 - 32 : window.innerWidth - gutter / 2 - 32) + 'px';
                    d.style.top = y + 'px';
                    layer.appendChild(d);
                    items.push({ el: d, y: y, speed: 0.18 });
                } else {
                    var img = source[i % source.length];
                    var fig = document.createElement('figure');
                    fig.className = 'side-photo';
                    fig.style.width = w + 'px';
                    fig.style.left = (x + jitterX) + 'px';
                    fig.style.top = y + 'px';
                    fig.style.setProperty('--r', ((i * 53 % 18) - 9) + 'deg');
                    fig.style.setProperty('--tr', ((i * 29 % 12) - 6) + 'deg');
                    fig.style.setProperty('--tape-c', TAPES[i % TAPES.length]);
                    fig.style.setProperty('--ar', i % 4 === 1 ? '1' : '4 / 5');
                    fig.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="' + img.alt + '" loading="lazy"><figcaption>' + img.alt + '</figcaption>';
                    layer.appendChild(fig);
                    items.push({ el: fig, y: y, speed: i % 2 ? 0.1 : -0.08 });
                }
                i++;
            }
            move();
        }

        function move() {
            if (reduceMotion) return;
            var mid = window.scrollY + window.innerHeight / 2;
            items.forEach(function (it) { it.el.style.transform = 'translateY(' + ((mid - it.y) * it.speed).toFixed(1) + 'px)'; });
        }

        var timer;
        window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(build, 200); });
        window.addEventListener('scroll', move, { passive: true });
        window.addEventListener('load', build);
        build();
    }

    var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
    function fecha(md) { var p = md.split('-'); return +p[1] + ' ' + MESES[+p[0] - 1]; }

    function growthChart() {
        document.querySelectorAll('.growth-chart[data-series]').forEach(function (box) {
            var data = JSON.parse(box.getAttribute('data-series'));
            var peakDate = box.getAttribute('data-peak');
            var NS = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(NS, 'svg');
            box.appendChild(svg);
            var tip = document.createElement('div');
            tip.className = 'growth-tip';
            box.appendChild(tip);

            function render() {
                var W = box.clientWidth, H = box.clientHeight, L = 44, R = 12, T = 22, B = 28;
                var max = 1500, n = data.length;
                var x = function (i) { return L + (W - L - R) * i / (n - 1); };
                var y = function (v) { return T + (H - T - B) * (1 - v / max); };
                var pts = data.map(function (d, i) { return x(i).toFixed(1) + ',' + y(d[1]).toFixed(1); });
                var grid = [0, 500, 1000, 1500].map(function (v) {
                    return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
                }).join('');
                var ylab = [0, 500, 1000, 1500].map(function (v) {
                    return '<text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v >= 1000 ? (v / 1000).toString().replace('.', ',') + ' mil' : v) + '</text>';
                }).join('');
                var step = W < 500 ? 30 : 15, xlab = '';
                for (var i = 0; i < n; i += step) xlab += '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle">' + fecha(data[i][0]) + '</text>';
                var pk = 0;
                data.forEach(function (d, i) { if (d[0] === peakDate) pk = i; });
                var pkAnchor = pk > n * 0.7 ? 'end' : 'start';
                svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
                svg.innerHTML = '<defs><linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b8e986" stop-opacity="0.55"/><stop offset="1" stop-color="#b8e986" stop-opacity="0.05"/></linearGradient></defs>' +
                    '<g class="grid">' + grid + '</g><g class="axis">' + ylab + xlab + '</g>' +
                    '<path class="area" d="M' + x(0) + ',' + y(0) + 'L' + pts.join('L') + 'L' + x(n - 1) + ',' + y(0) + 'Z"/>' +
                    '<path class="line" d="M' + pts.join('L') + '"/>' +
                    '<g class="peak"><circle cx="' + x(pk) + '" cy="' + y(data[pk][1]) + '" r="5"/><text x="' + (x(pk) + (pkAnchor === 'end' ? -10 : 10)) + '" y="' + (y(data[pk][1]) - 8) + '" text-anchor="' + pkAnchor + '">¡récord! ' + data[pk][1] + ' clics el ' + fecha(data[pk][0]) + '</text></g>' +
                    '<line class="cross" y1="' + T + '" y2="' + (H - B) + '"/><circle class="dot" r="5"/>';
                var line = svg.querySelector('.line');
                box.style.setProperty('--len', Math.ceil(line.getTotalLength()));

                svg.onmousemove = function (e) {
                    var r = svg.getBoundingClientRect();
                    var i = Math.round((e.clientX - r.left - L) / (W - L - R) * (n - 1));
                    i = Math.max(0, Math.min(n - 1, i));
                    var cx = x(i), cy = y(data[i][1]);
                    var cross = svg.querySelector('.cross'), dot = svg.querySelector('.dot');
                    cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.style.opacity = 1;
                    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.style.opacity = 1;
                    tip.innerHTML = '<b>' + data[i][1] + '</b> clics · ' + fecha(data[i][0]);
                    tip.style.left = cx + 'px'; tip.style.top = cy + 'px'; tip.style.opacity = 1;
                };
                svg.onmouseleave = function () {
                    svg.querySelector('.cross').style.opacity = 0; svg.querySelector('.dot').style.opacity = 0; tip.style.opacity = 0;
                };
            }

            render();
            var t;
            window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(render, 150); });
            if ('IntersectionObserver' in window && !reduceMotion) {
                var io = new IntersectionObserver(function (en) {
                    if (en[0].isIntersecting) { box.classList.add('draw'); io.disconnect(); }
                }, { threshold: 0.3 });
                box.classList.add('wait');
                io.observe(box);
            }
        });
    }

    function casMap() {
        var el = document.getElementById('cas-map');
        if (!el || !window.L) return;
        var LIMA = [-12.0464, -77.0428];
        var places = [
            { at: LIMA, label: 'Lima', img: 'imagenes/experiencia2/08-resultado-final.jpg', title: 'Lima, Perú',
              links: [['experiencia2.html', '🍪 Exp. 2: Galletas desde cero'], ['experiencia6.html', '♿ Exp. 6: Sillas de ruedas'], ['proyecto1.html', '⚖️ Proyecto 1: modelo.pe']] },
            { at: [-33.0472, -71.6127], label: 'Valparaíso', img: 'imagenes/experiencia5/03-equipo.jpg', title: 'Valparaíso, Chile',
              links: [['experiencia5.html', '🏀 Exp. 5: Copa Pancho 2026']] },
            { at: [43.6629, -79.3957], label: 'Toronto', img: 'imagenes/experiencia1/17-mirador-cn-tower.jpg', title: 'Toronto, Canadá',
              links: [['experiencia1.html', '✈️ Exp. 1: Un mes en ELI Camps']] }
        ];
        var map = L.map(el, { scrollWheelZoom: false, zoomControl: true, worldCopyJump: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 18
        }).addTo(map);
        places.forEach(function (p, i) {
            if (i > 0) L.polyline([LIMA, p.at], { color: '#ff7b6b', weight: 3, dashArray: '8 10', opacity: 0.9 }).addTo(map);
            var icon = L.divIcon({ className: '', iconSize: [62, 62], iconAnchor: [31, 31],
                html: '<div class="pin' + (p.label === 'Lima' ? ' left' : '') + '" data-label="' + p.label + '" style="background-image:url(' + p.img + ')"></div>' });
            var links = p.links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('');
            L.marker(p.at, { icon: icon, title: p.title }).addTo(map)
                .bindPopup('<div class="pop"><img src="' + p.img + '" alt=""><h5>' + p.title + '</h5>' + links + '</div>');
        });
        map.fitBounds(places.map(function (p) { return p.at; }), { padding: [60, 60] });
    }

    function mobileNav() {
        var nav = document.querySelector('nav');
        if (!nav || nav.querySelector('.nav-toggle')) return;
        var current = nav.querySelector('a.active, .dropdown-menu a.active');
        var btn = document.createElement('button');
        btn.className = 'nav-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span><i class="fas fa-leaf"></i> ' + (current ? current.textContent.trim() : 'Menú') + '</span><span class="bars"><i class="fas fa-bars"></i></span>';
        nav.insertBefore(btn, nav.firstChild);
        btn.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.querySelector('.bars i').className = open ? 'fas fa-times' : 'fas fa-bars';
        });
        nav.querySelectorAll('.dropdown > a').forEach(function (a) {
            a.addEventListener('click', function (e) {
                if (window.innerWidth > 760) return;
                e.preventDefault();
                a.parentNode.classList.toggle('open');
            });
        });
    }

    var HDR_PHOTOS = [
        ['imagenes/experiencia5/03-equipo.jpg', '-9deg', '3%', '16%', '6s'],
        ['imagenes/experiencia1/17-mirador-cn-tower.jpg', '8deg', '86%', '12%', '7s'],
        ['imagenes/experiencia2/08-resultado-final.jpg', '6deg', '11%', '58%', '8s'],
        ['imagenes/experiencia6/05-circulo-testimonios.jpeg', '-7deg', '78%', '55%', '6.5s'],
        ['imagenes/proyecto1/05-inicio.jpg', '-4deg', '15%', '10%', '7.5s'],
        ['imagenes/experiencia1/10-uno-con-amigos-asiaticos.jpg', '5deg', '74%', '8%', '9s']
    ];

    function fancyHeader() {
        var header = document.querySelector('body > header');
        if (!header || header.classList.contains('hdr-fun')) return;
        header.classList.add('hdr-fun');
        var blobs = [['#b8e986', 180, '6%', '60%', '9s'], ['#ffd166', 140, '82%', '-10%', '7s'], ['#ff7b6b', 90, '55%', '70%', '8s'], ['#7cc6f2', 110, '38%', '-20%', '10s']];
        blobs.forEach(function (b) {
            var d = document.createElement('span');
            d.className = 'hdr-blob';
            d.setAttribute('aria-hidden', 'true');
            d.style.cssText = 'background:' + b[0] + ';width:' + b[1] + 'px;height:' + b[1] + 'px;left:' + b[2] + ';top:' + b[3] + ';--d:' + b[4];
            header.appendChild(d);
        });
        var collage = document.createElement('div');
        collage.className = 'hdr-collage';
        collage.setAttribute('aria-hidden', 'true');
        collage.innerHTML = HDR_PHOTOS.map(function (p) {
            return '<figure style="--r:' + p[1] + ';left:' + p[2] + ';top:' + p[3] + ';--d:' + p[4] + '"><img src="' + p[0] + '" alt=""></figure>';
        }).join('');
        header.appendChild(collage);
        var hand = document.createElement('div');
        hand.className = 'hdr-hand';
        hand.textContent = 'el diario CAS de Dylan Díaz';
        var sub = header.querySelector('p');
        (sub || header.querySelector('h1')).insertAdjacentElement('afterend', hand);
        var words = ['Creatividad', 'Actividad', 'Servicio', 'Toronto', 'Valparaíso', 'Lima', 'modelo.pe', 'IB 2026'];
        var row = words.map(function (w) { return '<span><i class="fas fa-star"></i>' + w + '</span>'; }).join('');
        var mq = document.createElement('div');
        mq.className = 'hdr-marquee';
        mq.setAttribute('aria-hidden', 'true');
        mq.innerHTML = '<div>' + row + row + row + row + '</div>';
        header.appendChild(mq);
    }

    function descPhoto() {
        var h = document.querySelector('.content-section h4 .fa-align-left');
        var pick = document.querySelectorAll('.hero-stack img')[1];
        if (!h || !pick) return;
        var section = h.closest('.content-section');
        section.classList.add('desc-section');
        var fig = document.createElement('figure');
        fig.className = 'desc-photo';
        fig.innerHTML = '<img src="' + pick.getAttribute('src') + '" alt="' + pick.alt + '"><figcaption>' + pick.alt + '</figcaption>';
        section.querySelector('h4').insertAdjacentElement('afterend', fig);
    }

    document.addEventListener('DOMContentLoaded', function () {
        fancyHeader();
        mobileNav();
        scrollProgress();
        stageColors();
        stageShortcuts();
        reveals();
        raScore();
        descPhoto();
        growthChart();
        casMap();
        sideLayer();
        lightbox();
    });
})();
