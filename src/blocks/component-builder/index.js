import { registerBlockType, registerBlockVariation } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => <InnerBlocks.Content />,
} );

apiFetch({ path: '/rcb/v1/templates/' }).then((templates) => {
    templates.forEach(template => {
        registerBlockVariation(metadata.name, {
            name: `template-${template.id}`,
            title: template.title || `Component ${template.id}`,
            icon: 'layout',
            attributes: { 
                templateId: template.id,
                mode: template.type || 'static'
            },
            isActive: (blockAttributes) => blockAttributes.templateId === template.id,
            scope: ['inserter']
        });
    });
}).catch(() => {});
