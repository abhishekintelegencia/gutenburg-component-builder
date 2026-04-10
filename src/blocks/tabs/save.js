import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { 
        layout, blockId,
        navBgColor, contentBgColor,
        labelColor, labelActiveColor,
        navActiveBgColor, labelActiveBorderColor,
        labelHoverColor, navHoverBgColor,
        labelFontSize, labelFontWeight, labelFontFamily
    } = attributes;

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

    const blockProps = useBlockProps.save( {
        className: `rcb-tabs-wrapper layout-${ layout }`,
        'data-id': blockId,
        style: styleVars
    } );

    return (
        <div { ...blockProps }>
            <div className="rcb-tabs-nav-container">
                <div className="rcb-tabs-nav" role="tablist">
                    { /* Note: Nav items will be generated on frontend based on children data */ }
                </div>
            </div>

            <div className="rcb-tabs-content-wrapper">
                <div className="rcb-tabs-content-area" { ...useInnerBlocksProps.save() } />
            </div>
        </div>
    );
}
