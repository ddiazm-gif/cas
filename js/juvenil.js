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

    function lightbox() {
        var imgs = Array.prototype.slice.call(document.querySelectorAll('.stage-photo img, .stage-mini img, .photo-grid img, .filmstrip img, .hero-stack img'));
        if (!imgs.length) return;
        var lb = document.createElement('div');
        lb.className = 'lb';
        lb.setAttribute('role', 'dialog');
        lb.setAttribute('aria-modal', 'true');
        lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
            '<button class="lb-close" aria-label="Cerrar"><i class="fas fa-times"></i></button>' +
            '<button class="lb-prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>' +
            '<button class="lb-next" aria-label="Siguiente"><i class="fas fa-chevron-right"></i></button>';
        document.body.appendChild(lb);
        var big = lb.querySelector('img'), cap = lb.querySelector('figcaption'), idx = 0;
        var show = function (i) {
            idx = (i + imgs.length) % imgs.length;
            big.src = imgs[idx].currentSrc || imgs[idx].src;
            big.alt = imgs[idx].alt || '';
            cap.textContent = imgs[idx].alt || '';
            var fig = lb.querySelector('figure');
            fig.style.animation = 'none'; void fig.offsetWidth; fig.style.animation = '';
        };
        var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
        imgs.forEach(function (img, i) {
            img.addEventListener('click', function () { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; });
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

    document.addEventListener('DOMContentLoaded', function () {
        scrollProgress();
        stageColors();
        stageShortcuts();
        reveals();
        raScore();
        lightbox();
    });
})();
