import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { 
        arrows, dots, autoplay, autoplayDelay, 
        loop, effect, slidesPerView, spaceBetween,
        arrowColor, dotColor, height
    } = attributes;

    const blockProps = useBlockProps.save( {
        className: 'rcb-slider swiper',
        'data-arrows': arrows,
        'data-dots': dots,
        'data-autoplay': autoplay,
        'data-autoplay-delay': autoplayDelay,
        'data-loop': loop,
        'data-effect': effect,
        'data-slides-per-view': slidesPerView,
        'data-space-between': spaceBetween,
        style: {
            '--rcb-slider-height': height,
            '--rcb-arrow-color': arrowColor,
            '--rcb-dot-color': dotColor,
        }
    } );

    return (
        <div { ...blockProps }>
            <div className="swiper-wrapper">
                <InnerBlocks.Content />
            </div>
            
            { dots && <div className="swiper-pagination"></div> }
            
            { arrows && (
                <>
                    <div className="swiper-button-prev"></div>
                    <div className="swiper-button-next"></div>
                </>
            ) }
        </div>
    );
}
