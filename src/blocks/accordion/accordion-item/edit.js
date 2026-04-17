import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    RichText, 
    useInnerBlocksProps,
    InspectorControls,
    PanelColorSettings
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    ToggleControl, 
    Button,
    RangeControl,
    SelectControl,
    __experimentalBoxControl as BoxControl,
    __experimentalDivider as Divider,
} from '@wordpress/components';
import { 
    ResponsiveControl, 
    AdvancedTypographyControl, 
    getResponsiveValue as getResp 
} from '../../shared-styles';
import { useEffect, useState } from '@wordpress/element';
import { select, dispatch } from '@wordpress/data';

// Common system fonts
const FONT_FAMILY_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: '"Open Sans", sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
];

const FONT_WEIGHT_OPTIONS = [
    { label: 'Default', value: '' },
    { label: 'Thin (100)', value: '100' },
    { label: 'Light (300)', value: '300' },
    { label: 'Normal (400)', value: '400' },
    { label: 'Medium (500)', value: '500' },
    { label: 'Semi-Bold (600)', value: '600' },
    { label: 'Bold (700)', value: '700' },
    { label: 'Extra Bold (800)', value: '800' },
    { label: 'Black (900)', value: '900' },
];

const TEXT_TRANSFORM_OPTIONS = [
    { label: 'None', value: '' },
    { label: 'UPPERCASE', value: 'uppercase' },
    { label: 'lowercase', value: 'lowercase' },
    { label: 'Capitalize', value: 'capitalize' },
];

