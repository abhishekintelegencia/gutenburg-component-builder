import re

with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/builder/index.js', 'r') as f:
    content = f.read()

# 1. Update addChildToNode signature and logic
content = content.replace(
    "const addChildToNode = (nodes, parentId, type) => {",
    "const addChildToNode = (nodes, parentId, type, position = 'bottom') => {"
)
content = content.replace(
    "return { ...node, children: [...(node.children || []), newNode] };",
    "const newChildren = position === 'top' ? [newNode, ...(node.children || [])] : [...(node.children || []), newNode];\\n                return { ...node, children: newChildren };"
)
content = content.replace(
    "return { ...node, children: addChildToNode(node.children, parentId, type) };",
    "return { ...node, children: addChildToNode(node.children, parentId, type, position) };"
)

# 2. Update handleAddChild
content = content.replace(
    "const handleAddChild = (parentId, type) => {\\n        setStructure(addChildToNode(structure, parentId, type));\\n    };",
    "const handleAddChild = (parentId, type, position = 'bottom') => {\\n        setStructure(addChildToNode(structure, parentId, type, position));\\n    };"
)

# 3. Insert Top Button before unified children render
content = content.replace(
    "{/* Single unified children render */}",
    "{/* Add Top Button */}\\n            {(node.type === 'container' || node.type === 'column') && node.children && node.children.length > 0 && (\\n                <div className=\\"rcb-add-inside rcb-add-top\\" style={{ marginBottom: '10px', textAlign: 'center' }}>\\n                    <AddElementButton onAdd={(type) => addChild(node.id, type, 'top')} label=\\"Add Above\\" />\\n                </div>\\n            )}\\n            {/* Single unified children render */}"
)

# 4. Render otherNodes above Grid
other_nodes_render = """                            <>
                                {otherNodes.length > 0 && (
                                    <div className="rcb-node-children" style={{ marginBottom: '15px' }}>
                                        {otherNodes.map((child, index) => (
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
                                                duplicateNode={() => null}
                                                addChild={addChild}
                                                moveNodeUp={null}
                                                moveNodeDown={null}
                                                styleRegistry={styleRegistry}
                                            />
                                        ))}
                                    </div>
                                )}
                                <div"""
content = content.replace("                        {isGrid ? (\\n                            // Grid view: only the N column nodes side-by-side\\n                            <div", other_nodes_render)

# 5. Update bottom addChildButton
content = content.replace(
    "<AddElementButton\\n                        onAdd={(type) => addChild(node.id, type)}\\n                        label=\\"+ Add Block inside\\"\\n                        insideColumn={node.type === 'column'}\\n                    />",
    "<AddElementButton\\n                        onAdd={(type) => addChild(node.id, type, 'bottom')}\\n                        label=\\"Add Below\\"\\n                        insideColumn={node.type === 'column'}\\n                    />"
)

# 6. Make AddElementButton use an icon instead of text (except root block)
content = content.replace(
    "<Button variant=\\"tertiary\\" onClick={() => setType('heading')}>{label}</Button>",
    "<div style={{display:'flex', justifyContent:'center'}}><Button variant=\\"secondary\\" icon=\\"plus\\" onClick={() => setType('heading')} title={label} style={{ minWidth: '32px', padding: '0 8px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ccc', color: '#555', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>{label === '+ Add Root Block' ? label : ''}</Button></div>"
)

with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/builder/index.js', 'w') as f:
    f.write(content)
print("done")
