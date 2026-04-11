document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.swiper', {
    loop: true,
    loopedSlides: 3,
    slidesPerView: 1,

    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
        loopedSlides: 3,
      },
      768: {
        slidesPerView: 1.2,
        centeredSlides: true,
        spaceBetween: 16,
        loopedSlides: 3,
      },
      1024: {
        slidesPerView: 1.3,
        centeredSlides: true,
        spaceBetween: 24,
        loopedSlides: 3,
      },
    },
  });
});