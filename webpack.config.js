const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'builder/index': path.resolve( process.cwd(), 'src/builder', 'index.js' ),
        'blocks/component-builder/index': path.resolve( process.cwd(), 'src/blocks/component-builder', 'index.js' )
	},
};
