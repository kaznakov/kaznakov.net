// js/carousel.js
// Универсальная карусель для .carousel
// Логика:
// - если элементов <= видимых: карусель выключается (без стрелок/скролла)
// - если элементов > видимых: включается прокрутка стрелками/колесом/drag/swipe
// - стрелки скрываются на границах (в начале/в конце)

(function () {
  function isMobile() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function isTablet() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function getItemsPerView(carousel) {
    const isPricing = carousel.classList.contains("pricing-carousel");
    if (isMobile()) return 1;
    if (isTablet()) return 2;
    return isPricing ? 3 : 3;
  }

  function getItemStep(track) {
    const items = track.querySelectorAll(".carousel-item");
    const first = items[0];
    if (!first) return 0;

    if (items.length > 1) {
      const second = items[1];
      const step = second.offsetLeft - first.offsetLeft;
      if (step > 0) return step;
    }

    return first.getBoundingClientRect().width;
  }

  function updateEnabledState(carousel) {
    const track = carousel.querySelector(".carousel-track");
    if (!track) return;

    const items = track.querySelectorAll(".carousel-item");
    const perView = getItemsPerView(carousel);

    if (items.length <= perView) {
      carousel.classList.add("is-disabled");
    } else {
      carousel.classList.remove("is-disabled");
    }
  }

  function bindCarousel(carousel) {
    const track = carousel.querySelector(".carousel-track");
    const prev = carousel.querySelector(".carousel-nav.prev");
    const next = carousel.querySelector(".carousel-nav.next");
    if (!track) return;

    function updateNavState() {
      if (!prev || !next) return;

      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const atStart = track.scrollLeft <= 1;
      const atEnd = maxScroll - track.scrollLeft <= 1;

      prev.classList.toggle("is-hidden", atStart);
      next.classList.toggle("is-hidden", atEnd);
    }

    function refreshState() {
      updateEnabledState(carousel);
      updateNavState();
    }

    function scrollByOne(dir) {
      if (carousel.classList.contains("is-disabled")) return;
      const step = getItemStep(track);
      if (!step) return;
      track.scrollBy({ left: dir * step, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", () => scrollByOne(-1));
    if (next) next.addEventListener("click", () => scrollByOne(1));

    track.addEventListener(
      "wheel",
      (e) => {
        if (carousel.classList.contains("is-disabled")) return;
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    // Drag (mouse)
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener("mousedown", (e) => {
      if (carousel.classList.contains("is-disabled")) return;
      isDown = true;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mouseleave", () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    });

    // Swipe (touch)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDragging = false;

    track.addEventListener(
      "touchstart",
      (e) => {
        if (carousel.classList.contains("is-disabled")) return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchDragging = true;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchmove",
      (e) => {
        if (!touchDragging || carousel.classList.contains("is-disabled")) return;
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);

        // блокируем вертикальный скролл только при явном горизонтальном свайпе
        if (dx > dy) e.preventDefault();
      },
      { passive: false }
    );

    track.addEventListener(
      "touchend",
      (e) => {
        if (!touchDragging || carousel.classList.contains("is-disabled")) return;
        touchDragging = false;

        const t = e.changedTouches[0];
        const deltaX = t.clientX - touchStartX;
        const threshold = 36;

        if (Math.abs(deltaX) < threshold) return;
        if (deltaX < 0) scrollByOne(1);
        else scrollByOne(-1);
      },
      { passive: true }
    );

    track.addEventListener("scroll", updateNavState, { passive: true });
    window.addEventListener("resize", refreshState);

    refreshState();
    requestAnimationFrame(updateNavState);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel").forEach(bindCarousel);
  });
})();
