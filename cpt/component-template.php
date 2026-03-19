<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function rcb_register_component_template_cpt() {
	$labels = array(
		'name'                  => _x( 'Component Templates', 'Post type general name', 'reusable-component-builder' ),
		'singular_name'         => _x( 'Component Template', 'Post type singular name', 'reusable-component-builder' ),
		'menu_name'             => _x( 'Component Templates', 'Admin Menu text', 'reusable-component-builder' ),
		'name_admin_bar'        => _x( 'Component Template', 'Add New on Toolbar', 'reusable-component-builder' ),
		'add_new'               => __( 'Add New', 'reusable-component-builder' ),
		'add_new_item'          => __( 'Add New Component Template', 'reusable-component-builder' ),
		'new_item'              => __( 'New Component Template', 'reusable-component-builder' ),
		'edit_item'             => __( 'Edit Component Template', 'reusable-component-builder' ),
		'view_item'             => __( 'View Component Template', 'reusable-component-builder' ),
		'all_items'             => __( 'All Component Templates', 'reusable-component-builder' ),
		'search_items'          => __( 'Search Component Templates', 'reusable-component-builder' ),
		'parent_item_colon'     => __( 'Parent Component Templates:', 'reusable-component-builder' ),
		'not_found'             => __( 'No component templates found.', 'reusable-component-builder' ),
		'not_found_in_trash'    => __( 'No component templates found in Trash.', 'reusable-component-builder' ),
	);

	$args = array(
		'labels'             => $labels,
		'public'             => false,
		'publicly_queryable' => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => false,
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 20,
		'menu_icon'          => 'dashicons-layout',
		'supports'           => array( 'title' ),
		'show_in_rest'       => true, // Important for Gutenberg / REST API access
	);

	register_post_type( 'component_template', $args );

	// Register meta for storing structure
	register_post_meta( 'component_template', '_component_structure', array(
		'type'         => 'string',
		'description'  => 'JSON breakdown of the component structure',
		'single'       => true,
		'show_in_rest' => true,
	) );
}
add_action( 'init', 'rcb_register_component_template_cpt' );

// Add Meta Box for Builder UI
function rcb_add_component_template_metabox() {
	add_meta_box(
		'rcb_component_builder',
		__( 'Template Builder', 'reusable-component-builder' ),
		'rcb_component_builder_html',
		'component_template',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes', 'rcb_add_component_template_metabox' );

function rcb_component_builder_html( $post ) {
	// Render UI using React
	$structure = get_post_meta( $post->ID, '_component_structure', true );
	$type = get_post_meta( $post->ID, '_component_type', true );
	$html = get_post_meta( $post->ID, '_component_html', true );
	if ( empty( $structure ) ) {
		$structure = wp_json_encode( array( 'structure' => array() ) );
	}
    if ( empty( $type ) ) {
        $type = 'visual';
    }
	
	wp_nonce_field( 'rcb_save_template_meta', 'rcb_template_meta_nonce' );
	
	echo '<div id="rcb-template-builder-root"></div>';
	echo '<input type="hidden" id="rcb-structure-data" name="_component_structure" value="' . esc_attr( $structure ) . '" />';
    echo '<input type="hidden" id="rcb-template-type-data" name="_component_type" value="' . esc_attr( $type ) . '" />';
	echo '<textarea id="rcb-html-data" name="_component_html" style="display:none;">' . esc_textarea( $html ) . '</textarea>';
}

function rcb_save_component_template_meta( $post_id ) {
	if ( ! isset( $_POST['rcb_template_meta_nonce'] ) || ! wp_verify_nonce( $_POST['rcb_template_meta_nonce'], 'rcb_save_template_meta' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['_component_structure'] ) ) {
		// Just validate it is JSON
		$structure_data = wp_unslash( $_POST['_component_structure'] );
		$decoded = json_decode( $structure_data );
		if ( json_last_error() === JSON_ERROR_NONE ) {
			update_post_meta( $post_id, '_component_structure', $structure_data );
		}
	}
    if ( isset( $_POST['_component_type'] ) ) {
        update_post_meta( $post_id, '_component_type', sanitize_text_field( $_POST['_component_type'] ) );
    }
    if ( isset( $_POST['_component_html'] ) ) {
        if ( current_user_can('unfiltered_html') ) {
            update_post_meta( $post_id, '_component_html', wp_unslash($_POST['_component_html']) );
        } else {
            update_post_meta( $post_id, '_component_html', wp_kses_post( wp_unslash( $_POST['_component_html'] ) ) );
        }
    }
}
add_action( 'save_post_component_template', 'rcb_save_component_template_meta' );

// Enqueue admin scripts for the builder
function rcb_enqueue_admin_scripts( $hook ) {
	global $post;
	if ( $hook === 'post-new.php' || $hook === 'post.php' ) {
		if ( 'component_template' === $post->post_type ) {
			$asset_file = RCB_PLUGIN_DIR . 'build/builder/index.asset.php';
			if ( file_exists( $asset_file ) ) {
				$assets = require $asset_file;
				wp_enqueue_script(
					'rcb-builder-js',
					RCB_PLUGIN_URL . 'build/builder/index.js',
					$assets['dependencies'],
					$assets['version'],
					true
				);
				wp_enqueue_style('wp-components');
				if ( file_exists( RCB_PLUGIN_DIR . 'build/builder/style-index.css' ) ) {
					wp_enqueue_style(
						'rcb-builder-css',
						RCB_PLUGIN_URL . 'build/builder/style-index.css',
						array( 'wp-components' ),
						$assets['version']
					);
				}
			}
		}
	}
}
add_action( 'admin_enqueue_scripts', 'rcb_enqueue_admin_scripts' );
