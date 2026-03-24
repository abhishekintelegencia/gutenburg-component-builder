/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/builder/index.js"
/*!******************************!*\
  !*** ./src/builder/index.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./style.scss */ "./src/builder/style.scss");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__);




const CATEGORIZED_STYLE_OPTIONS = [{
  title: 'Colors & Background',
  options: [{
    id: 'color',
    label: 'Color (Text & Background)'
  }, {
    id: 'backgroundImage',
    label: 'Background Image'
  }]
}, {
  title: 'Typography',
  options: [{
    id: 'typography',
    label: 'Typography (Font Size, Weight, etc)'
  }, {
    id: 'alignment',
    label: 'Text Alignment'
  }]
}, {
  title: 'Spacing & Dimensions',
  options: [{
    id: 'spacing',
    label: 'Spacing (Padding, Margin)'
  }, {
    id: 'dimensions',
    label: 'Dimensions (Width/Height)'
  }]
}, {
  title: 'Borders & Effects',
  options: [{
    id: 'borders',
    label: 'Borders & Radius'
  }, {
    id: 'boxShadow',
    label: 'Box Shadow'
  }, {
    id: 'opacity',
    label: 'Opacity'
  }]
}, {
  title: 'Advanced Layout',
  options: [{
    id: 'zIndex',
    label: 'Z-Index'
  }, {
    id: 'overflow',
    label: 'Overflow'
  }, {
    id: 'visibility',
    label: 'Visibility'
  }, {
    id: 'cursor',
    label: 'Cursor'
  }]
}, {
  title: 'Animations & Filters',
  options: [{
    id: 'transition',
    label: 'Transition'
  }, {
    id: 'filter',
    label: 'Filter'
  }, {
    id: 'backdropFilter',
    label: 'Backdrop Filter'
  }, {
    id: 'transform',
    label: 'Transform'
  }]
}, {
  title: 'Custom',
  options: [{
    id: 'customStylesBox',
    label: 'Custom CSS Box'
  }]
}];

