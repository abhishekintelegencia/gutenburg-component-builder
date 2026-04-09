import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls, 
    useInnerBlocksProps,
    InnerBlocks
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    RangeControl,
    SelectControl
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';

const ALLOWED_BLOCKS = [ 'rcb/accordion-item' ];
const TEMPLATE = [
    [ 'rcb/accordion-item', { title: 'Accordion Item 1' } ],
    [ 'rcb/accordion-item', { title: 'Accordion Item 2' } ]
];

export default function Edit( { attributes, setAttributes, clientId } ) {
    const { gap, uniqueId, iconType } = attributes;

    useEffect( () => {
        if ( ! uniqueId ) {
            setAttributes( { uniqueId: `rcb-acc-${ clientId.substring( 0, 8 ) }` } );
        }
    }, [] );

    const blockProps = useBlockProps( {
        className: `rcb-accordion-wrapper rcb-icon-${ iconType }`,
        style: { gap: `${ gap }px` }
    } );

    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: TEMPLATE,
        renderAppender: () => <InnerBlocks.ButtonBlockAppender />
    } );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Layout Settings', 'reusable-component-builder' ) }>
                    <RangeControl
                        label={ __( 'Item Gap', 'reusable-component-builder' ) }
                        value={ gap }
                        min={ 0 }
                        max={ 100 }
                        onChange={ ( val ) => setAttributes( { gap: val } ) }
                    />
                    <SelectControl
                        label={ __( 'Icon Style', 'reusable-component-builder' ) }
                        value={ iconType }
                        options={ [
                            { label: __( 'Plus/Minus', 'reusable-component-builder' ), value: 'plus' },
                            { label: __( 'Arrow', 'reusable-component-builder' ), value: 'arrow' },
                            { label: __( 'Chevron', 'reusable-component-builder' ), value: 'chevron' },
                            { label: __( 'None', 'reusable-component-builder' ), value: 'none' },
                        ] }
                        onChange={ ( val ) => setAttributes( { iconType: val } ) }
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...innerBlocksProps }>
                { /* Small label to make parent selection easier */ }
                <div style={ { 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    opacity: 0.5, 
                    marginBottom: '5px',
                    pointerEvents: 'none'
                } }>
                    { __( 'Accordion Wrapper', 'reusable-component-builder' ) }
                </div>
                { innerBlocksProps.children }
            </div>
        </>
    );
}
