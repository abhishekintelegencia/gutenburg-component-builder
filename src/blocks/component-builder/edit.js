import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, TextareaControl, Button, ToggleControl, RangeControl, RadioControl, BaseControl, Dashicon, __experimentalBoxControl as BoxControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const parseBoxValue = (value) => {
    if (typeof value === 'object' && value !== null) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        // Un-format var(--wp--preset--spacing--20) back to var:preset|spacing|20
        const normalizedStr = value.replace(/var\(--wp--preset--spacing--([^)]+)\)/g, 'var:preset|spacing|$1');
        const parts = normalizedStr.split(' ').filter(Boolean);
        if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
        if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
        if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
        if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    return undefined;
};

const serializeBoxValue = (value) => {
    if (typeof value === 'object' && value !== null) {
        if (!value.top && !value.right && !value.bottom && !value.left) return undefined;
        
        const formatVal = (v) => {
            if (v === undefined || v === '') return '0px';
            // Convert var:preset|spacing|XX to var(--wp--preset--spacing--XX)
            if (String(v).startsWith('var:preset|spacing|')) {
                return `var(--wp--preset--spacing--${v.replace('var:preset|spacing|', '')})`;
            }
            // Ensure there is a unit if it's just a number
            if (!isNaN(v) && v !== '') {
                 return `${v}px`;
            }
            return v;
        };
        
        const t = formatVal(value.top);
        const r = formatVal(value.right);
        const b = formatVal(value.bottom);
        const l = formatVal(value.left);
        
        if (t === r && r === b && b === l) return t;
        if (t === b && r === l) return `${t} ${r}`;
        return `${t} ${r} ${b} ${l}`;
    }
    return value;
};

