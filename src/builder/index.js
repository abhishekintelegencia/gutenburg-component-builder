import { render, useState, useEffect } from '@wordpress/element';
import { Button, TextControl, SelectControl, CheckboxControl, Modal, TextareaControl } from '@wordpress/components';
import './style.scss';

const CATEGORIZED_STYLE_OPTIONS = [
    {
        title: 'Colors & Background',
        options: [
            { id: 'color', label: 'Color (Text & Background)' },
            { id: 'backgroundImage', label: 'Background Image' },
        ],
    },
    {
        title: 'Typography',
        options: [
            { id: 'typography', label: 'Typography (Font Size, Weight, etc)' },
            { id: 'alignment', label: 'Text Alignment' },
        ],
    },
    {
        title: 'Spacing & Dimensions',
        options: [
            { id: 'spacing', label: 'Spacing (Padding, Margin)' },
            { id: 'dimensions', label: 'Dimensions (Width/Height)' },
        ],
    },
    {
        title: 'Borders & Effects',
        options: [
            { id: 'borders', label: 'Borders & Radius' },
            { id: 'boxShadow', label: 'Box Shadow' },
            { id: 'opacity', label: 'Opacity' },
        ],
    },
    {
        title: 'Advanced Layout',
        options: [
            { id: 'zIndex', label: 'Z-Index' },
            { id: 'overflow', label: 'Overflow' },
            { id: 'visibility', label: 'Visibility' },
            { id: 'cursor', label: 'Cursor' },
        ],
    },
    {
        title: 'Animations & Filters',
        options: [
            { id: 'transition', label: 'Transition' },
            { id: 'filter', label: 'Filter' },
            { id: 'backdropFilter', label: 'Backdrop Filter' },
            { id: 'transform', label: 'Transform' },
        ],
    },
    {
        title: 'Button Settings',
        options: [
            { id: 'buttonSettings', label: 'Button Settings (Text, Size, Padding, Hover, etc)' },
        ],
    },
    {
        title: 'Icon Settings',
        options: [
            { id: 'iconSettings', label: 'Icon Settings (Icon Type, Colors, Hover)' },
        ],
    },
    {
        title: 'Custom',
        options: [
            { id: 'customStylesBox', label: 'Custom CSS Box' },
        ],
    }
];

