<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action('wp_ajax_rcb_load_loop_page', 'rcb_ajax_load_loop_page');
add_action('wp_ajax_nopriv_rcb_load_loop_page', 'rcb_ajax_load_loop_page');

function rcb_ajax_load_loop_page() {
	check_ajax_referer('rcb_ajax_nonce', 'nonce');

	$attributes_json = isset($_POST['attributes']) ? stripslashes($_POST['attributes']) : '';
	$paged = isset($_POST['paged']) ? intval($_POST['paged']) : 1;
	
	if (empty($attributes_json)) {
		wp_send_json_error('No attributes provided');
	}

	$attributes = json_decode($attributes_json, true);

	// The rcb_render_component_builder_block function will now read $_POST['paged'] when wp_doing_ajax() is true!
	$html = rcb_render_component_builder_block($attributes, '');

	wp_send_json_success(array(
		'html' => $html
	));
}
