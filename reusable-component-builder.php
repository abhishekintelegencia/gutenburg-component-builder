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

// Include Core Files removed
require_once RCB_PLUGIN_DIR . 'cpt/component-template.php';
require_once RCB_PLUGIN_DIR . 'core/renderer.php';

// Initialize Block //
function rcb_register_blocks()
{
	if (function_exists('register_block_type') && file_exists(RCB_PLUGIN_DIR . 'build/blocks/component-builder/block.json')) {
		register_block_type(RCB_PLUGIN_DIR . 'build/blocks/component-builder', array(
			'render_callback' => 'rcb_render_component_builder_block'
		));
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
	$raw_meta = get_post_meta( $post->ID );
	$flattened = array();
	foreach ( $raw_meta as $key => $values ) {
		// Skip private/internal keys
		if ( strpos( $key, '_' ) === 0 ) continue;
		$flattened[ $key ] = ( is_array( $values ) && count( $values ) === 1 ) ? $values[0] : $values;
	}
	$data['meta'] = $flattened;
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