import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
    PanelColorSettings,
    MediaUpload,
    MediaUploadCheck
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    RangeControl,
    ToggleControl,
    TextControl,
    SelectControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useState } from '@wordpress/element';

export default function Edit( { attributes, setAttributes } ) {
    const { 
        menuId, showLogo, logoSize, sticky,
        showCTA, ctaText, ctaLink, ctaBgColor, ctaTextColor,
        showSearch, headerBgColor, navColor, navHoverColor,
        menuFontSize, menuFontWeight, paddingTop, paddingBottom,
        megaDropdownBg, megaDropdownTextColor, searchIconColor
    } = attributes;

    const [ isPreviewingMega, setIsPreviewingMega ] = useState( false );

    const menus = useSelect( ( select ) => {
        return select( coreStore ).getMenus( { per_page: -1 } );
    }, [] );

    const menuOptions = [
        { label: __( 'Select a Menu', 'reusable-component-builder' ), value: 0 },
        ...( menus ? menus.map( ( menu ) => ( {
            label: menu.name,
            value: menu.id
        } ) ) : [] )
    ];

    const siteSettings = useSelect( ( select ) => select( coreStore ).getEntityRecord( 'root', 'site' ), [] );
    const siteLogoId = siteSettings?.site_logo;
    const siteLogo = useSelect( ( select ) => siteLogoId ? select( coreStore ).getMedia( siteLogoId ) : null, [ siteLogoId ] );

    const topLevelItems = useSelect( ( select ) => {
        if ( ! menuId ) return null;
        return select( coreStore ).getMenuItems( { 
            menus: menuId, 
            per_page: -1,
            parent: 0 
        } );
    }, [ menuId ] );

    const blockProps = useBlockProps( {
        className: `rcb-header-editor ${ isPreviewingMega ? 'is-previewing' : '' }`,
        style: {
            backgroundColor: headerBgColor,
            paddingTop: paddingTop + 'px',
            paddingBottom: paddingBottom + 'px',
            fontFamily: "'Inter', sans-serif"
        }
    } );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Select the Menu', 'reusable-component-builder' ) }>
                    <SelectControl
                        label={ __( 'WordPress Menu', 'reusable-component-builder' ) }
                        value={ menuId }
                        options={ menuOptions }
                        onChange={ ( val ) => setAttributes( { menuId: parseInt( val ) } ) }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Identity & Search', 'reusable-component-builder' ) }>
                    <ToggleControl
                        label={ __( 'Show Site Logo', 'reusable-component-builder' ) }
                        checked={ showLogo }
                        onChange={ ( val ) => setAttributes( { showLogo: val } ) }
                    />
                    { showLogo && (
                        <RangeControl
                            label={ __( 'Logo Max Width (px)', 'reusable-component-builder' ) }
                            value={ logoSize }
                            min={ 50 }
                            max={ 400 }
                            onChange={ ( val ) => setAttributes( { logoSize: val } ) }
                        />
                    ) }
                    <ToggleControl
                        label={ __( 'Show Search Icon', 'reusable-component-builder' ) }
                        checked={ showSearch }
                        onChange={ ( val ) => setAttributes( { showSearch: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Sticky Header', 'reusable-component-builder' ) }
                        checked={ sticky }
                        onChange={ ( val ) => setAttributes( { sticky: val } ) }
                    />
                </PanelBody>

                <PanelBody title={ __( 'CTA Button Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Call to Action', 'reusable-component-builder' ) }
                        checked={ showCTA }
                        onChange={ ( val ) => setAttributes( { showCTA: val } ) }
                    />
                    { showCTA && (
                        <>
                            <TextControl
                                label={ __( 'Button Text', 'reusable-component-builder' ) }
                                value={ ctaText }
                                onChange={ ( val ) => setAttributes( { ctaText: val } ) }
                            />
                            <TextControl
                                label={ __( 'Button Link', 'reusable-component-builder' ) }
                                value={ ctaLink }
                                onChange={ ( val ) => setAttributes( { ctaLink: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Spacing Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Padding Top (px)', 'reusable-component-builder' ) }
                        value={ paddingTop }
                        min={ 0 }
                        max={ 100 }
                        onChange={ ( val ) => setAttributes( { paddingTop: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Padding Bottom (px)', 'reusable-component-builder' ) }
                        value={ paddingBottom }
                        min={ 0 }
                        max={ 100 }
                        onChange={ ( val ) => setAttributes( { paddingBottom: val } ) }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Design Preview', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Always Show Mega Menu (Preview)', 'reusable-component-builder' ) }
                        checked={ isPreviewingMega }
                        onChange={ ( val ) => setIsPreviewingMega( val ) }
                        help={ __( 'Enable this to style your mega menu in the editor.', 'reusable-component-builder' ) }
                    />
                </PanelBody>

                <PanelColorSettings
                    title={ __( 'Color Settings', 'reusable-component-builder' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: headerBgColor,
                            onChange: ( val ) => setAttributes( { headerBgColor: val } ),
                            label: __( 'Header Background', 'reusable-component-builder' )
                        },
                        {
                            value: navColor,
                            onChange: ( val ) => setAttributes( { navColor: val } ),
                            label: __( 'Navigation Text', 'reusable-component-builder' )
                        },
                        {
                            value: navHoverColor,
                            onChange: ( val ) => setAttributes( { navHoverColor: val } ),
                            label: __( 'Nav Hover Color', 'reusable-component-builder' )
                        },
                        {
                            value: ctaBgColor,
                            onChange: ( val ) => setAttributes( { ctaBgColor: val } ),
                            label: __( 'CTA Button Background', 'reusable-component-builder' )
                        },
                        {
                            value: ctaTextColor,
                            onChange: ( val ) => setAttributes( { ctaTextColor: val } ),
                            label: __( 'CTA Button Text', 'reusable-component-builder' )
                        },
                        {
                            value: megaDropdownBg,
                            onChange: ( val ) => setAttributes( { megaDropdownBg: val } ),
                            label: __( 'Mega Menu Background', 'reusable-component-builder' )
                        },
                        {
                            value: megaDropdownTextColor,
                            onChange: ( val ) => setAttributes( { megaDropdownTextColor: val } ),
                            label: __( 'Mega Menu Text Color', 'reusable-component-builder' )
                        },
                        {
                            value: searchIconColor,
                            onChange: ( val ) => setAttributes( { searchIconColor: val } ),
                            label: __( 'Search Icon Color', 'reusable-component-builder' )
                        }
                    ] }
                />
            </InspectorControls>

            <div { ...blockProps }>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', height: '85px' }}>
                    <div className="rcb-header-logo-preview" style={{ flexShrink: 0 }}>
                        { showLogo ? (
                            siteLogo && siteLogo.source_url ? (
                                <img 
                                    src={ siteLogo.source_url } 
                                    style={{ maxWidth: logoSize + 'px', height: 'auto', display: 'block' }} 
                                    alt={ __( 'Site Logo', 'reusable-component-builder' ) } 
                                />
                            ) : (
                                <div style={{ 
                                    width: logoSize + 'px', 
                                    height: '40px', 
                                    background: 'rgba(0,0,0,0.03)', 
                                    padding: '10px', 
                                    textAlign: 'center',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: navColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `1px solid ${navColor}22`
                                }}>
                                    { __( 'Logo Placeholder', 'reusable-component-builder' ) }
                                </div>
                            )
                        ) : null }
                    </div>

                    <div className="rcb-header-nav-preview" style={{ flexGrow: 1, display: 'flex', gap: '20px', justifyContent: 'center' }}>
                         { topLevelItems && topLevelItems.length > 0 ? (
                             topLevelItems.map( ( item ) => (
                                 <span key={ item.id } style={{ color: navColor, fontWeight: menuFontWeight }}>
                                     { item.title.rendered || item.title }
                                 </span>
                             ) )
                         ) : (
                             <>
                                <span style={{ color: navColor, fontWeight: menuFontWeight }}>{ __( 'Home', 'reusable-component-builder' ) }</span>
                                <span style={{ color: navColor, fontWeight: menuFontWeight }}>{ __( 'About Us', 'reusable-component-builder' ) }</span>
                                <span style={{ color: navColor, fontWeight: menuFontWeight, borderBottom: `2px solid ${navHoverColor}` }}>{ __( 'Services', 'reusable-component-builder' ) }</span>
                                <span style={{ color: navColor, fontWeight: menuFontWeight }}>{ __( 'Contact', 'reusable-component-builder' ) }</span>
                             </>
                         ) }
                    </div>

                    <div className="rcb-header-actions-preview" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        { showSearch && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ searchIconColor || navColor || '#1e293b' } strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </div>
                        ) }
                        { showCTA && (
                            <div style={{ 
                                backgroundColor: ctaBgColor, 
                                color: ctaTextColor, 
                                padding: '8px 16px', 
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}>
                                { ctaText }
                            </div>
                        ) }
                    </div>
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '10px', textAlign: 'center' }}>
                    { __( 'Note: Dynamic menu items and Logo will appear on the frontend.', 'reusable-component-builder' ) }
                </div>
            </div>
        </>
    );
}
