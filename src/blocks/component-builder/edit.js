import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, BlockControls, MediaUpload, MediaUploadCheck, PanelColorSettings, InnerBlocks } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, TextareaControl, Button, ToggleControl, RangeControl, RadioControl, BaseControl, Dashicon, TabPanel, __experimentalBoxControl as BoxControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption, ToolbarGroup, ToolbarButton } from '@wordpress/components';
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

const ResponsiveControl = ({ label, deviceMode, setDeviceMode, children }) => {
    return (
        <div className="rcb-responsive-control" style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                {label && <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#1e1e1e' }}>{label}</span>}
                <div className="rcb-device-toggles" style={{ display: 'flex', gap: '2px' }}>
                    <Button 
                        size="small" 
                        icon="desktop" 
                        isPressed={deviceMode === 'desktop'} 
                        onClick={() => setDeviceMode('desktop')}
                        variant={deviceMode === 'desktop' ? 'primary' : 'tertiary'}
                        style={{ minWidth: '24px', height: '24px', padding: '0' }}
                    />
                    <Button 
                        size="small" 
                        icon="tablet" 
                        isPressed={deviceMode === 'tablet'} 
                        onClick={() => setDeviceMode('tablet')}
                        variant={deviceMode === 'tablet' ? 'primary' : 'tertiary'}
                        style={{ minWidth: '24px', height: '24px', padding: '0' }}
                    />
                    <Button 
                        size="small" 
                        icon="smartphone" 
                        isPressed={deviceMode === 'mobile'} 
                        onClick={() => setDeviceMode('mobile')}
                        variant={deviceMode === 'mobile' ? 'primary' : 'tertiary'}
                        style={{ minWidth: '24px', height: '24px', padding: '0' }}
                    />
                </div>
            </div>
            {children}
        </div>
    );
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

const AdvancedTypographyControl = ({ label, value, fontWeight, textTransform, lineHeight, letterSpacing, fontFamily, onChange, deviceMode, setDeviceMode }) => {
    const themeFonts = useSelect((select) => {
        const settings = select('core/block-editor').getSettings();
        return settings?.fontFamilies || [];
    }, []);

    const fontOptions = [
        { label: __('Inherit', 'reusable-component-builder'), value: '' },
        ...themeFonts.map(font => ({ label: font.name, value: font.fontFamily })),
        ...SYSTEM_FONTS.filter(sf => !themeFonts.some(tf => tf.fontFamily === sf.value))
    ];

    const getVal = (v) => (typeof v === 'object' && v !== null) ? v[deviceMode] || v.desktop || '' : (v || '');
    
    // Process Font Size
    const sizeStr = getVal(value).toString();
    const parsedSize = parseFloat(sizeStr) || 0;
    const sizeUnit = sizeStr.match(/[a-z%]+$/i)?.[0] || 'px';

    // Process Line Height
    const lhStr = getVal(lineHeight).toString();
    const parsedLH = parseFloat(lhStr) || 1.5;

    // Process Letter Spacing
    const lsStr = getVal(letterSpacing).toString();
    const parsedLS = parseFloat(lsStr) || 0;

    const labelStyle = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' };
    
    return (
        <div className="rcb-advanced-typography" style={{ marginBottom: '24px' }}>
            {label && <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: '#1e1e1e', letterSpacing: '0.5px' }}>{label}</div>}
            
            <div style={{ marginBottom: '16px' }}>
                <div style={labelStyle}>FONT FAMILY</div>
                <SelectControl
                    value={fontFamily || ''}
                    options={fontOptions}
                    onChange={(val) => onChange('fontFamily', val, false)}
                    __nextHasNoMarginBottom={true}
                />
            </div>

            <ResponsiveControl label="Font Size" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parsedSize}
                            onChange={(val) => onChange('fontSize', `${val}${sizeUnit}`, true)}
                            min={8}
                            max={100}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                    <TextControl
                        type="number"
                        value={parsedSize || ''}
                        onChange={(val) => onChange('fontSize', val ? `${val}${sizeUnit}` : '', true)}
                        style={{ width: '55px' }}
                        __nextHasNoMarginBottom={true}
                    />
                    <SelectControl
                        value={sizeUnit}
                        options={[{ label: 'PX', value: 'px' }, { label: 'EM', value: 'em' }, { label: 'REM', value: 'rem' }]}
                        onChange={(newUnit) => onChange('fontSize', parsedSize ? `${parsedSize}${newUnit}` : '', true)}
                        style={{ width: '70px' }}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
            </ResponsiveControl>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <div style={labelStyle}>Weight</div>
                    <SelectControl
                        value={fontWeight || ''}
                        options={[
                            { label: __('Default', 'reusable-component-builder'), value: '' },
                            { label: '100', value: '100' }, { label: '200', value: '200' }, { label: '300', value: '300' },
                            { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' },
                            { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }
                        ]}
                        onChange={(val) => onChange('fontWeight', val, false)}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={labelStyle}>Transform</div>
                    <SelectControl
                        value={textTransform || ''}
                        options={[
                            { label: __('None', 'reusable-component-builder'), value: '' },
                            { label: __('Uppercase', 'reusable-component-builder'), value: 'uppercase' },
                            { label: __('Lowercase', 'reusable-component-builder'), value: 'lowercase' },
                            { label: __('Capitalize', 'reusable-component-builder'), value: 'capitalize' }
                        ]}
                        onChange={(val) => onChange('textTransform', val, false)}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
            </div>

            <ResponsiveControl label="Line Height" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parsedLH}
                            onChange={(val) => onChange('lineHeight', val, true)}
                            min={0.5}
                            max={3}
                            step={0.1}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                    <TextControl
                        type="number"
                        value={parsedLH}
                        onChange={(val) => onChange('lineHeight', val, true)}
                        style={{ width: '65px' }}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
            </ResponsiveControl>

            <ResponsiveControl label="Letter Spacing" deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <RangeControl
                            value={parsedLS}
                            onChange={(val) => onChange('letterSpacing', `${val}px`, true)}
                            min={-5}
                            max={20}
                            step={1}
                            withInputField={false}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>
                    <TextControl
                        type="number"
                        value={parsedLS}
                        onChange={(val) => onChange('letterSpacing', `${val}px`, true)}
                        style={{ width: '65px' }}
                        __nextHasNoMarginBottom={true}
                    />
                </div>
            </ResponsiveControl>
        </div>
    );
};

/**
 * Helper to recursively get all fields from structure
 */
const getAllFields = (nodes) => {
    let fields = [];
    nodes.forEach(node => {
        if (node.field) {
            fields.push(node);
        }
        if (node.children) fields = fields.concat(getAllFields(node.children));
    });
    return fields;
};

