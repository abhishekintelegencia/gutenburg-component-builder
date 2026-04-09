import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const { gap, iconType } = attributes;
    
    const blockProps = useBlockProps.save( {
        className: `rcb-accordion-wrapper rcb-icon-${ iconType || 'plus' }`,
        style: { gap: `${ gap }px` }
    } );

    return (
        <div { ...blockProps }>
            <InnerBlocks.Content />
        </div>
    );
}