export default function Edit( { attributes, setAttributes, clientId } ) {
    const { 
        title, isOpen, id,
        titleColor, titleBgColor,
        titleFontFamily, titleFontSize, titleFontWeight,
        titleTextTransform, titleLineHeight, titleLetterSpacing,
        titlePadding,
        contentBgColor,
    } = attributes;

    const [ isEditorOpen, setIsEditorOpen ] = useState( true );
    const [ deviceMode, setDeviceMode ] = useState( 'desktop' );

    const updateResponsiveAttribute = ( name, value ) => {
        const currentData = attributes[ name ] || { desktop: '' };
        const newData = { ...( typeof currentData === 'object' ? currentData : { desktop: currentData } ) };
        newData[ deviceMode ] = value;
        setAttributes( { [ name ]: newData } );
    };

    useEffect( () => {
        if ( ! id ) {
            setAttributes( { id: `item-${ clientId.substring( 0, 8 ) }` } );
        }
    }, [] );

    // Build CSS variables for title styling
    const titleCssVars = {};
    const respTitleFontSize = getResp( titleFontSize );
    const respTitleLineHeight = getResp( titleLineHeight );
    const respTitleLetterSpacing = getResp( titleLetterSpacing );
    const respTitlePadding = getResp( titlePadding );

    if ( titleColor )         titleCssVars['--rcb-title-color']          = titleColor;
    if ( titleBgColor )       titleCssVars['--rcb-title-bg-color']       = titleBgColor;
    if ( titleFontFamily )    titleCssVars['--rcb-title-font-family']    = titleFontFamily;
    if ( respTitleFontSize )  titleCssVars['--rcb-title-font-size']      = respTitleFontSize;
    if ( titleFontWeight )    titleCssVars['--rcb-title-font-weight']    = titleFontWeight;
    if ( titleTextTransform ) titleCssVars['--rcb-title-text-transform'] = titleTextTransform;
    if ( respTitleLineHeight ) titleCssVars['--rcb-title-line-height']   = respTitleLineHeight;
    if ( respTitleLetterSpacing ) titleCssVars['--rcb-title-letter-spacing'] = respTitleLetterSpacing;
    if ( contentBgColor )     titleCssVars['--rcb-content-bg-color']     = contentBgColor;

    // Build padding style for the header
    const headerPaddingStyle = {};
    if ( respTitlePadding ) {
        if ( respTitlePadding.top )    headerPaddingStyle.paddingTop    = respTitlePadding.top;
        if ( respTitlePadding.right )  headerPaddingStyle.paddingRight  = respTitlePadding.right;
        if ( respTitlePadding.bottom ) headerPaddingStyle.paddingBottom = respTitlePadding.bottom;
        if ( respTitlePadding.left )   headerPaddingStyle.paddingLeft   = respTitlePadding.left;
    }

    const blockProps = useBlockProps( {
        className: `rcb-accordion-item ${ isEditorOpen ? 'is-open' : '' }`,
        style: titleCssVars,
    } );

    const innerBlocksProps = useInnerBlocksProps(
        { className: "rcb-accordion-content", style: { display: isEditorOpen ? 'block' : 'none' } },
        {}
    );

    return (
        <>
            <InspectorControls>
                {/* ── Item Settings ─────────────────────────────────────── */}
                <PanelBody title={ __( 'Item Settings', 'reusable-component-builder' ) }>
                    <ToggleControl
                        label={ __( 'Open by Default', 'reusable-component-builder' ) }
                        checked={ isOpen }
                        onChange={ ( val ) => setAttributes( { isOpen: val } ) }
                        help={ __( 'Determines if this item is open by default on the frontend.', 'reusable-component-builder' ) }
                    />
                    <div style={ { marginTop: '10px' } }>
                        <Button 
                            variant="secondary"
                            onClick={ () => {
                                const parentId = select( 'core/block-editor' ).getBlockParents( clientId ).at( -1 );
                                if ( parentId ) dispatch( 'core/block-editor' ).selectBlock( parentId );
                            } }
                            style={ { width: '100%', justifyContent: 'center' } }
                        >
                            { __( '⚙ Icon & Layout Settings', 'reusable-component-builder' ) }
                        </Button>
                    </div>
                </PanelBody>

                <PanelColorSettings
                    title={ __( 'Accordion Colors', 'reusable-component-builder' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: titleColor,
                            onChange: ( val ) => setAttributes( { titleColor: val } ),
                            label: __( 'Title Text Color', 'reusable-component-builder' )
                        },
                        {
                            value: titleBgColor,
                            onChange: ( val ) => setAttributes( { titleBgColor: val } ),
                            label: __( 'Title Background Color', 'reusable-component-builder' )
                        },
                        {
                            value: contentBgColor,
                            onChange: ( val ) => setAttributes( { contentBgColor: val } ),
                            label: __( 'Inner Background Color', 'reusable-component-builder' )
                        }
                    ] }
                />

                <PanelBody title={ __( 'Title Style', 'reusable-component-builder' ) } initialOpen={ false }>
                    <AdvancedTypographyControl
                        label={ __( 'Title Typography', 'reusable-component-builder' ) }
                        value={ titleFontSize }
                        fontWeight={ titleFontWeight }
                        fontFamily={ titleFontFamily }
                        textTransform={ titleTextTransform }
                        lineHeight={ titleLineHeight }
                        letterSpacing={ titleLetterSpacing }
                        onChange={ ( prop, val, isResp ) => {
                            if ( isResp ) {
                                const attrMap = {
                                    fontSize: 'titleFontSize',
                                    lineHeight: 'titleLineHeight',
                                    letterSpacing: 'titleLetterSpacing'
                                };
                                updateResponsiveAttribute( attrMap[prop] || prop, val );
                            } else {
                                const attrMap = {
                                    fontWeight: 'titleFontWeight',
                                    fontFamily: 'titleFontFamily',
                                    textTransform: 'titleTextTransform'
                                };
                                setAttributes( { [ attrMap[prop] || prop ]: val } );
                            }
                        } }
                        deviceMode={ deviceMode }
                        setDeviceMode={ setDeviceMode }
                    />

                    <Divider />

                    <ResponsiveControl 
                        label={ __( 'Title Padding', 'reusable-component-builder' ) } 
                        deviceMode={ deviceMode } 
                        setDeviceMode={ setDeviceMode }
                    >
                        <BoxControl
                            values={ getResp( titlePadding ) || { top: '15px', right: '20px', bottom: '15px', left: '20px' } }
                            onChange={ ( val ) => updateResponsiveAttribute( 'titlePadding', val ) }
                        />
                    </ResponsiveControl>
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps } style={ { ...blockProps.style, ...titleCssVars } }>
                <div 
                    className="rcb-accordion-header"
                    style={ headerPaddingStyle }
                    onClick={ (e) => {
                        if ( e.target.closest('.rich-text') ) return;
                        setIsEditorOpen( !isEditorOpen );
                    } }
                >
                    <RichText
                        tagName="h4"
                        value={ title }
                        onChange={ ( val ) => setAttributes( { title: val } ) }
                        placeholder={ __( 'Title...', 'reusable-component-builder' ) }
                    />
                    <div 
                        className="rcb-accordion-icon"
                        title={ __( 'Toggle Editor Preview', 'reusable-component-builder' ) }
                    />
                </div>
                <div { ...innerBlocksProps } />
            </div>
        </>
    );
}
