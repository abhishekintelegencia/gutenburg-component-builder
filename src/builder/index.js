import { render, useState, useEffect } from '@wordpress/element';
import { Button, TextControl, SelectControl, CheckboxControl, Modal } from '@wordpress/components';
import './style.scss';

// Recursive Component
const NodeEditor = ({ node, updateNode, removeNode, addChild, moveNodeUp, moveNodeDown }) => {
    const [isEditing, setIsEditing] = useState(false);

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
                    <Button isSmall isDestructive variant="tertiary" icon="trash" onClick={removeNode} title="Remove" />
                </div>
            </div>

            {isEditing && (
                <Modal title={`Edit ${node.type.toUpperCase()} Settings`} onRequestClose={() => setIsEditing(false)}>
                    <div className="rcb-settings-modal">
                        <TextControl
                            label={node.type === 'container' ? "Container ID/Field (Must be unique)" : "Field Key (Must be unique)"}
                            value={node.field || ''}
                            onChange={(val) => updateNode({ ...node, field: val })}
                            help="Used to map content and settings in the Block editor."
                        />
                        {node.type === 'container' && (
                            <SelectControl
                                label="Columns Layout"
                                value={node.columns || 1}
                                options={[
                                    { label: 'Single Column', value: 1 },
                                    { label: '2 Columns', value: 2 },
                                    { label: '3 Columns', value: 3 },
                                ]}
                                onChange={(val) => updateNode({ ...node, columns: parseInt(val) })}
                            />
                        )}
                        <fieldset>
                            <legend>Allowed Style Controls (For Block Editor)</legend>
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
                        </fieldset>
                        <Button isPrimary onClick={() => setIsEditing(false)}>Done</Button>
                    </div>
                </Modal>
            )}

            {node.type === 'container' && (
                <div className="rcb-node-visual-children">
                    {(node.children || []).map((child, index) => (
                        <NodeEditor
                            key={child.id}
                            node={child}
                            updateNode={(updatedChild) => {
                                const newChildren = [...node.children];
                                newChildren[index] = updatedChild;
                                updateNode({ ...node, children: newChildren });
                            }}
                            removeNode={() => {
                                const newChildren = node.children.filter((_, i) => i !== index);
                                updateNode({ ...node, children: newChildren });
                            }}
                            moveNodeUp={index > 0 ? () => {
                                const newChildren = [...node.children];
                                const temp = newChildren[index - 1];
                                newChildren[index - 1] = newChildren[index];
                                newChildren[index] = temp;
                                updateNode({ ...node, children: newChildren });
                            } : null}
                            moveNodeDown={index < node.children.length - 1 ? () => {
                                const newChildren = [...node.children];
                                const temp = newChildren[index + 1];
                                newChildren[index + 1] = newChildren[index];
                                newChildren[index] = temp;
                                updateNode({ ...node, children: newChildren });
                            } : null}
                            addChild={addChild}
                        />
                    ))}
                    <div className="rcb-add-inside">
                        <AddElementButton onAdd={(type) => addChild(node.id, type)} label="+ Add Block inside" />
                    </div>
                </div>
            )}
        </div>
    );
};

const AddElementButton = ({ onAdd, label = "Add Element" }) => {
    const [type, setType] = useState('');
    return (
        <div className="rcb-inline-add">
            {type === '' ? (
                 <Button variant="tertiary" onClick={() => setType('text')}>{label}</Button>
            ) : (
                <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <SelectControl
                            value={type}
                            options={[
                                { label: 'Container', value: 'container' },
                                { label: 'Heading', value: 'heading' },
                                { label: 'Text', value: 'text' },
                                { label: 'Image', value: 'image' },
                                { label: 'Button', value: 'button' },
                                { label: 'InnerBlocks (Gutenberg Slot)', value: 'innerblocks' },
                            ]}
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
    const inputElement = document.getElementById('rcb-structure-data');

    const initialData = inputElement && inputElement.value ? JSON.parse(inputElement.value) : { structure: [] };
    
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

    const defaultData = initialData.structure ? initialData.structure.map(n => mapLegacyNodes(n)) : [];
    
    const [structure, setStructure] = useState(defaultData);

    useEffect(() => {
        if (inputElement) inputElement.value = JSON.stringify({ structure });
    }, [structure]);

    const addRootElement = (type) => {
        const id = generateId(type);
        const newNode = {
            id,
            type,
            field: generateId(type),
            allowedSettings: { color: true, typography: true, spacing: true, borders: true, dimensions: type === 'image', backgroundImage: type === 'container' },
            ...(type === 'container' ? { children: [] } : {})
        };
        setStructure([...structure, newNode]);
    };

    const addChildToNode = (nodes, parentId, type) => {
        return nodes.map((node) => {
            if (node.id === parentId && node.type === 'container') {
                const subId = generateId(type);
                const newNode = {
                    id: subId,
                    type,
                    field: generateId(type),
                    allowedSettings: { color: true, typography: true, spacing: true, borders: true, dimensions: type === 'image', backgroundImage: type === 'container' },
                    ...(type === 'container' ? { children: [] } : {})
                };
                return { ...node, children: [...(node.children || []), newNode] };
            } else if (node.type === 'container' && node.children) {
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
                    </div>
                </div>

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
                <div className="rcb-available-fields">
                    <h4>Available Fields:</h4>
                    <p className="help" style={{fontSize: '12px', fontStyle: 'italic', marginBottom: '10px'}}>Use these generic visual fields which map to component content.</p>
                    {availableFields.length === 0 ? <p className="help">No fields yet.</p> : (
                        <ul>
                            {availableFields.map((f, i) => (
                                <li key={i}><code>{`${f.field}`}</code> ({f.type})</li>
                            ))}
                        </ul>
                    )}
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