const SYSTEM_FONTS = [
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
    { label: 'Courier New', value: '"Courier New", Courier, monospace' },
    { label: 'Impact', value: 'Impact, Charcoal, sans-serif' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' }
];

const AdvancedTypographyControl = ({ label, value, fontWeight, textTransform, lineHeight, letterSpacing, fontFamily, onChange }) => {
    const themeFonts = useSelect((select) => {
        const settings = select('core/block-editor').getSettings();
        return settings?.fontFamilies || [];
    }, []);

    const fontOptions = [
        { label: __('Inherit', 'reusable-component-builder'), value: '' },
        ...themeFonts.map(f => ({ label: f.name, value: f.fontFamily })),
        ...SYSTEM_FONTS.filter(sf => !themeFonts.some(tf => tf.fontFamily === sf.value))
    ];


    const valString = (value || '').toString();
    const parsedValue = parseFloat(valString) || 0;
    const unitMatch = valString.match(/[a-z%]+$/i);
    const unit = unitMatch ? unitMatch[0] : 'px';
    
    return (
        <div className="rcb-advanced-typography" style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>{label}</span>
            <div style={{ marginBottom: '15px' }}>
                <SelectControl
                    label={__('Font Family', 'reusable-component-builder')}
                    value={fontFamily || ''}
                    options={fontOptions}
                    onChange={(val) => onChange('fontFamily', val)}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#666' }}>Size</span>
                    <SelectControl
                        value={unit}
                        options={[
                            { label: 'PX', value: 'px' }, { label: 'EM', value: 'em' }, { label: 'REM', value: 'rem' }
                        ]}
                        onChange={(newUnit) => onChange('fontSize', parsedValue ? `${parsedValue}${newUnit}` : '')}
                        style={{ minWidth: '70px', height: '30px', padding: '0 8px', fontSize: '12px' }}
                    />
                </div>
                <RangeControl
                    value={parsedValue}
                    onChange={(newVal) => onChange('fontSize', newVal !== undefined ? `${newVal}${unit}` : '')}
                    min={0}
                    max={unit === 'px' ? 100 : 10}
                    step={unit === 'px' ? 1 : 0.1}
                    allowReset={true}
                />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <SelectControl
                        label="Weight"
                        value={fontWeight || ''}
                        options={[
                            { label: 'Default', value: '' }, { label: 'Normal', value: 'normal' }, { label: 'Bold', value: 'bold' },
                            { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' },
                            { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }
                        ]}
                        onChange={(val) => onChange('fontWeight', val)}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <SelectControl
                        label="Transform"
                        value={textTransform || ''}
                        options={[
                            { label: 'Default', value: '' }, { label: 'Uppercase', value: 'uppercase' },
                            { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }
                        ]}
                        onChange={(val) => onChange('textTransform', val)}
                    />
                </div>
            </div>

            {/* Line Height Control (Two-Row) */}
            <div className="rcb-typo-control-wrapper">
                <div className="rcb-typo-header">
                    <label className="rcb-typo-label">{__('Line Height', 'reusable-component-builder')}</label>
                    <Button 
                        className="rcb-typo-reset-btn" 
                        variant="link" 
                        onClick={() => onChange('lineHeight', '')}
                    >
                        {__('Reset', 'reusable-component-builder')}
                    </Button>
                </div>
                <div className="rcb-typo-control-row">
                    <div className="rcb-typo-icon"><Dashicon icon="editor-lineheight" /></div>
                    <div className="rcb-typo-input">
                        <TextControl
                            value={lineHeight || ''}
                            placeholder="1.5"
                            onChange={(val) => onChange('lineHeight', val)}
                        />
                    </div>
                    <div className="rcb-typo-slider">
                        <RangeControl
                            value={parseFloat(lineHeight) || 1.5}
                            onChange={(val) => onChange('lineHeight', val)}
                            min={0.5}
                            max={3}
                            step={0.1}
                        />
                    </div>
                </div>
            </div>

            {/* Letter Spacing Control (Two-Row) */}
            <div className="rcb-typo-control-wrapper">
                <div className="rcb-typo-header">
                    <label className="rcb-typo-label">{__('Letter Spacing', 'reusable-component-builder')}</label>
                    <Button 
                        className="rcb-typo-reset-btn" 
                        variant="link" 
                        onClick={() => onChange('letterSpacing', '')}
                    >
                        {__('Reset', 'reusable-component-builder')}
                    </Button>
                </div>
                <div className="rcb-typo-control-row">
                    <div className="rcb-typo-icon"><Dashicon icon="editor-spellcheck" /></div>
                    <div className="rcb-typo-input">
                        <TextControl
                            value={parseInt(letterSpacing) || 0}
                            onChange={(val) => onChange('letterSpacing', `${val}px`)}
                        />
                    </div>
                    <div className="rcb-typo-slider">
                        <RangeControl
                            value={parseInt(letterSpacing) || 0}
                            onChange={(val) => onChange('letterSpacing', `${val}px`)}
                            min={-5}
                            max={20}
                            step={1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Edit({ attributes, setAttributes, clientId }) {
    const { templateId, content, styles, uniqueId, mode, postType, taxonomy, termId, layout, columns, postsPerPage, pagination, visibilityVars } = attributes;
    
    // Fetch live data for static mode previews (e.g. ACF meta, title)
    const { currentPostTitle, currentPostExcerpt, currentPostDate, currentPostAuthorName, currentPostMeta, currentPostACF } = useSelect((select) => {
        const { getEditedPostAttribute } = select('core/editor');
        const { getEntityRecord } = select('core');
        
        let authorName = '';
        const authorId = getEditedPostAttribute('author');
        if (authorId) {
            const author = getEntityRecord('root', 'user', authorId);
            if (author) authorName = author.name || '';
        }

        return {
            currentPostTitle: getEditedPostAttribute('title'),
            currentPostExcerpt: getEditedPostAttribute('excerpt'),
            currentPostDate: getEditedPostAttribute('date'),
            currentPostAuthorName: authorName,
            currentPostMeta: getEditedPostAttribute('meta') || {},
            currentPostACF: getEditedPostAttribute('acf') || {}
        };
    }, []);
    
    // We already know our templateId from the variation registration.
    // Fetch specifically this template immediately.
    const [templateName, setTemplateName] = useState('Component Content');
    const [structureNodes, setStructureNodes] = useState([]);
    const [globalCustomStyles, setGlobalCustomStyles] = useState([]);
    const [globalAllowedSettings, setGlobalAllowedSettings] = useState({});
    const [previewPosts, setPreviewPosts] = useState([]);
    
    // Taxonomy API loading state
    const [taxonomies, setTaxonomies] = useState([]);
    const [terms, setTerms] = useState([]);

    // Optional loop visibility settings
    const vVars = visibilityVars || { showTitle: true, showExcerpt: true, showImage: true, showButton: true };

    // Set uniqueId once
    useEffect(() => {
        if (!uniqueId) setAttributes({ uniqueId: clientId });
        
        if (templateId > 0) {
            apiFetch({ path: '/rcb/v1/templates/' }).then((templates) => {
                const selected = templates.find(t => t.id === templateId);
                if (selected && selected.structure) {
                    setTemplateName(selected.title || 'Component Content');
                    const struct = selected.structure;
                    setStructureNodes(struct.structure || []);
                    setGlobalCustomStyles(struct.globalCustomStyles || []);
                    setGlobalAllowedSettings(struct.globalAllowedSettings || {});
                }
            }).catch(() => {});
        }
    }, [templateId]);

    useEffect(() => {
        if (mode === 'query') {
            const route = postType === 'events' ? 'events' : (postType === 'page' ? 'pages' : 'posts');
            let path = `/wp/v2/${route}?per_page=${postsPerPage}&_embed=true`;
            if (taxonomy && termId) {
                // To fetch filtered posts, we need to know the term's taxonomy query var, we'll rough it in preview
                path += `&${taxonomy}=${termId}`;
            }
            apiFetch({ path }).then(posts => {
                setPreviewPosts(posts);
            }).catch(() => setPreviewPosts([]));
        } else {
            setPreviewPosts([]);
        }
    }, [mode, postType, taxonomy, termId, postsPerPage, templateId]);

    // Fetch taxonomies for the post type
    useEffect(() => {
        if (mode === 'query' && postType) {
            apiFetch({ path: `/wp/v2/taxonomies?type=${postType}` }).then(data => {
                const taxOptions = Object.keys(data).map(key => ({ label: data[key].name, value: data[key].slug, rest_base: data[key].rest_base }));
                setTaxonomies([{ label: 'All Categories (No Filter)', value: '', rest_base: '' }, ...taxOptions]);
            }).catch(() => setTaxonomies([]));
        }
    }, [mode, postType]);

    // Fetch terms for the taxonomy
    useEffect(() => {
        if (mode === 'query' && taxonomy) {
            const selectedTax = taxonomies.find(t => t.value === taxonomy);
            if (selectedTax && selectedTax.rest_base) {
                apiFetch({ path: `/wp/v2/${selectedTax.rest_base}?per_page=100` }).then(data => {
                    const termOptions = data.map(term => ({ label: term.name, value: term.id }));
                    setTerms([{ label: 'All Terms (No Filter)', value: 0 }, ...termOptions]);
                }).catch(() => setTerms([]));
            } else {
                 setTerms([]);
            }
        } else {
            setTerms([]);
        }
    }, [mode, taxonomy, taxonomies]);

    const getAllFields = (nodes) => {
        let fields = [];
        nodes.forEach(node => {
            // Include all nodes with a field (ID), so styling panels can be generated for them
            if (node.field) {
                fields.push(node);
            }
            if (node.children) fields = fields.concat(getAllFields(node.children));
        });
        return fields;
    };

    const configurableFields = getAllFields(structureNodes);

    const updateContent = (key, value) => {
        setAttributes({ content: { ...content, [key]: value } });
    };

    const updateStyle = (key, prop, value) => {
        const currentStyle = styles[key] || {};
        if (value === undefined || value === '') {
            const newStyles = { ...styles };
            const newFieldStyles = { ...currentStyle };
            delete newFieldStyles[prop];
            newStyles[key] = newFieldStyles;
            setAttributes({ styles: newStyles });
        } else {
            setAttributes({
                styles: {
                    ...styles,
                    [key]: { ...currentStyle, [prop]: value }
                }
            });
        }
    };

    // Render nodes (Visual Structure)
    const renderPreviewNodes = (nodes, post = null) => {
        return nodes.map((node, i) => {
            const rawStyles = { ...(styles[node.field] || {}) };
            const { customCssPairs, ...validReactStyles } = rawStyles;
            const nodeStyles = { ...validReactStyles };
            
            if (customCssPairs && Array.isArray(customCssPairs)) {
                customCssPairs.forEach(pair => {
                    if (pair.key && pair.value) {
                        const camelKey = pair.key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                        nodeStyles[camelKey] = pair.value;
                    }
                });
            }

            // Explicitly ensure typography values are correctly typed and fallback for preview
            if (nodeStyles.fontWeight) {
                // Force string for numeric weights to ensure React handles them correctly
                // Note: React styles do not support !important in objects, so we just set it here
                // and we will also handle it in the frontend renderer.
                nodeStyles.fontWeight = nodeStyles.fontWeight.toString();
            }
            
            // Background image implementation for any node type
            if (content[`${node.field}_bg_url`]) {
                nodeStyles.backgroundImage = `url(${content[`${node.field}_bg_url`]})`;
                nodeStyles.backgroundSize = nodeStyles.backgroundSize || 'cover';
                nodeStyles.backgroundPosition = nodeStyles.backgroundPosition || 'center';
                nodeStyles.backgroundRepeat = nodeStyles.backgroundRepeat || 'no-repeat';
            }

            // Columns layout for container — use grid on container itself
            if (node.type === 'container' && node.columns > 1) {
                nodeStyles.display = 'grid';
                nodeStyles.gridTemplateColumns = `repeat(${node.columns}, 1fr)`;
                nodeStyles.gap = '20px';
                // In grid mode, render only column children inside the grid
                return (
                    <div key={i} className={`rcb-container ${node.id}`} style={nodeStyles}>
                        {renderPreviewNodes((node.children || []).filter(c => c.type === 'column'), post)}
                    </div>
                );
            }

            // Apply custom style variables from block attributes
            if (node.customStyles && node.customStyles.length > 0) {
                node.customStyles.forEach(styleKey => {
                    // Convert to camelCase — that's how we store now
                    const camelKey = styleKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                    // Look for camelCase first, fall back to kebab-case
                    const styleValue = styles[node.field]?.[camelKey] || styles[node.field]?.[styleKey];
                    if (styleValue) {
                        nodeStyles[camelKey] = styleValue;
                    }
                });
            }

            // In static mode, content is user input. 
            // In query mode, content is populated from dynamicSource!
            const placeholderMap = {
                'heading': 'Enter heading...',
                'text': 'Enter text content...',
                'button': 'Button label',
                'innerblocks': '',
            };
            let nodeContent = content[node.field] || placeholderMap[node.type] || '';
            let url = content[`${node.field}_url`];

            if (mode === 'query' && post && node.dynamicSource) {
                // For dynamic query items, we start fresh and don't leak static content
                const source = node.dynamicSource;
                nodeContent = ''; 
                url = ''; 

                if (source === 'post_title') {
                    nodeContent = post.title?.rendered || 'Post Title';
                } else if (source === 'post_excerpt') {
                    nodeContent = post.excerpt?.rendered?.replace(/(<([^>]+)>)/gi, "") || 'Post Excerpt';
                } else if (source === 'post_date') {
                    nodeContent = new Date(post.date).toLocaleDateString() || 'Post Date';
                } else if (source === 'post_author') {
                    nodeContent = 'Post Author';
                } else if (source === 'featured_image') {
                    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
                    url = featuredMedia?.source_url || '';
                } else if (source === 'permalink') {
                    nodeContent = nodeContent || __('Read More', 'reusable-component-builder');
                    url = post.link || '#';
                } else if (source === 'term') {
                    nodeContent = `Term: ${node.dynamicField || 'name'}`;
                } else if (source === 'custom_meta') {
                    nodeContent = `Meta: ${node.dynamicField || 'value'}`;
                }
            } else if (mode !== 'query' && node.dynamicSource) {
                const source = node.dynamicSource;
                if (source === 'post_title') {
                    nodeContent = currentPostTitle || 'Post Title';
                } else if (source === 'post_excerpt') {
                    nodeContent = currentPostExcerpt?.replace(/(<([^>]+)>)/gi, "") || 'Post Excerpt';
                } else if (source === 'post_date') {
                    nodeContent = currentPostDate ? new Date(currentPostDate).toLocaleDateString() : 'Post Date';
                } else if (source === 'post_author') {
                    nodeContent = currentPostAuthorName || 'Post Author';
                } else if (source === 'featured_image') {
                    url = 'https://via.placeholder.com/600x400?text=Featured+Image';
                } else if (source === 'permalink') {
                    nodeContent = content[node.field] || __('Read More', 'reusable-component-builder');
                    url = '#';
                } else if (source === 'term') {
                    nodeContent = `[Term: ${node.dynamicField}]`;
                } else if (source === 'custom_meta') {
                    const metaKey = node.dynamicField;
                    let metaVal = currentPostMeta[metaKey] || (currentPostACF && currentPostACF[metaKey]);
                    
                    // Fallback to checking the DOM for ACF classic metabox fields
                    if (!metaVal && typeof document !== 'undefined') {
                        const acfInput = document.querySelector(`.acf-field[data-name="${metaKey}"] input[type="text"], .acf-field[data-name="${metaKey}"] textarea, .acf-field[data-name="${metaKey}"] input[type="number"]`);
                        if (acfInput && acfInput.value) {
                            metaVal = acfInput.value;
                        }
                    }

                    if (node.type === 'image') {
                        url = metaVal || 'https://via.placeholder.com/600x400?text=Dynamic+Image';
                    } else if (node.type === 'button') {
                        url = metaVal || '#';
                        nodeContent = content[node.field] || __('Read More', 'reusable-component-builder');
                    } else {
                        nodeContent = metaVal || `[Meta: ${metaKey}]`;
                    }
                } else {
                    nodeContent = `[Dynamic: ${source}]`;
                }
            }

            switch (node.type) {
                case 'container':
                    return (
                        <div key={i} className={`rcb-container ${node.id}`} style={nodeStyles}>
                            {node.children && renderPreviewNodes(node.children, post)}
                        </div>
                    );
                case 'column':
                    return (
                        <div key={i} className={`rcb-column ${node.id}`} style={nodeStyles}>
                            {node.children && renderPreviewNodes(node.children, post)}
                        </div>
                    );
                case 'innerblocks':
                    return (
                        <div key={i} className={`rcb-inner-blocks-slot ${node.id}`} style={nodeStyles}>
                            <InnerBlocks />
                        </div>
                    );
                case 'heading':
                    return <h2 key={i} className={`rcb-heading ${node.id}`} style={{...nodeStyles, whiteSpace: 'pre-wrap'}}>{nodeContent}</h2>;
                case 'text':
                    return <div key={i} className={`rcb-text ${node.id}`} style={{...nodeStyles, whiteSpace: 'pre-wrap'}}>{nodeContent}</div>;
                case 'image':
                    if (url) {
                        return <img key={i} src={url} className={`rcb-image ${node.id}`} alt={nodeContent} style={{...nodeStyles, display: 'block'}} />;
                    }
                    if (node.dynamicSource) {
                        return null; // Don't show placeholders for missing dynamic images
                    }
                    return <div key={i} className={`rcb-image-placeholder ${node.id}`} style={{...nodeStyles, background: '#ccc', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Image Placeholder: {node.field}</div>;
                case 'button':
                    const btnStyles = { ...nodeStyles };
                    
                    // Handle Padding X/Y
                    if (nodeStyles.paddingX !== undefined || nodeStyles.paddingY !== undefined) {
                        const px = nodeStyles.paddingX !== undefined ? `${nodeStyles.paddingX}rem` : '1rem';
                        const py = nodeStyles.paddingY !== undefined ? `${nodeStyles.paddingY}rem` : '0.5rem';
                        btnStyles.padding = `${py} ${px}`;
                    }

                    // Handle Border Radius/Width Rem
                    if (nodeStyles.borderRadiusRem !== undefined) btnStyles.borderRadius = `${nodeStyles.borderRadiusRem}rem`;
                    if (nodeStyles.borderWidthRem !== undefined) {
                        btnStyles.borderWidth = `${nodeStyles.borderWidthRem}rem`;
                        btnStyles.borderStyle = btnStyles.borderStyle || 'solid';
                        if (nodeStyles.borderColor) btnStyles.borderColor = nodeStyles.borderColor;
                    }

                    // Handle Text Size Presets
                    const sizeMap = { 'S': '12px', 'M': '14px', 'L': '16px', 'XL': '20px', '1XL': '24px', '2XL': '32px' };
                    if (nodeStyles.textSizePreset && sizeMap[nodeStyles.textSizePreset]) {
                        btnStyles.fontSize = sizeMap[nodeStyles.textSizePreset];
                    }

                    if (nodeStyles.fontFamily) {
                        btnStyles.fontFamily = nodeStyles.fontFamily;
                    }


                    // Alignment wrapper
                    const alignMap = { 'start': 'flex-start', 'center': 'center', 'end': 'flex-end' };
                    const wrapperStyles = { 
                        display: 'flex', 
                        justifyContent: alignMap[nodeStyles.buttonAlign || 'start'],
                        width: '100%'
                    };

                    const iconMode = content[`${node.field}_icon_mode`] || 'Default';
                    const iconSize = parseFloat(nodeStyles.iconSize) || 0.8;
                    const url = content[`${node.field}_url`] || '';
                    
                    return (
                        <div key={i} style={wrapperStyles} className="rcb-button-wrapper">
                            <style>{`
                                .rcb-button-wrapper .rcb-button.${node.id}:hover {
                                    ${nodeStyles.hoverColor ? `color: ${nodeStyles.hoverColor} !important;` : ''}
                                    ${nodeStyles.hoverBgColor ? `background-color: ${nodeStyles.hoverBgColor} !important;` : ''}
                                    ${nodeStyles.hoverBorderColor ? `border-color: ${nodeStyles.hoverBorderColor} !important;` : ''}
                                    ${nodeStyles.hoverUnderline ? 'text-decoration: underline !important;' : ''}
                                }
                                .rcb-button-wrapper .rcb-button.${node.id}:hover .rcb-button-icon {
                                    ${nodeStyles.iconHoverColor ? `color: ${nodeStyles.iconHoverColor} !important;` : ''}
                                    ${nodeStyles.iconHoverBgColor ? `background-color: ${nodeStyles.iconHoverBgColor} !important;` : ''}
                                    ${nodeStyles.iconHoverBorderColor ? `border-color: ${nodeStyles.iconHoverBorderColor} !important;` : ''}
                                }
                            `}</style>
                            <a 
                                href={url || '#'} 
                                className={`rcb-button ${node.id}`} 
                                style={{
                                    ...btnStyles, 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease-in-out'
                                }} 
                                onClick={e => e.preventDefault()}
                            >
                                {nodeContent}
                                {iconMode !== 'Default' && (
                                    <span 
                                        className="rcb-button-icon"
                                        style={{ 
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: iconMode === 'Icon with Bg' ? (nodeStyles.iconBgColor || '#f0f0f0') : 'transparent',
                                            color: nodeStyles.iconColor || 'inherit',
                                            borderRadius: '50%',
                                            width: iconMode === 'Icon with Bg' ? `${iconSize * 1.875}em` : 'auto',
                                            height: iconMode === 'Icon with Bg' ? `${iconSize * 1.875}em` : 'auto',
                                            border: iconMode === 'Icon with Bg' ? `${nodeStyles.iconBorderWidth || 0.1}rem solid ${nodeStyles.iconBorderColor || 'transparent'}` : 'none',
                                            fontSize: `${iconSize}em`,
                                            lineHeight: 1,
                                            marginLeft: iconMode === 'Icon with Bg' ? '4px' : '0',
                                            transition: 'all 0.3s ease-in-out'
                                        }}
                                    >
                                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                )}
                            </a>
                        </div>
                    );
                default:
                    return null;
            }
        });
    };

    const blockProps = useBlockProps({
        style: (() => {
            const rootStyles = styles['_root'] || {};
            const final = {};
            globalCustomStyles.forEach(styleKey => {
                const styleValue = rootStyles[styleKey];
                if (styleValue) {
                    const camelKey = styleKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    final[camelKey] = styleValue;
                }
            });
            return final;
        })()
    });

    return (
        <div { ...blockProps }>
            {/* Take 3: Dynamic Style Injection for Editor Specificity */}
            <style>
                {configurableFields.map(node => {
                    const nodeStyle = styles[node.field] || {};
                    let css = '';
                    if (nodeStyle.fontWeight) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { font-weight: ${nodeStyle.fontWeight} !important; } `;
                    }
                    if (nodeStyle.lineHeight) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { line-height: ${nodeStyle.lineHeight} !important; } `;
                    }
                    if (nodeStyle.letterSpacing) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { letter-spacing: ${nodeStyle.letterSpacing} !important; } `;
                    }
                    return css;
                }).join('\n')}
            </style>
            
            <InspectorControls>

                {mode === 'query' && templateId > 0 && (
                    <PanelBody title={__('Loop Options')} initialOpen={true}>
                        <SelectControl
                            label={__('Post Type')}
                            value={postType}
                            options={[
                                { label: 'Posts', value: 'post' },
                                { label: 'Pages', value: 'page' },
                                { label: 'Events', value: 'events' },
                            ]}
                            onChange={(val) => setAttributes({ postType: val, taxonomy: '', termId: 0 })}
                        />
                        {taxonomies.length > 1 && (
                            <SelectControl
                                label={__('Filter by Taxonomy')}
                                value={taxonomy}
                                options={taxonomies}
                                onChange={(val) => setAttributes({ taxonomy: val, termId: 0 })}
                            />
                        )}
                        {taxonomy && terms.length > 1 && (
                            <SelectControl
                                label={__('Filter by Term')}
                                value={termId}
                                options={terms}
                                onChange={(val) => setAttributes({ termId: parseInt(val, 10) || 0 })}
                            />
                        )}
                        <RangeControl
                            label={__('Posts Per Page')}
                            value={postsPerPage}
                            onChange={(val) => setAttributes({ postsPerPage: val })}
                            min={1}
                            max={20}
                        />
                        <SelectControl
                            label={__('Layout')}
                            value={layout}
                            options={[
                                { label: 'Grid', value: 'grid' },
                                { label: 'List', value: 'list' },
                            ]}
                            onChange={(val) => setAttributes({ layout: val })}
                        />
                        {layout === 'grid' && (
                            <RangeControl
                                label={__('Columns')}
                                value={columns}
                                onChange={(val) => setAttributes({ columns: val })}
                                min={1}
                                max={6}
                            />
                        )}
                        <ToggleControl
                            label={__('Enable Pagination')}
                            checked={pagination}
                            onChange={(val) => setAttributes({ pagination: val })}
                        />
                        
                        <div style={{marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px'}}>
                            <strong>Dynamic Rendering Note:</strong>
                            <p style={{fontSize: '12px', marginTop: '5px'}}>The Loop populates elements that have a "Dynamic Source" set in the Template Builder.</p>
                        </div>
                    </PanelBody>
                )}

                {/* CONTENT MAPPING - Only for Static Mode */}
                {templateId > 0 && mode === 'static' && (
                    <PanelBody title={`${templateName} Content`} initialOpen={true}>
                        {(() => {
                            const fieldsToRender = configurableFields.filter(f => f.type !== 'container' && f.type !== 'column' && !f.dynamicSource);
                            
                            if (fieldsToRender.length === 0) {
                                return (
                                    <div style={{ padding: '10px', background: '#f8f9fa', border: '1px solid #e2e4e7', borderRadius: '4px' }}>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#646970' }}>All content in this component is configured to load dynamically (e.g. from Custom Fields). No manual input is required here.</p>
                                    </div>
                                );
                            }

                            return fieldsToRender.map((fieldNode) => {

                            if (fieldNode.type === 'image') {
                                return (
                                    <div key={fieldNode.id} className="rcb-field-row" style={{marginBottom: '15px'}}>
                                        <BaseControl id={`img-${fieldNode.field}`} label={`${fieldNode.field} (Image)`}>
                                            <MediaUploadCheck>
                                                <MediaUpload
                                                    onSelect={(media) => {
                                                        // Ensure deep updates are captured cleanly
                                                        setAttributes({ 
                                                            content: { 
                                                                ...content, 
                                                                [`${fieldNode.field}_id`]: media.id, 
                                                                [`${fieldNode.field}_url`]: media.url 
                                                            } 
                                                        });
                                                    }}
                                                    allowedTypes={['image']}
                                                    value={content[`${fieldNode.field}_id`]}
                                                    render={({ open }) => (
                                                        <div className="rcb-media-upload-wrapper" style={{display:'flex', gap:'10px', alignItems:'flex-start', marginTop:'5px', flexWrap:'wrap'}}>
                                                            {content[`${fieldNode.field}_url`] && <img src={content[`${fieldNode.field}_url`]} style={{width:'50px', height:'auto', border: '1px solid #ccc', borderRadius: '3px'}} />}
                                                            <Button isSecondary onClick={open}>
                                                                {content[`${fieldNode.field}_url`] ? 'Change Image' : 'Select Image'}
                                                            </Button>
                                                            {content[`${fieldNode.field}_url`] && (
                                                                <Button isDestructive isSmall variant="tertiary" onClick={() => {
                                                                    setAttributes({ content: { ...content, [`${fieldNode.field}_id`]: undefined, [`${fieldNode.field}_url`]: undefined } });
                                                                }}>
                                                                    Remove
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                />
                                            </MediaUploadCheck>
                                        </BaseControl>
                                    </div>
                                );
                            }

                            if (fieldNode.type === 'text') {
                                return (
                                    <div key={fieldNode.id} className="rcb-field-row" style={{marginBottom: '15px'}}>
                                        <TextareaControl
                                            label={`${fieldNode.field} (Text)`}
                                            value={content[fieldNode.field] || ''}
                                            onChange={(val) => updateContent(fieldNode.field, val)}
                                            rows={5}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <div key={fieldNode.id} className="rcb-field-row" style={{marginBottom: '10px'}}>
                                    <TextControl
                                        label={`${fieldNode.field} (${fieldNode.type})`}
                                        value={content[fieldNode.field] || ''}
                                        onChange={(val) => updateContent(fieldNode.field, val)}
                                    />
                                    {fieldNode.type === 'button' && (
                                        <TextControl
                                            label={`${fieldNode.field} Link URL`}
                                            value={content[`${fieldNode.field}_url`] || ''}
                                            onChange={(val) => updateContent(`${fieldNode.field}_url`, val)}
                                        />
                                    )}
                                </div>
                            );
                        })})()}
                    </PanelBody>
                )}

                {/* STYLE MAPPING */}
                {templateId > 0 && configurableFields.map((fieldNode) => {
                    // backgroundImage as a style control only makes sense for non-image nodes (image nodes use content upload)
                    const defaultBgImage = fieldNode.type !== 'image';
                    const allowed = fieldNode.allowedSettings || { color: true, typography: true, spacing: true, borders: true, dimensions: fieldNode.type === 'image', backgroundImage: defaultBgImage };
                    
                    // Force button-specific settings
                    if (fieldNode.type === 'button') {
                        allowed.buttonSettings = true;
                        allowed.iconSettings = true;
                        // For buttons, we might want to hide generic panels if not explicitly enabled
                    }
                    
                    // Runtime override: image-type nodes should never show bg-image style control
                    if (fieldNode.type === 'image') {
                        allowed.backgroundImage = false;
                    }
                    
                    // Check if any standard keys are enabled
                    if (!allowed.buttonSettings && !allowed.iconSettings && !allowed.color && !allowed.typography && !allowed.spacing && !allowed.borders && !allowed.alignment && !allowed.dimensions && !allowed.backgroundImage && !allowed.opacity && !allowed.boxShadow && !allowed.customStylesBox && !allowed.zIndex && !allowed.overflow && !allowed.visibility && !allowed.cursor && !allowed.transition && !allowed.filter && !allowed.backdropFilter && !allowed.transform) {
                        return null; // No settings enabled for this node
                    }

                    return (
                        <PanelBody key={`style-${fieldNode.id}`} title={`${fieldNode.type.toUpperCase()} Styles (${fieldNode.field})`} initialOpen={false}>
                            
                            {/* Background Image capability for Containers */}
                            {allowed.backgroundImage && (
                                <BaseControl id={`bg-${fieldNode.field}`} label={__('Background Image')} help="Will apply inline background-image to this container.">
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            onSelect={(media) => {
                                                setAttributes({ 
                                                    content: { 
                                                        ...content, 
                                                        [`${fieldNode.field}_bg_id`]: media.id, 
                                                        [`${fieldNode.field}_bg_url`]: media.url 
                                                    } 
                                                });
                                            }}
                                            allowedTypes={['image']}
                                            value={content[`${fieldNode.field}_bg_id`]}
                                            render={({ open }) => (
                                                <div style={{display:'flex', gap:'10px', alignItems:'flex-start', marginTop:'5px', marginBottom:'15px', flexWrap:'wrap'}}>
                                                    {content[`${fieldNode.field}_bg_url`] && <img src={content[`${fieldNode.field}_bg_url`]} style={{width:'50px', height:'auto', border: '1px solid #ccc', borderRadius: '3px'}} />}
                                                    <Button isSecondary onClick={open}>
                                                        {content[`${fieldNode.field}_bg_url`] ? 'Change BG Image' : 'Select BG Image'}
                                                    </Button>
                                                    {content[`${fieldNode.field}_bg_url`] && (
                                                        <Button isDestructive isSmall variant="tertiary" onClick={() => {
                                                            setAttributes({ content: { ...content, [`${fieldNode.field}_bg_id`]: undefined, [`${fieldNode.field}_bg_url`]: undefined } });
                                                        }}>
                                                            Remove BG
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </MediaUploadCheck>
                                    
                                    {content[`${fieldNode.field}_bg_url`] && (
                                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                            <SelectControl
                                                label={__('Background Size')}
                                                value={(styles[fieldNode.field] && styles[fieldNode.field].backgroundSize) || 'cover'}
                                                options={[
                                                    { label: 'Cover', value: 'cover' },
                                                    { label: 'Contain', value: 'contain' },
                                                    { label: 'Auto (Original)', value: 'auto' }
                                                ]}
                                                onChange={(val) => updateStyle(fieldNode.field, 'backgroundSize', val)}
                                            />
                                            <SelectControl
                                                label={__('Background Position')}
                                                value={(styles[fieldNode.field] && styles[fieldNode.field].backgroundPosition) || 'center center'}
                                                options={[
                                                    { label: 'Center', value: 'center center' },
                                                    { label: 'Top Left', value: 'left top' },
                                                    { label: 'Top Center', value: 'center top' },
                                                    { label: 'Top Right', value: 'right top' },
                                                    { label: 'Bottom Left', value: 'left bottom' },
                                                    { label: 'Bottom Center', value: 'center bottom' },
                                                    { label: 'Bottom Right', value: 'right bottom' }
                                                ]}
                                                onChange={(val) => updateStyle(fieldNode.field, 'backgroundPosition', val)}
                                            />
                                            <SelectControl
                                                label={__('Background Repeat')}
                                                value={(styles[fieldNode.field] && styles[fieldNode.field].backgroundRepeat) || 'no-repeat'}
                                                options={[
                                                    { label: 'No Repeat', value: 'no-repeat' },
                                                    { label: 'Repeat XY', value: 'repeat' },
                                                    { label: 'Repeat X', value: 'repeat-x' },
                                                    { label: 'Repeat Y', value: 'repeat-y' }
                                                ]}
                                                onChange={(val) => updateStyle(fieldNode.field, 'backgroundRepeat', val)}
                                            />
                                        </div>
                                    )}

                                </BaseControl>
                            )}

                            {allowed.color && !allowed.buttonSettings && (
                                <PanelColorSettings
                                    title={__('Colors', 'reusable-component-builder')}
                                    initialOpen={false}
                                    colorSettings={[
                                        {
                                            value: (styles[fieldNode.field] && styles[fieldNode.field].color) || '',
                                            onChange: (val) => updateStyle(fieldNode.field, 'color', val),
                                            label: __('Text Color', 'reusable-component-builder'),
                                        },
                                        {
                                            value: (styles[fieldNode.field] && styles[fieldNode.field].backgroundColor) || '',
                                            onChange: (val) => updateStyle(fieldNode.field, 'backgroundColor', val),
                                            label: __('Background Color', 'reusable-component-builder'),
                                        }
                                    ]}
                                />
                            )}
                            {allowed.typography && !allowed.buttonSettings && (
                                <AdvancedTypographyControl
                                    label={__('Typography', 'reusable-component-builder')}
                                    value={(styles[fieldNode.field] && styles[fieldNode.field].fontSize) || ''}
                                    fontWeight={(styles[fieldNode.field] && styles[fieldNode.field].fontWeight) || ''}
                                    textTransform={(styles[fieldNode.field] && styles[fieldNode.field].textTransform) || ''}
                                    lineHeight={(styles[fieldNode.field] && styles[fieldNode.field].lineHeight) || ''}
                                    letterSpacing={(styles[fieldNode.field] && styles[fieldNode.field].letterSpacing) || ''}
                                    fontFamily={(styles[fieldNode.field] && styles[fieldNode.field].fontFamily) || ''}
                                    onChange={(prop, val) => updateStyle(fieldNode.field, prop, val)}
                                />
                            )}
                            {allowed.spacing && !allowed.buttonSettings && (
                                <>
                                    <div className="rcb-box-control-wrapper" style={{ marginBottom: '15px' }}>
                                        <BoxControl
                                            label={__('Padding', 'reusable-component-builder')}
                                            values={parseBoxValue((styles[fieldNode.field] && styles[fieldNode.field].padding) || '')}
                                            onChange={(val) => updateStyle(fieldNode.field, 'padding', serializeBoxValue(val))}
                                        />
                                    </div>
                                    <div className="rcb-box-control-wrapper" style={{ marginBottom: '15px' }}>
                                        <BoxControl
                                            label={__('Margin', 'reusable-component-builder')}
                                            values={parseBoxValue((styles[fieldNode.field] && styles[fieldNode.field].margin) || '')}
                                            onChange={(val) => updateStyle(fieldNode.field, 'margin', serializeBoxValue(val))}
                                        />
                                    </div>
                                </>
                            )}
                            {allowed.alignment && !allowed.buttonSettings && (
                                <ToggleGroupControl
                                    label={__('Text Alignment', 'reusable-component-builder')}
                                    value={(styles[fieldNode.field] && styles[fieldNode.field].textAlign) || 'default'}
                                    isBlock
                                    onChange={(val) => updateStyle(fieldNode.field, 'textAlign', val === 'default' ? '' : val)}
                                >
                                    <ToggleGroupControlOption value="default" label={__('Default')} />
                                    <ToggleGroupControlOption value="left" label={__('Left')} />
                                    <ToggleGroupControlOption value="center" label={__('Center')} />
                                    <ToggleGroupControlOption value="right" label={__('Right')} />
                                </ToggleGroupControl>
                            )}
                            {allowed.dimensions && (
                                <>
                                    <TextControl
                                        label={__('Width (e.g. 100%, 300px)', 'reusable-component-builder')}
                                        value={(styles[fieldNode.field] && styles[fieldNode.field].width) || ''}
                                        onChange={(val) => updateStyle(fieldNode.field, 'width', val)}
                                    />
                                    <TextControl
                                        label={__('Height (e.g. auto, 200px)', 'reusable-component-builder')}
                                        value={(styles[fieldNode.field] && styles[fieldNode.field].height) || ''}
                                        onChange={(val) => updateStyle(fieldNode.field, 'height', val)}
                                    />
                                </>
                            )}
                            {allowed.borders && !allowed.buttonSettings && (
                                <>
                                    <RangeControl
                                        label={__('Border Radius (px)', 'reusable-component-builder')}
                                        value={parseInt(styles[fieldNode.field]?.[ 'borderRadius' ]) || 0}
                                        onChange={(val) => updateStyle(fieldNode.field, 'borderRadius', val !== undefined ? `${val}px` : '')}
                                        min={0}
                                        max={100}
                                        allowReset={true}
                                    />
                                    <SelectControl
                                        label={__('Border Outline', 'reusable-component-builder')}
                                        value={(styles[fieldNode.field] && styles[fieldNode.field].border) || ''}
                                        options={[
                                            { label: __('None', 'reusable-component-builder'), value: '' },
                                            { label: __('Solid Light (1px solid #ccc)', 'reusable-component-builder'), value: '1px solid #ccc' },
                                            { label: __('Solid Dark (1px solid #333)', 'reusable-component-builder'), value: '1px solid #333' },
                                            { label: __('Dashed Light (1px dashed #ccc)', 'reusable-component-builder'), value: '1px dashed #ccc' },
                                            { label: __('Dotted Light (1px dotted #ccc)', 'reusable-component-builder'), value: '1px dotted #ccc' },
                                            { label: __('Thick Solid Dark (2px solid #333)', 'reusable-component-builder'), value: '2px solid #333' }
                                        ]}
                                        onChange={(val) => updateStyle(fieldNode.field, 'border', val)}
                                    />
                                </>
                            )}

                            {allowed.opacity && (
                                <RangeControl
                                    label={__('Opacity', 'reusable-component-builder')}
                                    value={parseFloat(styles[fieldNode.field]?.[ 'opacity' ]) ?? 1}
                                    onChange={(val) => updateStyle(fieldNode.field, 'opacity', val)}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    allowReset={true}
                                />
                            )}
                            {allowed.boxShadow && (
                                <TextControl
                                    label={__('Box Shadow', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'boxShadow' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'boxShadow', val)}
                                    help="e.g., 0px 4px 10px rgba(0,0,0,0.1)"
                                />
                            )}
                            
                            {/* ADVANCED LAYOUT */}
                            {allowed.zIndex && (
                                <TextControl
                                    label={__('Z-Index', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'zIndex' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'zIndex', val)}
                                    type="number"
                                />
                            )}
                            {allowed.overflow && (
                                <SelectControl
                                    label={__('Overflow', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'overflow' ] || ''}
                                    options={[
                                        { label: __('Default', 'reusable-component-builder'), value: '' },
                                        { label: __('Visible', 'reusable-component-builder'), value: 'visible' },
                                        { label: __('Hidden', 'reusable-component-builder'), value: 'hidden' },
                                        { label: __('Scroll', 'reusable-component-builder'), value: 'scroll' },
                                        { label: __('Auto', 'reusable-component-builder'), value: 'auto' }
                                    ]}
                                    onChange={(val) => updateStyle(fieldNode.field, 'overflow', val)}
                                />
                            )}
                            {allowed.visibility && (
                                <SelectControl
                                    label={__('Visibility', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'visibility' ] || ''}
                                    options={[
                                        { label: __('Default', 'reusable-component-builder'), value: '' },
                                        { label: __('Visible', 'reusable-component-builder'), value: 'visible' },
                                        { label: __('Hidden', 'reusable-component-builder'), value: 'hidden' }
                                    ]}
                                    onChange={(val) => updateStyle(fieldNode.field, 'visibility', val)}
                                />
                            )}
                            {allowed.cursor && (
                                <SelectControl
                                    label={__('Cursor', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'cursor' ] || ''}
                                    options={[
                                        { label: __('Default', 'reusable-component-builder'), value: '' },
                                        { label: __('Pointer (Hand)', 'reusable-component-builder'), value: 'pointer' },
                                        { label: __('Text', 'reusable-component-builder'), value: 'text' },
                                        { label: __('Not Allowed', 'reusable-component-builder'), value: 'not-allowed' },
                                        { label: __('Help', 'reusable-component-builder'), value: 'help' }
                                    ]}
                                    onChange={(val) => updateStyle(fieldNode.field, 'cursor', val)}
                                />
                            )}

                            {/* ANIMATIONS & FILTERS */}
                            {allowed.transition && (
                                <TextControl
                                    label={__('Transition', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'transition' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'transition', val)}
                                    help="e.g., all 0.3s ease"
                                />
                            )}
                            {allowed.filter && (
                                <TextControl
                                    label={__('Filter', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'filter' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'filter', val)}
                                    help="e.g., blur(5px) or grayscale(100%)"
                                />
                            )}
                            {allowed.backdropFilter && (
                                <TextControl
                                    label={__('Backdrop Filter', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'backdropFilter' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'backdropFilter', val)}
                                    help="e.g., blur(10px) (Ideal for glassmorphism)"
                                />
                            )}
                            {allowed.transform && (
                                <TextControl
                                    label={__('Transform', 'reusable-component-builder')}
                                    value={styles[fieldNode.field]?.[ 'transform' ] || ''}
                                    onChange={(val) => updateStyle(fieldNode.field, 'transform', val)}
                                    help="e.g., scale(1.05) translateY(-5px)"
                                />
                            )}
                            {allowed.buttonSettings && (
                                <PanelBody title={__('Button Settings', 'reusable-component-builder')} initialOpen={true}>
                                    <TextControl
                                        label={__('BUTTON TEXT', 'reusable-component-builder')}
                                        value={content[fieldNode.field] || ''}
                                        onChange={(val) => updateContent(fieldNode.field, val)}
                                    />
                                    <SelectControl
                                        label={__('BUTTON FONTWEIGHT', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.fontWeight || '400'}
                                        options={[
                                            { label: 'Thin', value: '100' },
                                            { label: 'Extra-Light', value: '200' },
                                            { label: 'Light', value: '300' },
                                            { label: 'Regular', value: '400' },
                                            { label: 'Medium', value: '500' },
                                            { label: 'Semi-Bold', value: '600' },
                                            { label: 'Bold', value: '700' },
                                            { label: 'Extra-Bold', value: '800' },
                                            { label: 'Black', value: '900' },
                                        ]}
                                        onChange={(val) => updateStyle(fieldNode.field, 'fontWeight', val)}
                                    />
                                    <PanelColorSettings
                                        title={__('Button Color', 'reusable-component-builder')}
                                        initialOpen={false}
                                        colorSettings={[
                                            {
                                                value: styles[fieldNode.field]?.color || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'color', val),
                                                label: __('Button Text Color', 'reusable-component-builder'),
                                            },
                                            {
                                                value: styles[fieldNode.field]?.backgroundColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'backgroundColor', val),
                                                label: __('Background Color', 'reusable-component-builder'),
                                            },
                                        ]}
                                    />
                                    <ToggleGroupControl
                                        label={__('Text Size', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.textSizePreset || 'None'}
                                        isBlock
                                        onChange={(val) => updateStyle(fieldNode.field, 'textSizePreset', val)}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        <ToggleGroupControlOption value="S" label="S" />
                                        <ToggleGroupControlOption value="M" label="M" />
                                        <ToggleGroupControlOption value="L" label="L" />
                                        <ToggleGroupControlOption value="XL" label="XL" />
                                        <ToggleGroupControlOption value="1XL" label="1XL" />
                                        <ToggleGroupControlOption value="2XL" label="2XL" />
                                        <ToggleGroupControlOption value="None" label="None" />
                                    </ToggleGroupControl>
                                    <SelectControl
                                        label={__('Font Family', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.fontFamily || ''}
                                        options={[
                                            { label: __('Inherit', 'reusable-component-builder'), value: '' },
                                            ...(wp.data.select('core/block-editor').getSettings()?.fontFamilies || []).map(f => ({ label: f.name, value: f.fontFamily })),
                                            ...SYSTEM_FONTS.filter(sf => !(wp.data.select('core/block-editor').getSettings()?.fontFamilies || []).some(tf => tf.fontFamily === sf.value))
                                        ]}
                                        onChange={(val) => updateStyle(fieldNode.field, 'fontFamily', val)}
                                    />

                                    <SelectControl
                                        label={__('Text Transform', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.textTransform || ''}
                                        options={[
                                            { label: 'None', value: '' },
                                            { label: 'Uppercase', value: 'uppercase' },
                                            { label: 'Lowercase', value: 'lowercase' },
                                            { label: 'Capitalize', value: 'capitalize' }
                                        ]}
                                        onChange={(val) => updateStyle(fieldNode.field, 'textTransform', val)}
                                    />
                                    <RangeControl
                                        label={__('Line Height', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.lineHeight) || 1.2}
                                        onChange={(val) => updateStyle(fieldNode.field, 'lineHeight', val)}
                                        min={0.5}
                                        max={4}
                                        step={0.1}
                                        allowReset
                                    />
                                    <RangeControl
                                        label={__('Letter Spacing', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.letterSpacing) || 0}
                                        onChange={(val) => updateStyle(fieldNode.field, 'letterSpacing', val)}
                                        min={-5}
                                        max={20}
                                        step={1}
                                        allowReset
                                    />
                                    
                                    <PanelColorSettings
                                        title={__('Border', 'reusable-component-builder')}
                                        initialOpen={false}
                                        colorSettings={[
                                            {
                                                value: styles[fieldNode.field]?.borderColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'borderColor', val),
                                                label: __('Border Color', 'reusable-component-builder'),
                                            },
                                        ]}
                                    />
                                    <RangeControl
                                        label={__('PADDING-X (REM)', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.paddingX) ?? 1}
                                        onChange={(val) => updateStyle(fieldNode.field, 'paddingX', val)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                    />
                                    <RangeControl
                                        label={__('PADDING-Y (REM)', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.paddingY) ?? 0.5}
                                        onChange={(val) => updateStyle(fieldNode.field, 'paddingY', val)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                    />
                                    <RangeControl
                                        label={__('BORDER RADIUS (REM)', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.borderRadiusRem) ?? 0}
                                        onChange={(val) => updateStyle(fieldNode.field, 'borderRadiusRem', val)}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                    />
                                    <RangeControl
                                        label={__('BORDER WIDTH (REM)', 'reusable-component-builder')}
                                        value={parseFloat(styles[fieldNode.field]?.borderWidthRem) ?? 0.1}
                                        onChange={(val) => updateStyle(fieldNode.field, 'borderWidthRem', val)}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                    />

                                    <PanelColorSettings
                                        title={__('Button Hover', 'reusable-component-builder')}
                                        initialOpen={false}
                                        colorSettings={[
                                            {
                                                value: styles[fieldNode.field]?.hoverBgColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverBgColor', val),
                                                label: __('Background Color', 'reusable-component-builder'),
                                            },
                                            {
                                                value: styles[fieldNode.field]?.hoverColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverColor', val),
                                                label: __('Text Color', 'reusable-component-builder'),
                                            },
                                            {
                                                value: styles[fieldNode.field]?.hoverBorderColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverBorderColor', val),
                                                label: __('Border Color', 'reusable-component-builder'),
                                            },
                                        ]}
                                    />
                                    <ToggleControl
                                        label={__('Show Underline', 'reusable-component-builder')}
                                        checked={styles[fieldNode.field]?.hoverUnderline || false}
                                        onChange={(val) => updateStyle(fieldNode.field, 'hoverUnderline', val)}
                                    />

                                    <ToggleGroupControl
                                        label={__('Button Alignment', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.buttonAlign || 'start'}
                                        isBlock
                                        onChange={(val) => updateStyle(fieldNode.field, 'buttonAlign', val)}
                                        style={{ marginTop: '20px' }}
                                    >
                                        <ToggleGroupControlOption value="start" label="start" />
                                        <ToggleGroupControlOption value="center" label="center" />
                                        <ToggleGroupControlOption value="end" label="end" />
                                    </ToggleGroupControl>

                                    <TextControl
                                        label={__('BUTTON URL', 'reusable-component-builder')}
                                        value={content[`${fieldNode.field}_url`] || ''}
                                        onChange={(val) => updateContent(`${fieldNode.field}_url`, val)}
                                        style={{ marginTop: '20px' }}
                                    />
                                    
                                    <ToggleGroupControl
                                        label={__('Button target link', 'reusable-component-builder')}
                                        value={content[`${fieldNode.field}_target`] || '_self'}
                                        isBlock
                                        onChange={(val) => updateContent(`${fieldNode.field}_target`, val)}
                                    >
                                        <ToggleGroupControlOption value="_blank" label="_blank" />
                                        <ToggleGroupControlOption value="_self" label="_self" />
                                    </ToggleGroupControl>
                                </PanelBody>
                            )}

                            {allowed.iconSettings && (
                                <PanelBody title={__('Icon Settings', 'reusable-component-builder')} initialOpen={false}>
                                    <SelectControl
                                        label={__('ICON CLASS', 'reusable-component-builder')}
                                        value={content[`${fieldNode.field}_icon_mode`] || 'Default'}
                                        options={[
                                            { label: 'Default', value: 'Default' },
                                            { label: 'With Icon', value: 'With Icon' },
                                            { label: 'Icon with Bg', value: 'Icon with Bg' },
                                        ]}
                                        onChange={(val) => updateContent(`${fieldNode.field}_icon_mode`, val)}
                                    />
                                    {content[`${fieldNode.field}_icon_mode`] !== 'Default' && (
                                        <RangeControl
                                            label={__('Icon Size (REM)', 'reusable-component-builder')}
                                            value={parseFloat(styles[fieldNode.field]?.iconSize) || 0.8}
                                            onChange={(val) => updateStyle(fieldNode.field, 'iconSize', val)}
                                            min={0.5}
                                            max={3}
                                            step={0.1}
                                        />
                                    )}
                                    {content[`${fieldNode.field}_icon_mode`] === 'Icon with Bg' && (
                                        <>
                                            <PanelColorSettings
                                                title={__('Icon Settings Style', 'reusable-component-builder')}
                                                initialOpen={true}
                                                colorSettings={[
                                                    {
                                                        value: styles[fieldNode.field]?.iconBgColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconBgColor', val),
                                                        label: __('Bg Color', 'reusable-component-builder'),
                                                    },
                                                    {
                                                        value: styles[fieldNode.field]?.iconColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconColor', val),
                                                        label: __('Color', 'reusable-component-builder'),
                                                    },
                                                    {
                                                        value: styles[fieldNode.field]?.iconBorderColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconBorderColor', val),
                                                        label: __('Border Color', 'reusable-component-builder'),
                                                    },
                                                ]}
                                            />
                                            <RangeControl
                                                label={__('BORDER WIDTH (REM)', 'reusable-component-builder')}
                                                value={parseFloat(styles[fieldNode.field]?.iconBorderWidth) ?? 0.1}
                                                onChange={(val) => updateStyle(fieldNode.field, 'iconBorderWidth', val)}
                                                min={0}
                                                max={1}
                                                step={0.05}
                                            />
                                            <PanelColorSettings
                                                title={__('Icon Hover Settings', 'reusable-component-builder')}
                                                initialOpen={false}
                                                colorSettings={[
                                                    {
                                                        value: styles[fieldNode.field]?.iconHoverBgColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconHoverBgColor', val),
                                                        label: __('Bg Color', 'reusable-component-builder'),
                                                    },
                                                    {
                                                        value: styles[fieldNode.field]?.iconHoverColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconHoverColor', val),
                                                        label: __('Color', 'reusable-component-builder'),
                                                    },
                                                    {
                                                        value: styles[fieldNode.field]?.iconHoverBorderColor || '',
                                                        onChange: (val) => updateStyle(fieldNode.field, 'iconHoverBorderColor', val),
                                                        label: __('Border Color', 'reusable-component-builder'),
                                                    },
                                                ]}
                                            />
                                        </>
                                    )}
                                </PanelBody>
                            )}

                            {allowed.customStylesBox && (
                                <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa' }}>
                                    <strong style={{ display: 'block', marginBottom: '10px', fontSize: '12px' }}>{__('Custom Styles', 'reusable-component-builder')}</strong>
                                    {(styles[fieldNode.field]?.customCssPairs || []).map((pair, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px', alignItems: 'center' }}>
                                            <TextControl
                                                value={pair.key}
                                                placeholder="z-index"
                                                onChange={(val) => {
                                                    const newPairs = [...(styles[fieldNode.field].customCssPairs || [])];
                                                    newPairs[idx] = { ...newPairs[idx], key: val };
                                                    updateStyle(fieldNode.field, 'customCssPairs', newPairs);
                                                }}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            />
                                            <TextControl
                                                value={pair.value}
                                                placeholder="99"
                                                onChange={(val) => {
                                                    const newPairs = [...(styles[fieldNode.field].customCssPairs || [])];
                                                    newPairs[idx] = { ...newPairs[idx], value: val };
                                                    updateStyle(fieldNode.field, 'customCssPairs', newPairs);
                                                }}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            />
                                            <Button isDestructive isSmall variant="tertiary" icon="trash" onClick={() => {
                                                const newPairs = (styles[fieldNode.field].customCssPairs || []).filter((_, i) => i !== idx);
                                                updateStyle(fieldNode.field, 'customCssPairs', newPairs.length ? newPairs : undefined);
                                            }} />
                                        </div>
                                    ))}
                                    <Button variant="secondary" isSmall onClick={() => {
                                        const newPairs = [...(styles[fieldNode.field]?.customCssPairs || []), { key: '', value: '' }];
                                        updateStyle(fieldNode.field, 'customCssPairs', newPairs);
                                    }}>
                                        + Add Custom Style
                                    </Button>
                                </div>
                            )}
                        </PanelBody>
                    );
                })}
            </InspectorControls>

            <div className={`rcb-editor-preview-container ${layout === 'grid' && mode === 'query' ? 'rcb-layout-grid' : ''}`} style={layout === 'grid' && mode === 'query' ? {display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '20px'} : {}}>
                {!templateId ? (
                    <div style={{padding: '30px', border: '1px dashed #ccc', textAlign: 'center', background: '#f5f5f5'}}>
                        {__('Error: No template variation assigned to this block!', 'reusable-component-builder')}
                    </div>
                ) : (
                    mode === 'query' ? (
                        previewPosts.length > 0 ? previewPosts.map((post, idx) => {
                            // Reset per post loop preview


                            return (
                                <div key={`post-${idx}`} className={`rcb-instance rcb-instance-${uniqueId}`}>
                                    {renderPreviewNodes(structureNodes, post)}
                                </div>
                            );
                        }) : <div style={{padding: '20px', background: '#e0e0e0'}}>Loading posts...</div>
                    ) : (
                        <div className={`rcb-instance rcb-instance-${uniqueId}`}>
                            {renderPreviewNodes(structureNodes)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