// Recursive Component
const NodeEditor = ({
  node,
  updateNode,
  removeNode,
  duplicateNode,
  addChild,
  moveNodeUp,
  moveNodeDown,
  styleRegistry = [],
  parentType = null,
  templateType = 'query'
}) => {
  const [isEditing, setIsEditing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [activeTab, setActiveTab] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('Colors & Background');
  const toggleSetting = setting => {
    const allowed = node.allowedSettings || {};
    updateNode({
      ...node,
      allowedSettings: {
        ...allowed,
        [setting]: !allowed[setting]
      }
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: `rcb-node-visual ${node.type === 'container' ? 'is-container' : ''}`,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "rcb-node-visual-header",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
        className: "rcb-node-visual-title",
        children: node.type === 'container' ? 'Container block' : node.type.charAt(0).toUpperCase() + node.type.slice(1)
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "rcb-node-actions",
        children: [moveNodeUp && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSmall: true,
          variant: "tertiary",
          icon: "arrow-up-alt2",
          onClick: moveNodeUp,
          title: "Move Up"
        }), moveNodeDown && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSmall: true,
          variant: "tertiary",
          icon: "arrow-down-alt2",
          onClick: moveNodeDown,
          title: "Move Down"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSmall: true,
          variant: "tertiary",
          onClick: () => setIsEditing(true),
          children: "Edit Settings"
        }), duplicateNode && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSmall: true,
          variant: "tertiary",
          icon: "admin-page",
          onClick: duplicateNode,
          title: "Duplicate"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
          isSmall: true,
          isDestructive: true,
          variant: "tertiary",
          icon: "trash",
          onClick: removeNode,
          title: "Remove"
        })]
      })]
    }), isEditing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Modal, {
      title: `Edit ${node.type.toUpperCase()} Settings`,
      onRequestClose: () => setIsEditing(false),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "rcb-settings-modal",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
          label: node.type === 'container' || node.type === 'column' ? "Container ID/Field (Must be unique)" : "Field Key (Must be unique)",
          value: node.field || '',
          onChange: val => updateNode({
            ...node,
            field: val
          }),
          help: "Used to map content and settings in the Block editor."
        }), node.type !== 'container' && node.type !== 'column' && node.type !== 'innerblocks' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          style: {
            marginTop: '15px',
            padding: '15px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
            children: "Dynamic Content Binding"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
            style: {
              fontSize: '11px',
              color: '#666',
              marginBottom: '10px'
            },
            children: "In a Query Loop, this applies to each post. In a Static Layout, this applies to the current page/post."
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
            label: "Dynamic Source",
            value: node.dynamicSource || '',
            options: [{
              label: 'Static Template Content',
              value: ''
            }, {
              label: 'Post Title',
              value: 'post_title'
            }, {
              label: 'Post Excerpt',
              value: 'post_excerpt'
            }, {
              label: 'Post Date',
              value: 'post_date'
            }, {
              label: 'Post Author',
              value: 'post_author'
            }, {
              label: 'Featured Image',
              value: 'featured_image'
            }, {
              label: 'Permalink',
              value: 'permalink'
            }, {
              label: 'Taxonomy Term',
              value: 'term'
            }, {
              label: 'Custom Meta Field',
              value: 'custom_meta'
            }],
            onChange: val => updateNode({
              ...node,
              dynamicSource: val
            })
          }), (node.dynamicSource === 'term' || node.dynamicSource === 'custom_meta') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.TextControl, {
            label: node.dynamicSource === 'term' ? "Taxonomy Slug (e.g. category, event_category)" : "Meta Key (e.g. _my_custom_field)",
            value: node.dynamicField || '',
            onChange: val => updateNode({
              ...node,
              dynamicField: val
            }),
            help: node.dynamicSource === 'term' ? "Enter the taxonomy slug to retrieve the first term." : "Enter the exact post meta key."
          })]
        }), node.type === 'container' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          className: "rcb-column-selector",
          style: {
            marginBottom: '20px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("label", {
            style: {
              display: 'block',
              marginBottom: '10px',
              fontWeight: 'bold'
            },
            children: "Column Structure"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
            style: {
              display: 'flex',
              gap: '10px'
            },
            children: [1, 2, 3].map(cols => {
              const genId = t => `${t}_${Math.random().toString(36).substr(2, 6)}`;
              return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
                isPrimary: node.columns === cols,
                variant: node.columns === cols ? 'primary' : 'secondary',
                onClick: () => {
                  // Separate existing cols from non-col children
                  const existingCols = (node.children || []).filter(c => c.type === 'column');
                  const nonColChildren = (node.children || []).filter(c => c.type !== 'column');
                  if (cols === 1) {
                    // No column wrappers — keep non-col children only (column children stay but hidden in grid)
                    updateNode({
                      ...node,
                      columns: 1,
                      children: nonColChildren
                    });
                  } else {
                    let syncedCols;
                    if (existingCols.length === cols) {
                      syncedCols = existingCols;
                    } else if (existingCols.length < cols) {
                      const toAdd = cols - existingCols.length;
                      const added = Array.from({
                        length: toAdd
                      }).map(() => ({
                        id: genId('column'),
                        type: 'column',
                        field: genId('column'),
                        children: [],
                        allowedSettings: {
                          color: true,
                          spacing: true
                        }
                      }));
                      syncedCols = [...existingCols, ...added];
                    } else {
                      // Trim: simply discard the extra columns (don't carry over their children)
                      syncedCols = existingCols.slice(0, cols);
                    }
                    updateNode({
                      ...node,
                      columns: cols,
                      children: syncedCols
                    });
                  }
                },
                style: {
                  width: '60px',
                  height: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '5px'
                },
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                  style: {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: '2px',
                    width: '100%',
                    height: '100%'
                  },
                  children: Array.from({
                    length: cols
                  }).map((_, i) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                    style: {
                      background: node.columns === cols ? '#fff' : '#ccc'
                    }
                  }, i))
                })
              }, cols);
            })
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("fieldset", {
          style: {
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '4px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("legend", {
            style: {
              padding: '0 10px',
              fontWeight: 'bold'
            },
            children: "Allowed Style Controls (For Block Editor)"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            style: {
              display: 'flex',
              gap: '20px'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
              style: {
                flex: '0 0 200px',
                borderRight: '1px solid #ddd',
                paddingRight: '10px'
              },
              children: CATEGORIZED_STYLE_OPTIONS.map(cat => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                onClick: () => setActiveTab(cat.title),
                style: {
                  padding: '8px 10px',
                  cursor: 'pointer',
                  backgroundColor: activeTab === cat.title ? '#007cba' : 'transparent',
                  color: activeTab === cat.title ? '#fff' : '#3c434a',
                  borderRadius: '3px',
                  marginBottom: '5px',
                  fontWeight: activeTab === cat.title ? '600' : '400'
                },
                children: cat.title
              }, cat.title))
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
              style: {
                flex: '1',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px',
                alignContent: 'start'
              },
              children: CATEGORIZED_STYLE_OPTIONS.find(c => c.title === activeTab)?.options.map(opt => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
                label: opt.label,
                checked: node.allowedSettings?.[opt.id] || false,
                onChange: () => toggleSetting(opt.id)
              }, opt.id))
            })]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          style: {
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end'
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            isPrimary: true,
            onClick: () => setIsEditing(false),
            children: "Done"
          })
        })]
      })
    }), node.children && node.children.length > 0 && (() => {
      const colNodes = node.children.filter(c => c.type === 'column');
      const otherNodes = node.children.filter(c => c.type !== 'column');
      const isGrid = node.type === 'container' && (node.columns || 1) > 1 && colNodes.length > 0;
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.Fragment, {
        children: isGrid ?
        /*#__PURE__*/
        // Grid view: only the N column nodes side-by-side
        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          className: "rcb-column-grid",
          style: {
            display: 'grid',
            gridTemplateColumns: `repeat(${node.columns}, 1fr)`,
            gap: '12px',
            border: '1px dashed #bbb',
            padding: '10px',
            marginTop: '10px',
            borderRadius: '4px'
          },
          children: colNodes.map((child, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(NodeEditor, {
            node: child,
            parentType: "container",
            templateType: templateType,
            updateNode: updated => {
              const next = node.children.map(c => c.id === child.id ? updated : c);
              updateNode({
                ...node,
                children: next
              });
            },
            removeNode: () => {
              updateNode({
                ...node,
                children: node.children.filter(c => c.id !== child.id)
              });
            },
            duplicateNode: () => {
              const genId = t => `${t}_${Math.random().toString(36).substr(2, 6)}`;
              const deepClone = n => {
                const cln = {
                  ...n,
                  id: genId(n.type),
                  field: genId(n.type)
                };
                if (cln.children) cln.children = cln.children.map(deepClone);
                return cln;
              };
              const next = [...node.children];
              const idx = next.findIndex(c => c.id === child.id);
              next.splice(idx + 1, 0, deepClone(child));
              updateNode({
                ...node,
                children: next
              });
            },
            addChild: addChild,
            moveNodeUp: null,
            moveNodeDown: null,
            styleRegistry: styleRegistry
          }, child.id))
        }) :
        /*#__PURE__*/
        // Normal stacked view (single column or no column nodes)
        (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          className: "rcb-node-children",
          children: node.children.map((child, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(NodeEditor, {
            node: child,
            parentType: node.type,
            templateType: templateType,
            updateNode: updated => {
              const next = [...node.children];
              next[index] = updated;
              updateNode({
                ...node,
                children: next
              });
            },
            removeNode: () => {
              updateNode({
                ...node,
                children: node.children.filter((_, i) => i !== index)
              });
            },
            duplicateNode: () => {
              const genId = t => `${t}_${Math.random().toString(36).substr(2, 6)}`;
              const deepClone = n => {
                const cln = {
                  ...n,
                  id: genId(n.type),
                  field: genId(n.type)
                };
                if (cln.children) cln.children = cln.children.map(deepClone);
                return cln;
              };
              const next = [...node.children];
              next.splice(index + 1, 0, deepClone(child));
              updateNode({
                ...node,
                children: next
              });
            },
            addChild: addChild,
            moveNodeUp: index > 0 ? () => {
              const next = [...node.children];
              [next[index - 1], next[index]] = [next[index], next[index - 1]];
              updateNode({
                ...node,
                children: next
              });
            } : null,
            moveNodeDown: index < node.children.length - 1 ? () => {
              const next = [...node.children];
              [next[index + 1], next[index]] = [next[index], next[index + 1]];
              updateNode({
                ...node,
                children: next
              });
            } : null,
            styleRegistry: styleRegistry
          }, child.id))
        })
      });
    })(), (node.type === 'container' || node.type === 'column') && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "rcb-add-inside",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(AddElementButton, {
        onAdd: type => addChild(node.id, type),
        label: "+ Add Block inside",
        insideColumn: node.type === 'column'
      })
    })]
  });
};
const AddElementButton = ({
  onAdd,
  label = "Add Element",
  insideColumn = false
}) => {
  const [type, setType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const allOptions = [{
    label: 'Container',
    value: 'container'
  }, {
    label: 'Heading',
    value: 'heading'
  }, {
    label: 'Text',
    value: 'text'
  }, {
    label: 'Image',
    value: 'image'
  }, {
    label: 'Button',
    value: 'button'
  }, {
    label: 'InnerBlocks (Gutenberg Slot)',
    value: 'innerblocks'
  }];

  // Only show Container option at top-level containers, not inside columns
  const options = insideColumn ? allOptions.filter(o => o.value !== 'container') : allOptions;
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
    className: "rcb-inline-add",
    children: type === '' ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
      variant: "tertiary",
      onClick: () => setType('heading'),
      children: label
    }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      style: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
        value: type,
        options: options,
        onChange: val => setType(val),
        style: {
          marginBottom: 0
        }
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        isPrimary: true,
        onClick: () => {
          onAdd(type);
          setType('');
        },
        children: "Add"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
        isSecondary: true,
        onClick: () => setType(''),
        children: "Cancel"
      })]
    })
  });
};
const App = () => {
  const inputElement = document.getElementById('rcb_component_structure_input');
  const typeInputElement = document.getElementById('rcb-template-type-data');
  const initialData = inputElement && inputElement.value ? JSON.parse(inputElement.value) : {};
  const defaultType = typeInputElement && typeInputElement.value ? typeInputElement.value : 'visual';

  // Removed global style registry dependency
  const generateId = type => `${type}_${Math.random().toString(36).substr(2, 6)}`;

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
  const [structure, setStructure] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultStructure);
  const [globalCustomStyles, setGlobalCustomStyles] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultGlobalStyles);
  const [globalAllowedSettings, setGlobalAllowedSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(initialData.globalAllowedSettings || {
    color: true,
    spacing: true
  });
  const [templateType, setTemplateType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultType);
  const [isEditingGlobal, setIsEditingGlobal] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [globalActiveTab, setGlobalActiveTab] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('Colors & Background');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (inputElement) {
      inputElement.value = JSON.stringify({
        structure,
        globalCustomStyles,
        globalAllowedSettings
      });
    }
    if (typeInputElement) {
      typeInputElement.value = templateType;
    }
  }, [structure, globalCustomStyles, globalAllowedSettings, templateType]);
  const addRootElement = type => {
    const id = generateId(type);
    const newNode = {
      id,
      type,
      field: generateId(type),
      allowedSettings: {
        color: true,
        typography: true,
        spacing: true,
        borders: true,
        opacity: false,
        boxShadow: false,
        customStylesBox: false,
        dimensions: type === 'image',
        backgroundImage: type === 'container'
      },
      ...(type === 'container' ? {
        children: []
      } : {})
    };
    setStructure([...structure, newNode]);
  };
  const addChildToNode = (nodes, parentId, type) => {
    return nodes.map(node => {
      if (node.id === parentId && (node.type === 'container' || node.type === 'column')) {
        const subId = generateId(type);
        const newNode = {
          id: subId,
          type,
          field: generateId(type),
          allowedSettings: {
            color: true,
            typography: true,
            spacing: true,
            borders: true,
            opacity: false,
            boxShadow: false,
            customStylesBox: false,
            dimensions: type === 'image',
            backgroundImage: type === 'container'
          },
          ...(type === 'container' || type === 'column' ? {
            children: []
          } : {})
        };
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      } else if ((node.type === 'container' || node.type === 'column') && node.children) {
        return {
          ...node,
          children: addChildToNode(node.children, parentId, type)
        };
      }
      return node;
    });
  };
  const handleAddChild = (parentId, type) => {
    setStructure(addChildToNode(structure, parentId, type));
  };

  // Extract dynamic fields for sidebar
  const getAllFields = nodes => {
    let fields = [];
    nodes.forEach(node => {
      if (node.field) fields.push({
        field: node.field,
        type: node.type
      });
      if (node.children) fields = fields.concat(getAllFields(node.children));
    });
    return fields;
  };
  const availableFields = getAllFields(structure);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
    className: "rcb-new-builder-layout",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
      className: "rcb-main-area",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "rcb-builder-header",
        style: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '15px'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("h3", {
              children: "Template Builder"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
              children: "Build your layout visually. Add components below and configure their unique field IDs."
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
            isPrimary: true,
            onClick: () => setIsEditingGlobal(true),
            children: "Global Component Settings (Root Block)"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          style: {
            background: '#fff',
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '4px',
            width: '100%',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
            style: {
              minWidth: '150px'
            },
            children: "Component Type:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
            value: templateType,
            options: [{
              label: 'Static Visual Layout',
              value: 'visual'
            }, {
              label: 'Dynamic Post Loop',
              value: 'query'
            }],
            onChange: val => setTemplateType(val),
            style: {
              marginBottom: '0',
              minWidth: '250px'
            }
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
            style: {
              fontSize: '12px',
              color: '#666',
              fontStyle: 'italic',
              display: 'inline-block',
              lineHeight: '1.4'
            },
            children: templateType === 'query' ? 'Will render as a loop. Dynamic Content Bindings will pull data automatically.' : 'Will render exactly as designed. Content input via block attributes.'
          })]
        })]
      }), isEditingGlobal && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Modal, {
        title: "Global Component Settings (Root Block)",
        onRequestClose: () => setIsEditingGlobal(false),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          style: {
            minWidth: '400px',
            padding: '10px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
            children: "Enable/Disable style controls for the entire block wrapper in the Gutenberg sidebar."
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("fieldset", {
            style: {
              border: '1px solid #ddd',
              padding: '15px',
              borderRadius: '4px'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("legend", {
              style: {
                padding: '0 10px',
                fontWeight: 'bold'
              },
              children: "Global Style Controls"
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
              style: {
                display: 'flex',
                gap: '20px'
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                style: {
                  flex: '0 0 200px',
                  borderRight: '1px solid #ddd',
                  paddingRight: '10px'
                },
                children: CATEGORIZED_STYLE_OPTIONS.map(cat => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                  onClick: () => setGlobalActiveTab(cat.title),
                  style: {
                    padding: '8px 10px',
                    cursor: 'pointer',
                    backgroundColor: globalActiveTab === cat.title ? '#007cba' : 'transparent',
                    color: globalActiveTab === cat.title ? '#fff' : '#3c434a',
                    borderRadius: '3px',
                    marginBottom: '5px',
                    fontWeight: globalActiveTab === cat.title ? '600' : '400'
                  },
                  children: cat.title
                }, cat.title))
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
                style: {
                  flex: '1',
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '10px',
                  alignContent: 'start'
                },
                children: CATEGORIZED_STYLE_OPTIONS.find(c => c.title === globalActiveTab)?.options.map(opt => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.CheckboxControl, {
                  label: opt.label,
                  checked: globalAllowedSettings[opt.id] || false,
                  onChange: () => setGlobalAllowedSettings({
                    ...globalAllowedSettings,
                    [opt.id]: !globalAllowedSettings[opt.id]
                  })
                }, opt.id))
              })]
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
            style: {
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end'
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Button, {
              isPrimary: true,
              onClick: () => setIsEditingGlobal(false),
              children: "Done"
            })
          })]
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
        className: "rcb-visual-canvas",
        children: [structure.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          style: {
            padding: '30px',
            textAlign: 'center',
            background: '#f9f9f9',
            border: '1px dashed #ccc'
          },
          children: "Start by adding a Container Block."
        }), structure.map((node, index) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(NodeEditor, {
          node: node,
          templateType: templateType,
          updateNode: updatedNode => {
            const newStructure = [...structure];
            newStructure[index] = updatedNode;
            setStructure(newStructure);
          },
          removeNode: () => {
            const newStructure = structure.filter((_, i) => i !== index);
            setStructure(newStructure);
          },
          duplicateNode: () => {
            const genId = t => `${t}_${Math.random().toString(36).substr(2, 6)}`;
            const deepClone = n => {
              const cln = {
                ...n,
                id: genId(n.type),
                field: genId(n.type)
              };
              if (cln.children) cln.children = cln.children.map(deepClone);
              return cln;
            };
            const newStructure = [...structure];
            newStructure.splice(index + 1, 0, deepClone(node));
            setStructure(newStructure);
          },
          moveNodeUp: index > 0 ? () => {
            const newStructure = [...structure];
            const temp = newStructure[index - 1];
            newStructure[index - 1] = newStructure[index];
            newStructure[index] = temp;
            setStructure(newStructure);
          } : null,
          moveNodeDown: index < structure.length - 1 ? () => {
            const newStructure = [...structure];
            const temp = newStructure[index + 1];
            newStructure[index + 1] = newStructure[index];
            newStructure[index] = temp;
            setStructure(newStructure);
          } : null,
          addChild: handleAddChild
        }, node.id)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
          className: "rcb-root-add-area",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(AddElementButton, {
            onAdd: addRootElement,
            label: "+ Add Root Block"
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
      className: "rcb-sidebar-area",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
        className: "rcb-sidebar",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
          style: {
            padding: '15px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("strong", {
            children: "Available Fields:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("p", {
            style: {
              fontSize: '11px',
              color: '#666'
            },
            children: "Use these generic visual fields which map to component content."
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div", {
            className: "available-fields-list",
            children: availableFields.map(f => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("div", {
              className: "field-item",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("span", {
                className: "field-name",
                children: f.field
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)("span", {
                className: "field-type",
                children: ["(", f.type, ")"]
              })]
            }, f.field))
          })]
        })
      })
    })]
  });
};
window.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('rcb-template-builder-root');
  if (rootEl) {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(App, {}), rootEl);
  }
});

/***/ },

/***/ "./src/builder/style.scss"
/*!********************************!*\
  !*** ./src/builder/style.scss ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"builder/index": 0,
/******/ 			"builder/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkreusable_component_builder"] = globalThis["webpackChunkreusable_component_builder"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["builder/style-index"], () => (__webpack_require__("./src/builder/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map