import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Function to init each slider
const initRcbSlider = ( el ) => {
    // Prevent double initialization
    if (el.classList.contains('swiper-initialized')) return;

    const arrows = el.getAttribute('data-arrows') === 'true';
    const dots = el.getAttribute('data-dots') === 'true';
    const autoplay = el.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(el.getAttribute('data-autoplay-delay'), 10) || 3000;
    let loop = el.getAttribute('data-loop') === 'true';
    const effect = el.getAttribute('data-effect') || 'slide';
    const slidesPerView = parseInt(el.getAttribute('data-slides-per-view'), 10) || 1;
    const spaceBetween = parseInt(el.getAttribute('data-space-between'), 10) || 0;
    
    // Count original slides scoped to this instance's wrapper
    const wrapper = el.querySelector(':scope > .swiper-wrapper');
    if (!wrapper) return;
    
    let slides = wrapper.querySelectorAll(':scope > .swiper-slide');
    let slideCount = slides.length;
    
    if (slideCount === 0) return;

    // Swiper 11/12 Loop requires enough physical slides to create functional clones.
    // If we have fewer slides than needed for a smooth loop (at least slidesPerView * 2),
    // we manually duplicate them before Swiper starts.
    if ( loop && slideCount > 0 ) {
        const minRequired = Math.max(slidesPerView * 2, 4);
        if ( slideCount < minRequired ) {
            const repeats = Math.ceil(minRequired / slideCount);
            for (let i = 1; i < repeats; i++) {
                slides.forEach(slide => {
                    const clone = slide.cloneNode(true);
                    clone.classList.add('rcb-cloned-slide');
                    wrapper.appendChild(clone);
                });
            }
            // Update counts after manual duplication
            slides = wrapper.querySelectorAll(':scope > .swiper-slide');
            slideCount = slides.length;
        }
    } else if (slideCount <= 1) {
        loop = false;
    }

    const swiper = new Swiper( el, {
        modules: [ Navigation, Pagination, Autoplay, EffectFade ],
        slidesPerView: slidesPerView,
        spaceBetween: spaceBetween,
        loop: loop,
        effect: effect,
        grabCursor: false,
        autoplay: autoplay ? {
            delay: delay,
            disableOnInteraction: false,
        } : false,
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
    const sliders = document.querySelectorAll( '.rcb-slider' );
    sliders.forEach( initRcbSlider );
} );