/**
 * Helper to get a clean label for the styling sidebar
 */
const getCleanFieldLabel = (node, index, allNodes) => {
    let label = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    
    if (allNodes) {
        let sameTypeCount = 0;
        let sameTypeIndex = 0;
        for (let j = 0; j < allNodes.length; j++) {
            if (allNodes[j].type === node.type) {
                sameTypeCount++;
                if (j <= index) sameTypeIndex++;
            }
        }
        if (sameTypeCount > 1) {
            label += ` ${sameTypeIndex}`;
        }
    }

    if (node.dynamicSource) {
        label += ` (${node.dynamicSource.replace(/_/g, ' ')})`;
    }
    
    return label;
};

/**
 * Resolves a potentially responsive value into a single value based on device.
 */
const getResponsiveValue = (val, deviceMode) => {
    if (typeof val === 'object' && val !== null) {
        return val[deviceMode] || val.desktop || '';
    }
    return val;
};

/**
 * Main recursive renderer for the editor preview
 */
const renderVisualStructure = (nodes, post, parentContext, context) => {
    const { 
        styles, content, mode, currentPostTitle, currentPostExcerpt, 
        currentPostDate, currentPostAuthorName, currentPostMeta, 
        currentPostACF, uniqueId, deviceMode 
    } = context;

    return nodes.map((node, i) => {
        const rawStyles = { ...(styles[node.field] || {}) };
        const nodeStyles = {};
        
        // Resolve all properties (including responsive ones)
        Object.keys(rawStyles).forEach(prop => {
            if (prop !== 'customCssPairs' && prop !== 'customStylesRaw') {
                const val = getResponsiveValue(rawStyles[prop], deviceMode);
                
                // Map internal names to valid CSS/React properties
                if (prop === 'displayMode') {
                    nodeStyles.display = val;
                } else if (prop === 'contentMaxWidth') {
                    if (val) {
                        nodeStyles.maxWidth = val;
                        nodeStyles.marginLeft = 'auto';
                        nodeStyles.marginRight = 'auto';
                        nodeStyles.width = '100%';
                    }
                } else if (prop === 'flexGap' || prop === 'gridGap') {
                    nodeStyles.gap = val;
                } else if (prop === 'rowGap') {
                    nodeStyles.rowGap = val;
                } else {
                    nodeStyles[prop] = val;
                }
            }
        });

        // Parse raw CSS string if present
        if (rawStyles.customStylesRaw) {
            const rules = rawStyles.customStylesRaw.split(';').filter(Boolean);
            rules.forEach(rule => {
                const [key, ...valueParts] = rule.split(':');
                if (key && valueParts.length) {
                    const styleKey = key.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                    const styleValue = valueParts.join(':').trim();
                    nodeStyles[styleKey] = styleValue;
                }
            });
        }

        // Explicitly ensure typography values are correctly typed and fallback for preview
        if (nodeStyles.fontWeight) {
            nodeStyles.fontWeight = nodeStyles.fontWeight.toString();
        }
        
        // Background image implementation for any node type
        if (content[`${node.field}_bg_url`]) {
            nodeStyles.backgroundImage = `url(${content[`${node.field}_bg_url`]})`;
            nodeStyles.backgroundSize = nodeStyles.backgroundSize || 'cover';
            nodeStyles.backgroundPosition = nodeStyles.backgroundPosition || 'center';
            nodeStyles.backgroundRepeat = nodeStyles.backgroundRepeat || 'no-repeat';
        }

        // Apply custom style variables from block attributes
        if (node.customStyles && node.customStyles.length > 0) {
            node.customStyles.forEach(styleKey => {
                const camelKey = styleKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                const styleValue = styles[node.field]?.[camelKey] || styles[node.field]?.[styleKey];
                if (styleValue) {
                    nodeStyles[camelKey] = styleValue;
                }
            });
        }

        const placeholderMap = {
            'heading': 'Enter heading...',
            'text': 'Enter text content...',
            'button': 'Button label',
            'innerblocks': '',
        };
        let nodeContent = content[node.field] || placeholderMap[node.type] || '';
        let url = content[`${node.field}_url`];

        if (mode === 'query' && post && node.dynamicSource) {
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
                const metaKey = node.dynamicField;
                const metaVal = post.meta && post.meta[metaKey] !== undefined ? post.meta[metaKey] : null;
                if (node.type === 'image') {
                    url = metaVal || '';
                } else if (node.type === 'button') {
                    url = metaVal || post.link || '#';
                    nodeContent = nodeContent || __('Read More', 'reusable-component-builder');
                } else {
                    nodeContent = metaVal !== null ? String(metaVal) : `[Meta: ${metaKey}]`;
                }
            }
        } else if (mode !== 'query' && node.dynamicSource) {
            const source = node.dynamicSource;
            if (source === 'post_title') {
                nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : (currentPostTitle || 'Post Title');
            } else if (source === 'post_excerpt') {
                nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : (currentPostExcerpt?.replace(/(<([^>]+)>)/gi, "") || 'Post Excerpt');
            } else if (source === 'post_date') {
                nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : (currentPostDate ? new Date(currentPostDate).toLocaleDateString() : 'Post Date');
            } else if (source === 'post_author') {
                nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : (currentPostAuthorName || 'Post Author');
            } else if (source === 'featured_image') {
                url = (content[`${node.field}_url`] && content[`${node.field}_url`].length > 0) ? content[`${node.field}_url`] : (content[`${node.field}_url`] || 'https://via.placeholder.com/600x400?text=Featured+Image');
            } else if (source === 'permalink') {
                nodeContent = content[node.field] || __('Read More', 'reusable-component-builder');
                url = content[`${node.field}_url`] || '#';
            } else if (source === 'custom_meta') {
                const metaKey = node.dynamicField;
                let metaVal = currentPostMeta[metaKey] || (currentPostACF && currentPostACF[metaKey]);
                
                // Read live keystrokes from ACF metabox inputs to provide real-time preview
                const acfElement = document.querySelector(`.acf-field[data-name="${metaKey}"] input:not([type="hidden"]), .acf-field[data-name="${metaKey}"] textarea`);
                if (acfElement && typeof acfElement.value !== 'undefined') {
                    metaVal = acfElement.value;
                }
                
                // Extremely verbose explicit fallback logic to completely prevent evaluation errors
                if (node.type === 'image') {
                    url = (content[`${node.field}_url`] && content[`${node.field}_url`].length > 0) ? content[`${node.field}_url`] : (metaVal || 'https://via.placeholder.com/600x400?text=Dynamic+Image');
                } else if (node.type === 'button') {
                    url = (content[`${node.field}_url`] && content[`${node.field}_url`].length > 0) ? content[`${node.field}_url`] : (metaVal || '#');
                    nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : __('Read More', 'reusable-component-builder');
                } else {
                    nodeContent = (content[node.field] && content[node.field].length > 0) ? content[node.field] : (metaVal || `[Meta: ${metaKey}]`);
                }
            }
        }

        switch (node.type) {
            case 'container':
                const containerStyles = { ...nodeStyles };
                if (node.columns > 1 || containerStyles.display === 'grid' || containerStyles.display === 'flex') {
                    if (containerStyles.display === 'flex') {
                        containerStyles.flexDirection = containerStyles.flexDirection || 'row';
                        containerStyles.flexWrap = containerStyles.flexWrap || 'wrap';
                        containerStyles.justifyContent = containerStyles.justifyContent || 'flex-start';
                        containerStyles.alignItems = containerStyles.alignItems || 'stretch';
                    } else {
                        containerStyles.display = 'grid';
                        containerStyles.gridTemplateColumns = (containerStyles.gridTemplateColumns === 'custom' ? containerStyles.customGridTemplate : containerStyles.gridTemplateColumns) || `repeat(${node.columns || 1}, 1fr)`;
                        if (containerStyles.gap || containerStyles.rowGap) {
                            containerStyles.columnGap = containerStyles.gap || '20px';
                            containerStyles.rowGap = containerStyles.rowGap || containerStyles.gap || '20px';
                        } else if (node.columns > 1) {
                            containerStyles.gap = '20px';
                        }
                    }
                }
                const isVerticalFlex = containerStyles.display === 'flex' && containerStyles.flexDirection && containerStyles.flexDirection.includes('column');
                return (
                    <div key={i} className={`rcb-container ${node.id}`} style={containerStyles}>
                        {node.children && renderVisualStructure(node.children, post, { isVerticalFlex }, context)}
                    </div>
                );
            case 'column':
                const colStyles = { ...nodeStyles };
                if (colStyles.customColumnWidth) {
                    const unit = colStyles.customColumnWidthUnit || '%';
                    colStyles.width = `${colStyles.customColumnWidth}${unit}`;
                    colStyles.flex = `0 0 ${colStyles.width}`;
                } else if (parentContext.isVerticalFlex) {
                    colStyles.flex = '1 1 auto';
                    colStyles.width = '100%';
                } else {
                    colStyles.flex = '1 1 0%';
                }
                return (
                    <div key={i} className={`rcb-column ${node.id}`} style={colStyles}>
                        {node.children && renderVisualStructure(node.children, post, {}, context)}
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
                return node.dynamicSource ? null : <div key={i} className={`rcb-image-placeholder ${node.id}`} style={{...nodeStyles, background: '#ccc', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Image Placeholder: {node.field}</div>;
            case 'button':
                const btnStyles = { ...nodeStyles };
                if (!nodeStyles.padding && (nodeStyles.paddingX !== undefined || nodeStyles.paddingY !== undefined)) {
                    const px = nodeStyles.paddingX !== undefined ? `${nodeStyles.paddingX}rem` : '1rem';
                    const py = nodeStyles.paddingY !== undefined ? `${nodeStyles.paddingY}rem` : '0.5rem';
                    btnStyles.padding = `${py} ${px}`;
                }

                // Handle Advanced Button Settings (match renderer.php)
                if (!btnStyles.borderRadius && nodeStyles.borderRadiusRem) {
                    btnStyles.borderRadius = `${nodeStyles.borderRadiusRem}rem`;
                }
                if (!btnStyles.border && nodeStyles.borderWidthRem) {
                    btnStyles.borderWidth = `${nodeStyles.borderWidthRem}rem`;
                    if (!btnStyles.borderStyle) btnStyles.borderStyle = 'solid';
                }

                // Strip color/bg/border/radius props from inline style — the global <style> block handles these
                // with !important for proper specificity in the editor (inline styles always win otherwise)
                delete btnStyles.color;
                delete btnStyles.backgroundColor;
                delete btnStyles.borderColor;
                delete btnStyles.borderRadius;

                const alignMap = { 'start': 'flex-start', 'center': 'center', 'end': 'flex-end', 'default': 'flex-start', 'left': 'flex-start', 'right': 'flex-end' };
                const wrapperStyles = { 
                    display: 'flex', 
                    justifyContent: alignMap[nodeStyles.textAlign || nodeStyles.buttonAlign || 'start'] || 'flex-start',
                    width: '100%'
                };
                const iconMode = content[`${node.field}_icon_mode`] || 'Default';
                const iconSize = parseFloat(nodeStyles.iconSize) || 0.8;

                // Icon inline styles — color/bg are overridden via global style block too
                const iconInlineStyle = {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: `${iconSize}em`,
                    lineHeight: 1,
                    marginLeft: iconMode === 'Icon with Bg' ? '4px' : '0',
                    transition: 'all 0.3s ease-in-out',
                    ...(iconMode === 'Icon with Bg' ? {
                        width: `${iconSize * 1.875}em`,
                        height: `${iconSize * 1.875}em`,
                        borderWidth: `${nodeStyles.iconBorderWidth || 0.1}rem`,
                        borderStyle: 'solid',
                    } : {}),
                };
                
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
                                ${nodeStyles.iconHoverBgColor ? `background-color: ${nodeStyles.iconHoverBgColor} !important;` : ''}
                                ${nodeStyles.iconHoverColor ? `color: ${nodeStyles.iconHoverColor} !important;` : ''}
                                ${nodeStyles.iconHoverBorderColor ? `border-color: ${nodeStyles.iconHoverBorderColor} !important;` : ''}
                            }
                        `}</style>
                        <a 
                            href={url || '#'} 
                            className={`rcb-button ${node.id}`} 
                            style={{ ...btnStyles, display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', transition: 'all 0.3s ease-in-out' }} 
                            onClick={e => e.preventDefault()}
                        >
                            {nodeContent}
                            {iconMode !== 'Default' && (
                                <span className="rcb-button-icon" style={iconInlineStyle}>
                                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

export default function Edit({ attributes, setAttributes, clientId }) {
    const { templateId, content, styles, uniqueId, mode, postType, taxonomy, termId, layout, columns, postsPerPage, pagination, showPaginationText, paginationFontSize, paginationTextColor, paginationBgColor, paginationActiveTextColor, paginationActiveBgColor, visibilityVars } = attributes;
    
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

    // Create a local state to forcefully trigger re-renders when ACF DOM inputs change
    const [acfDomTick, setAcfDomTick] = useState(0);

    useEffect(() => {
        // Since ACF metaboxes don't sync with core/editor meta on keystroke,
        // we set up a polling mechanism to catch live typing in ACF fields
        const interval = setInterval(() => {
            let acfChanged = false;
            document.querySelectorAll('.acf-field input:not([type="hidden"]), .acf-field textarea, .acf-field select').forEach(el => {
                if (document.activeElement === el) {
                    acfChanged = true;
                }
            });
            if (acfChanged) {
                setAcfDomTick(prev => prev + 1);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);
    
    // We already know our templateId from the variation registration.
    // Fetch specifically this template immediately.
    const [templateName, setTemplateName] = useState('Component Content');
    const [structureNodes, setStructureNodes] = useState([]);
    const [globalCustomStyles, setGlobalCustomStyles] = useState([]);
    const [globalAllowedSettings, setGlobalAllowedSettings] = useState({});
    const [previewPosts, setPreviewPosts] = useState([]);
    const [selectedStyleElement, setSelectedStyleElement] = useState('');
    const [paged, setPaged] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Taxonomy API loading state
    const [taxonomies, setTaxonomies] = useState([]);
    const [terms, setTerms] = useState([]);
    const [deviceMode, setDeviceMode] = useState('desktop'); // desktop, tablet, mobile
    const getResp = (val) => getResponsiveValue(val, deviceMode);

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
        setPaged(1);
    }, [mode, postType, taxonomy, termId, postsPerPage, templateId]);

    useEffect(() => {
        if (mode === 'query') {
            const route = postType === 'events' ? 'events' : (postType === 'page' ? 'pages' : 'posts');
            let path = `/wp/v2/${route}?per_page=${postsPerPage}&_embed=true&page=${paged}`;
            if (taxonomy && termId) {
                // To fetch filtered posts, we need to know the term's taxonomy query var, we'll rough it in preview
                path += `&${taxonomy}=${termId}`;
            }
            apiFetch({ path, parse: false }).then(res => {
                const total = res.headers.get('x-wp-totalpages');
                setTotalPages(total ? parseInt(total, 10) : 1);
                return res.json();
            }).then(posts => {
                setPreviewPosts(posts);
            }).catch(() => {
                setPreviewPosts([]);
                setTotalPages(1);
            });
        } else {
            setPreviewPosts([]);
            setTotalPages(1);
        }
    }, [mode, postType, taxonomy, termId, postsPerPage, templateId, paged]);

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

    const configurableFields = getAllFields(structureNodes);

    useEffect(() => {
        if (configurableFields.length > 0 && (!selectedStyleElement || !configurableFields.find(node => node.field === selectedStyleElement))) {
            setSelectedStyleElement(configurableFields[0].field);
        }
    }, [configurableFields, selectedStyleElement]);

    const updateContent = (key, value) => {
        setAttributes({ content: { ...content, [key]: value } });
    };

    const updateStyle = (key, prop, value, isResponsive = false) => {
        const currentStyle = { ...(styles[key] || {}) };
        
        if (isResponsive) {
            const currentPropVal = currentStyle[prop];
            const responsiveObj = (typeof currentPropVal === 'object' && currentPropVal !== null) ? { ...currentPropVal } : { desktop: currentPropVal || '' };
            responsiveObj[deviceMode] = value;
            currentStyle[prop] = responsiveObj;
        } else {
            currentStyle[prop] = value;
        }

        setAttributes({
            styles: {
                ...styles,
                [key]: currentStyle
            }
        });
    };

    // Main recursive renderer for the editor preview
    const renderPreviewNodes = (nodes, post = null, parentContext = {}) => {
        return renderVisualStructure(nodes, post, parentContext, {
            styles, content, mode, currentPostTitle, currentPostExcerpt, 
            currentPostDate, currentPostAuthorName, currentPostMeta, 
            currentPostACF, uniqueId, deviceMode
        });
    };
;

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
                    const r = (val) => getResponsiveValue(val, deviceMode);

                    if (r(nodeStyle.fontWeight)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { font-weight: ${r(nodeStyle.fontWeight)} !important; } `;
                    }
                    if (r(nodeStyle.lineHeight)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { line-height: ${r(nodeStyle.lineHeight)} !important; } `;
                    }
                    if (r(nodeStyle.letterSpacing)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { letter-spacing: ${r(nodeStyle.letterSpacing)} !important; } `;
                    }
                    if (r(nodeStyle.color)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { color: ${r(nodeStyle.color)} !important; } `;
                    }
                    if (r(nodeStyle.backgroundColor)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { background-color: ${r(nodeStyle.backgroundColor)} !important; } `;
                    }
                    if (r(nodeStyle.borderColor)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { border-color: ${r(nodeStyle.borderColor)} !important; } `;
                    }
                    // border-radius: support both the generic borderRadius and the advanced borderRadiusRem
                    const _radius = r(nodeStyle.borderRadius) || (r(nodeStyle.borderRadiusRem) ? `${r(nodeStyle.borderRadiusRem)}rem` : '');
                    if (_radius) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { border-radius: ${_radius} !important; } `;
                    }
                    if (r(nodeStyle.borderWidthRem)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} { border-width: ${r(nodeStyle.borderWidthRem)}rem !important; border-style: solid !important; } `;
                    }
                    // Icon Styles with High Specificity
                    if (r(nodeStyle.iconColor)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} .rcb-button-icon { color: ${r(nodeStyle.iconColor)} !important; } `;
                    }
                    if (r(nodeStyle.iconBgColor)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} .rcb-button-icon { background-color: ${r(nodeStyle.iconBgColor)} !important; } `;
                    }
                    if (r(nodeStyle.iconBorderColor)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} .rcb-button-icon { border-color: ${r(nodeStyle.iconBorderColor)} !important; } `;
                    }
                    if (r(nodeStyle.iconBorderWidth)) {
                        css += `.rcb-instance-${uniqueId} .${node.id} .rcb-button-icon { border-width: ${r(nodeStyle.iconBorderWidth)}rem !important; border-style: solid !important; } `;
                    }
                    return css;
                }).join('\n')}
            </style>
            
                        <BlockControls group="block">
                <ToolbarGroup>
                    <ToolbarButton
                        icon="edit"
                        label="Component Settings"
                        onClick={() => console.log('Edit Settings clicked')}
                    />
                </ToolbarGroup>
            </BlockControls>
            
                        <InspectorControls>
                <TabPanel
                    className="rcb-inspector-tabs"
                    activeClass="is-active"
                    tabs={[
                        { name: 'general', title: __('General', 'reusable-component-builder'), className: 'rcb-tab-general' },
                        { name: 'styles', title: __('Styles', 'reusable-component-builder'), className: 'rcb-tab-styles' }
                    ]}
                >
                    {(tab) => (
                        <div className="rcb-tab-panel-content" style={{ marginTop: '16px' }}>
                            {tab.name === 'general' && (
                                <>

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
                        {pagination && (
                            <ToggleControl
                                label={__('Show Prev/Next Text')}
                                checked={showPaginationText !== false}
                                onChange={(val) => setAttributes({ showPaginationText: val })}
                            />
                        )}
                        {pagination && (
                            <>
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', color: '#1e1e1e' }}>
                                        {__('Pagination Font Size', 'reusable-component-builder')}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <TextControl
                                                type="number"
                                                value={paginationFontSize ? parseFloat(paginationFontSize) : 1}
                                                onChange={(val) => setAttributes({ paginationFontSize: val ? `${val}${paginationFontSize ? (paginationFontSize.match(/[a-zA-Z%]+/) || ['rem'])[0] : 'rem'}` : '1rem' })}
                                                __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                        <div style={{ width: '80px' }}>
                                            <SelectControl
                                                value={paginationFontSize ? (paginationFontSize.match(/[a-zA-Z%]+/) || ['rem'])[0] : 'rem'}
                                                options={[{ label: 'PX', value: 'px' }, { label: 'EM', value: 'em' }, { label: 'REM', value: 'rem' }, { label: 'VW', value: 'vw' }]}
                                                onChange={(newUnit) => setAttributes({ paginationFontSize: `${paginationFontSize ? parseFloat(paginationFontSize) : 1}${newUnit}` })}
                                                __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    </div>
                                    <RangeControl
                                        value={paginationFontSize ? parseFloat(paginationFontSize) : 1}
                                        onChange={(val) => setAttributes({ paginationFontSize: `${val}${paginationFontSize ? (paginationFontSize.match(/[a-zA-Z%]+/) || ['rem'])[0] : 'rem'}` })}
                                        step={paginationFontSize && paginationFontSize.includes('px') ? 1 : 0.1}
                                        min={paginationFontSize && paginationFontSize.includes('px') ? 10 : 0.5}
                                        max={paginationFontSize && paginationFontSize.includes('px') ? 100 : 10}
                                        withInputField={false}
                                        __nextHasNoMarginBottom={true}
                                    />
                                </div>
                                <PanelColorSettings
                                    title={__('Pagination Color Settings', 'reusable-component-builder')}
                                    initialOpen={false}
                                    colorSettings={[
                                        {
                                            value: paginationTextColor || '',
                                            onChange: (val) => setAttributes({ paginationTextColor: val }),
                                            label: __('Text Color'),
                                        },
                                        {
                                            value: paginationBgColor || '',
                                            onChange: (val) => setAttributes({ paginationBgColor: val }),
                                            label: __('Background Color'),
                                        },
                                        {
                                            value: paginationActiveTextColor || '',
                                            onChange: (val) => setAttributes({ paginationActiveTextColor: val }),
                                            label: __('Active Text Color'),
                                        },
                                        {
                                            value: paginationActiveBgColor || '',
                                            onChange: (val) => setAttributes({ paginationActiveBgColor: val }),
                                            label: __('Active Background Color'),
                                        }
                                    ]}
                                />
                            </>
                        )}
                        
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
                            const fieldsToRender = configurableFields.filter(node => node.type !== 'container' && node.type !== 'column');

                            return fieldsToRender.map((fieldNode) => {
                                const isDynamic = !!fieldNode.dynamicSource;
                                const dynamicLabel = isDynamic ? ` (Override ${fieldNode.dynamicSource})` : '';

                                if (fieldNode.type === 'image') {
                                return (
                                    <div key={fieldNode.id} className="rcb-field-row" style={{marginBottom: '15px'}}>
                                        <BaseControl id={`img-${fieldNode.field}`} label={`${fieldNode.field} (Image)${dynamicLabel}`}>
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
                                            label={`${fieldNode.field} (Text)${dynamicLabel}`}
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
                                        label={`${fieldNode.field} (${fieldNode.type})${dynamicLabel}`}
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
                            </>
                        )}

                            {tab.name === 'styles' && templateId > 0 && (
                                <div className="rcb-styles-tab">
                                    <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e0e0e0', marginBottom: '16px' }}>
                                        <SelectControl
                                            label={__('Select Element to Style', 'reusable-component-builder')}
                                            value={selectedStyleElement}
                                            options={configurableFields.map((node, i) => ({ label: getCleanFieldLabel(node, i, configurableFields), value: node.field }))}
                                            onChange={(val) => setSelectedStyleElement(val)}
                                        />
                                    </div>
                                    {selectedStyleElement && configurableFields.filter(node => node.field === selectedStyleElement).map((fieldNode) => {
                                        // backgroundImage as a style control only makes sense for non-image nodes (image nodes use content upload)
                                        const defaultBgImage = fieldNode.type !== 'image';
                                        const allowed = fieldNode.allowedSettings || { color: true, typography: true, spacing: true, borders: true, dimensions: fieldNode.type === 'image', backgroundImage: defaultBgImage };
                                        
                                        // Force button-specific settings only for buttons, and disable for others
                                        if (fieldNode.type === 'button') {
                                            allowed.buttonSettings = true;
                                            allowed.iconSettings = true;
                                            // Force generic settings for legacy buttons that had them disabled
                                            allowed.color = true;
                                            allowed.typography = true;
                                            allowed.spacing = true;
                                            allowed.borders = true;
                                            allowed.alignment = true;
                                        } else {
                                            allowed.buttonSettings = false;
                                            allowed.iconSettings = false;
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
                        <div key={`style-${fieldNode.id}`} className="rcb-styles-wrapper" style={{ padding: '0 16px' }}>
                            
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
                                    fontFamily={(styles[fieldNode.field] && styles[fieldNode.field].fontFamily) || ''}
                                    onChange={(prop, val, isResp) => updateStyle(fieldNode.field, prop, val, isResp)}
                                    deviceMode={deviceMode}
                                    setDeviceMode={setDeviceMode}
                                />
                            )}
                            {allowed.spacing && (
                                <>
                                    <ResponsiveControl label={__('Padding', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                        <BoxControl
                                            values={parseBoxValue(getResponsiveValue((styles[fieldNode.field] && styles[fieldNode.field].padding) || ''))}
                                            onChange={(val) => updateStyle(fieldNode.field, 'padding', serializeBoxValue(val), true)}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </ResponsiveControl>
                                    <ResponsiveControl label={__('Margin', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                        <BoxControl
                                            values={parseBoxValue(getResponsiveValue((styles[fieldNode.field] && styles[fieldNode.field].margin) || ''))}
                                            onChange={(val) => updateStyle(fieldNode.field, 'margin', serializeBoxValue(val), true)}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </ResponsiveControl>
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
                                    <ResponsiveControl label={__('Width (e.g. 100%, 300px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                        <TextControl
                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'width' ]) || ''}
                                            onChange={(val) => updateStyle(fieldNode.field, 'width', val, true)}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </ResponsiveControl>
                                    <ResponsiveControl label={__('Height (e.g. auto, 200px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                        <TextControl
                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'height' ]) || ''}
                                            onChange={(val) => updateStyle(fieldNode.field, 'height', val, true)}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </ResponsiveControl>
                                    <ResponsiveControl label={__('Min Height (e.g. 300px, 50vh)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                        <TextControl
                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'minHeight' ]) || ''}
                                            onChange={(val) => updateStyle(fieldNode.field, 'minHeight', val, true)}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </ResponsiveControl>
                                </>
                            )}
                            
                            {allowed.layoutSettings && (
                                <div className="rcb-advanced-layout-panel" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                                    
                                    {fieldNode.type === 'container' && (
                                        <>
                                            <ResponsiveControl label={__('Display Mode', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                <ToggleGroupControl
                                                    value={getResponsiveValue(styles[fieldNode.field]?.[ 'displayMode' ]) || 'grid'}
                                                    onChange={(val) => updateStyle(fieldNode.field, 'displayMode', val, true)}
                                                    isBlock
                                                    className="rcb-layout-icon-grid"
                                                    __nextHasNoMarginBottom={true}
                                                >
                                                    <ToggleGroupControlOption value="grid" label={<Dashicon icon="grid-view" title="Grid" />} />
                                                    <ToggleGroupControlOption value="flex" label={<Dashicon icon="move" title="Flexbox" />} />
                                                </ToggleGroupControl>
                                            </ResponsiveControl>

                                            <ResponsiveControl label={__('Content Max Width (px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                <RangeControl
                                                    value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'contentMaxWidth' ])) || 1200}
                                                    onChange={(val) => updateStyle(fieldNode.field, 'contentMaxWidth', val ? `${val}px` : '1200px', true)}
                                                    min={400}
                                                    max={2000}
                                                    allowReset
                                                    __nextHasNoMarginBottom={true}
                                                />
                                            </ResponsiveControl>

                                            {(getResponsiveValue(styles[fieldNode.field]?.[ 'displayMode' ]) || 'grid') === 'grid' && (
                                                <>
                                                    <SelectControl
                                                        label={__('Grid Template (Columns)', 'reusable-component-builder')}
                                                        value={getResponsiveValue(styles[fieldNode.field]?.[ 'gridTemplateColumns' ]) || ''}
                                                        options={[
                                                            { label: __('Equal Columns', 'reusable-component-builder'), value: '' },
                                                            { label: __('50 / 50', 'reusable-component-builder'), value: '1fr 1fr' },
                                                            { label: __('30 / 70', 'reusable-component-builder'), value: '3fr 7fr' },
                                                            { label: __('70 / 30', 'reusable-component-builder'), value: '7fr 3fr' },
                                                            { label: __('33 / 33 / 33', 'reusable-component-builder'), value: '1fr 1fr 1fr' },
                                                            { label: __('25 / 50 / 25', 'reusable-component-builder'), value: '1fr 2fr 1fr' },
                                                            { label: __('Custom...', 'reusable-component-builder'), value: 'custom' },
                                                        ]}
                                                        onChange={(val) => updateStyle(fieldNode.field, 'gridTemplateColumns', val, true)}
                                                    />
                                                    {(getResponsiveValue(styles[fieldNode.field]?.[ 'gridTemplateColumns' ]) === 'custom') && (
                                                        <TextControl
                                                            label={__('Custom Grid String', 'reusable-component-builder')}
                                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'customGridTemplate' ]) || ''}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'customGridTemplate', val, true)}
                                                        />
                                                    )}
                                                    
                                                    <ResponsiveControl label={__('Column Gap (px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <RangeControl
                                                            value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'gridGap' ])) || 20}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'gridGap', `${val}px`, true)}
                                                            min={0}
                                                            max={100}
                                                            __nextHasNoMarginBottom={true}
                                                        />
                                                    </ResponsiveControl>
                                                    
                                                    <ResponsiveControl label={__('Row Gap (px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <RangeControl
                                                            value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'rowGap' ])) || 20}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'rowGap', `${val}px`, true)}
                                                            min={0}
                                                            max={100}
                                                            __nextHasNoMarginBottom={true}
                                                        />
                                                    </ResponsiveControl>
                                                </>
                                            )}

                                            {(getResponsiveValue(styles[fieldNode.field]?.[ 'displayMode' ]) || 'grid') === 'flex' && (
                                                <>
                                                    <ResponsiveControl label={__('Direction', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <ToggleGroupControl
                                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'flexDirection' ]) || 'row'}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'flexDirection', val, true)}
                                                            isBlock
                                                            className="rcb-layout-icon-grid"
                                                            __nextHasNoMarginBottom={true}
                                                        >
                                                            <ToggleGroupControlOption value="row" label={<Dashicon icon="arrow-right-alt" title="Row" />} />
                                                            <ToggleGroupControlOption value="column" label={<Dashicon icon="arrow-down-alt" title="Column" />} />
                                                            <ToggleGroupControlOption value="row-reverse" label={<Dashicon icon="arrow-left-alt" title="Row Reverse" />} />
                                                            <ToggleGroupControlOption value="column-reverse" label={<Dashicon icon="arrow-up-alt" title="Column Reverse" />} />
                                                        </ToggleGroupControl>
                                                    </ResponsiveControl>

                                                    <ResponsiveControl label={__('Horizontal Align', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <ToggleGroupControl
                                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'justifyContent' ]) || 'flex-start'}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'justifyContent', val, true)}
                                                            isBlock
                                                            className="rcb-layout-icon-grid"
                                                            __nextHasNoMarginBottom={true}
                                                        >
                                                            <ToggleGroupControlOption value="flex-start" label={<Dashicon icon="editor-alignleft" />} />
                                                            <ToggleGroupControlOption value="center" label={<Dashicon icon="editor-aligncenter" />} />
                                                            <ToggleGroupControlOption value="flex-end" label={<Dashicon icon="editor-alignright" />} />
                                                            <ToggleGroupControlOption value="space-between" label={<Dashicon icon="distribute-horizontal" />} />
                                                        </ToggleGroupControl>
                                                    </ResponsiveControl>

                                                    <ResponsiveControl label={__('Vertical Align', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <ToggleGroupControl
                                                            value={getResponsiveValue(styles[fieldNode.field]?.[ 'alignItems' ]) || 'stretch'}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'alignItems', val, true)}
                                                            isBlock
                                                            className="rcb-layout-icon-grid"
                                                            __nextHasNoMarginBottom={true}
                                                        >
                                                            <ToggleGroupControlOption value="flex-start" label={<Dashicon icon="align-top" />} />
                                                            <ToggleGroupControlOption value="center" label={<Dashicon icon="align-none" />} />
                                                            <ToggleGroupControlOption value="flex-end" label={<Dashicon icon="align-bottom" />} />
                                                            <ToggleGroupControlOption value="stretch" label={<Dashicon icon="editor-justify" />} />
                                                        </ToggleGroupControl>
                                                    </ResponsiveControl>
                                                    
                                                    <ResponsiveControl label={__('Flex Gap (px)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                        <RangeControl
                                                            value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'flexGap' ])) || 0}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'flexGap', val ? `${val}px` : '0px', true)}
                                                            min={0}
                                                            max={100}
                                                            __nextHasNoMarginBottom={true}
                                                        />
                                                    </ResponsiveControl>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {fieldNode.type === 'column' && (
                                        <>
                                            <ResponsiveControl label={__('Custom Column Width', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <RangeControl
                                                            value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'customColumnWidth' ])) || 0}
                                                            onChange={(val) => updateStyle(fieldNode.field, 'customColumnWidth', val, true)}
                                                            min={0}
                                                            max={100}
                                                            withInputField={false}
                                                            __nextHasNoMarginBottom={true}
                                                        />
                                                    </div>
                                                    <TextControl
                                                        type="number"
                                                        value={parseInt(getResponsiveValue(styles[fieldNode.field]?.[ 'customColumnWidth' ])) || ''}
                                                        onChange={(val) => updateStyle(fieldNode.field, 'customColumnWidth', val, true)}
                                                        style={{ width: '60px' }}
                                                        __nextHasNoMarginBottom={true}
                                                    />
                                                    <SelectControl
                                                        value={getResponsiveValue(styles[fieldNode.field]?.[ 'customColumnWidthUnit' ]) || '%'}
                                                        options={[{ label: '%', value: '%' }, { label: 'PX', value: 'px' }, { label: 'VW', value: 'vw' }, { label: 'FR', value: 'fr' }]}
                                                        onChange={(val) => updateStyle(fieldNode.field, 'customColumnWidthUnit', val, true)}
                                                        style={{ width: '70px' }}
                                                        __nextHasNoMarginBottom={true}
                                                    />
                                                </div>
                                            </ResponsiveControl>
                                            
                                            <ResponsiveControl label={__('Align Self (Vertical)', 'reusable-component-builder')} deviceMode={deviceMode} setDeviceMode={setDeviceMode}>
                                                <ToggleGroupControl
                                                    value={getResponsiveValue(styles[fieldNode.field]?.[ 'alignSelf' ]) || ''}
                                                    onChange={(val) => updateStyle(fieldNode.field, 'alignSelf', val, true)}
                                                    isBlock
                                                    className="rcb-layout-icon-grid"
                                                    __nextHasNoMarginBottom={true}
                                                >
                                                    <ToggleGroupControlOption value="" label={<Dashicon icon="no" title="Auto" />} />
                                                    <ToggleGroupControlOption value="flex-start" label={<Dashicon icon="align-top" />} />
                                                    <ToggleGroupControlOption value="center" label={<Dashicon icon="align-none" />} />
                                                    <ToggleGroupControlOption value="flex-end" label={<Dashicon icon="align-bottom" />} />
                                                    <ToggleGroupControlOption value="stretch" label={<Dashicon icon="editor-justify" />} />
                                                </ToggleGroupControl>
                                            </ResponsiveControl>
                                        </>
                                    )}
                                </div>
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
                                    <PanelColorSettings
                                        title={__('Border Color', 'reusable-component-builder')}
                                        initialOpen={false}
                                        colorSettings={[
                                            {
                                                value: styles[fieldNode.field]?.borderColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'borderColor', val),
                                                label: __('Color', 'reusable-component-builder'),
                                            },
                                        ]}
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
                                    <PanelColorSettings
                                        title={__('Hover Settings', 'reusable-component-builder')}
                                        initialOpen={false}
                                        colorSettings={[
                                            {
                                                value: styles[fieldNode.field]?.hoverBgColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverBgColor', val),
                                                label: __('Hover Background', 'reusable-component-builder'),
                                            },
                                            {
                                                value: styles[fieldNode.field]?.hoverColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverColor', val),
                                                label: __('Hover Text Color', 'reusable-component-builder'),
                                            },
                                            {
                                                value: styles[fieldNode.field]?.hoverBorderColor || '',
                                                onChange: (val) => updateStyle(fieldNode.field, 'hoverBorderColor', val),
                                                label: __('Hover Border', 'reusable-component-builder'),
                                            },
                                        ]}
                                    />

                                    <ToggleControl
                                        label={__('Show Underline', 'reusable-component-builder')}
                                        checked={styles[fieldNode.field]?.hoverUnderline || false}
                                        onChange={(val) => updateStyle(fieldNode.field, 'hoverUnderline', val)}
                                        style={{ marginTop: '15px' }}
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
                                <div style={{ marginTop: '15px' }}>
                                    <TextareaControl
                                        label={__('Custom CSS Styles', 'reusable-component-builder')}
                                        help={__('Enter raw CSS (e.g. z-index: 99; color: red;)', 'reusable-component-builder')}
                                        value={styles[fieldNode.field]?.customStylesRaw || ''}
                                        onChange={(val) => updateStyle(fieldNode.field, 'customStylesRaw', val)}
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
                                    </div>
                                )}{/* end tab name === styles */}
                        </div>
                    )}
                </TabPanel>
            </InspectorControls>

            {(() => {
                // --- Smart Container Detection (mirrors PHP renderer logic) ---
                // When mode=query and first root node is a Container:
                //   - Use Container's layout styles for the outer wrapper
                //   - Use Container's appearance styles on each loop item
                //   - Render only Container's children inside each loop item
                const firstNode = structureNodes && structureNodes[0];
                const rootIsContainer = firstNode && firstNode.type === 'container' && mode === 'query';

                let wrapperStyle = {};
                let loopItemExtraStyle = {};
                let loopNodes = structureNodes;
                let loopItemExtraClass = '';

                if (rootIsContainer) {
                    const cRaw = (styles && styles[firstNode.field]) || {};
                    const getR = (v) => getResponsiveValue(v, deviceMode);
                    const displayMode = getR(cRaw.displayMode) || 'grid';

                    if (displayMode === 'flex') {
                        wrapperStyle = {
                            display: 'flex',
                            flexDirection: getR(cRaw.flexDirection) || 'row',
                            flexWrap: getR(cRaw.flexWrap) || 'wrap',
                            justifyContent: getR(cRaw.justifyContent) || 'flex-start',
                            alignItems: getR(cRaw.alignItems) || 'stretch',
                            gap: getR(cRaw.flexGap) || undefined,
                        };
                    } else {
                        const nodeColsC = firstNode.columns || columns || 3;
                        let tCols = getR(cRaw.gridTemplateColumns);
                        if (tCols === 'custom') tCols = getR(cRaw.customGridTemplate);
                        if (!tCols) tCols = `repeat(${nodeColsC}, 1fr)`;
                        const gGap = getR(cRaw.gridGap);
                        const rGap = getR(cRaw.rowGap);
                        wrapperStyle = {
                            display: 'grid',
                            gridTemplateColumns: tCols,
                            columnGap: gGap || '20px',
                            rowGap: rGap || gGap || '20px',
                        };
                    }

                    const maxW = getR(cRaw.contentMaxWidth);
                    if (maxW) {
                        wrapperStyle.maxWidth = maxW;
                        wrapperStyle.marginLeft = 'auto';
                        wrapperStyle.marginRight = 'auto';
                        wrapperStyle.width = '100%';
                    }

                    // backgroundColor → OUTER WRAPPER (appears once, covers the entire grid + gaps)
                    const bgColor = getR(cRaw.backgroundColor);
                    if (bgColor) wrapperStyle.backgroundColor = bgColor;

                    // Background image → OUTER WRAPPER
                    const bgUrlKey = `${firstNode.field}_bg_url`;
                    if (content && content[bgUrlKey]) {
                        wrapperStyle.backgroundImage    = `url(${content[bgUrlKey]})`;
                        wrapperStyle.backgroundSize     = cRaw.backgroundSize     || 'cover';
                        wrapperStyle.backgroundPosition = cRaw.backgroundPosition || 'center';
                        wrapperStyle.backgroundRepeat   = cRaw.backgroundRepeat   || 'no-repeat';
                    }

                    // All other appearance styles → each LOOP ITEM (border, padding, radius on individual cards)
                    const itemAppearanceKeys = ['color','padding','margin','borderRadius','border','minHeight','overflow','boxShadow'];
                    itemAppearanceKeys.forEach(k => {
                        const v = getR(cRaw[k]);
                        if (v !== undefined && v !== '' && v !== null) {
                            loopItemExtraStyle[k] = v;
                        }
                    });

                    loopNodes = firstNode.children || [];
                    loopItemExtraClass = `rcb-container ${firstNode.id}`;
                } else {
                    wrapperStyle = layout === 'grid' && mode === 'query'
                        ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '20px' }
                        : {};
                }

                return (
                    <div
                        className={`rcb-editor-preview-container rcb-preview-${deviceMode}${mode === 'query' ? ' rcb-layout-' + layout : ''}`}
                        style={wrapperStyle}
                    >
                        {!templateId ? (
                            <div style={{padding: '30px', border: '1px dashed #ccc', textAlign: 'center', background: '#f5f5f5'}}>
                                {__('Error: No template variation assigned to this block!', 'reusable-component-builder')}
                            </div>
                        ) : (
                            mode === 'query' ? (
                                previewPosts.length > 0 ? (
                                    <>
                                        {previewPosts.map((post, idx) => (
                                            <div
                                                key={`post-${idx}`}
                                                className={`rcb-instance rcb-instance-${uniqueId}${loopItemExtraClass ? ' ' + loopItemExtraClass : ''}`}
                                                style={loopItemExtraStyle}
                                            >
                                                {renderPreviewNodes(loopNodes, post)}
                                            </div>
                                        ))}
                                        {pagination && totalPages > 1 && (() => {
                                            const pages = [];
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                            const leftArrowSvg = <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}><path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
                                            const rightArrowSvg = <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

                                            return (
                                                <div className="rcb-pagination" style={{
                                                    display: 'flex', gap: '5px', width: '100%', justifyContent: 'space-between', gridColumn: '1 / -1', flexWrap: 'wrap', alignItems: 'center',
                                                    marginTop: '20px', fontSize: paginationFontSize || '1rem'
                                                }}>
                                                    <span onClick={() => paged > 1 && setPaged(paged - 1)} style={{
                                                        padding: '8px 16px', border: '1px solid #ccc', cursor: paged > 1 ? 'pointer' : 'not-allowed', textDecoration: 'none',
                                                        backgroundColor: paginationBgColor || '#fff', color: paginationTextColor || '#333',
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: paged > 1 ? 1 : 0.5
                                                    }}>
                                                        {leftArrowSvg} {showPaginationText !== false && 'Previous'}
                                                    </span>
                                                    
                                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                        {pages.map(i => (
                                                            <span key={`pg-${i}`} onClick={() => setPaged(i)} style={{
                                                                padding: '8px 16px', border: '1px solid #ccc', cursor: 'pointer', textDecoration: 'none',
                                                                backgroundColor: paged === i ? (paginationActiveBgColor || '#c82333') : (paginationBgColor || '#fff'),
                                                                color: paged === i ? (paginationActiveTextColor || '#fff') : (paginationTextColor || '#333'),
                                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                {i}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <span onClick={() => paged < totalPages && setPaged(paged + 1)} style={{
                                                        padding: '8px 16px', border: '1px solid #ccc', cursor: paged < totalPages ? 'pointer' : 'not-allowed', textDecoration: 'none',
                                                        backgroundColor: paginationBgColor || '#fff', color: paginationTextColor || '#333',
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: paged < totalPages ? 1 : 0.5
                                                    }}>
                                                        {showPaginationText !== false && 'Next'} {rightArrowSvg}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </>
                                ) : <div style={{padding: '20px', background: '#e0e0e0'}}>Loading posts...</div>
                            ) : (
                                <div className={`rcb-instance rcb-instance-${uniqueId}`}>
                                    {renderPreviewNodes(structureNodes)}
                                </div>
                            )
                        )}
                    </div>
                );
            })()}
        </div>
    );
}
