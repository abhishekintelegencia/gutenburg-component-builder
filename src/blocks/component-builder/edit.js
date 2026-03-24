import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Button, ToggleControl, RangeControl, RadioControl, BaseControl, Dashicon, __experimentalBoxControl as BoxControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';
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

const AdvancedTypographyControl = ({ label, value, fontWeight, textTransform, lineHeight, letterSpacing, onChange }) => {
    const valString = (value || '').toString();
    const parsedValue = parseFloat(valString) || 0;
    const unitMatch = valString.match(/[a-z%]+$/i);
    const unit = unitMatch ? unitMatch[0] : 'px';
    
    return (
        <div className="rcb-advanced-typography" style={{ marginBottom: '15px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>{label}</span>
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
            let path = `/wp/v2/${route}?per_page=${postsPerPage}`;
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
            // Skip column and container nodes — they are structural, not content fields
            if (node.field && node.type !== 'column' && node.type !== 'container') {
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
                nodeStyles.backgroundSize = 'cover';
                nodeStyles.backgroundPosition = 'center';
            }

            // Columns layout for container — use grid on container itself
            if (node.type === 'container' && node.columns > 1) {
                nodeStyles.display = 'grid';
                nodeStyles.gridTemplateColumns = `repeat(${node.columns}, 1fr)`;
                nodeStyles.gap = '20px';
                // In grid mode, render only column children inside the grid
                return (
                    <div key={i} className={`rcb-container ${node.id}`} style={nodeStyles}>
                        {(node.children || []).filter(c => c.type === 'column').map((col, ci) => (
                            <div key={ci} className={`rcb-column ${col.id}`} style={styles[col.field] || {}}>
                                {col.children && renderPreviewNodes(col.children, post)}
                            </div>
                        ))}
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

            if (mode !== 'query' && node.dynamicSource) {
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
            } else if (mode === 'query' && post) {
                const source = node.dynamicSource;
                if (source === 'post_title') {
                    nodeContent = post.title?.rendered || 'Post Title';
                } else if (source === 'post_excerpt') {
                    nodeContent = post.excerpt?.rendered?.replace(/(<([^>]+)>)/gi, "") || 'Post Excerpt';
                } else if (source === 'post_date') {
                    nodeContent = new Date(post.date).toLocaleDateString() || 'Post Date';
                } else if (source === 'post_author') {
                    nodeContent = 'Post Author';
                } else if (source === 'featured_image') {
                    url = post.featured_media ? 'https://via.placeholder.com/600x400?text=Featured+Image' : 'https://via.placeholder.com/600x400?text=No+Image';
                } else if (source === 'permalink') {
                    nodeContent = nodeContent || __('Read More', 'reusable-component-builder');
                    url = post.link || '#';
                } else if (source === 'term') {
                    nodeContent = `Term: ${node.dynamicField || 'name'}`;
                } else if (source === 'custom_meta') {
                    nodeContent = `Meta: ${node.dynamicField || 'value'}`;
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
                    return <h2 key={i} className={`rcb-heading ${node.id}`} style={nodeStyles}>{nodeContent}</h2>;
                case 'text':
                    return <div key={i} className={`rcb-text ${node.id}`} style={nodeStyles}>{nodeContent}</div>;
                case 'image':
                    if (url) {
                        return <img key={i} src={url} className={`rcb-image ${node.id}`} alt={nodeContent} style={{...nodeStyles, display: 'block'}} />;
                    }
                    return <div key={i} className={`rcb-image-placeholder ${node.id}`} style={{...nodeStyles, background: '#ccc', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Image Placeholder: {node.field}</div>;
                case 'button':
                    return <a key={i} href={url || '#'} className={`rcb-button ${node.id}`} style={{...nodeStyles, display: 'inline-block'}} onClick={e => e.preventDefault()}>{nodeContent}</a>;
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
                            const fieldsToRender = configurableFields.filter(f => f.type !== 'container' && !f.dynamicSource);
                            
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
                    // Runtime override: image-type nodes should never show bg-image style control
                    if (fieldNode.type === 'image') {
                        allowed.backgroundImage = false;
                    }
                    
                    // Check if any standard keys are enabled
                    if (!allowed.color && !allowed.typography && !allowed.spacing && !allowed.borders && !allowed.alignment && !allowed.dimensions && !allowed.backgroundImage && !allowed.opacity && !allowed.boxShadow && !allowed.customStylesBox && !allowed.zIndex && !allowed.overflow && !allowed.visibility && !allowed.cursor && !allowed.transition && !allowed.filter && !allowed.backdropFilter && !allowed.transform) {
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
                                </BaseControl>
                            )}

                            {allowed.color && (
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
                            {allowed.typography && (
                                <AdvancedTypographyControl
                                    label={__('Typography', 'reusable-component-builder')}
                                    value={(styles[fieldNode.field] && styles[fieldNode.field].fontSize) || ''}
                                    fontWeight={(styles[fieldNode.field] && styles[fieldNode.field].fontWeight) || ''}
                                    textTransform={(styles[fieldNode.field] && styles[fieldNode.field].textTransform) || ''}
                                    lineHeight={(styles[fieldNode.field] && styles[fieldNode.field].lineHeight) || ''}
                                    letterSpacing={(styles[fieldNode.field] && styles[fieldNode.field].letterSpacing) || ''}
                                    onChange={(prop, val) => updateStyle(fieldNode.field, prop, val)}
                                />
                            )}
                            {allowed.spacing && (
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
                            {allowed.alignment && (
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
                            {allowed.borders && (
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
