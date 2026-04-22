import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
    MediaUpload,
    MediaUploadCheck
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    TextControl, 
    Button,
    ExternalLink
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import IconLibrary from '../icon-library';
import { ICON_LIBRARY } from '../icons';

export default function Edit( { attributes, setAttributes, context } ) {
    const { platform, label, url, customIcon, customIconType } = attributes;
    const [ isModalOpen, setIsModalOpen ] = useState( false );

    // Get styles from parent context
    const pIconColor = context['rcb/socialIconsIconColor'];
    const pIconBgColor = context['rcb/socialIconsIconBgColor'];
    const pIconSize = context['rcb/socialIconsIconSize'];
    const pBorderRadius = context['rcb/socialIconsBorderRadius'];
    const parentStyle = context['rcb/socialIconsStyle'] || 'icon';

    const onSelectIcon = ( iconData ) => {
        setAttributes( { 
            platform: iconData.platform,
            label: iconData.name,
            customIcon: '', // Clear custom icon if selecting from library
            customIconType: 'library'
        } );
        setIsModalOpen( false );
    };

    const onSelectCustomSVG = ( media ) => {
        setAttributes( { 
            customIcon: media.url,
            customIconType: 'svg',
            platform: 'custom'
        } );
    };

    const blockProps = useBlockProps( {
        className: `rcb-social-item rcb-item-platform-${platform}`,
    } );

    // Determine which icon to display
    let displayIcon = null;
    if ( customIcon && customIconType === 'svg' ) {
        displayIcon = <img src={ customIcon } alt="" style={{ width: '1em', height: '1em' }} />;
    } else {
        // Find icon in library
        let found = null;
        Object.values( ICON_LIBRARY ).forEach( icons => {
            const match = icons.find( i => i.platform === platform );
            if ( match ) found = match.icon;
        } );
        displayIcon = found;
    }

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Icon Settings', 'reusable-component-builder' ) }>
                    <div style={{ marginBottom: '15px' }}>
                        <label className="components-base-control__label">{ __( 'Choose Icon', 'reusable-component-builder' ) }</label>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '20px', 
                            background: '#f8f9fa', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            marginBottom: '10px'
                        }}>
                            <div style={{ width: '40px', height: '40px', color: pIconColor }}>
                                { displayIcon || <span className="dashicons dashicons-share-alt2" style={{ fontSize: '40px' }}></span> }
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button 
                                isSecondary 
                                onClick={ () => setIsModalOpen( true ) }
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                { __( 'Icon Library', 'reusable-component-builder' ) }
                            </Button>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ onSelectCustomSVG }
                                    allowedTypes={ [ 'image/svg+xml' ] }
                                    render={ ( { open } ) => (
                                        <Button 
                                            isSecondary 
                                            onClick={ open }
                                            style={{ flex: 1, justifyContent: 'center' }}
                                        >
                                            { __( 'Upload SVG', 'reusable-component-builder' ) }
                                        </Button>
                                    ) }
                                />
                            </MediaUploadCheck>
                        </div>
                    </div>

                    <TextControl
                        label={ __( 'Label', 'reusable-component-builder' ) }
                        value={ label }
                        onChange={ ( val ) => setAttributes( { label: val } ) }
                    />
                    <TextControl
                        label={ __( 'Link', 'reusable-component-builder' ) }
                        value={ url }
                        onChange={ ( val ) => setAttributes( { url: val } ) }
                        placeholder="https://"
                    />
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                <div className="rcb-social-item-icon">
                    { displayIcon }
                </div>
                <span className="rcb-social-item-label">{ label }</span>
                
                <IconLibrary 
                    isOpen={ isModalOpen }
                    onRequestClose={ () => setIsModalOpen( false ) }
                    onSelect={ onSelectIcon }
                />
            </div>
        </>
    );
}
