import re

with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/blocks/component-builder/edit.js', 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings, InnerBlocks } from '@wordpress/block-editor';",
    "import { useBlockProps, InspectorControls, BlockControls, MediaUpload, MediaUploadCheck, PanelColorSettings, InnerBlocks } from '@wordpress/block-editor';"
)

content = content.replace(
    "import { PanelBody, SelectControl, TextControl, TextareaControl, Button, ToggleControl, RangeControl, RadioControl, BaseControl, Dashicon, __experimentalBoxControl as BoxControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption } from '@wordpress/components';",
    "import { PanelBody, SelectControl, TextControl, TextareaControl, Button, ToggleControl, RangeControl, RadioControl, BaseControl, Dashicon, TabPanel, __experimentalBoxControl as BoxControl, __experimentalToggleGroupControl as ToggleGroupControl, __experimentalToggleGroupControlOption as ToggleGroupControlOption, ToolbarGroup, ToolbarButton } from '@wordpress/components';"
)

# 2. State
content = content.replace(
    "    const [previewPosts, setPreviewPosts] = useState([]);",
    "    const [previewPosts, setPreviewPosts] = useState([]);\n    const [selectedStyleElement, setSelectedStyleElement] = useState('');"
)

# 3. Utils
utils_insertion = """    const configurableFields = getAllFields(structureNodes);

    useEffect(() => {
        if (configurableFields.length > 0 && (!selectedStyleElement || !configurableFields.find(f => f.field === selectedStyleElement))) {
            setSelectedStyleElement(configurableFields[0].field);
        }
    }, [configurableFields, selectedStyleElement]);

    const getCleanFieldLabel = (node) => {
        let name = node.type.charAt(0).toUpperCase() + node.type.slice(1);
        if (node.dynamicSource) {
            name += ` (${node.dynamicSource.replace('_', ' ')})`;
        } else {
            name += ` (Static)`;
        }
        return name;
    };"""

content = content.replace("    const configurableFields = getAllFields(structureNodes);", utils_insertion)

# 4. wrap InspectorControls in TabPanel
# First find <InspectorControls> and the closing </InspectorControls>
# Since the code between InspectorControls is very specific, we can split by it.

tab_start = """            <InspectorControls>
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
                                <>"""

tab_mid = """                                </>
                            )}
                            
                            {tab.name === 'styles' && templateId > 0 && (
                                <>
                                    <div style={{ padding: '0 16px 16px', borderBottom: '1px solid #e0e0e0', marginBottom: '16px' }}>
                                        <SelectControl
                                            label={__('Select Element to Style', 'reusable-component-builder')}
                                            value={selectedStyleElement}
                                            options={configurableFields.map(f => ({ label: getCleanFieldLabel(f) + ' - ' + f.field, value: f.field }))}
                                            onChange={(val) => setSelectedStyleElement(val)}
                                        />
                                    </div>"""

tab_end = """                                </>
                            )}
                        </div>
                    )}
                </TabPanel>
            </InspectorControls>"""


# Let's replace the outer shell
content = content.replace("<InspectorControls>", tab_start)

# We need to replace the style mapping section start
# This is tricky because the exact spacing might differ. Let's do a reliable regex or string replace.
content = content.replace(
    "{/* STYLE MAPPING */}\n                {templateId > 0 && configurableFields.map((fieldNode) => {",
    tab_mid + "\n                                    {selectedStyleElement && configurableFields.filter(f => f.field === selectedStyleElement).map((fieldNode) => {"
)

# And replace the closing of InspectorControls
content = content.replace(
    "                })}\n            </InspectorControls>",
    "                })}\n" + tab_end
)

# Replace the inner panels from <PanelBody title={`${fieldNode.type.toUpperCase()} Styles (${fieldNode.field})`} initialOpen={false}>
# to something native and beautiful
content = content.replace(
    "<PanelBody key={`style-${fieldNode.id}`} title={`${fieldNode.type.toUpperCase()} Styles (${fieldNode.field})`} initialOpen={false}>",
    "<div key={`style-${fieldNode.id}`} className=\"rcb-styles-wrapper\">"
)

# To close the div where PanelBody was
content = content.replace(
    "                                </div>\n                            )}\n                        </PanelBody>\n                    );\n                })}",
    "                                </div>\n                            )}\n                        </div>\n                    );\n                })}"
)

# Introduce a standard block toolbar (BlockControls) just above <InspectorControls>
block_controls = """            <BlockControls group="block">
                <ToolbarGroup>
                    <ToolbarButton
                        icon="edit"
                        label="Component Settings"
                        onClick={() => console.log('Edit Settings clicked')}
                    />
                </ToolbarGroup>
            </BlockControls>
            
            """
content = content.replace(tab_start, block_controls + tab_start)


with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/blocks/component-builder/edit.js', 'w') as f:
    f.write(content)

print("Patched successfully")
