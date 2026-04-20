import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { label, icon } = attributes;

    const blockProps = useBlockProps.save( {
        className: 'rcb-tab-item',
        'data-label': label,
        'data-icon': icon,
    } );

    return (
        <div { ...blockProps }>
            <InnerBlocks.Content />
        </div>
    );
}
