import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

const initRcbDynamicSlider = ( el ) => {
    // Prevent double initialization
    if (el.classList.contains('swiper-initialized')) return;

    const arrows = el.getAttribute('data-arrows') === 'true';
    const dots = el.getAttribute('data-dots') === 'true';
    const autoplay = el.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(el.getAttribute('data-autoplay-delay'), 10) || 3000;
    const loop = el.getAttribute('data-loop') === 'true';
    const effect = el.getAttribute('data-effect') || 'slide';
    const slidesPerView = parseInt(el.getAttribute('data-slides-per-view'), 10) || 1;
    const spaceBetween = parseInt(el.getAttribute('data-space-between'), 10) || 0;
    const breakpointsRaw = el.getAttribute('data-breakpoints');
    let swiperBreakpoints = {};
    
    if ( breakpointsRaw ) {
        try {
            const parsed = JSON.parse( breakpointsRaw );
            // Map our specific keys (0 and 768) to Swiper breakpoints
            // We use 0 for mobile, 768 for tablet, and default for desktop
            swiperBreakpoints = {
                0: parsed[0] || parsed['0'] || { slidesPerView: 1, spaceBetween: 10 },
                768: parsed[768] || parsed['768'] || { slidesPerView: Math.min(2, slidesPerView), spaceBetween: Math.min(20, spaceBetween) },
                1025: { slidesPerView: slidesPerView, spaceBetween: spaceBetween }
            };

            // Prevent Swiper loop reset bug by removing redundant breakpoint props
            Object.keys(swiperBreakpoints).forEach(key => {
                if (swiperBreakpoints[key].slidesPerView === slidesPerView) {
                    delete swiperBreakpoints[key].slidesPerView;
                }
                if (swiperBreakpoints[key].spaceBetween === spaceBetween) {
                    delete swiperBreakpoints[key].spaceBetween;
                }
                if (Object.keys(swiperBreakpoints[key]).length === 0) {
                    delete swiperBreakpoints[key];
                }
            });
        } catch ( e ) {
            console.error( 'RCB Dynamic Slider: Error parsing breakpoints', breakpointsRaw, e );
        }
    }
    
    const swiper = new Swiper( el, {
        modules: [ Navigation, Pagination, Autoplay, EffectFade ],
        slidesPerView: slidesPerView,
        spaceBetween: spaceBetween,
        breakpoints: swiperBreakpoints,
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
        watchOverflow: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
    });

    // Use ResizeObserver for maximum layout stability.
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            if (swiper && swiper.update) {
                swiper.update();
            }
        });
        ro.observe(el);
    } else {
        setTimeout(() => swiper.update(), 500);
    }
};

document.addEventListener( 'DOMContentLoaded', () => {
    document.querySelectorAll( '.rcb-dynamic-slider' ).forEach( initRcbDynamicSlider );
} );
