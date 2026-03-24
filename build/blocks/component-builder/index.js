/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/component-builder/edit.js"
/*!**********************************************!*\
  !*** ./src/blocks/component-builder/edit.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);






const parseBoxValue = value => {
  if (typeof value === 'object' && value !== null) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    // Un-format var(--wp--preset--spacing--20) back to var:preset|spacing|20
    const normalizedStr = value.replace(/var\(--wp--preset--spacing--([^)]+)\)/g, 'var:preset|spacing|$1');
    const parts = normalizedStr.split(' ').filter(Boolean);
    if (parts.length === 1) return {
      top: parts[0],
      right: parts[0],
      bottom: parts[0],
      left: parts[0]
    };
    if (parts.length === 2) return {
      top: parts[0],
      right: parts[1],
      bottom: parts[0],
      left: parts[1]
    };
    if (parts.length === 3) return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[1]
    };
    if (parts.length === 4) return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[3]
    };
  }
  return undefined;
};
const serializeBoxValue = value => {
  if (typeof value === 'object' && value !== null) {
    if (!value.top && !value.right && !value.bottom && !value.left) return undefined;
    const formatVal = v => {
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
const AdvancedTypographyControl = ({
  label,
  value,
  fontWeight,
  textTransform,
  lineHeight,
  letterSpacing,
  onChange
}) => {
  const valString = (value || '').toString();
  const parsedValue = parseFloat(valString) || 0;
  const unitMatch = valString.match(/[a-z%]+$/i);
  const unit = unitMatch ? unitMatch[0] : 'px';
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    className: "rcb-advanced-typography",
    style: {
      marginBottom: '15px'
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
      style: {
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: '10px'
      },
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      style: {
        marginBottom: '15px'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          style: {
            fontSize: '11px',
            color: '#666'
          },
          children: "Size"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          value: unit,
          options: [{
            label: 'PX',
            value: 'px'
          }, {
            label: 'EM',
            value: 'em'
          }, {
            label: 'REM',
            value: 'rem'
          }],
          onChange: newUnit => onChange('fontSize', parsedValue ? `${parsedValue}${newUnit}` : ''),
          style: {
            minWidth: '70px',
            height: '30px',
            padding: '0 8px',
            fontSize: '12px'
          }
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
        value: parsedValue,
        onChange: newVal => onChange('fontSize', newVal !== undefined ? `${newVal}${unit}` : ''),
        min: 0,
        max: unit === 'px' ? 100 : 10,
        step: unit === 'px' ? 1 : 0.1,
        allowReset: true
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      style: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        style: {
          flex: 1
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: "Weight",
          value: fontWeight || '',
          options: [{
            label: 'Default',
            value: ''
          }, {
            label: 'Normal',
            value: 'normal'
          }, {
            label: 'Bold',
            value: 'bold'
          }, {
            label: '300',
            value: '300'
          }, {
            label: '400',
            value: '400'
          }, {
            label: '500',
            value: '500'
          }, {
            label: '600',
            value: '600'
          }, {
            label: '700',
            value: '700'
          }, {
            label: '800',
            value: '800'
          }],
          onChange: val => onChange('fontWeight', val)
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        style: {
          flex: 1
        },
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: "Transform",
          value: textTransform || '',
          options: [{
            label: 'Default',
            value: ''
          }, {
            label: 'Uppercase',
            value: 'uppercase'
          }, {
            label: 'Lowercase',
            value: 'lowercase'
          }, {
            label: 'Capitalize',
            value: 'capitalize'
          }],
          onChange: val => onChange('textTransform', val)
        })
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "rcb-typo-control-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "rcb-typo-header",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("label", {
          className: "rcb-typo-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Line Height', 'reusable-component-builder')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: "rcb-typo-reset-btn",
          variant: "link",
          onClick: () => onChange('lineHeight', ''),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset', 'reusable-component-builder')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "rcb-typo-control-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-icon",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Dashicon, {
            icon: "editor-lineheight"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-input",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            value: lineHeight || '',
            placeholder: "1.5",
            onChange: val => onChange('lineHeight', val)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-slider",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
            value: parseFloat(lineHeight) || 1.5,
            onChange: val => onChange('lineHeight', val),
            min: 0.5,
            max: 3,
            step: 0.1
          })
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "rcb-typo-control-wrapper",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "rcb-typo-header",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("label", {
          className: "rcb-typo-label",
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Letter Spacing', 'reusable-component-builder')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          className: "rcb-typo-reset-btn",
          variant: "link",
          onClick: () => onChange('letterSpacing', ''),
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Reset', 'reusable-component-builder')
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "rcb-typo-control-row",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-icon",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Dashicon, {
            icon: "editor-spellcheck"
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-input",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            value: parseInt(letterSpacing) || 0,
            onChange: val => onChange('letterSpacing', `${val}px`)
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "rcb-typo-slider",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
            value: parseInt(letterSpacing) || 0,
            onChange: val => onChange('letterSpacing', `${val}px`),
            min: -5,
            max: 20,
            step: 1
          })
        })]
      })]
    })]
  });
};
function Edit({
  attributes,
  setAttributes,
  clientId
}) {
  const {
    templateId,
    content,
    styles,
    uniqueId,
    mode,
    postType,
    taxonomy,
    termId,
    layout,
    columns,
    postsPerPage,
    pagination,
    visibilityVars
  } = attributes;

  // We already know our templateId from the variation registration.
  // Fetch specifically this template immediately.
  const [templateName, setTemplateName] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)('Component Content');
  const [structureNodes, setStructureNodes] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [globalCustomStyles, setGlobalCustomStyles] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [globalAllowedSettings, setGlobalAllowedSettings] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)({});
  const [previewPosts, setPreviewPosts] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);

  // Taxonomy API loading state
  const [taxonomies, setTaxonomies] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);
  const [terms, setTerms] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useState)([]);

  // Optional loop visibility settings
  const vVars = visibilityVars || {
    showTitle: true,
    showExcerpt: true,
    showImage: true,
    showButton: true
  };

  // Set uniqueId once
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (!uniqueId) setAttributes({
      uniqueId: clientId
    });
    if (templateId > 0) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
        path: '/rcb/v1/templates/'
      }).then(templates => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (mode === 'query') {
      const route = postType === 'events' ? 'events' : postType === 'page' ? 'pages' : 'posts';
      let path = `/wp/v2/${route}?per_page=${postsPerPage}`;
      if (taxonomy && termId) {
        // To fetch filtered posts, we need to know the term's taxonomy query var, we'll rough it in preview
        path += `&${taxonomy}=${termId}`;
      }
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
        path
      }).then(posts => {
        setPreviewPosts(posts);
      }).catch(() => setPreviewPosts([]));
    } else {
      setPreviewPosts([]);
    }
  }, [mode, postType, taxonomy, termId, postsPerPage, templateId]);

  // Fetch taxonomies for the post type
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (mode === 'query' && postType) {
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
        path: `/wp/v2/taxonomies?type=${postType}`
      }).then(data => {
        const taxOptions = Object.keys(data).map(key => ({
          label: data[key].name,
          value: data[key].slug,
          rest_base: data[key].rest_base
        }));
        setTaxonomies([{
          label: 'All Categories (No Filter)',
          value: '',
          rest_base: ''
        }, ...taxOptions]);
      }).catch(() => setTaxonomies([]));
    }
  }, [mode, postType]);

  // Fetch terms for the taxonomy
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(() => {
    if (mode === 'query' && taxonomy) {
      const selectedTax = taxonomies.find(t => t.value === taxonomy);
      if (selectedTax && selectedTax.rest_base) {
        _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
          path: `/wp/v2/${selectedTax.rest_base}?per_page=100`
        }).then(data => {
          const termOptions = data.map(term => ({
            label: term.name,
            value: term.id
          }));
          setTerms([{
            label: 'All Terms (No Filter)',
            value: 0
          }, ...termOptions]);
        }).catch(() => setTerms([]));
      } else {
        setTerms([]);
      }
    } else {
      setTerms([]);
    }
  }, [mode, taxonomy, taxonomies]);
  const getAllFields = nodes => {
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
    setAttributes({
      content: {
        ...content,
        [key]: value
      }
    });
  };
  const updateStyle = (key, prop, value) => {
    const currentStyle = styles[key] || {};
    if (value === undefined || value === '') {
      const newStyles = {
        ...styles
      };
      const newFieldStyles = {
        ...currentStyle
      };
      delete newFieldStyles[prop];
      newStyles[key] = newFieldStyles;
      setAttributes({
        styles: newStyles
      });
    } else {
      setAttributes({
        styles: {
          ...styles,
          [key]: {
            ...currentStyle,
            [prop]: value
          }
        }
      });
    }
  };

  // Render nodes (Visual Structure)
  const renderPreviewNodes = (nodes, post = null) => {
    return nodes.map((node, i) => {
      const rawStyles = {
        ...(styles[node.field] || {})
      };
      const {
        customCssPairs,
        ...validReactStyles
      } = rawStyles;
      const nodeStyles = {
        ...validReactStyles
      };
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
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: `rcb-container ${node.id}`,
          style: nodeStyles,
          children: (node.children || []).filter(c => c.type === 'column').map((col, ci) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: `rcb-column ${col.id}`,
            style: styles[col.field] || {},
            children: col.children && renderPreviewNodes(col.children, post)
          }, ci))
        }, i);
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
        'innerblocks': ''
      };
      let nodeContent = content[node.field] || placeholderMap[node.type] || '';
      let url = content[`${node.field}_url`];
      if (mode !== 'query' && node.dynamicSource) {
        if (node.type === 'image') {
          url = 'https://via.placeholder.com/600x400?text=Dynamic+Image';
        } else if (node.type === 'button') {
          nodeContent = `[Dynamic: ${node.dynamicSource}]`;
          url = '#';
        } else {
          nodeContent = `[Dynamic: ${node.dynamicSource}]`;
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
          nodeContent = nodeContent || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Read More', 'reusable-component-builder');
          url = post.link || '#';
        } else if (source === 'term') {
          nodeContent = `Term: ${node.dynamicField || 'name'}`;
        } else if (source === 'custom_meta') {
          nodeContent = `Meta: ${node.dynamicField || 'value'}`;
        }
      }
      switch (node.type) {
        case 'container':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: `rcb-container ${node.id}`,
            style: nodeStyles,
            children: node.children && renderPreviewNodes(node.children, post)
          }, i);
        case 'column':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: `rcb-column ${node.id}`,
            style: nodeStyles,
            children: node.children && renderPreviewNodes(node.children, post)
          }, i);
        case 'innerblocks':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: `rcb-inner-blocks-slot ${node.id}`,
            style: nodeStyles,
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InnerBlocks, {})
          }, i);
        case 'heading':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h2", {
            className: `rcb-heading ${node.id}`,
            style: nodeStyles,
            children: nodeContent
          }, i);
        case 'text':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: `rcb-text ${node.id}`,
            style: nodeStyles,
            children: nodeContent
          }, i);
        case 'image':
          if (url) {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("img", {
              src: url,
              className: `rcb-image ${node.id}`,
              alt: nodeContent,
              style: {
                ...nodeStyles,
                display: 'block'
              }
            }, i);
          }
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: `rcb-image-placeholder ${node.id}`,
            style: {
              ...nodeStyles,
              background: '#ccc',
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            },
            children: ["Image Placeholder: ", node.field]
          }, i);
        case 'button':
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("a", {
            href: url || '#',
            className: `rcb-button ${node.id}`,
            style: {
              ...nodeStyles,
              display: 'inline-block'
            },
            onClick: e => e.preventDefault(),
            children: nodeContent
          }, i);
        default:
          return null;
      }
    });
  };
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)({
    style: (() => {
      const rootStyles = styles['_root'] || {};
      const final = {};
      globalCustomStyles.forEach(styleKey => {
        const styleValue = rootStyles[styleKey];
        if (styleValue) {
          const camelKey = styleKey.replace(/-([a-z])/g, g => g[1].toUpperCase());
          final[camelKey] = styleValue;
        }
      });
      return final;
    })()
  });
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("style", {
      children: configurableFields.map(node => {
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
      }).join('\n')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [mode === 'query' && templateId > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Loop Options'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Post Type'),
          value: postType,
          options: [{
            label: 'Posts',
            value: 'post'
          }, {
            label: 'Pages',
            value: 'page'
          }, {
            label: 'Events',
            value: 'events'
          }],
          onChange: val => setAttributes({
            postType: val,
            taxonomy: '',
            termId: 0
          })
        }), taxonomies.length > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Filter by Taxonomy'),
          value: taxonomy,
          options: taxonomies,
          onChange: val => setAttributes({
            taxonomy: val,
            termId: 0
          })
        }), taxonomy && terms.length > 1 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Filter by Term'),
          value: termId,
          options: terms,
          onChange: val => setAttributes({
            termId: parseInt(val, 10) || 0
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Posts Per Page'),
          value: postsPerPage,
          onChange: val => setAttributes({
            postsPerPage: val
          }),
          min: 1,
          max: 20
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Layout'),
          value: layout,
          options: [{
            label: 'Grid',
            value: 'grid'
          }, {
            label: 'List',
            value: 'list'
          }],
          onChange: val => setAttributes({
            layout: val
          })
        }), layout === 'grid' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Columns'),
          value: columns,
          onChange: val => setAttributes({
            columns: val
          }),
          min: 1,
          max: 6
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enable Pagination'),
          checked: pagination,
          onChange: val => setAttributes({
            pagination: val
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          style: {
            marginTop: '20px',
            padding: '10px',
            background: '#f0f0f0',
            borderRadius: '4px'
          },
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
            children: "Dynamic Rendering Note:"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
            style: {
              fontSize: '12px',
              marginTop: '5px'
            },
            children: "The Loop populates elements that have a \"Dynamic Source\" set in the Template Builder."
          })]
        })]
      }), templateId > 0 && mode === 'static' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: `${templateName} Content`,
        initialOpen: true,
        children: configurableFields.map(fieldNode => {
          if (fieldNode.type === 'container') {
            // For containers, check if BG image is allowed in style, but we put it in content since it's an asset
            return null;
          }
          if (fieldNode.type === 'image') {
            return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "rcb-field-row",
              style: {
                marginBottom: '15px'
              },
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.BaseControl, {
                id: `img-${fieldNode.field}`,
                label: `${fieldNode.field} (Image)`,
                children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
                  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
                    onSelect: media => {
                      // Ensure deep updates are captured cleanly
                      setAttributes({
                        content: {
                          ...content,
                          [`${fieldNode.field}_id`]: media.id,
                          [`${fieldNode.field}_url`]: media.url
                        }
                      });
                    },
                    allowedTypes: ['image'],
                    value: content[`${fieldNode.field}_id`],
                    render: ({
                      open
                    }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
                      className: "rcb-media-upload-wrapper",
                      style: {
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                        marginTop: '5px',
                        flexWrap: 'wrap'
                      },
                      children: [content[`${fieldNode.field}_url`] && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("img", {
                        src: content[`${fieldNode.field}_url`],
                        style: {
                          width: '50px',
                          height: 'auto',
                          border: '1px solid #ccc',
                          borderRadius: '3px'
                        }
                      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                        isSecondary: true,
                        onClick: open,
                        children: content[`${fieldNode.field}_url`] ? 'Change Image' : 'Select Image'
                      }), content[`${fieldNode.field}_url`] && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                        isDestructive: true,
                        isSmall: true,
                        variant: "tertiary",
                        onClick: () => {
                          setAttributes({
                            content: {
                              ...content,
                              [`${fieldNode.field}_id`]: undefined,
                              [`${fieldNode.field}_url`]: undefined
                            }
                          });
                        },
                        children: "Remove"
                      })]
                    })
                  })
                })
              })
            }, fieldNode.id);
          }
          return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "rcb-field-row",
            style: {
              marginBottom: '10px'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              label: `${fieldNode.field} (${fieldNode.type})`,
              value: content[fieldNode.field] || '',
              onChange: val => updateContent(fieldNode.field, val)
            }), fieldNode.type === 'button' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              label: `${fieldNode.field} Link URL`,
              value: content[`${fieldNode.field}_url`] || '',
              onChange: val => updateContent(`${fieldNode.field}_url`, val)
            })]
          }, fieldNode.id);
        })
      }), templateId > 0 && configurableFields.map(fieldNode => {
        // backgroundImage as a style control only makes sense for non-image nodes (image nodes use content upload)
        const defaultBgImage = fieldNode.type !== 'image';
        const allowed = fieldNode.allowedSettings || {
          color: true,
          typography: true,
          spacing: true,
          borders: true,
          dimensions: fieldNode.type === 'image',
          backgroundImage: defaultBgImage
        };
        // Runtime override: image-type nodes should never show bg-image style control
        if (fieldNode.type === 'image') {
          allowed.backgroundImage = false;
        }

        // Check if any standard keys are enabled
        if (!allowed.color && !allowed.typography && !allowed.spacing && !allowed.borders && !allowed.alignment && !allowed.dimensions && !allowed.backgroundImage && !allowed.opacity && !allowed.boxShadow && !allowed.customStylesBox && !allowed.zIndex && !allowed.overflow && !allowed.visibility && !allowed.cursor && !allowed.transition && !allowed.filter && !allowed.backdropFilter && !allowed.transform) {
          return null; // No settings enabled for this node
        }
        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
          title: `${fieldNode.type.toUpperCase()} Styles (${fieldNode.field})`,
          initialOpen: false,
          children: [allowed.backgroundImage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.BaseControl, {
            id: `bg-${fieldNode.field}`,
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Background Image'),
            help: "Will apply inline background-image to this container.",
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
                onSelect: media => {
                  setAttributes({
                    content: {
                      ...content,
                      [`${fieldNode.field}_bg_id`]: media.id,
                      [`${fieldNode.field}_bg_url`]: media.url
                    }
                  });
                },
                allowedTypes: ['image'],
                value: content[`${fieldNode.field}_bg_id`],
                render: ({
                  open
                }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
                  style: {
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    marginTop: '5px',
                    marginBottom: '15px',
                    flexWrap: 'wrap'
                  },
                  children: [content[`${fieldNode.field}_bg_url`] && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("img", {
                    src: content[`${fieldNode.field}_bg_url`],
                    style: {
                      width: '50px',
                      height: 'auto',
                      border: '1px solid #ccc',
                      borderRadius: '3px'
                    }
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                    isSecondary: true,
                    onClick: open,
                    children: content[`${fieldNode.field}_bg_url`] ? 'Change BG Image' : 'Select BG Image'
                  }), content[`${fieldNode.field}_bg_url`] && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                    isDestructive: true,
                    isSmall: true,
                    variant: "tertiary",
                    onClick: () => {
                      setAttributes({
                        content: {
                          ...content,
                          [`${fieldNode.field}_bg_id`]: undefined,
                          [`${fieldNode.field}_bg_url`]: undefined
                        }
                      });
                    },
                    children: "Remove BG"
                  })]
                })
              })
            })
          }), allowed.color && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.PanelColorSettings, {
            title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Colors', 'reusable-component-builder'),
            initialOpen: false,
            colorSettings: [{
              value: styles[fieldNode.field] && styles[fieldNode.field].color || '',
              onChange: val => updateStyle(fieldNode.field, 'color', val),
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Color', 'reusable-component-builder')
            }, {
              value: styles[fieldNode.field] && styles[fieldNode.field].backgroundColor || '',
              onChange: val => updateStyle(fieldNode.field, 'backgroundColor', val),
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Background Color', 'reusable-component-builder')
            }]
          }), allowed.typography && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(AdvancedTypographyControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Typography', 'reusable-component-builder'),
            value: styles[fieldNode.field] && styles[fieldNode.field].fontSize || '',
            fontWeight: styles[fieldNode.field] && styles[fieldNode.field].fontWeight || '',
            textTransform: styles[fieldNode.field] && styles[fieldNode.field].textTransform || '',
            lineHeight: styles[fieldNode.field] && styles[fieldNode.field].lineHeight || '',
            letterSpacing: styles[fieldNode.field] && styles[fieldNode.field].letterSpacing || '',
            onChange: (prop, val) => updateStyle(fieldNode.field, prop, val)
          }), allowed.spacing && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "rcb-box-control-wrapper",
              style: {
                marginBottom: '15px'
              },
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalBoxControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Padding', 'reusable-component-builder'),
                values: parseBoxValue(styles[fieldNode.field] && styles[fieldNode.field].padding || ''),
                onChange: val => updateStyle(fieldNode.field, 'padding', serializeBoxValue(val))
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "rcb-box-control-wrapper",
              style: {
                marginBottom: '15px'
              },
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalBoxControl, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Margin', 'reusable-component-builder'),
                values: parseBoxValue(styles[fieldNode.field] && styles[fieldNode.field].margin || ''),
                onChange: val => updateStyle(fieldNode.field, 'margin', serializeBoxValue(val))
              })
            })]
          }), allowed.alignment && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToggleGroupControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text Alignment', 'reusable-component-builder'),
            value: styles[fieldNode.field] && styles[fieldNode.field].textAlign || 'default',
            isBlock: true,
            onChange: val => updateStyle(fieldNode.field, 'textAlign', val === 'default' ? '' : val),
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToggleGroupControlOption, {
              value: "default",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToggleGroupControlOption, {
              value: "left",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Left')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToggleGroupControlOption, {
              value: "center",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Center')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToggleGroupControlOption, {
              value: "right",
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Right')
            })]
          }), allowed.dimensions && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Width (e.g. 100%, 300px)', 'reusable-component-builder'),
              value: styles[fieldNode.field] && styles[fieldNode.field].width || '',
              onChange: val => updateStyle(fieldNode.field, 'width', val)
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Height (e.g. auto, 200px)', 'reusable-component-builder'),
              value: styles[fieldNode.field] && styles[fieldNode.field].height || '',
              onChange: val => updateStyle(fieldNode.field, 'height', val)
            })]
          }), allowed.borders && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Border Radius (px)', 'reusable-component-builder'),
              value: parseInt(styles[fieldNode.field]?.['borderRadius']) || 0,
              onChange: val => updateStyle(fieldNode.field, 'borderRadius', val !== undefined ? `${val}px` : ''),
              min: 0,
              max: 100,
              allowReset: true
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Border Outline', 'reusable-component-builder'),
              value: styles[fieldNode.field] && styles[fieldNode.field].border || '',
              options: [{
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('None', 'reusable-component-builder'),
                value: ''
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Solid Light (1px solid #ccc)', 'reusable-component-builder'),
                value: '1px solid #ccc'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Solid Dark (1px solid #333)', 'reusable-component-builder'),
                value: '1px solid #333'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Dashed Light (1px dashed #ccc)', 'reusable-component-builder'),
                value: '1px dashed #ccc'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Dotted Light (1px dotted #ccc)', 'reusable-component-builder'),
                value: '1px dotted #ccc'
              }, {
                label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Thick Solid Dark (2px solid #333)', 'reusable-component-builder'),
                value: '2px solid #333'
              }],
              onChange: val => updateStyle(fieldNode.field, 'border', val)
            })]
          }), allowed.opacity && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.RangeControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Opacity', 'reusable-component-builder'),
            value: parseFloat(styles[fieldNode.field]?.['opacity']) ?? 1,
            onChange: val => updateStyle(fieldNode.field, 'opacity', val),
            min: 0,
            max: 1,
            step: 0.05,
            allowReset: true
          }), allowed.boxShadow && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Box Shadow', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['boxShadow'] || '',
            onChange: val => updateStyle(fieldNode.field, 'boxShadow', val),
            help: "e.g., 0px 4px 10px rgba(0,0,0,0.1)"
          }), allowed.zIndex && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Z-Index', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['zIndex'] || '',
            onChange: val => updateStyle(fieldNode.field, 'zIndex', val),
            type: "number"
          }), allowed.overflow && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Overflow', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['overflow'] || '',
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default', 'reusable-component-builder'),
              value: ''
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Visible', 'reusable-component-builder'),
              value: 'visible'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Hidden', 'reusable-component-builder'),
              value: 'hidden'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Scroll', 'reusable-component-builder'),
              value: 'scroll'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Auto', 'reusable-component-builder'),
              value: 'auto'
            }],
            onChange: val => updateStyle(fieldNode.field, 'overflow', val)
          }), allowed.visibility && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Visibility', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['visibility'] || '',
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default', 'reusable-component-builder'),
              value: ''
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Visible', 'reusable-component-builder'),
              value: 'visible'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Hidden', 'reusable-component-builder'),
              value: 'hidden'
            }],
            onChange: val => updateStyle(fieldNode.field, 'visibility', val)
          }), allowed.cursor && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Cursor', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['cursor'] || '',
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Default', 'reusable-component-builder'),
              value: ''
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pointer (Hand)', 'reusable-component-builder'),
              value: 'pointer'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Text', 'reusable-component-builder'),
              value: 'text'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Not Allowed', 'reusable-component-builder'),
              value: 'not-allowed'
            }, {
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Help', 'reusable-component-builder'),
              value: 'help'
            }],
            onChange: val => updateStyle(fieldNode.field, 'cursor', val)
          }), allowed.transition && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Transition', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['transition'] || '',
            onChange: val => updateStyle(fieldNode.field, 'transition', val),
            help: "e.g., all 0.3s ease"
          }), allowed.filter && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Filter', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['filter'] || '',
            onChange: val => updateStyle(fieldNode.field, 'filter', val),
            help: "e.g., blur(5px) or grayscale(100%)"
          }), allowed.backdropFilter && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Backdrop Filter', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['backdropFilter'] || '',
            onChange: val => updateStyle(fieldNode.field, 'backdropFilter', val),
            help: "e.g., blur(10px) (Ideal for glassmorphism)"
          }), allowed.transform && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Transform', 'reusable-component-builder'),
            value: styles[fieldNode.field]?.['transform'] || '',
            onChange: val => updateStyle(fieldNode.field, 'transform', val),
            help: "e.g., scale(1.05) translateY(-5px)"
          }), allowed.customStylesBox && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            style: {
              marginTop: '15px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fafafa'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
              style: {
                display: 'block',
                marginBottom: '10px',
                fontSize: '12px'
              },
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Custom Styles', 'reusable-component-builder')
            }), (styles[fieldNode.field]?.customCssPairs || []).map((pair, idx) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
              style: {
                display: 'flex',
                gap: '5px',
                marginBottom: '5px',
                alignItems: 'center'
              },
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
                value: pair.key,
                placeholder: "z-index",
                onChange: val => {
                  const newPairs = [...(styles[fieldNode.field].customCssPairs || [])];
                  newPairs[idx] = {
                    ...newPairs[idx],
                    key: val
                  };
                  updateStyle(fieldNode.field, 'customCssPairs', newPairs);
                },
                style: {
                  flex: 1,
                  marginBottom: 0
                }
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
                value: pair.value,
                placeholder: "99",
                onChange: val => {
                  const newPairs = [...(styles[fieldNode.field].customCssPairs || [])];
                  newPairs[idx] = {
                    ...newPairs[idx],
                    value: val
                  };
                  updateStyle(fieldNode.field, 'customCssPairs', newPairs);
                },
                style: {
                  flex: 1,
                  marginBottom: 0
                }
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
                isDestructive: true,
                isSmall: true,
                variant: "tertiary",
                icon: "trash",
                onClick: () => {
                  const newPairs = (styles[fieldNode.field].customCssPairs || []).filter((_, i) => i !== idx);
                  updateStyle(fieldNode.field, 'customCssPairs', newPairs.length ? newPairs : undefined);
                }
              })]
            }, idx)), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
              variant: "secondary",
              isSmall: true,
              onClick: () => {
                const newPairs = [...(styles[fieldNode.field]?.customCssPairs || []), {
                  key: '',
                  value: ''
                }];
                updateStyle(fieldNode.field, 'customCssPairs', newPairs);
              },
              children: "+ Add Custom Style"
            })]
          })]
        }, `style-${fieldNode.id}`);
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: `rcb-editor-preview-container ${layout === 'grid' && mode === 'query' ? 'rcb-layout-grid' : ''}`,
      style: layout === 'grid' && mode === 'query' ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '20px'
      } : {},
      children: !templateId ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        style: {
          padding: '30px',
          border: '1px dashed #ccc',
          textAlign: 'center',
          background: '#f5f5f5'
        },
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error: No template variation assigned to this block!', 'reusable-component-builder')
      }) : mode === 'query' ? previewPosts.length > 0 ? previewPosts.map((post, idx) => {
        // Reset per post loop preview

        return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: `rcb-instance rcb-instance-${uniqueId}`,
          children: renderPreviewNodes(structureNodes, post)
        }, `post-${idx}`);
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        style: {
          padding: '20px',
          background: '#e0e0e0'
        },
        children: "Loading posts..."
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: `rcb-instance rcb-instance-${uniqueId}`,
        children: renderPreviewNodes(structureNodes)
      })
    })]
  });
}

/***/ },

