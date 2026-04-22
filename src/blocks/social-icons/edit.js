import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    useInnerBlocksProps,
    InspectorControls,
    PanelColorSettings,
    store as blockEditorStore
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    SelectControl, 
    Button,
    ButtonGroup,
    Tooltip
} from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { 
    ResponsiveControl, 
    AdvancedTypographyControl,
    PreciseRangeControl,
    AdvancedBoxControl,
    getResponsiveValue 
} from '../shared-styles';

const ALLOWED_BLOCKS = [ 'rcb/social-icon-item' ];
const TEMPLATE = [
    [ 'rcb/social-icon-item', { platform: 'facebook', label: 'Facebook' } ],
    [ 'rcb/social-icon-item', { platform: 'twitter', label: 'Twitter' } ],
    [ 'rcb/social-icon-item', { platform: 'instagram', label: 'Instagram' } ],
];

export default function Edit( { attributes, setAttributes, clientId } ) {
    const { 
        uniqueId, style, alignment, gap, iconSize, 
        iconColor, iconHoverColor, iconBgColor, iconHoverBgColor,
        borderRadius,
        labelFontFamily, labelFontSize, labelFontWeight, labelColor,
        margin, padding
    } = attributes;

    const [ deviceMode, setDeviceMode ] = useState( 'desktop' );
    
    // Initialize uniqueId if missing
    useMemo(() => {
        if (!uniqueId) {
            setAttributes({ uniqueId: clientId.substring(0, 8) });
        }
    }, [uniqueId, clientId]);

    const id = uniqueId || clientId.substring(0, 8);

    const { innerBlocks } = useSelect( ( select ) => ( {
        innerBlocks: select( blockEditorStore ).getBlock( clientId ).innerBlocks
    } ), [ clientId ] );

    const { insertBlock, removeBlock, selectBlock } = useDispatch( blockEditorStore );

    const addSocialItem = () => {
        const newBlock = createBlock( 'rcb/social-icon-item', { platform: 'facebook', label: 'New Item' } );
        insertBlock( newBlock, innerBlocks.length, clientId );
    };

    const updateAttribute = ( key, val, isResponsive = false ) => {
        if ( isResponsive ) {
            const current = attributes[ key ] || {};
            setAttributes( { [ key ]: { ...current, [ deviceMode ]: val } } );
        } else {
            setAttributes( { [ key ]: val } );
        }
    };

    const blockProps = useBlockProps( {
        className: `rcb-social-icons-editor rcb-id-${id} rcb-style-${ style }`,
        style: {
            margin: getResponsiveValue( margin, 'desktop' ),
            padding: getResponsiveValue( padding, 'desktop' ),
        }
    } );

    const editorStyles = `
        .rcb-id-${id} .rcb-social-icons-inner {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: ${ getResponsiveValue( gap, 'desktop' ) } !important;
            justify-content: ${ { left: 'flex-start', center: 'center', right: 'flex-end' }[ getResponsiveValue( alignment, 'desktop' ) ] || 'flex-start' } !important;
        }
        .rcb-id-${id} .rcb-social-item {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            text-decoration: none !important;
            gap: 10px !important;
        }
        .rcb-id-${id} .rcb-social-item-icon {
            color: ${ iconColor } !important;
            background-color: ${ iconBgColor } !important;
            font-size: ${ getResponsiveValue( iconSize, 'desktop' ) } !important;
            border-radius: ${ borderRadius } !important;
            width: 1.8em;
            height: 1.8em;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .rcb-id-${id} .rcb-social-item:hover .rcb-social-item-icon {
            color: ${ iconHoverColor } !important;
            background-color: ${ iconHoverBgColor } !important;
        }
        .rcb-id-${id} .rcb-social-item-label {
            color: ${ labelColor } !important;
            font-family: ${ labelFontFamily } !important;
            font-size: ${ getResponsiveValue( labelFontSize, 'desktop' ) } !important;
            font-weight: ${ labelFontWeight } !important;
            display: ${ style === 'icon' ? 'none !important' : 'inline-block !important' };
        }
        .rcb-id-${id} .rcb-style-text .rcb-social-item-icon {
            display: none !important;
        }
    `;

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'rcb-social-icons-inner' },
        { 
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            orientation: 'horizontal'
        }
    );

    return (
        <>
            <style>{ editorStyles }</style>
            <InspectorControls>
                <PanelBody title={ __( 'Layout Settings', 'reusable-component-builder' ) }>
                    <div style={{ marginBottom: '15px' }}>
                        <label className="components-base-control__label">{ __( 'Select Style', 'reusable-component-builder' ) }</label>
                        <ButtonGroup style={{ width: '100%', marginTop: '5px' }}>
                            <Button 
                                isPrimary={ style === 'icon' } 
                                isSecondary={ style !== 'icon' }
                                onClick={ () => setAttributes( { style: 'icon' } ) }
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                { __( 'Icon', 'reusable-component-builder' ) }
                            </Button>
                            <Button 
                                isPrimary={ style === 'text' } 
                                isSecondary={ style !== 'text' }
                                onClick={ () => setAttributes( { style: 'text' } ) }
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                { __( 'Text', 'reusable-component-builder' ) }
                            </Button>
                            <Button 
                                isPrimary={ style === 'both' } 
                                isSecondary={ style !== 'both' }
                                onClick={ () => setAttributes( { style: 'both' } ) }
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                { __( 'Icon & Text', 'reusable-component-builder' ) }
                            </Button>
                        </ButtonGroup>
                    </div>

                    <ResponsiveControl 
                        label={ __( 'Alignment', 'reusable-component-builder' ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                        className="rcb-alignment-buttons"
                    >
                        <ButtonGroup style={{ marginTop: '5px' }}>
                            <Tooltip text={ __( 'Left', 'reusable-component-builder' ) }>
                                <Button 
                                    icon="editor-alignleft" 
                                    isPrimary={ getResponsiveValue( alignment, deviceMode ) === 'left' }
                                    isSecondary={ getResponsiveValue( alignment, deviceMode ) !== 'left' }
                                    onClick={ () => updateAttribute( 'alignment', 'left', true ) }
                                />
                            </Tooltip>
                            <Tooltip text={ __( 'Center', 'reusable-component-builder' ) }>
                                <Button 
                                    icon="editor-aligncenter" 
                                    isPrimary={ getResponsiveValue( alignment, deviceMode ) === 'center' }
                                    isSecondary={ getResponsiveValue( alignment, deviceMode ) !== 'center' }
                                    onClick={ () => updateAttribute( 'alignment', 'center', true ) }
                                />
                            </Tooltip>
                            <Tooltip text={ __( 'Right', 'reusable-component-builder' ) }>
                                <Button 
                                    icon="editor-alignright" 
                                    isPrimary={ getResponsiveValue( alignment, deviceMode ) === 'right' }
                                    isSecondary={ getResponsiveValue( alignment, deviceMode ) !== 'right' }
                                    onClick={ () => updateAttribute( 'alignment', 'right', true ) }
                                />
                            </Tooltip>
                        </ButtonGroup>
                    </ResponsiveControl>

                    <PreciseRangeControl
                        label={ __( 'Space Between', 'reusable-component-builder' ) }
                        value={ gap }
                        onChange={ ( val ) => updateAttribute( 'gap', val, true ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Spacing', 'reusable-component-builder' ) } initialOpen={ false }>
                    <AdvancedBoxControl
                        label={ __( 'Margin', 'reusable-component-builder' ) }
                        value={ margin }
                        onChange={ ( val ) => updateAttribute( 'margin', val, true ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />
                    <AdvancedBoxControl
                        label={ __( 'Padding', 'reusable-component-builder' ) }
                        value={ padding }
                        onChange={ ( val ) => updateAttribute( 'padding', val, true ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Icons', 'reusable-component-builder' ) }>
                    <div className="rcb-social-icons-list">
                        { innerBlocks.map( ( block, index ) => (
                            <div key={ block.clientId } className="rcb-social-icon-item-sidebar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid #ddd', marginBottom: '5px', borderRadius: '4px' }}>
                                <span 
                                    onClick={ () => selectBlock( block.clientId ) } 
                                    style={{ cursor: 'pointer', flex: 1, fontSize: '13px' }}
                                >
                                    { block.attributes.label || `Item #${ index + 1 }` }
                                </span>
                                <Button 
                                    icon="no-alt" 
                                    onClick={ () => removeBlock( block.clientId ) } 
                                    isDestructive
                                    style={{ height: '24px', minWidth: '24px', padding: '0' }}
                                />
                            </div>
                        ) ) }
                    </div>
                    <Button 
                        isSecondary
                        onClick={ addSocialItem }
                        style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                    >
                        { __( '+ Add Item', 'reusable-component-builder' ) }
                    </Button>
                </PanelBody>

                <PanelBody title={ __( 'Style Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <PreciseRangeControl
                        label={ __( 'Icon Size', 'reusable-component-builder' ) }
                        value={ iconSize }
                        onChange={ ( val ) => updateAttribute( 'iconSize', val, true ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />

                    <PreciseRangeControl
                        label={ __( 'Border Radius', 'reusable-component-builder' ) }
                        value={ borderRadius }
                        onChange={ ( val ) => setAttributes( { borderRadius: val } ) }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />

                    <PanelColorSettings
                        title={ __( 'Icon Colors', 'reusable-component-builder' ) }
                        initialOpen={ true }
                        colorSettings={ [
                            {
                                value: iconColor,
                                onChange: ( val ) => setAttributes( { iconColor: val } ),
                                label: __( 'Color', 'reusable-component-builder' ),
                            },
                            {
                                value: iconBgColor,
                                onChange: ( val ) => setAttributes( { iconBgColor: val } ),
                                label: __( 'Background Color', 'reusable-component-builder' ),
                            },
                        ] }
                    />

                    <PanelColorSettings
                        title={ __( 'Icon Hover Colors', 'reusable-component-builder' ) }
                        initialOpen={ false }
                        colorSettings={ [
                            {
                                value: iconHoverColor,
                                onChange: ( val ) => setAttributes( { iconHoverColor: val } ),
                                label: __( 'Hover Color', 'reusable-component-builder' ),
                            },
                            {
                                value: iconHoverBgColor,
                                onChange: ( val ) => setAttributes( { iconHoverBgColor: val } ),
                                label: __( 'Hover Background Color', 'reusable-component-builder' ),
                            },
                        ] }
                    />
                </PanelBody>

                { ( style === 'text' || style === 'both' ) && (
                    <PanelBody title={ __( 'Label Style', 'reusable-component-builder' ) } initialOpen={ false }>
                        <AdvancedTypographyControl
                            label={ __( 'Typography', 'reusable-component-builder' ) }
                            value={ labelFontSize }
                            fontFamily={ labelFontFamily }
                            fontWeight={ labelFontWeight }
                            onChange={ ( key, val, isResp ) => updateAttribute( 'label' + key.charAt(0).toUpperCase() + key.slice(1), val, isResp ) }
                            deviceMode={ deviceMode }
                            setDeviceMode={ setDeviceMode }
                        />
                        <PanelColorSettings
                            title={ __( 'Label Color', 'reusable-component-builder' ) }
                            initialOpen={ true }
                            colorSettings={ [
                                {
                                    value: labelColor,
                                    onChange: ( val ) => setAttributes( { labelColor: val } ),
                                    label: __( 'Color', 'reusable-component-builder' ),
                                },
                            ] }
                        />
                    </PanelBody>
                ) }
            </InspectorControls>

            <div { ...blockProps }>
                <div { ...innerBlocksProps } />
            </div>
        </>
    );
}
