// js/carousel.js
/* ================================================================
   Carousel controls (Projects + Certificates)
   ------------------------------------------------
   Что делаю и зачем (коротко и по делу):
   1) Стрелки ◀ ▶:
      - кликом прокручивают ленту на ширину 1 карточки.
   2) Колесо мыши / трекпад:
      - когда курсор над лентой, вертикальный wheel (deltaY)
        превращаю в горизонтальный скролл (scrollLeft).
      - так “листание” работает привычно на десктопе.
   3) Drag-to-scroll мышью:
      - можно “схватить” ленту и тянуть влево/вправо,
        как на тач-устройствах.
      - это делает прокрутку очевидной даже без скроллбара.
   4) Клавиатура:
      - при фокусе на ленте (tab) ←/→ листают карточки.
   5) Состояние стрелок:
      - отключаю стрелки, если уже упёрлись в начало/конец.
   ================================================================ */

(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function initCarousel(carouselEl) {
    var track = carouselEl.querySelector('.carousel-track');
    var prevBtn = carouselEl.querySelector('.carousel-nav.prev');
    var nextBtn = carouselEl.querySelector('.carousel-nav.next');

    if (!track || !prevBtn || !nextBtn) return;

    // ------------------------------------------------------------
    // 1) Шаг прокрутки = ширина одной карточки (включая padding)
    // ------------------------------------------------------------
    function getStep() {
      var item = track.querySelector('.carousel-item');
      if (!item) return 320;
      return item.getBoundingClientRect().width;
    }

    function updateNavDisabledState() {
      // Важно: допускаю небольшой “эпсилон”, чтобы не дрожало на дробных пикселях
      var epsilon = 2;

      var maxScrollLeft = track.scrollWidth - track.clientWidth;
      var left = track.scrollLeft;

      var atStart = left <= epsilon;
      var atEnd = left >= (maxScrollLeft - epsilon);

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;

      // Чисто визуально (кнопка остаётся на месте, но подсказка очевидна)
      prevBtn.style.opacity = atStart ? '0.35' : '1';
      nextBtn.style.opacity = atEnd ? '0.35' : '1';
    }

    // Стрелки
    prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    // ------------------------------------------------------------
    // 2) Wheel → horizontal scroll (когда курсор над треком)
    // ------------------------------------------------------------
    track.addEventListener('wheel', function (e) {
      // Если пользователь уже “просит” горизонтальный скролл (Shift+wheel) — не мешаем
      if (e.shiftKey) return;

      // preventDefault нужен, чтобы страница не уезжала вверх/вниз
      e.preventDefault();

      // Большинство трекпадов дают deltaY маленькими порциями — это ок.
      track.scrollLeft += e.deltaY;

      updateNavDisabledState();
    }, { passive: false });

    // ------------------------------------------------------------
    // 3) Drag-to-scroll (мышь)
    // ------------------------------------------------------------
    var isDown = false;
    var startX = 0;
    var startScrollLeft = 0;

    track.addEventListener('mousedown', function (e) {
      // ЛКМ (0) — да; остальные кнопки мыши не трогаем
      if (e.button !== 0) return;

      isDown = true;
      track.classList.add('is-dragging');

      startX = e.pageX;
      startScrollLeft = track.scrollLeft;
    });

    // Если ушли мышью за пределы — отпускаю “захват”
    function stopDrag() {
      isDown = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('mouseleave', stopDrag);
    window.addEventListener('mouseup', stopDrag);

    track.addEventListener('mousemove', function (e) {
      if (!isDown) return;

      // Чтобы текст/картинки не “выделялись” при перетаскивании
      e.preventDefault();

      var dx = e.pageX - startX;
      // dx > 0 (мышь вправо) → контент должен уйти влево, поэтому минус
      track.scrollLeft = startScrollLeft - dx;

      updateNavDisabledState();
    });

    // ------------------------------------------------------------
    // 4) Клавиатура: ← / →
    // ------------------------------------------------------------
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      }
    });

    // ------------------------------------------------------------
    // 5) Обновление состояния стрелок
    // ------------------------------------------------------------
    track.addEventListener('scroll', function () {
      updateNavDisabledState();
    });

    // Первичная инициализация
    // Делаю с небольшим таймаутом, чтобы WOW/изображения успели проставить размеры
    setTimeout(function () {
      updateNavDisabledState();
    }, 50);

    // На ресайз тоже пересчитываю
    window.addEventListener('resize', function () {
      updateNavDisabledState();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var carousels = document.querySelectorAll('.carousel');
    for (var i = 0; i < carousels.length; i++) {
      initCarousel(carousels[i]);
    }
  });
})();