/***/ "./src/blocks/component-builder/index.js"
/*!***********************************************!*\
  !*** ./src/blocks/component-builder/index.js ***!
  \***********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./style.scss */ "./src/blocks/component-builder/style.scss");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./edit */ "./src/blocks/component-builder/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block.json */ "./src/blocks/component-builder/block.json");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_5__.name, {
  edit: _edit__WEBPACK_IMPORTED_MODULE_4__["default"],
  save: () => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InnerBlocks.Content, {})
});
_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_2___default()({
  path: '/rcb/v1/templates/'
}).then(templates => {
  templates.forEach(template => {
    (0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockVariation)(_block_json__WEBPACK_IMPORTED_MODULE_5__.name, {
      name: `template-${template.id}`,
      title: template.title || `Component ${template.id}`,
      icon: 'layout',
      attributes: {
        templateId: template.id,
        mode: template.type === 'query' ? 'query' : 'static'
      },
      isActive: blockAttributes => blockAttributes.templateId === template.id,
      scope: ['inserter']
    });
  });
}).catch(() => {});

/***/ },

/***/ "./src/blocks/component-builder/style.scss"
/*!*************************************************!*\
  !*** ./src/blocks/component-builder/style.scss ***!
  \*************************************************/
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

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

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

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./src/blocks/component-builder/block.json"
/*!*************************************************!*\
  !*** ./src/blocks/component-builder/block.json ***!
  \*************************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"reusable-component-builder/block","version":"1.0.0","title":"Component Builder","category":"design","icon":"layout","description":"Dynamic component block from a selected template.","supports":{"html":false,"align":true},"attributes":{"templateId":{"type":"number","default":0},"content":{"type":"object","default":{}},"styles":{"type":"object","default":{}},"uniqueId":{"type":"string","default":""},"mode":{"type":"string","default":"static"},"postType":{"type":"string","default":"post"},"layout":{"type":"string","default":"grid"},"columns":{"type":"number","default":3},"taxonomy":{"type":"string","default":""},"termId":{"type":"number","default":0},"postsPerPage":{"type":"number","default":3},"pagination":{"type":"boolean","default":false},"visibilityVars":{"type":"object","default":{"showTitle":true,"showExcerpt":true,"showImage":true,"showButton":true}}},"textdomain":"reusable-component-builder","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css"}');

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
/******/ 			"blocks/component-builder/index": 0,
/******/ 			"blocks/component-builder/style-index": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["blocks/component-builder/style-index"], () => (__webpack_require__("./src/blocks/component-builder/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map