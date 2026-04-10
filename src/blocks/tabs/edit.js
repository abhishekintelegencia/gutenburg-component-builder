import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    useInnerBlocksProps,
    InspectorControls,
    PanelColorSettings,
    RichText,
    InnerBlocks 
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    ToggleControl,
    RangeControl,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { useEffect } from '@wordpress/element';

const FONT_FAMILY_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
];

const FONT_WEIGHT_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Regular (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'Semi-Bold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
];

const ALLOWED_BLOCKS = [ 'rcb/tab-item' ];
const TEMPLATE = [
    [ 'rcb/tab-item', { label: 'Wordpress' } ],
    [ 'rcb/tab-item', { label: 'Prestashop' } ],
    [ 'rcb/tab-item', { label: 'Joomla' } ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
    const { 
        layout, activeTabClientId, blockId,
        navBgColor, contentBgColor,
        labelColor, labelActiveColor,
        navActiveBgColor, labelActiveBorderColor,
        labelHoverColor, navHoverBgColor,
        labelFontSize, labelFontWeight, labelFontFamily
    } = attributes;

    const { insertBlock, removeBlock } = useDispatch( 'core/block-editor' );

    const innerBlocks = useSelect( ( select ) => {
        return select( 'core/block-editor' ).getBlock( clientId )?.innerBlocks || [];
    }, [ clientId ] );

    useEffect( () => {
        if ( ! blockId ) {
            setAttributes( { blockId: `tabs-${ clientId.substring( 0, 8 ) }` } );
        }
    }, [] );

    // Ensure we have a valid active tab if blocks exist
    useEffect( () => {
        if ( innerBlocks.length > 0 ) {
            const validIds = innerBlocks.map( b => b.clientId );
            const isValid = activeTabClientId && validIds.includes( activeTabClientId );
            
            if ( ! isValid ) {
                setAttributes( { activeTabClientId: validIds[0] } );
            }
        }
    }, [ innerBlocks, activeTabClientId ] );

    const addTab = () => {
        const newBlock = createBlock( 'rcb/tab-item', { label: 'New Tab' } );
        insertBlock( newBlock, innerBlocks.length, clientId );
        setAttributes( { activeTabClientId: newBlock.clientId } );
    };

    const removeTab = ( tabClientId ) => {
        removeBlock( tabClientId );
        if ( activeTabClientId === tabClientId && innerBlocks.length > 1 ) {
            const remaining = innerBlocks.filter( b => b.clientId !== tabClientId );
            setAttributes( { activeTabClientId: remaining[0].clientId } );
        }
    };

    // Build CSS Variables
    const styleVars = {};
    if ( navBgColor )        styleVars['--rcb-nav-bg']             = navBgColor;
    if ( contentBgColor )    styleVars['--rcb-content-bg']         = contentBgColor;
    if ( labelColor )        styleVars['--rcb-label-color']        = labelColor;
    if ( labelActiveColor )  styleVars['--rcb-label-active-color'] = labelActiveColor;
    if ( navActiveBgColor )  styleVars['--rcb-nav-active-bg']     = navActiveBgColor;
    if ( labelHoverColor )   styleVars['--rcb-label-hover-color']  = labelHoverColor;
    if ( navHoverBgColor )   styleVars['--rcb-nav-hover-bg']       = navHoverBgColor;
    if ( labelActiveBorderColor ) styleVars['--rcb-active-border-color'] = labelActiveBorderColor;
    if ( labelFontSize )     styleVars['--rcb-label-font-size']    = `${labelFontSize}px`;
    if ( labelFontWeight )   styleVars['--rcb-label-font-weight']  = labelFontWeight;
    if ( labelFontFamily )   styleVars['--rcb-label-font-family']  = labelFontFamily;

    const blockProps = useBlockProps( {
        className: `rcb-tabs-wrapper layout-${ layout }`,
        style: styleVars,
        'data-active-id': activeTabClientId
    } );

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'rcb-tabs-content-area' },
        { 
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            renderAppender: false
        }
    );

    return (
        <>
            <style>
                { `
                    .rcb-tabs-wrapper .rcb-tabs-nav-item.is-active {
                        background-color: ${ navActiveBgColor || '#fff' } !important;
                        color: ${ labelActiveColor || '#3b82f6' } !important;
                    }
                    .rcb-tabs-wrapper.layout-vertical .rcb-tabs-nav-item.is-active {
                        border-right-color: ${ labelActiveBorderColor || labelActiveColor || '#3b82f6' } !important;
                    }
                    .rcb-tabs-wrapper.layout-horizontal .rcb-tabs-nav-item.is-active {
                        border-bottom-color: ${ labelActiveBorderColor || labelActiveColor || '#3b82f6' } !important;
                    }
                ` }
            </style>
            <InspectorControls>
                <PanelBody title={ __( 'Tab Contents', 'reusable-component-builder' ) }>
                    <div className="rcb-tabs-repeater">
                        { innerBlocks.map( ( block, index ) => (
                            <div key={ block.clientId } className="rcb-tabs-repeater-item" style={ {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '10px',
                                padding: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px'
                            } }>
                                <span style={ { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
                                    { block.attributes.label || `Tab ${ index + 1 }` }
                                </span>
                                <button
                                    onClick={ () => removeTab( block.clientId ) }
                                    style={ {
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '2px 8px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    } }
                                >
                                    { __( 'Remove', 'reusable-component-builder' ) }
                                </button>
                            </div>
                        ) ) }
                        <button 
                            onClick={ addTab }
                            style={ {
                                width: '100%',
                                padding: '10px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                marginTop: '10px'
                            } }
                        >
                            { __( '+ Add Item', 'reusable-component-builder' ) }
                        </button>
                    </div>
                </PanelBody>

                <PanelBody title={ __( 'Tab Layout Settings', 'reusable-component-builder' ) }>
                    <ToggleGroupControl
                        label={ __( 'Layout Mode', 'reusable-component-builder' ) }
                        value={ layout }
                        onChange={ ( value ) => setAttributes( { layout: value } ) }
                        isBlock
                    >
                        <ToggleGroupControlOption
                            value="horizontal"
                            label={ __( 'Horizontal', 'reusable-component-builder' ) }
                        />
                        <ToggleGroupControlOption
                            value="vertical"
                            label={ __( 'Vertical', 'reusable-component-builder' ) }
                        />
                    </ToggleGroupControl>
                </PanelBody>

                <PanelColorSettings
                    title={ __( 'Tab Colors', 'reusable-component-builder' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: navBgColor,
                            onChange: ( val ) => setAttributes( { navBgColor: val } ),
                            label: __( 'Nav Background', 'reusable-component-builder' )
                        },
                        {
                            value: contentBgColor,
                            onChange: ( val ) => setAttributes( { contentBgColor: val } ),
                            label: __( 'Content Background', 'reusable-component-builder' )
                        },
                        {
                            value: labelColor,
                            onChange: ( val ) => setAttributes( { labelColor: val } ),
                            label: __( 'Label Text Color', 'reusable-component-builder' )
                        },
                        {
                            value: labelActiveColor,
                            onChange: ( val ) => setAttributes( { labelActiveColor: val } ),
                            label: __( 'Label Active Color', 'reusable-component-builder' )
                        },
                        {
                            value: labelHoverColor,
                            onChange: ( val ) => setAttributes( { labelHoverColor: val } ),
                            label: __( 'Hover Text Color', 'reusable-component-builder' )
                        },
                        {
                            value: navHoverBgColor,
                            onChange: ( val ) => setAttributes( { navHoverBgColor: val } ),
                            label: __( 'Hover Background', 'reusable-component-builder' )
                        },
                        {
                            value: navActiveBgColor,
                            onChange: ( val ) => setAttributes( { navActiveBgColor: val } ),
                            label: __( 'Active Tab Background', 'reusable-component-builder' )
                        },
                        {
                            value: labelActiveBorderColor,
                            onChange: ( val ) => setAttributes( { labelActiveBorderColor: val } ),
                            label: __( 'Active Tab Border', 'reusable-component-builder' )
                        }
                    ] }
                />

                <PanelBody title={ __( 'Label Typography', 'reusable-component-builder' ) } initialOpen={ false }>
                    <SelectControl
                        label={ __( 'Font Family', 'reusable-component-builder' ) }
                        value={ labelFontFamily || '' }
                        options={ FONT_FAMILY_OPTIONS }
                        onChange={ ( val ) => setAttributes( { labelFontFamily: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Font Size', 'reusable-component-builder' ) }
                        value={ labelFontSize || 16 }
                        min={ 10 }
                        max={ 80 }
                        onChange={ ( val ) => setAttributes( { labelFontSize: val } ) }
                    />
                    <SelectControl
                        label={ __( 'Font Weight', 'reusable-component-builder' ) }
                        value={ labelFontWeight || '' }
                        options={ FONT_WEIGHT_OPTIONS }
                        onChange={ ( val ) => setAttributes( { labelFontWeight: val } ) }
                    />
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps } data-active-id={ activeTabClientId }>
                <div className="rcb-tabs-nav-container">
                    <div className="rcb-tabs-nav">
                        { innerBlocks.filter( b => b.name === 'rcb/tab-item' ).map( ( block, index ) => {
                            const isActive = activeTabClientId === block.clientId;
                            return (
                                <div 
                                    key={ block.clientId }
                                    className={ `rcb-tabs-nav-item ${ isActive ? 'is-active' : '' }` }
                                    onClick={ () => setAttributes( { activeTabClientId: block.clientId } ) }
                                    style={ isActive ? {
                                        backgroundColor: navActiveBgColor || '#fff',
                                        color: labelActiveColor || '#3b82f6',
                                        borderRightColor: layout === 'vertical' ? ( labelActiveBorderColor || labelActiveColor || '#3b82f6' ) : undefined,
                                        borderBottomColor: layout === 'horizontal' ? ( labelActiveBorderColor || labelActiveColor || '#3b82f6' ) : undefined,
                                        borderRightWidth: layout === 'vertical' ? '3px' : undefined,
                                        borderBottomWidth: layout === 'horizontal' ? '3px' : undefined,
                                        borderRightStyle: layout === 'vertical' ? 'solid' : undefined,
                                        borderBottomStyle: layout === 'horizontal' ? 'solid' : undefined,
                                    } : {} }
                                >
                                    { block.attributes.icon && (
                                        <span className={ `rcb-tabs-nav-icon dashicons ${ block.attributes.icon }` } style={ { marginRight: '8px' } }></span>
                                    ) }
                                    <span className="rcb-tabs-nav-label">
                                        { block.attributes.label || __( 'New Tab', 'reusable-component-builder' ) }
                                    </span>
                                </div>
                            );
                        } ) }
                    </div>
                </div>

                <div 
                    className="rcb-tabs-content-wrapper"
                >
                    <div { ...innerBlocksProps } />
                </div>
            </div>
        </>
    );
}
