import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { 
    useBlockProps, 
    InnerBlocks,
    InspectorControls,
    RichText 
} from '@wordpress/block-editor';
import { 
    PanelBody, 
    TextControl,
    SelectControl 
} from '@wordpress/components';

const ICON_OPTIONS = [
    { label: __( 'None', 'reusable-component-builder' ), value: '' },
    { label: __( 'WordPress', 'reusable-component-builder' ), value: 'dashicons-wordpress' },
    { label: __( 'Prestashop', 'reusable-component-builder' ), value: 'dashicons-cart' },
    { label: __( 'Joomla', 'reusable-component-builder' ), value: 'dashicons-category' },
    { label: __( 'Laravel', 'reusable-component-builder' ), value: 'dashicons-performance' },
    { label: __( 'Globe', 'reusable-component-builder' ), value: 'dashicons-admin-site-alt3' },
];

export default function Edit( { attributes, setAttributes, clientId, context } ) {
    const { label, icon } = attributes;
    const activeTabClientId = context['rcb/activeTabClientId'];

    const isActive = activeTabClientId === clientId;

    const blockProps = useBlockProps( {
        className: `rcb-tab-item ${ isActive ? 'is-active' : '' }`,
    } );

    if ( ! isActive ) {
        // We still need to render the InspectorControls so they don't disappear when switching
        // but we hide the actual content in the editor canvas.
        return (
            <div { ...blockProps } style={ { display: 'none' } }>
                <InspectorControls>
                    <PanelBody title={ __( 'Tab Item Settings', 'reusable-component-builder' ) }>
                        <SelectControl
                            label={ __( 'Icon', 'reusable-component-builder' ) }
                            value={ icon || '' }
                            options={ ICON_OPTIONS }
                            onChange={ ( val ) => setAttributes( { icon: val } ) }
                        />
                    </PanelBody>
                </InspectorControls>
                <InnerBlocks />
            </div>
        );
    }

    return (
        <div { ...blockProps }>
            <InspectorControls>
                <PanelBody title={ __( 'Tab Item Settings', 'reusable-component-builder' ) }>
                    <SelectControl
                        label={ __( 'Icon', 'reusable-component-builder' ) }
                        value={ icon || '' }
                        options={ ICON_OPTIONS }
                        onChange={ ( val ) => setAttributes( { icon: val } ) }
                    />
                </PanelBody>
            </InspectorControls>
            <div className="rcb-tab-item-editor-label">
                <TextControl
                    label={ __( 'Tab Label', 'reusable-component-builder' ) }
                    value={ label }
                    onChange={ ( val ) => setAttributes( { label: val } ) }
                />
            </div>
            <div className="rcb-tab-item-content">
                <InnerBlocks />
            </div>
        </div>
    );
}
