import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { 
        mediaUrl, bgType, bgColor, bgGradient,
        showAvatar, avatarUrl, avatarSize, avatarBorderRadius,
        showRating, rating, ratingColor,
        verticalAlignment, contentAlignment,
        showContentBg, contentBgColor, contentPadding, contentBorderRadius,
        showTitle, title, titleColor, titleFontSize, titleFontWeight,
        showDesc, description, descColor, descFontSize, descFontWeight,
        showBtn, btnText, btnLink, btnColor, btnBgColor, btnBorderRadius, btnFontSize,
        overlayOpacity, overlayColor, caption
    } = attributes;

    const blockProps = useBlockProps.save( {
        className: `swiper-slide rcb-slide-item v-align-${verticalAlignment}`,
        style: {
            backgroundImage: bgType === 'image' && mediaUrl ? `url(${mediaUrl})` : undefined,
            backgroundColor: (bgType === 'color' || (bgType === 'image' && !mediaUrl)) ? bgColor : undefined,
            '--rcb-title-color': titleColor,
            '--rcb-title-size': titleFontSize + 'px',
            '--rcb-title-weight': titleFontWeight,
            '--rcb-desc-color': descColor,
            '--rcb-desc-size': descFontSize + 'px',
            '--rcb-desc-weight': descFontWeight,
            '--rcb-btn-color': btnColor,
            '--rcb-btn-bg': btnBgColor,
            '--rcb-btn-radius': btnBorderRadius + 'px',
            '--rcb-btn-size': btnFontSize + 'px',
            '--rcb-rating-color': ratingColor,
            '--rcb-content-bg': showContentBg ? contentBgColor : 'transparent',
            '--rcb-content-padding': contentPadding + 'px',
            '--rcb-content-radius': contentBorderRadius + 'px'
        }
    } );

    return (
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
                            <span key={i} className={`dashicons dashicons-star-${i < rating ? 'filled' : 'empty'}`}></span>
                        ))}
                    </div>
                ) }

                { showTitle && ! RichText.isEmpty( title ) && (
                    <RichText.Content
                        tagName="h2"
                        className="rcb-slide-title"
                        value={ title }
                    />
                ) }

                { showDesc && ! RichText.isEmpty( description ) && (
                    <RichText.Content
                        tagName="p"
                        className="rcb-slide-desc"
                        value={ description }
                    />
                ) }

                { showBtn && ! RichText.isEmpty( btnText ) && (
                    <div className="rcb-slide-btn-wrapper">
                        <a 
                            href={ btnLink || '#' } 
                            className="rcb-slide-btn"
                        >
                            <RichText.Content value={ btnText } />
                        </a>
                    </div>
                ) }

                { /* Legacy support */ }
                { !showTitle && !showDesc && !showBtn && ! RichText.isEmpty( caption ) && (
                    <RichText.Content
                        tagName="h2"
                        className="rcb-slide-caption"
                        value={ caption }
                    />
                ) }
            </div>
        </div>
    );
}
