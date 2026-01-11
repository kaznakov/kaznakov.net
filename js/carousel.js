// js/carousel.js
// Универсальная карусель для .carousel
// Логика:
// - если элементов <= видимых: карусель выключается (без стрелок/скролла)
// - если элементов > видимых: включается прокрутка стрелками/колесом/drag

(function () {
  function isMobile() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function isTablet() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function getItemsPerView(carousel) {
    // pricing: хотим 3 на десктопе (как раньше)
    const isPricing = carousel.classList.contains("pricing-carousel");
    if (isMobile()) return 1;
    if (isTablet()) return 2;
    return isPricing ? 3 : 3;
  }

  function getItemWidth(track) {
    const first = track.querySelector(".carousel-item");
    if (!first) return 0;
    const rect = first.getBoundingClientRect();
    return rect.width;
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

    // Обновляем состояние (вкл/выкл)
    updateEnabledState(carousel);

    function scrollByOne(dir) {
      if (carousel.classList.contains("is-disabled")) return;
      const w = getItemWidth(track);
      if (!w) return;
      track.scrollBy({ left: dir * w, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", () => scrollByOne(-1));
    if (next) next.addEventListener("click", () => scrollByOne(1));

    // Wheel -> horizontal scroll
    track.addEventListener(
      "wheel",
      (e) => {
        if (carousel.classList.contains("is-disabled")) return;
        // превращаем вертикальный скролл в горизонтальный только над треком
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

    // Recalc on resize (меняется itemsPerView)
    window.addEventListener("resize", () => updateEnabledState(carousel));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel").forEach(bindCarousel);
  });
})();