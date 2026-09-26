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
            var w = Math.min(210, gutter - 44);
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
        scrollProgress();
        stageColors();
        stageShortcuts();
        reveals();
        raScore();
        descPhoto();
        sideLayer();
        lightbox();
    });
})();
