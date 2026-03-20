import { render, useState, useEffect } from '@wordpress/element';
import { Button, TextControl, SelectControl, CheckboxControl, Modal, TextareaControl } from '@wordpress/components';
import './style.scss';

// Recursive Component
const NodeEditor = ({ node, updateNode, removeNode, duplicateNode, addChild, moveNodeUp, moveNodeDown, styleRegistry = [], parentType = null }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newStyleKey, setNewStyleKey] = useState('');

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
                            
                            <div className="rcb-settings-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                <CheckboxControl
                                    label="Color (Text & Background)"
                                    checked={node.allowedSettings?.color || false}
                                    onChange={() => toggleSetting('color')}
                                />
                                {node.type === 'container' && (
                                    <CheckboxControl
                                        label="Background Image"
                                        checked={node.allowedSettings?.backgroundImage || false}
                                        onChange={() => toggleSetting('backgroundImage')}
                                    />
                                )}
                                {node.type !== 'image' && (
                                    <CheckboxControl
                                        label="Typography (Font Size)"
                                        checked={node.allowedSettings?.typography || false}
                                        onChange={() => toggleSetting('typography')}
                                    />
                                )}
                                <CheckboxControl
                                    label="Spacing (Padding, Margin)"
                                    checked={node.allowedSettings?.spacing || false}
                                    onChange={() => toggleSetting('spacing')}
                                />
                                <CheckboxControl
                                    label="Alignment"
                                    checked={node.allowedSettings?.alignment || false}
                                    onChange={() => toggleSetting('alignment')}
                                />
                                <CheckboxControl
                                    label="Borders & Radius"
                                    checked={node.allowedSettings?.borders || false}
                                    onChange={() => toggleSetting('borders')}
                                />
                                {node.type === 'image' && (
                                    <CheckboxControl
                                        label="Dimensions (Width/Height)"
                                        checked={node.allowedSettings?.dimensions || false}
                                        onChange={() => toggleSetting('dimensions')}
                                    />
                                )}
                                <CheckboxControl
                                    label="Opacity"
                                    checked={node.allowedSettings?.opacity || false}
                                    onChange={() => toggleSetting('opacity')}
                                />
                                <CheckboxControl
                                    label="Box Shadow"
                                    checked={node.allowedSettings?.boxShadow || false}
                                    onChange={() => toggleSetting('boxShadow')}
                                />
                                <CheckboxControl
                                    label="Custom Styles Box"
                                    checked={node.allowedSettings?.customStylesBox || false}
                                    onChange={() => toggleSetting('customStylesBox')}
                                />


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
    const initialData = inputElement && inputElement.value ? JSON.parse(inputElement.value) : {};
    
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
    const [isEditingGlobal, setIsEditingGlobal] = useState(false);

    useEffect(() => {
        if (inputElement) {
            inputElement.value = JSON.stringify({ structure, globalCustomStyles, globalAllowedSettings });
        }
    }, [structure, globalCustomStyles, globalAllowedSettings]);

    const addRootElement = (type) => {
        const id = generateId(type);
        const newNode = {
            id,
            type,
            field: generateId(type),
            allowedSettings: { color: true, typography: true, spacing: true, borders: true, opacity: false, boxShadow: false, customStylesBox: false, dimensions: type === 'image', backgroundImage: type === 'container' },
            ...(type === 'container' ? { children: [] } : {})
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
                    allowedSettings: { color: true, typography: true, spacing: true, borders: true, opacity: false, boxShadow: false, customStylesBox: false, dimensions: type === 'image', backgroundImage: type === 'container' },
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
                <div className="rcb-builder-header">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h3>Template Builder</h3>
                            <p>Build your layout visually. Add components below and configure their unique field IDs.</p>
                        </div>
                        <Button isPrimary onClick={() => setIsEditingGlobal(true)}>
                            Global Component Settings (Root Block)
                        </Button>
                    </div>
                </div>

                {/* Global Settings Modal */}
                {isEditingGlobal && (
                    <Modal title="Global Component Settings (Root Block)" onRequestClose={() => setIsEditingGlobal(false)}>
                        <div style={{minWidth: '400px', padding: '10px'}}>
                            <p>Enable/Disable style controls for the entire block wrapper in the Gutenberg sidebar.</p>
                            
                            <fieldset style={{border: '1px solid #ddd', padding: '15px', borderRadius: '4px'}}>
                                <legend style={{padding: '0 10px', fontWeight: 'bold'}}>Global Style Controls</legend>
                                
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                    <CheckboxControl
                                        label="Color (Text & Background)"
                                        checked={globalAllowedSettings.color || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, color: !globalAllowedSettings.color})}
                                    />
                                    <CheckboxControl
                                        label="Spacing (Padding, Margin)"
                                        checked={globalAllowedSettings.spacing || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, spacing: !globalAllowedSettings.spacing})}
                                    />
                                    <CheckboxControl
                                        label="Typography (Global)"
                                        checked={globalAllowedSettings.typography || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, typography: !globalAllowedSettings.typography})}
                                    />
                                    <CheckboxControl
                                        label="Borders & Radius"
                                        checked={globalAllowedSettings.borders || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, borders: !globalAllowedSettings.borders})}
                                    />

                                    <CheckboxControl
                                        label="Opacity"
                                        checked={globalAllowedSettings.opacity || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, opacity: !globalAllowedSettings.opacity})}
                                    />
                                    <CheckboxControl
                                        label="Box Shadow"
                                        checked={globalAllowedSettings.boxShadow || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, boxShadow: !globalAllowedSettings.boxShadow})}
                                    />
                                    <CheckboxControl
                                        label="Custom Styles Box"
                                        checked={globalAllowedSettings.customStylesBox || false}
                                        onChange={() => setGlobalAllowedSettings({...globalAllowedSettings, customStylesBox: !globalAllowedSettings.customStylesBox})}
                                    />
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
