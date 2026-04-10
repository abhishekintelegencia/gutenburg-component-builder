import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    MediaPlaceholder,
    MediaUpload,
    MediaUploadCheck,
    RichText,
    InspectorControls,
    PanelColorSettings
} from '@wordpress/block-editor';
import { 
    Button, 
    PanelBody, 
    RangeControl,
    ToggleControl,
    TextControl,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
    const { 
        mediaId, mediaUrl, 
        bgType, bgColor,
        showAvatar, avatarId, avatarUrl, avatarSize, avatarBorderRadius,
        showRating, rating, ratingColor,
        verticalAlignment, contentAlignment,
        showContentBg, contentBgColor, contentPadding, contentBorderRadius,
        showTitle, title, titleColor, titleFontSize, titleFontWeight,
        showDesc, description, descColor, descFontSize, descFontWeight,
        showBtn, btnText, btnLink, btnColor, btnBgColor, btnBorderRadius, btnFontSize,
        overlayOpacity, overlayColor, caption
    } = attributes;

    const onSelectMedia = ( media ) => {
        setAttributes( { 
            mediaId: media.id, 
            mediaUrl: media.url 
        } );
    };

    const removeMedia = () => {
        setAttributes( { 
            mediaId: undefined, 
            mediaUrl: undefined 
        } );
    };

    const onSelectAvatar = ( media ) => {
        setAttributes( { 
            avatarId: media.id, 
            avatarUrl: media.url 
        } );
    };

    const blockProps = useBlockProps( {
        className: `rcb-slide-item-editor v-align-${verticalAlignment}`,
        style: {
            backgroundImage: bgType === 'image' && mediaUrl ? `url(${mediaUrl})` : 'none',
            backgroundColor: (bgType === 'color' || (bgType === 'image' && !mediaUrl)) ? bgColor : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '--rcb-content-bg': showContentBg ? contentBgColor : 'transparent',
            '--rcb-content-padding': contentPadding + 'px',
            '--rcb-content-radius': contentBorderRadius + 'px'
        }
    } );

    // Star SVG for editor visibility
    const StarIcon = ({ filled }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? ratingColor : '#ccc'} style={{ margin: '0 2px' }}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Background Settings', 'reusable-component-builder' ) }>
                    <ToggleGroupControl
                        label={ __( 'Background Type', 'reusable-component-builder' ) }
                        value={ bgType }
                        onChange={ ( val ) => setAttributes( { bgType: val } ) }
                        isBlock
                    >
                        <ToggleGroupControlOption value="image" label={ __( 'Image', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="color" label={ __( 'Color', 'reusable-component-builder' ) } />
                    </ToggleGroupControl>

                    { bgType === 'image' && (
                        <>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ onSelectMedia }
                                    allowedTypes={ [ 'image' ] }
                                    value={ mediaId }
                                    render={ ( { open } ) => (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <Button isSecondary isLarge onClick={ open } style={{ flexGrow: 1, marginBottom: '10px'}}>
                                                { ! mediaId ? __( 'Select Image', 'reusable-component-builder' ) : __( 'Replace Image', 'reusable-component-builder' ) }
                                            </Button>
                                            { mediaId && (
                                                <Button isDestructive isLarge onClick={ removeMedia } style={{ marginBottom: '10px' }}>
                                                    { __( 'Remove', 'reusable-component-builder' ) }
                                                </Button>
                                            ) }
                                        </div>
                                    ) }
                                />
                            </MediaUploadCheck>
                            <RangeControl
                                label={ __( 'Overlay Opacity', 'reusable-component-builder' ) }
                                value={ overlayOpacity }
                                min={ 0 }
                                max={ 1 }
                                step={ 0.1 }
                                onChange={ ( val ) => setAttributes( { overlayOpacity: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Content Card Styling', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Enable Content Card', 'reusable-component-builder' ) }
                        checked={ showContentBg }
                        onChange={ ( val ) => setAttributes( { showContentBg: val } ) }
                    />
                    { showContentBg && (
                        <>
                            <RangeControl
                                label={ __( 'Card Padding (px)', 'reusable-component-builder' ) }
                                value={ contentPadding }
                                min={ 0 }
                                max={ 100 }
                                onChange={ ( val ) => setAttributes( { contentPadding: val } ) }
                            />
                            <RangeControl
                                label={ __( 'Corner Roundness (px)', 'reusable-component-builder' ) }
                                value={ contentBorderRadius }
                                min={ 0 }
                                max={ 50 }
                                onChange={ ( val ) => setAttributes( { contentBorderRadius: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Testimonial Details', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Avatar', 'reusable-component-builder' ) }
                        checked={ showAvatar }
                        onChange={ ( val ) => setAttributes( { showAvatar: val } ) }
                    />
                    { showAvatar && (
                        <>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ onSelectAvatar }
                                    allowedTypes={ [ 'image' ] }
                                    value={ avatarId }
                                    render={ ( { open } ) => (
                                        <Button isSecondary onClick={ open } style={{width: '100%', marginBottom: '10px'}}>
                                            { ! avatarId ? __( 'Select Avatar', 'reusable-component-builder' ) : __( 'Replace Avatar', 'reusable-component-builder' ) }
                                        </Button>
                                    ) }
                                />
                            </MediaUploadCheck>
                            <RangeControl
                                label={ __( 'Avatar Size (px)', 'reusable-component-builder' ) }
                                value={ avatarSize }
                                min={ 40 }
                                max={ 200 }
                                onChange={ ( val ) => setAttributes( { avatarSize: val } ) }
                            />
                            <RangeControl
                                label={ __( 'Avatar Roundness (px)', 'reusable-component-builder' ) }
                                value={ avatarBorderRadius }
                                min={ 0 }
                                max={ 100 }
                                onChange={ ( val ) => setAttributes( { avatarBorderRadius: val } ) }
                            />
                        </>
                    ) }

                    <ToggleControl
                        label={ __( 'Show Rating', 'reusable-component-builder' ) }
                        checked={ showRating }
                        onChange={ ( val ) => setAttributes( { showRating: val } ) }
                    />
                    { showRating && (
                         <RangeControl
                            label={ __( 'Rating (Stars)', 'reusable-component-builder' ) }
                            value={ rating }
                            min={ 1 }
                            max={ 5 }
                            onChange={ ( val ) => setAttributes( { rating: val } ) }
                        />
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Alignment Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleGroupControl
                        label={ __( 'Horizontal Alignment', 'reusable-component-builder' ) }
                        value={ contentAlignment }
                        onChange={ ( val ) => setAttributes( { contentAlignment: val } ) }
                        isBlock
                    >
                        <ToggleGroupControlOption value="left" label={ __( 'Left', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="center" label={ __( 'Center', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="right" label={ __( 'Right', 'reusable-component-builder' ) } />
                    </ToggleGroupControl>

                    <ToggleGroupControl
                        label={ __( 'Vertical Alignment', 'reusable-component-builder' ) }
                        value={ verticalAlignment }
                        onChange={ ( val ) => setAttributes( { verticalAlignment: val } ) }
                        isBlock
                    >
                        <ToggleGroupControlOption value="top" label={ __( 'Top', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="center" label={ __( 'Center', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="bottom" label={ __( 'Bottom', 'reusable-component-builder' ) } />
                    </ToggleGroupControl>
                </PanelBody>

                <PanelBody title={ __( 'Title Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Title', 'reusable-component-builder' ) }
                        checked={ showTitle }
                        onChange={ ( val ) => setAttributes( { showTitle: val } ) }
                    />
                    { showTitle && (
                        <>
                            <RangeControl
                                label={ __( 'Font Size (px)', 'reusable-component-builder' ) }
                                value={ titleFontSize }
                                min={ 10 }
                                max={ 100 }
                                onChange={ ( val ) => setAttributes( { titleFontSize: val } ) }
                            />
                            <SelectControl
                                label={ __( 'Font Weight', 'reusable-component-builder' ) }
                                value={ titleFontWeight }
                                options={ [
                                    { label: 'Normal', value: '400' },
                                    { label: 'Medium', value: '500' },
                                    { label: 'Semi-Bold', value: '600' },
                                    { label: 'Bold', value: '700' },
                                    { label: 'Extra-Bold', value: '800' },
                                ] }
                                onChange={ ( val ) => setAttributes( { titleFontWeight: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Description Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Description', 'reusable-component-builder' ) }
                        checked={ showDesc }
                        onChange={ ( val ) => setAttributes( { showDesc: val } ) }
                    />
                    { showDesc && (
                        <>
                            <RangeControl
                                label={ __( 'Font Size (px)', 'reusable-component-builder' ) }
                                value={ descFontSize }
                                min={ 10 }
                                max={ 50 }
                                onChange={ ( val ) => setAttributes( { descFontSize: val } ) }
                            />
                            <SelectControl
                                label={ __( 'Font Weight', 'reusable-component-builder' ) }
                                value={ descFontWeight }
                                options={ [
                                    { label: 'Thin', value: '300' },
                                    { label: 'Normal', value: '400' },
                                    { label: 'Medium', value: '500' },
                                ] }
                                onChange={ ( val ) => setAttributes( { descFontWeight: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Button Settings', 'reusable-component-builder' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Button', 'reusable-component-builder' ) }
                        checked={ showBtn }
                        onChange={ ( val ) => setAttributes( { showBtn: val } ) }
                    />
                    { showBtn && (
                        <>
                            <TextControl
                                label={ __( 'Button Link', 'reusable-component-builder' ) }
                                value={ btnLink }
                                onChange={ ( val ) => setAttributes( { btnLink: val } ) }
                            />
                            <RangeControl
                                label={ __( 'Font Size (px)', 'reusable-component-builder' ) }
                                value={ btnFontSize }
                                min={ 10 }
                                max={ 30 }
                                onChange={ ( val ) => setAttributes( { btnFontSize: val } ) }
                            />
                            <RangeControl
                                label={ __( 'Border Radius (px)', 'reusable-component-builder' ) }
                                value={ btnBorderRadius }
                                min={ 0 }
                                max={ 50 }
                                onChange={ ( val ) => setAttributes( { btnBorderRadius: val } ) }
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelColorSettings
                    title={ __( 'Colors & Appearance', 'reusable-component-builder' ) }
                    initialOpen={ false }
                    colorSettings={ [
                        {
                            value: bgColor,
                            onChange: ( val ) => setAttributes( { bgColor: val } ),
                            label: __( 'Slide Background', 'reusable-component-builder' )
                        },
                        {
                            value: contentBgColor,
                            onChange: ( val ) => setAttributes( { contentBgColor: val } ),
                            label: __( 'Content Area Background', 'reusable-component-builder' )
                        },
                        {
                            value: overlayColor,
                            onChange: ( val ) => setAttributes( { overlayColor: val } ),
                            label: __( 'Overlay Color', 'reusable-component-builder' )
                        },
                        {
                            value: ratingColor,
                            onChange: ( val ) => setAttributes( { ratingColor: val } ),
                            label: __( 'Star Color', 'reusable-component-builder' )
                        },
                        {
                            value: titleColor,
                            onChange: ( val ) => setAttributes( { titleColor: val } ),
                            label: __( 'Title Color', 'reusable-component-builder' )
                        },
                        {
                            value: descColor,
                            onChange: ( val ) => setAttributes( { descColor: val } ),
                            label: __( 'Description Color', 'reusable-component-builder' )
                        },
                        {
                            value: btnColor,
                            onChange: ( val ) => setAttributes( { btnColor: val } ),
                            label: __( 'Button Text Color', 'reusable-component-builder' )
                        },
                        {
                            value: btnBgColor,
                            onChange: ( val ) => setAttributes( { btnBgColor: val } ),
                            label: __( 'Button Background', 'reusable-component-builder' )
                        }
                    ] }
                />
            </InspectorControls>

            <div { ...blockProps }>
                { bgType === 'image' && mediaUrl && (
                    <div 
                        className="rcb-slide-overlay" 
                        style={ { 
                            backgroundColor: overlayColor, 
                            opacity: overlayOpacity 
                        } } 
                    />
                ) }
                
                <div className={ `rcb-slide-content align-${ contentAlignment }${ showContentBg ? ' has-card' : '' }` }>
                    { showAvatar && avatarUrl && (
                        <div className="rcb-slide-avatar-wrapper">
                            <img 
                                src={ avatarUrl } 
                                alt="Avatar" 
                                style={{ 
                                    width: avatarSize + 'px', 
                                    height: avatarSize + 'px', 
                                    borderRadius: avatarBorderRadius + '%' 
                                }} 
                            />
                        </div>
                    ) }

                    { showRating && (
                        <div className="rcb-slide-rating">
                            { Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon key={i} filled={i < rating} />
                            ))}
                        </div>
                    ) }

                    { showTitle && (
                        <RichText
                            tagName="h2"
                            className="rcb-slide-title"
                            value={ title }
                            placeholder={ __( 'Enter slide title...', 'reusable-component-builder' ) }
                            onChange={ ( val ) => setAttributes( { title: val } ) }
                            style={ { 
                                color: titleColor,
                                fontSize: titleFontSize + 'px',
                                fontWeight: titleFontWeight
                            } }
                        />
                    ) }
                    
                    { showDesc && (
                        <RichText
                            tagName="p"
                            className="rcb-slide-desc"
                            value={ description }
                            placeholder={ __( 'Enter slide description...', 'reusable-component-builder' ) }
                            onChange={ ( val ) => setAttributes( { description: val } ) }
                            style={ { 
                                color: descColor,
                                fontSize: descFontSize + 'px',
                                fontWeight: descFontWeight
                            } }
                        />
                    ) }

                    { showBtn && (
                        <div className="rcb-slide-btn-wrapper">
                            <RichText
                                tagName="div"
                                className="rcb-slide-btn"
                                value={ btnText }
                                placeholder={ __( 'Button Text', 'reusable-component-builder' ) }
                                onChange={ ( val ) => setAttributes( { btnText: val } ) }
                                style={ { 
                                    color: btnColor,
                                    backgroundColor: btnBgColor,
                                    fontSize: btnFontSize + 'px',
                                    borderRadius: btnBorderRadius + 'px'
                                } }
                            />
                        </div>
                    ) }
                </div>
            </div>
        </>
    );
}
