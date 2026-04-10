import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    useInnerBlocksProps,
    InspectorControls,
    PanelColorSettings
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    ToggleControl,
    RangeControl,
    SelectControl,
} from '@wordpress/components';

const ALLOWED_BLOCKS = [ 'rcb/slide-item' ];
const TEMPLATE = [
    [ 'rcb/slide-item', {} ],
    [ 'rcb/slide-item', {} ],
];

export default function Edit( { attributes, setAttributes } ) {
    const { 
        arrows, dots, autoplay, autoplayDelay, 
        loop, effect, slidesPerView, spaceBetween,
        arrowColor, dotColor, height
    } = attributes;

    const blockProps = useBlockProps( {
        className: 'rcb-slider-editor-wrapper',
        style: {
            '--rcb-slider-height': height,
            '--rcb-arrow-color': arrowColor,
            '--rcb-dot-color': dotColor,
        }
    } );

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'rcb-slider-preview-inner' },
        { 
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            orientation: 'horizontal'
        }
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Slider Settings', 'reusable-component-builder' ) }>
                    <ToggleControl
                        label={ __( 'Show Arrows', 'reusable-component-builder' ) }
                        checked={ arrows }
                        onChange={ ( val ) => setAttributes( { arrows: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Show Dots', 'reusable-component-builder' ) }
                        checked={ dots }
                        onChange={ ( val ) => setAttributes( { dots: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Infinite Loop', 'reusable-component-builder' ) }
                        checked={ loop }
                        onChange={ ( val ) => setAttributes( { loop: val } ) }
                    />
                    <SelectControl
                        label={ __( 'Transition Effect', 'reusable-component-builder' ) }
                        value={ effect }
                        options={ [
                            { label: 'Slide', value: 'slide' },
                            { label: 'Fade', value: 'fade' },
                        ] }
                        onChange={ ( val ) => setAttributes( { effect: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Slides Per View', 'reusable-component-builder' ) }
                        value={ slidesPerView }
                        min={ 1 }
                        max={ 6 }
                        onChange={ ( val ) => setAttributes( { slidesPerView: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Space Between Slides', 'reusable-component-builder' ) }
                        value={ spaceBetween }
                        min={ 0 }
                        max={ 100 }
                        onChange={ ( val ) => setAttributes( { spaceBetween: val } ) }
                    />
                    <TextControl
                        label={ __( 'Slider Height', 'reusable-component-builder' ) }
                        value={ height }
                        onChange={ ( val ) => setAttributes( { height: val } ) }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Autoplay Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Autoplay', 'reusable-component-builder' ) }
                        checked={ autoplay }
                        onChange={ ( val ) => setAttributes( { autoplay: val } ) }
                    />
                    { autoplay && (
                        <RangeControl
                            label={ __( 'Delay (ms)', 'reusable-component-builder' ) }
                            value={ autoplayDelay }
                            min={ 1000 }
                            max={ 10000 }
                            step={ 500 }
                            onChange={ ( val ) => setAttributes( { autoplayDelay: val } ) }
                        />
                    ) }
                </PanelBody>

                <PanelColorSettings
                    title={ __( 'Slider Colors', 'reusable-component-builder' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: arrowColor,
                            onChange: ( val ) => setAttributes( { arrowColor: val } ),
                            label: __( 'Arrow Color', 'reusable-component-builder' )
                        },
                        {
                            value: dotColor,
                            onChange: ( val ) => setAttributes( { dotColor: val } ),
                            label: __( 'Dot Color', 'reusable-component-builder' )
                        }
                    ] }
                />
            </InspectorControls>

            <div { ...blockProps }>
                <div className="rcb-slider-editor-header">
                    <span>{ __( 'Advanced Slider Preview', 'reusable-component-builder' ) }</span>
                    <div className="rcb-slider-editor-controls">
                        { arrows && <span className="dashicons dashicons-arrow-left-alt2"></span> }
                        { arrows && <span className="dashicons dashicons-arrow-right-alt2"></span> }
                    </div>
                </div>
                <div { ...innerBlocksProps } />
                { dots && (
                    <div className="rcb-slider-editor-dots">
                        <span></span><span></span><span></span>
                    </div>
                ) }
            </div>
        </>
    );
}

// Helper component for altura
import { TextControl } from '@wordpress/components';