// Recursive Component
const NodeEditor = ({ node, updateNode, removeNode, duplicateNode, addChild, moveNodeUp, moveNodeDown, styleRegistry = [], parentType = null, templateType = 'query' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('Colors & Background');

    const toggleSetting = (setting) => {
        const allowed = node.allowedSettings || {};
        updateNode({
            ...node,
            allowedSettings: { ...allowed, [setting]: !allowed[setting] }
        });
    };



    return (
        <div className={`rcb-node-visual ${node.type === 'container' ? 'is-container' : ''}`}>
            <div className="rcb-node-visual-header">
                <span className="rcb-node-visual-title">{node.type === 'container' ? 'Container block' : node.type.charAt(0).toUpperCase() + node.type.slice(1)}</span>
                
                <div className="rcb-node-actions">
                    {moveNodeUp && <Button isSmall variant="tertiary" icon="arrow-up-alt2" onClick={moveNodeUp} title="Move Up" />}
                    {moveNodeDown && <Button isSmall variant="tertiary" icon="arrow-down-alt2" onClick={moveNodeDown} title="Move Down" />}
                    <Button isSmall variant="tertiary" onClick={() => setIsEditing(true)}>Edit Settings</Button>
                    {duplicateNode && <Button isSmall variant="tertiary" icon="admin-page" onClick={duplicateNode} title="Duplicate" />}
                    <Button isSmall isDestructive variant="tertiary" icon="trash" onClick={removeNode} title="Remove" />
                </div>
            </div>

            {isEditing && (
                <Modal title={`Edit ${node.type.toUpperCase()} Settings`} onRequestClose={() => setIsEditing(false)}>
                    <div className="rcb-settings-modal">
                        <TextControl
                            label={node.type === 'container' || node.type === 'column' ? "Container ID/Field (Must be unique)" : "Field Key (Must be unique)"}
                            value={node.field || ''}
                            onChange={(val) => updateNode({ ...node, field: val })}
                            help="Used to map content and settings in the Block editor."
                        />
                        {node.type !== 'container' && node.type !== 'column' && node.type !== 'innerblocks' && (
                            <div style={{marginTop: '15px', padding: '15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px'}}>
                                <strong>Dynamic Content Binding</strong>
                                <p style={{fontSize: '11px', color: '#666', marginBottom: '10px'}}>In a Query Loop, this applies to each post. In a Static Layout, this applies to the current page/post.</p>
                                <SelectControl
                                    label="Dynamic Source"
                                    value={node.dynamicSource || ''}
                                    options={[
                                        { label: 'Static Template Content', value: '' },
                                        { label: 'Post Title', value: 'post_title' },
                                        { label: 'Post Excerpt', value: 'post_excerpt' },
                                        { label: 'Post Date', value: 'post_date' },
                                        { label: 'Post Author', value: 'post_author' },
                                        { label: 'Featured Image', value: 'featured_image' },
                                        { label: 'Permalink', value: 'permalink' },
                                        { label: 'Taxonomy Term', value: 'term' },
                                        { label: 'Custom Meta Field', value: 'custom_meta' }
                                    ]}
                                    onChange={(val) => updateNode({ ...node, dynamicSource: val })}
                                />
                                {(node.dynamicSource === 'term' || node.dynamicSource === 'custom_meta') && (
                                    <TextControl
                                        label={node.dynamicSource === 'term' ? "Taxonomy Slug (e.g. category, event_category)" : "Meta Key (e.g. _my_custom_field)"}
                                        value={node.dynamicField || ''}
                                        onChange={(val) => updateNode({ ...node, dynamicField: val })}
                                        help={node.dynamicSource === 'term' ? "Enter the taxonomy slug to retrieve the first term." : "Enter the exact post meta key."}
                                    />
                                )}
                            </div>
                        )}
                        {node.type === 'container' && (
                            <div className="rcb-column-selector" style={{marginBottom: '20px'}}>
                                <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Column Structure</label>
                                <div style={{display: 'flex', gap: '10px'}}>
                                    {[1, 2, 3].map(cols => {
                                        const genId = (t) => `${t}_${Math.random().toString(36).substr(2, 6)}`;
                                        return (
                                            <Button
                                                key={cols}
                                                isPrimary={node.columns === cols}
                                                variant={node.columns === cols ? 'primary' : 'secondary'}
                                                onClick={() => {
                                                    // Separate existing cols from non-col children
                                                    const existingCols = (node.children || []).filter(c => c.type === 'column');
                                                    const nonColChildren = (node.children || []).filter(c => c.type !== 'column');

                                                    if (cols === 1) {
                                                        // No column wrappers — keep non-col children only (column children stay but hidden in grid)
                                                        updateNode({ ...node, columns: 1, children: nonColChildren });
                                                    } else {
                                                        let syncedCols;
                                                        if (existingCols.length === cols) {
                                                            syncedCols = existingCols;
                                                        } else if (existingCols.length < cols) {
                                                            const toAdd = cols - existingCols.length;
                                                            const added = Array.from({ length: toAdd }).map(() => ({
                                                                id: genId('column'),
                                                                type: 'column',
                                                                field: genId('column'),
                                                                children: [],
                                                                allowedSettings: { color: true, spacing: true }
                                                            }));
                                                            syncedCols = [...existingCols, ...added];
                                                        } else {
                                                            // Trim: simply discard the extra columns (don't carry over their children)
                                                            syncedCols = existingCols.slice(0, cols);
                                                        }
                                                        updateNode({ ...node, columns: cols, children: syncedCols });
                                                    }
                                                }}
                                                style={{ width: '60px', height: '40px', display: 'flex', flexDirection: 'column', padding: '5px' }}
                                            >
                                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px', width: '100%', height: '100%' }}>
                                                    {Array.from({ length: cols }).map((_, i) => (
                                                        <div key={i} style={{ background: node.columns === cols ? '#fff' : '#ccc' }}></div>
                                                    ))}
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <fieldset style={{border: '1px solid #ddd', padding: '15px', borderRadius: '4px'}}>
                            <legend style={{padding: '0 10px', fontWeight: 'bold'}}>Allowed Style Controls (For Block Editor)</legend>
                            
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ flex: '0 0 200px', borderRight: '1px solid #ddd', paddingRight: '10px' }}>
                                    {CATEGORIZED_STYLE_OPTIONS.filter(cat => {
                                        if (node.type === 'button') {
                                            return cat.title !== 'Button Settings' && cat.title !== 'Icon Settings';
                                        }
                                        return true;
                                    }).map((cat) => (
                                        <div 
                                            key={cat.title}
                                            onClick={() => setActiveTab(cat.title)}
                                            style={{
                                                padding: '8px 10px', 
                                                cursor: 'pointer', 
                                                backgroundColor: activeTab === cat.title ? '#007cba' : 'transparent',
                                                color: activeTab === cat.title ? '#fff' : '#3c434a',
                                                borderRadius: '3px',
                                                marginBottom: '5px',
                                                fontWeight: activeTab === cat.title ? '600' : '400'
                                            }}
                                        >
                                            {cat.title}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ flex: '1', display: 'grid', gridTemplateColumns: '1fr', gap: '10px', alignContent: 'start' }}>
                                    {CATEGORIZED_STYLE_OPTIONS.find(c => c.title === activeTab)?.options.map(opt => (
                                        <CheckboxControl
                                            key={opt.id}
                                            label={opt.label}
                                            checked={node.allowedSettings?.[opt.id] || false}
                                            onChange={() => toggleSetting(opt.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </fieldset>

                        <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                             <Button isPrimary onClick={() => setIsEditing(false)}>Done</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Single unified children render */}
            {node.children && node.children.length > 0 && (() => {
                const colNodes = node.children.filter(c => c.type === 'column');
                const otherNodes = node.children.filter(c => c.type !== 'column');
                const isGrid = node.type === 'container' && (node.columns || 1) > 1 && colNodes.length > 0;

                return (
                    <>
                        {isGrid ? (
                            // Grid view: only the N column nodes side-by-side
                            <div
                                className="rcb-column-grid"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${node.columns}, 1fr)`,
                                    gap: '12px',
                                    border: '1px dashed #bbb',
                                    padding: '10px',
                                    marginTop: '10px',
                                    borderRadius: '4px',
                                }}
                            >
                                {colNodes.map((child, index) => (
                                    <NodeEditor
                                        key={child.id}
                                        node={child}
                                        parentType="container"
                                        templateType={templateType}
                                        updateNode={(updated) => {
                                            const next = node.children.map(c => c.id === child.id ? updated : c);
                                            updateNode({ ...node, children: next });
                                        }}
                                        removeNode={() => {
                                            updateNode({ ...node, children: node.children.filter(c => c.id !== child.id) });
                                        }}
                                        duplicateNode={() => {
                                            const genId = (t) => `${t}_${Math.random().toString(36).substr(2, 6)}`;
                                            const deepClone = (n) => {
                                                const cln = { ...n, id: genId(n.type), field: genId(n.type) };
                                                if (cln.children) cln.children = cln.children.map(deepClone);
                                                return cln;
                                            };
                                            const next = [...node.children];
                                            const idx = next.findIndex(c => c.id === child.id);
                                            next.splice(idx + 1, 0, deepClone(child));
                                            updateNode({ ...node, children: next });
                                        }}
                                        addChild={addChild}
                                        moveNodeUp={null}
                                        moveNodeDown={null}
                                        styleRegistry={styleRegistry}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Normal stacked view (single column or no column nodes)
                            <div className="rcb-node-children">
                                {node.children.map((child, index) => (
                                    <NodeEditor
                                        key={child.id}
                                        node={child}
                                        parentType={node.type}
                                        templateType={templateType}
                                        updateNode={(updated) => {
                                            const next = [...node.children];
                                            next[index] = updated;
                                            updateNode({ ...node, children: next });
                                        }}
                                        removeNode={() => {
                                            updateNode({ ...node, children: node.children.filter((_, i) => i !== index) });
                                        }}
                                        duplicateNode={() => {
                                            const genId = (t) => `${t}_${Math.random().toString(36).substr(2, 6)}`;
                                            const deepClone = (n) => {
                                                const cln = { ...n, id: genId(n.type), field: genId(n.type) };
                                                if (cln.children) cln.children = cln.children.map(deepClone);
                                                return cln;
                                            };
                                            const next = [...node.children];
                                            next.splice(index + 1, 0, deepClone(child));
                                            updateNode({ ...node, children: next });
                                        }}
                                        addChild={addChild}
                                        moveNodeUp={index > 0 ? () => {
                                            const next = [...node.children];
                                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                            updateNode({ ...node, children: next });
                                        } : null}
                                        moveNodeDown={index < node.children.length - 1 ? () => {
                                            const next = [...node.children];
                                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                                            updateNode({ ...node, children: next });
                                        } : null}
                                        styleRegistry={styleRegistry}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                );
            })()}
            {(node.type === 'container' || node.type === 'column') && (
                <div className="rcb-add-inside">
                    <AddElementButton
                        onAdd={(type) => addChild(node.id, type)}
                        label="+ Add Block inside"
                        insideColumn={node.type === 'column'}
                    />
                </div>
            )}
        </div>
    );
};

const AddElementButton = ({ onAdd, label = "Add Element", insideColumn = false }) => {
    const [type, setType] = useState('');

    const allOptions = [
        { label: 'Container', value: 'container' },
        { label: 'Heading', value: 'heading' },
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Button', value: 'button' },
        { label: 'InnerBlocks (Gutenberg Slot)', value: 'innerblocks' },
    ];

    // Only show Container option at top-level containers, not inside columns
    const options = insideColumn
        ? allOptions.filter(o => o.value !== 'container')
        : allOptions;

    return (
        <div className="rcb-inline-add">
            {type === '' ? (
                 <Button variant="tertiary" onClick={() => setType('heading')}>{label}</Button>
            ) : (
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <SelectControl
                            value={type}
                            options={options}
                            onChange={(val) => setType(val)}
                            style={{marginBottom: 0}}
                        />
                    <Button isPrimary onClick={() => { onAdd(type); setType(''); }}>Add</Button>
                    <Button isSecondary onClick={() => setType('')}>Cancel</Button>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const inputElement = document.getElementById('rcb_component_structure_input');
    const typeInputElement = document.getElementById('rcb-template-type-data');
    const initialData = inputElement && inputElement.value ? JSON.parse(inputElement.value) : {};
    const defaultType = typeInputElement && typeInputElement.value ? typeInputElement.value : 'visual';
    
    // Removed global style registry dependency
    const generateId = (type) => `${type}_${Math.random().toString(36).substr(2, 6)}`;

    // Helper for old data missing fields on containers
    function mapLegacyNodes(node) {
        if (!node.field && node.type === 'container') {
            node.field = generateId('container');
        }
        if (node.children) {
            node.children = node.children.map(c => mapLegacyNodes(c));
        }
        return node;
    }

    const defaultStructure = initialData.structure ? initialData.structure.map(n => mapLegacyNodes(n)) : [];
    const defaultGlobalStyles = initialData.globalCustomStyles || [];
    
    const [structure, setStructure] = useState(defaultStructure);
    const [globalCustomStyles, setGlobalCustomStyles] = useState(defaultGlobalStyles);
    const [globalAllowedSettings, setGlobalAllowedSettings] = useState(initialData.globalAllowedSettings || { color: true, spacing: true });
    const [templateType, setTemplateType] = useState(defaultType);
    const [isEditingGlobal, setIsEditingGlobal] = useState(false);
    const [globalActiveTab, setGlobalActiveTab] = useState('Colors & Background');

    useEffect(() => {
        if (inputElement) {
            inputElement.value = JSON.stringify({ structure, globalCustomStyles, globalAllowedSettings });
        }
        if (typeInputElement) {
            typeInputElement.value = templateType;
        }
    }, [structure, globalCustomStyles, globalAllowedSettings, templateType]);

    const addRootElement = (type) => {
        const id = generateId(type);
        const newNode = {
            id,
            type,
            field: generateId(type),
            allowedSettings: { 
                color: type !== 'button', 
                typography: type !== 'button', 
                spacing: type !== 'button', 
                borders: type !== 'button', 
                alignment: type !== 'button',
                opacity: true, 
                boxShadow: true, 
                customStylesBox: true, 
                dimensions: type === 'image', 
                backgroundImage: type === 'container' || type === 'column',
                buttonSettings: type === 'button',
                iconSettings: type === 'button'
            },
            ...(type === 'container' || type === 'column' ? { children: [] } : {})
        };
        setStructure([...structure, newNode]);
    };

    const addChildToNode = (nodes, parentId, type) => {
        return nodes.map((node) => {
            if (node.id === parentId && (node.type === 'container' || node.type === 'column')) {
                const subId = generateId(type);
                const newNode = {
                    id: subId,
                    type,
                    field: generateId(type),
                    allowedSettings: { 
                        color: type !== 'button', 
                        typography: type !== 'button', 
                        spacing: type !== 'button', 
                        borders: type !== 'button', 
                        alignment: type !== 'button',
                        opacity: true, 
                        boxShadow: true, 
                        customStylesBox: true, 
                        dimensions: type === 'image', 
                        backgroundImage: type === 'container' || type === 'column',
                        buttonSettings: type === 'button',
                        iconSettings: type === 'button'
                    },
                    ...(type === 'container' || type === 'column' ? { children: [] } : {})
                };
                return { ...node, children: [...(node.children || []), newNode] };
            } else if ((node.type === 'container' || node.type === 'column') && node.children) {
                return { ...node, children: addChildToNode(node.children, parentId, type) };
            }
            return node;
        });
    };

    const handleAddChild = (parentId, type) => {
        setStructure(addChildToNode(structure, parentId, type));
    };

    // Extract dynamic fields for sidebar
    const getAllFields = (nodes) => {
        let fields = [];
        nodes.forEach(node => {
            if (node.field) fields.push({ field: node.field, type: node.type });
            if (node.children) fields = fields.concat(getAllFields(node.children));
        });
        return fields;
    };
    const availableFields = getAllFields(structure);

    return (
        <div className="rcb-new-builder-layout">
            <div className="rcb-main-area">
                <div className="rcb-builder-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <div>
                            <h3>Template Builder</h3>
                            <p>Build your layout visually. Add components below and configure their unique field IDs.</p>
                        </div>
                        <Button isPrimary onClick={() => setIsEditingGlobal(true)}>
                            Global Component Settings (Root Block)
                        </Button>
                    </div>
                    <div style={{background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', width: '100%', display: 'flex', gap: '20px', alignItems: 'center'}}>
                        <strong style={{minWidth: '150px'}}>Component Type:</strong>
                        <SelectControl
                            value={templateType}
                            options={[
                                { label: 'Static Visual Layout', value: 'visual' },
                                { label: 'Dynamic Post Loop', value: 'query' }
                            ]}
                            onChange={(val) => setTemplateType(val)}
                            style={{marginBottom: '0', minWidth: '250px'}}
                        />
                        <span style={{fontSize: '12px', color: '#666', fontStyle: 'italic', display: 'inline-block', lineHeight: '1.4'}}>
                            {templateType === 'query' ? 'Will render as a loop. Dynamic Content Bindings will pull data automatically.' : 'Will render exactly as designed. Content input via block attributes.'}
                        </span>
                    </div>
                </div>

                {/* Global Settings Modal */}
                {isEditingGlobal && (
                    <Modal title="Global Component Settings (Root Block)" onRequestClose={() => setIsEditingGlobal(false)}>
                        <div style={{minWidth: '400px', padding: '10px'}}>
                            <p>Enable/Disable style controls for the entire block wrapper in the Gutenberg sidebar.</p>
                            
                            <fieldset style={{border: '1px solid #ddd', padding: '15px', borderRadius: '4px'}}>
                                <legend style={{padding: '0 10px', fontWeight: 'bold'}}>Global Style Controls</legend>
                                
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ flex: '0 0 200px', borderRight: '1px solid #ddd', paddingRight: '10px' }}>
                                        {CATEGORIZED_STYLE_OPTIONS.map((cat) => (
                                            <div 
                                                key={cat.title}
                                                onClick={() => setGlobalActiveTab(cat.title)}
                                                style={{
                                                    padding: '8px 10px', 
                                                    cursor: 'pointer', 
                                                    backgroundColor: globalActiveTab === cat.title ? '#007cba' : 'transparent',
                                                    color: globalActiveTab === cat.title ? '#fff' : '#3c434a',
                                                    borderRadius: '3px',
                                                    marginBottom: '5px',
                                                    fontWeight: globalActiveTab === cat.title ? '600' : '400'
                                                }}
                                            >
                                                {cat.title}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ flex: '1', display: 'grid', gridTemplateColumns: '1fr', gap: '10px', alignContent: 'start' }}>
                                        {CATEGORIZED_STYLE_OPTIONS.find(c => c.title === globalActiveTab)?.options.map(opt => (
                                            <CheckboxControl
                                                key={opt.id}
                                                label={opt.label}
                                                checked={globalAllowedSettings[opt.id] || false}
                                                onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, [opt.id]: !globalAllowedSettings[opt.id]})}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </fieldset>

                            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end'}}>
                                 <Button isPrimary onClick={() => setIsEditingGlobal(false)}>Done</Button>
                            </div>
                        </div>
                    </Modal>
                )}

                <div className="rcb-visual-canvas">
                    {structure.length === 0 && (
                        <div style={{padding: '30px', textAlign: 'center', background: '#f9f9f9', border: '1px dashed #ccc'}}>
                            Start by adding a Container Block.
                        </div>
                    )}
                    {structure.map((node, index) => (
                        <NodeEditor
                            key={node.id}
                            node={node}
                            templateType={templateType}
                            updateNode={(updatedNode) => {
                                const newStructure = [...structure];
                                newStructure[index] = updatedNode;
                                setStructure(newStructure);
                            }}
                            removeNode={() => {
                                const newStructure = structure.filter((_, i) => i !== index);
                                setStructure(newStructure);
                            }}
                            duplicateNode={() => {
                                const genId = (t) => `${t}_${Math.random().toString(36).substr(2, 6)}`;
                                const deepClone = (n) => {
                                    const cln = { ...n, id: genId(n.type), field: genId(n.type) };
                                    if (cln.children) cln.children = cln.children.map(deepClone);
                                    return cln;
                                };
                                const newStructure = [...structure];
                                newStructure.splice(index + 1, 0, deepClone(node));
                                setStructure(newStructure);
                            }}
                            moveNodeUp={index > 0 ? () => {
                                const newStructure = [...structure];
                                const temp = newStructure[index - 1];
                                newStructure[index - 1] = newStructure[index];
                                newStructure[index] = temp;
                                setStructure(newStructure);
                            } : null}
                            moveNodeDown={index < structure.length - 1 ? () => {
                                const newStructure = [...structure];
                                const temp = newStructure[index + 1];
                                newStructure[index + 1] = newStructure[index];
                                newStructure[index] = temp;
                                setStructure(newStructure);
                            } : null}
                            addChild={handleAddChild}
                        />
                    ))}
                    
                    <div className="rcb-root-add-area">
                        <AddElementButton onAdd={addRootElement} label="+ Add Root Block" />
                    </div>
                </div>

            </div>
            
            <div className="rcb-sidebar-area">
                <div className="rcb-sidebar">
                    <div style={{padding: '15px'}}>
                        <strong>Available Fields:</strong>
                        <p style={{fontSize: '11px', color: '#666'}}>Use these generic visual fields which map to component content.</p>
                        <div className="available-fields-list">
                            {availableFields.map(f => (
                                <div key={f.field} className="field-item">
                                    <span className="field-name">{f.field}</span>
                                    <span className="field-type">({f.type})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

window.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('rcb-template-builder-root');
    if (rootEl) {
        render(<App />, rootEl);
    }
});
