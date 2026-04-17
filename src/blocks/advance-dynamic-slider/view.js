import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

const initRcbDynamicSlider = ( el ) => {
    const arrows = el.getAttribute('data-arrows') === 'true';
    const dots = el.getAttribute('data-dots') === 'true';
    const autoplay = el.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(el.getAttribute('data-autoplay-delay'), 10) || 3000;
    const loop = el.getAttribute('data-loop') === 'true';
    const effect = el.getAttribute('data-effect') || 'slide';
    const slidesPerView = parseInt(el.getAttribute('data-slides-per-view'), 10) || 1;
    const spaceBetween = parseInt(el.getAttribute('data-space-between'), 10) || 0;
    
    new Swiper( el, {
        modules: [ Navigation, Pagination, Autoplay, EffectFade ],
        slidesPerView: slidesPerView,
        spaceBetween: spaceBetween,
        loop: loop,
        effect: effect,
        grabCursor: false,
        autoplay: autoplay ? { delay: delay, disableOnInteraction: false } : false,
        navigation: arrows ? {
            nextEl: el.querySelector('.swiper-button-next'),
            prevEl: el.querySelector('.swiper-button-prev'),
        } : false,
        pagination: dots ? {
            el: el.querySelector('.swiper-pagination'),
            clickable: true,
        } : false,
        watchOverflow: false, // Match base slider to keep arrows visible
    });
};

document.addEventListener( 'DOMContentLoaded', () => {
    document.querySelectorAll( '.rcb-dynamic-slider' ).forEach( initRcbDynamicSlider );
} );
