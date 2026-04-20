import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { 
        title, isOpen, id,
        titleColor, titleBgColor,
        titleFontFamily, titleFontSize, titleFontWeight,
        titleTextTransform, titleLineHeight, titleLetterSpacing,
        titlePadding,
        contentBgColor,
    } = attributes;

    // Compile title CSS variables
    const titleCssVars = {};
    if ( titleColor )         titleCssVars['--rcb-title-color']          = titleColor;
    if ( titleBgColor )       titleCssVars['--rcb-title-bg-color']       = titleBgColor;
    if ( titleFontFamily )    titleCssVars['--rcb-title-font-family']    = titleFontFamily;
    if ( titleFontSize )      titleCssVars['--rcb-title-font-size']      = `${ titleFontSize }px`;
    if ( titleFontWeight )    titleCssVars['--rcb-title-font-weight']    = titleFontWeight;
    if ( titleTextTransform ) titleCssVars['--rcb-title-text-transform'] = titleTextTransform;
    if ( titleLineHeight )    titleCssVars['--rcb-title-line-height']    = titleLineHeight;
    if ( titleLetterSpacing ) titleCssVars['--rcb-title-letter-spacing'] = `${ titleLetterSpacing }px`;
    if ( contentBgColor )     titleCssVars['--rcb-content-bg-color']     = contentBgColor;

    const headerPaddingStyle = {};
    if ( titlePadding ) {
        if ( titlePadding.top )    headerPaddingStyle.paddingTop    = titlePadding.top;
        if ( titlePadding.right )  headerPaddingStyle.paddingRight  = titlePadding.right;
        if ( titlePadding.bottom ) headerPaddingStyle.paddingBottom = titlePadding.bottom;
        if ( titlePadding.left )   headerPaddingStyle.paddingLeft   = titlePadding.left;
    }

    const blockProps = useBlockProps.save( {
        className: `rcb-accordion-item ${ isOpen ? 'is-open' : '' }`,
        'data-id': id,
        style: titleCssVars,
    } );

    return (
        <div { ...blockProps }>
            <div className="rcb-accordion-header" style={ headerPaddingStyle }>
                <RichText.Content tagName="h4" value={ title } />
                <div className="rcb-accordion-icon"></div>
            </div>
            <div className="rcb-accordion-content" style={ { display: isOpen ? 'block' : 'none' } }>
                <InnerBlocks.Content />
            </div>
        </div>
    );
}
