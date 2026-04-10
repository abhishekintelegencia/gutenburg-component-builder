const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'builder/index': path.resolve( process.cwd(), 'src/builder', 'index.js' ),
		'blocks/component-builder/index': path.resolve( process.cwd(), 'src/blocks/component-builder', 'index.js' ),
		'blocks/accordion/index': path.resolve( process.cwd(), 'src/blocks/accordion', 'index.js' ),
		'blocks/accordion/accordion-item/index': path.resolve( process.cwd(), 'src/blocks/accordion', 'accordion-item', 'index.js' ),
		'blocks/tabs/index': path.resolve( process.cwd(), 'src/blocks/tabs', 'index.js' ),
		'blocks/tabs/tab-item/index': path.resolve( process.cwd(), 'src/blocks/tabs/tab-item', 'index.js' ),
		'blocks/slider/index': path.resolve( process.cwd(), 'src/blocks/slider', 'index.js' ),
		'blocks/slider/view': path.resolve( process.cwd(), 'src/blocks/slider', 'view.js' ),
		'blocks/slider/slide-item/index': path.resolve( process.cwd(), 'src/blocks/slider/slide-item', 'index.js' ),
	},
};
