<?php
/**
 * Plugin Name: Reusable Component Builder System
 * Description: Create reusable component templates via CPT and use them in Gutenberg blocks with independent content and styling.
 * Version: 1.0.0
 * Author: Antigravity
 * Text Domain: reusable-component-builder
 */

if (!defined('ABSPATH')) {
	exit;
}

define('RCB_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RCB_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RCB_VERSION', '1.0.0');

require_once RCB_PLUGIN_DIR . 'cpt/component-template.php';
require_once RCB_PLUGIN_DIR . 'core/renderer.php';
require_once RCB_PLUGIN_DIR . 'core/ajax-handler.php';

// Add custom block category
function rcb_block_categories( $categories ) {
	array_unshift(
		$categories,
		array(
			'slug'  => 'rcb-components',
			'title' => __( 'RCB COMPONENTS', 'reusable-component-builder' ),
			'icon'  => 'layout',
		)
	);
	return $categories;
}
add_filter( 'block_categories_all', 'rcb_block_categories', 10, 2 );
add_filter( 'block_categories', 'rcb_block_categories', 10, 2 ); // Backward compatibility

// Initialize Blocks //
function rcb_register_blocks()
{
	$blocks_dir = RCB_PLUGIN_DIR . 'build/blocks';
	if ( is_dir( $blocks_dir ) ) {
		$it = new DirectoryIterator( $blocks_dir );
		foreach ( $it as $fileinfo ) {
			if ( $fileinfo->isDir() && ! $fileinfo->isDot() ) {
				$block_json = $fileinfo->getPathname() . '/block.json';
				if ( file_exists( $block_json ) ) {
					$metadata = json_decode( file_get_contents( $block_json ), true );
					$args = array();
					
					// Handle dynamic rendering
					if ( isset( $metadata['name'] ) ) {
						if ( $metadata['name'] === 'reusable-component-builder/block' ) {
							$args['render_callback'] = 'rcb_render_component_builder_block';
						} elseif ( $metadata['name'] === 'rcb/header' ) {
							$args['render_callback'] = function( $attributes ) {
								ob_start();
								include RCB_PLUGIN_DIR . 'src/blocks/header/render.php';
								return ob_get_clean();
							};
						} elseif ( $metadata['name'] === 'rcb/advance-dynamic-slider' ) {
							$args['render_callback'] = 'rcb_render_advance_dynamic_slider_block';
						} elseif ( $metadata['name'] === 'rcb/accordion' ) {
							$args['render_callback'] = 'rcb_render_accordion_block';
						} elseif ( $metadata['name'] === 'rcb/tabs' ) {
							$args['render_callback'] = 'rcb_render_tabs_block';
						}
					}
					
					register_block_type_from_metadata( $fileinfo->getPathname(), $args );

					// Handle sub-blocks (like accordion-item)
					$sub_it = new DirectoryIterator( $fileinfo->getPathname() );
					foreach ( $sub_it as $sub_file ) {
						if ( $sub_file->isDir() && ! $sub_file->isDot() ) {
							$sub_json = $sub_file->getPathname() . '/block.json';
							if ( file_exists( $sub_json ) ) {
								$sub_metadata = json_decode( file_get_contents( $sub_json ), true );
								$sub_args = array();
								if ( isset( $sub_metadata['name'] ) && $sub_metadata['name'] === 'rcb/accordion-item' ) {
									$sub_args['render_callback'] = 'rcb_render_accordion_item_block';
								} elseif ( isset( $sub_metadata['name'] ) && $sub_metadata['name'] === 'rcb/tab-item' ) {
									$sub_args['render_callback'] = 'rcb_render_tab_item_block';
								}
								register_block_type_from_metadata( $sub_file->getPathname(), $sub_args );
							}
						}
					}
				}
			}
		}
	}
}
add_action('init', 'rcb_register_blocks');


// Add REST endpoint to fetch template structures reliably
function rcb_register_template_rest_route()
{
	register_rest_route('rcb/v1', '/templates/', array(
		'methods' => 'GET',
		'callback' => 'rcb_get_all_templates',
		'permission_callback' => '__return_true'
	));
}
add_action('rest_api_init', 'rcb_register_template_rest_route');

/**
 * Inject full post meta into REST API responses so the block editor preview can
 * resolve custom_meta dynamic fields (mirrors what get_post_meta() does on the frontend).
 */
function rcb_inject_meta_into_rest( $response, $post, $request ) {
	$data = $response->get_data();
	$existing_meta = isset( $data['meta'] ) && is_array( $data['meta'] ) ? $data['meta'] : array();
	$raw_meta = get_post_meta( $post->ID );
	
	foreach ( $raw_meta as $key => $values ) {
		// Skip private/internal keys
		if ( strpos( $key, '_' ) === 0 ) continue;
		
		// CRITICAL: Do not overwrite meta keys that are already correctly formatted 
		// by WordPress core according to their registered REST API schema.
		// This prevents "ast-page-background-meta is not of type object" errors.
		if ( array_key_exists( $key, $existing_meta ) ) continue;

		if ( is_array( $values ) && count( $values ) === 1 ) {
			$existing_meta[ $key ] = $values[0];
		} else {
			$existing_meta[ $key ] = $values;
		}
	}
	
	$data['meta'] = $existing_meta;
	$response->set_data( $data );
	return $response;
}
add_filter( 'rest_prepare_post',   'rcb_inject_meta_into_rest', 10, 3 );
add_filter( 'rest_prepare_page',   'rcb_inject_meta_into_rest', 10, 3 );
add_filter( 'rest_prepare_events', 'rcb_inject_meta_into_rest', 10, 3 );


function rcb_register_events_cpt()
{
	register_post_type('events', array(
		'labels' => array(
			'name' => __('Events', 'reusable-component-builder'),
			'singular_name' => __('Event', 'reusable-component-builder'),
		),
		'public' => true,
		'has_archive' => true,
		'show_in_rest' => true,
		'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
		'menu_icon' => 'dashicons-calendar-alt'
	));
	register_taxonomy('event_category', 'events', array(
		'label' => __('Event Categories', 'reusable-component-builder'),
		'hierarchical' => true,
		'show_in_rest' => true,
	));
}
add_action('init', 'rcb_register_events_cpt');

function rcb_get_all_templates()
{
	$posts = get_posts(array(
		'post_type' => 'component_template',
		'posts_per_page' => -1,
		'post_status' => 'publish'
	));
	$data = array();
	foreach ($posts as $p) {
		$structure = get_post_meta($p->ID, '_component_structure', true);
		$type = get_post_meta($p->ID, '_component_type', true);
		$html = get_post_meta($p->ID, '_component_html', true);
		$data[] = array(
			'id' => $p->ID,
			'title' => $p->post_title,
			'structure' => $structure ? json_decode($structure, true) : null,
			'type' => $type ? $type : 'visual',
			'html' => $html
		);
	}
	return rest_ensure_response($data);
}

function rcb_enqueue_frontend_scripts() {
	$version = file_exists( RCB_PLUGIN_DIR . 'assets/js/rcb-frontend.js' ) ? filemtime( RCB_PLUGIN_DIR . 'assets/js/rcb-frontend.js' ) : RCB_VERSION;
	wp_enqueue_style( 'dashicons' );
	wp_enqueue_script( 'rcb-frontend-js', RCB_PLUGIN_URL . 'assets/js/rcb-frontend.js', array('jquery'), $version, true );
	wp_localize_script( 'rcb-frontend-js', 'rcbAjax', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce('rcb_ajax_nonce')
	));
}
add_action( 'wp_enqueue_scripts', 'rcb_enqueue_frontend_scripts' );