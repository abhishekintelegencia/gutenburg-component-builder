import { registerBlockType } from '@wordpress/blocks';
import './style.scss';

import tabsBlock from './block.json';
import TabsEdit from './edit';
import TabsSave from './save';

// Register Parent Tabs Block
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

registerBlockType( tabsBlock.name, {
    edit: TabsEdit,
    save: TabsSave,
    deprecated: [
        {
            attributes: {
                ...tabsBlock.attributes,
                activeTab: {
                    type: 'number',
                    default: 0
                }
            },
            save( { attributes } ) {
                const { layout, blockId } = attributes;
                // Old styleVars logic
                const styleVars = {};
                // ... minimal vars for fallback ...

                const blockProps = useBlockProps.save( {
                    className: `rcb-tabs-wrapper layout-${ layout }`,
                    'data-id': blockId,
                } );

                return (
                    <div { ...blockProps }>
                        <div className="rcb-tabs-nav" role="tablist"></div>
                        <div className="rcb-tabs-content-wrapper">
                            <div className="rcb-tabs-content-area" { ...useInnerBlocksProps.save() } />
                        </div>
                    </div>
                );
            }
        }
    ]
} );
