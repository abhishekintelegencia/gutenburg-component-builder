import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
    PanelColorSettings,
    RichText,
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    RangeControl,
    ToggleControl,
    TextControl,
    SelectControl,
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
    Placeholder,
    Spinner,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export default function Edit( { attributes, setAttributes } ) {
    const { 
        postType, taxonomy, termId, postsPerPage, uniqueId,
        arrows, dots, autoplay, autoplayDelay, 
        loop, effect, slidesPerView, spaceBetween,
        arrowColor, dotColor, height,
        bgType, bgColor, overlayOpacity, overlayColor,
        showAvatar, avatarUrl, avatarSize, avatarBorderRadius,
        showRating, rating, ratingColor,
        verticalAlignment, contentAlignment,
        showContentBg, contentBgColor, contentPadding, contentBorderRadius,
        showTitle, titleColor, titleFontSize, titleFontWeight,
        showDesc, descColor, descFontSize, descFontWeight,
        showBtn, btnText, btnColor, btnBgColor, btnBorderRadius, btnFontSize
    } = attributes;

    const [previewPosts, setPreviewPosts] = useState([]);
    const [taxonomies, setTaxonomies] = useState([]);
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(false);

    // Generate uniqueId
    useEffect( () => {
        if ( ! uniqueId ) {
            setAttributes( { uniqueId: Math.random().toString( 36 ).substr( 2, 9 ) } );
        }
    }, [] );

    // Fetch posts for preview
    useEffect(() => {
        setLoading(true);
        const route = postType === 'events' ? 'events' : (postType === 'page' ? 'pages' : 'posts');
        let path = `/wp/v2/${route}?per_page=${postsPerPage}&_embed=true`;
        if (taxonomy && termId) {
            path += `&${taxonomy}=${termId}`;
        }
        apiFetch({ path }).then(posts => {
            setPreviewPosts(posts);
            setLoading(false);
        }).catch(() => {
            setPreviewPosts([]);
            setLoading(false);
        });
    }, [postType, taxonomy, termId, postsPerPage]);

    // Fetch taxonomies for the post type
    useEffect(() => {
        const route = postType === 'events' ? 'events' : (postType === 'page' ? 'pages' : 'posts');
        apiFetch({ path: `/wp/v2/taxonomies?type=${route}` }).then(taxs => {
            const taxList = Object.keys(taxs).map(key => ({
                label: taxs[key].name,
                value: taxs[key].slug
            }));
            setTaxonomies([{ label: __('Select Taxonomy', 'reusable-component-builder'), value: '' }, ...taxList]);
        });
    }, [postType]);

    // Fetch terms when taxonomy changes
    useEffect(() => {
        if (taxonomy) {
            apiFetch({ path: `/wp/v2/${taxonomy}?per_page=100` }).then(termList => {
                setTerms([{ label: __('All Categories', 'reusable-component-builder'), value: 0 }, ...termList.map(t => ({
                    label: t.name,
                    value: t.id
                }))]);
            });
        } else {
            setTerms([]);
        }
    }, [taxonomy]);

    const blockProps = useBlockProps({
        className: `rcb-advance-dynamic-slider-preview rcb-instance-${uniqueId}`
    });

    const StarIcon = ({ filled }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? ratingColor : '#ccc'} style={{ margin: '0 2px' }}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Query Settings', 'reusable-component-builder' ) }>
                    <SelectControl
                        label={ __( 'Post Type', 'reusable-component-builder' ) }
                        value={ postType }
                        options={ [
                            { label: __( 'Posts', 'reusable-component-builder' ), value: 'post' },
                            { label: __( 'Pages', 'reusable-component-builder' ), value: 'page' },
                            { label: __( 'Events', 'reusable-component-builder' ), value: 'events' },
                        ] }
                        onChange={ ( val ) => setAttributes( { postType: val } ) }
                    />
                    { taxonomies.length > 1 && (
                        <SelectControl
                            label={ __( 'Filter by Taxonomy', 'reusable-component-builder' ) }
                            value={ taxonomy }
                            options={ taxonomies }
                            onChange={ ( val ) => setAttributes( { taxonomy: val, termId: 0 } ) }
                        />
                    ) }
                    { terms.length > 0 && (
                        <SelectControl
                            label={ __( 'Select Term', 'reusable-component-builder' ) }
                            value={ termId }
                            options={ terms }
                            onChange={ ( val ) => setAttributes( { termId: parseInt( val ) } ) }
                        />
                    ) }
                    <RangeControl
                        label={ __( 'Posts Per Page', 'reusable-component-builder' ) }
                        value={ postsPerPage }
                        min={ 1 }
                        max={ 20 }
                        onChange={ ( val ) => setAttributes( { postsPerPage: val } ) }
                    />
                </PanelBody>

                <PanelBody title={ __( 'Background Settings', 'reusable-component-builder' ) }>
                    <ToggleGroupControl
                        label={ __( 'Background Type', 'reusable-component-builder' ) }
                        value={ bgType }
                        onChange={ ( val ) => setAttributes( { bgType: val } ) }
                        isBlock
                    >
                        <ToggleGroupControlOption value="image" label={ __( 'Featured Image', 'reusable-component-builder' ) } />
                        <ToggleGroupControlOption value="color" label={ __( 'Solid Color', 'reusable-component-builder' ) } />
                    </ToggleGroupControl>

                    { bgType === 'image' && (
                        <RangeControl
                            label={ __( 'Overlay Opacity', 'reusable-component-builder' ) }
                            value={ overlayOpacity }
                            min={ 0 }
                            max={ 1 }
                            step={ 0.1 }
                            onChange={ ( val ) => setAttributes( { overlayOpacity: val } ) }
                        />
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
                                label={ __( 'Button Text', 'reusable-component-builder' ) }
                                value={ btnText }
                                onChange={ ( val ) => setAttributes( { btnText: val } ) }
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

                <PanelBody title={ __( 'Slider Settings', 'reusable-component-builder' ) }>
                    <ToggleControl
                        label={ __( 'Show Arrows', 'reusable-component-builder' ) }
                        checked={ arrows }
                        onChange={ ( val ) => setAttributes( { arrows: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Show Dots', 'reusable-component-builder' ) }
                        checked={ dots }
                        onChange={ ( val ) => setAttributes( { dots: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Infinite Loop', 'reusable-component-builder' ) }
                        checked={ loop }
                        onChange={ ( val ) => setAttributes( { loop: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Autoplay', 'reusable-component-builder' ) }
                        checked={ autoplay }
                        onChange={ ( val ) => setAttributes( { autoplay: val } ) }
                    />
                    { autoplay && (
                        <RangeControl
                            label={ __( 'Autoplay Delay (ms)', 'reusable-component-builder' ) }
                            value={ autoplayDelay }
                            min={ 1000 }
                            max={ 10000 }
                            step={ 500 }
                            onChange={ ( val ) => setAttributes( { autoplayDelay: val } ) }
                        />
                    ) }
                    <SelectControl
                        label={ __( 'Transition Effect', 'reusable-component-builder' ) }
                        value={ effect }
                        options={ [
                            { label: __( 'Slide', 'reusable-component-builder' ), value: 'slide' },
                            { label: __( 'Fade', 'reusable-component-builder' ), value: 'fade' },
                            { label: __( 'Cube', 'reusable-component-builder' ), value: 'cube' },
                            { label: __( 'Coverflow', 'reusable-component-builder' ), value: 'coverflow' },
                            { label: __( 'Flip', 'reusable-component-builder' ), value: 'flip' },
                        ] }
                        onChange={ ( val ) => setAttributes( { effect: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Slides Per View', 'reusable-component-builder' ) }
                        value={ slidesPerView }
                        min={ 1 }
                        max={ 6 }
                        onChange={ ( val ) => setAttributes( { slidesPerView: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Space Between Slides', 'reusable-component-builder' ) }
                        value={ spaceBetween }
                        min={ 0 }
                        max={ 50 }
                        onChange={ ( val ) => setAttributes( { spaceBetween: val } ) }
                    />
                    <TextControl
                        label={ __( 'Slider Height (e.g. 500px)', 'reusable-component-builder' ) }
                        value={ height }
                        onChange={ ( val ) => setAttributes( { height: val } ) }
                    />
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
                            value: arrowColor,
                            onChange: ( val ) => setAttributes( { arrowColor: val } ),
                            label: __( 'Arrow Color', 'reusable-component-builder' )
                        },
                        {
                            value: dotColor,
                            onChange: ( val ) => setAttributes( { dotColor: val } ),
                            label: __( 'Dot Color', 'reusable-component-builder' )
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
                { loading && <div className="rcb-preview-loading"><Spinner /></div> }
                
                <div className="rcb-advance-dynamic-slider-header">
                    <span>{ __( 'Advance Dynamic Slider Preview', 'reusable-component-builder' ) }</span>
                </div>

                <div className="rcb-slider-preview-container" style={{ height: height }}>
                    <div className="rcb-slider-preview-track" style={{ 
                        display: 'flex', 
                        gap: spaceBetween + 'px',
                        width: '100%'
                    }}>
                        { previewPosts.map( ( post, index ) => {
                            const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
                            const mediaUrl = featuredMedia?.source_url;
                            
                            return (
                                <div key={post.id} className={`rcb-slide-item v-align-${verticalAlignment}`} style={{ 
                                    flex: `0 0 calc(${100/slidesPerView}% - ${spaceBetween}px)`,
                                    backgroundImage: bgType === 'image' && mediaUrl ? `url(${mediaUrl})` : 'none',
                                    backgroundColor: (bgType === 'color' || (bgType === 'image' && !mediaUrl)) ? bgColor : 'transparent',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: height,
                                    position: 'relative'
                                }}>
                                    { bgType === 'image' && mediaUrl && (
                                        <div 
                                            className="rcb-slide-overlay" 
                                            style={ { 
                                                backgroundColor: overlayColor, 
                                                opacity: overlayOpacity,
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                zIndex: 1
                                            } } 
                                        />
                                    ) }

                                    <div className={ `rcb-slide-content align-${ contentAlignment }${ showContentBg ? ' has-card' : '' }` } style={{
                                        zIndex: 2,
                                        position: 'relative',
                                        backgroundColor: showContentBg ? contentBgColor : 'transparent',
                                        padding: contentPadding + 'px',
                                        borderRadius: contentBorderRadius + 'px'
                                    }}>
                                        { showTitle && post?.title?.rendered && (
                                            <h2 className="rcb-slide-title" style={{
                                                color: titleColor,
                                                fontSize: titleFontSize + 'px',
                                                fontWeight: titleFontWeight,
                                                margin: 0
                                            }} dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                        ) }

                                        { showDesc && post?.excerpt?.rendered && (
                                            <div className="rcb-slide-desc" style={{
                                                color: descColor,
                                                fontSize: descFontSize + 'px',
                                                fontWeight: descFontWeight,
                                                marginTop: '10px'
                                            }} dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                                        ) }

                                        { showBtn && (
                                            <div className="rcb-slide-btn-wrapper" style={{ marginTop: '20px' }}>
                                                <div className="rcb-slide-btn" style={{
                                                    display: 'inline-block',
                                                    color: btnColor,
                                                    backgroundColor: btnBgColor,
                                                    fontSize: btnFontSize + 'px',
                                                    borderRadius: btnBorderRadius + 'px',
                                                    padding: '10px 20px'
                                                }}>
                                                    { btnText }
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
