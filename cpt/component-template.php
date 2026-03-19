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
	echo '<input type="hidden" id="rcb_component_structure_input" name="_component_structure" value="' . esc_attr( $structure ) . '" />';
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
	if ( ( $hook === 'post-new.php' || $hook === 'post.php' ) && isset( $post ) ) {
		if ( 'component_template' === $post->post_type ) {
			$global_registry_opt = get_option( 'rcb_global_style_registry', '' );
			$global_registry_arr = array_filter( array_map( 'trim', explode( ',', $global_registry_opt ) ) );

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
				$registry_data = rcb_get_style_registry_data();
				wp_localize_script( 'rcb-builder-js', 'rcbGlobalConfig', array(
					'styleRegistry' => $registry_data
				) );
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

// Register Settings Page for Global Style Registry
function rcb_register_global_settings_page() {
	add_submenu_page(
		'edit.php?post_type=component_template',
		__( 'Allowed Style Control', 'reusable-component-builder' ),
		__( 'Allowed Style Control', 'reusable-component-builder' ),
		'manage_options',
		'rcb-allowed-styles',
		'rcb_render_global_settings_page'
	);
}
add_action( 'admin_menu', 'rcb_register_global_settings_page' );

function rcb_register_global_settings() {
	register_setting( 'rcb_global_styles_group', 'rcb_global_style_registry' );
}
add_action( 'admin_init', 'rcb_register_global_settings' );

/**
 * Helper to get style registry data (with migration support)
 */
function rcb_get_style_registry_data() {
	$registry = get_option( 'rcb_global_style_registry', '' );
	
	// If empty string, return empty array
	if ( empty( $registry ) ) {
		return array();
	}

	// Try to decode as JSON
	$decoded = json_decode( $registry, true );
	if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
		return $decoded;
	}

	// Migration: Convert comma-separated string to object array
	$items = array_filter( array_map( 'trim', explode( ',', $registry ) ) );
	$new_registry = array();
	foreach ( $items as $item ) {
		$new_registry[] = array(
			'id'       => uniqid(),
			'label'    => ucwords( str_replace( '-', ' ', $item ) ),
			'property' => $item
		);
	}
	
	// Save migrated version
	update_option( 'rcb_global_style_registry', wp_json_encode( $new_registry ) );
	return $new_registry;
}

function rcb_render_global_settings_page() {
	$registry = rcb_get_style_registry_data();
	$predefined_styles = array(
		'z-index'        => 'Z-Index',
		'opacity'        => 'Opacity',
		'scale'          => 'Scale (Transform)',
		'transition'     => 'Transition',
		'box-shadow'     => 'Box Shadow',
		'filter'         => 'Filter (Blur/Bright)',
		'cursor'         => 'Cursor',
		'width'          => 'Width',
		'height'         => 'Height',
		'aspect-ratio'   => 'Aspect Ratio',
		'object-fit'     => 'Object Fit',
		'perspective'    => 'Perspective',
		'transform'      => 'Transform (Custom)',
		'pointer-events' => 'Pointer Events',
		'overflow'       => 'Overflow',
		'position'       => 'Position (Absolute/Fixed)',
		'top'            => 'Top Position',
		'right'          => 'Right Position',
		'bottom'         => 'Bottom Position',
		'left'           => 'Left Position',
		'background-size' => 'Background Size',
		'flex-grow'      => 'Flex Grow',
		'flex-shrink'    => 'Flex Shrink',
	);
	?>
	<div class="wrap">
		<h1><?php _e( 'Global Allowed Style Controls', 'reusable-component-builder' ); ?></h1>
		<p><?php _e( 'Add custom CSS properties that you want to be available as style controls within the component builder.', 'reusable-component-builder' ); ?></p>
		
		<div class="rcb-settings-card" style="background:#fff; padding:20px; border:1px solid #ccd0d4; box-shadow:0 1px 1px rgba(0,0,0,.04); margin-bottom:20px; max-width:800px;">
			<h2 style="margin-top:0;"><?php _e( 'Add New Style Control', 'reusable-component-builder' ); ?></h2>
			<form id="rcb-add-style-form" style="display:flex; gap:15px; align-items:flex-end;">
				<div style="flex:1;">
					<label style="display:block; margin-bottom:5px; font-weight:600;"><?php _e( 'Style label name', 'reusable-component-builder' ); ?></label>
					<input type="text" id="rcb-style-label" placeholder="e.g. Layer Depth" style="width:100%;" required>
				</div>
				<div style="flex:1;">
					<label style="display:block; margin-bottom:5px; font-weight:600;"><?php _e( 'Predefined style name', 'reusable-component-builder' ); ?></label>
					<select id="rcb-style-property" style="width:100%;">
						<?php foreach($predefined_styles as $prop => $label): ?>
							<option value="<?php echo esc_attr($prop); ?>"><?php echo esc_html($label); ?> (<?php echo esc_html($prop); ?>)</option>
						<?php endforeach; ?>
					</select>
				</div>
				<button type="submit" class="button button-primary"><?php _e( 'Save Style', 'reusable-component-builder' ); ?></button>
			</form>
		</div>

		<table class="wp-list-table widefat fixed striped" style="max-width:800px;">
			<thead>
				<tr>
					<th style="width:50px;"><?php _e( 'S.No.', 'reusable-component-builder' ); ?></th>
					<th><?php _e( 'Label Name', 'reusable-component-builder' ); ?></th>
					<th><?php _e( 'Style name', 'reusable-component-builder' ); ?></th>
					<th style="width:150px;"><?php _e( 'Action', 'reusable-component-builder' ); ?></th>
				</tr>
			</thead>
			<tbody id="rcb-style-list-body">
				<?php if (empty($registry)): ?>
					<tr class="no-items"><td colspan="4" style="text-align:center;"><?php _e( 'No custom styles added yet.', 'reusable-component-builder' ); ?></td></tr>
				<?php else: ?>
					<?php foreach($registry as $index => $item): ?>
						<tr data-id="<?php echo esc_attr($item['id']); ?>">
							<td><?php echo $index + 1; ?></td>
							<td class="col-label"><?php echo esc_html($item['label']); ?></td>
							<td class="col-property"><code><?php echo esc_html($item['property']); ?></code></td>
							<td>
								<button class="button rcb-edit-style" data-id="<?php echo esc_attr($item['id']); ?>"><?php _e( 'Edit', 'reusable-component-builder' ); ?></button>
								<button class="button rcb-delete-style button-link-delete" data-id="<?php echo esc_attr($item['id']); ?>"><?php _e( 'Delete', 'reusable-component-builder' ); ?></button>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php endif; ?>
			</tbody>
		</table>
	</div>

	<script>
	jQuery(document).ready(function($) {
		const $form = $('#rcb-add-style-form');
		const $list = $('#rcb-style-list-body');
		let isEditing = false;
		let editingId = null;

		$form.on('submit', function(e) {
			e.preventDefault();
			const label = $('#rcb-style-label').val();
			const property = $('#rcb-style-property').val();

			$.post(ajaxurl, {
				action: 'rcb_save_style_registry_item',
				id: editingId,
				label: label,
				property: property,
				nonce: '<?php echo wp_create_nonce("rcb_registry_nonce"); ?>'
			}, function(response) {
				if (response.success) {
					location.reload();
				} else {
					alert(response.data || 'Error saving style.');
				}
			});
		});

		$list.on('click', '.rcb-delete-style', function() {
			if (!confirm('Are you sure you want to delete this style?')) return;
			const id = $(this).data('id');
			$.post(ajaxurl, {
				action: 'rcb_delete_style_registry_item',
				id: id,
				nonce: '<?php echo wp_create_nonce("rcb_registry_nonce"); ?>'
			}, function(response) {
				if (response.success) {
					location.reload();
				}
			});
		});

		$list.on('click', '.rcb-edit-style', function() {
			const tr = $(this).closest('tr');
			editingId = $(this).data('id');
			const label = tr.find('.col-label').text();
			const property = tr.find('.col-property code').text();

			$('#rcb-style-label').val(label);
			$('#rcb-style-property').val(property);
			$form.find('button[type="submit"]').text('Update Style');
			isEditing = true;
			window.scrollTo(0,0);
		});
	});
	</script>
	<?php
}

/**
 * AJAX Handler: Save Style Registry Item
 */
function rcb_save_style_registry_item_handler() {
	check_ajax_referer( 'rcb_registry_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

	$id       = !empty($_POST['id']) ? sanitize_text_field($_POST['id']) : uniqid();
	$label    = sanitize_text_field( $_POST['label'] );
	$property = sanitize_text_field( $_POST['property'] );

	if ( empty($label) || empty($property) ) wp_send_json_error( 'Missing fields' );

	$registry = rcb_get_style_registry_data();
	
	$found = false;
	foreach ($registry as &$item) {
		if ($item['id'] === $_POST['id']) {
			$item['label'] = $label;
			$item['property'] = $property;
			$found = true;
			break;
		}
	}

	if (!$found) {
		$registry[] = array(
			'id'       => $id,
			'label'    => $label,
			'property' => $property
		);
	}

	update_option( 'rcb_global_style_registry', wp_json_encode( $registry ) );
	wp_send_json_success();
}
add_action( 'wp_ajax_rcb_save_style_registry_item', 'rcb_save_style_registry_item_handler' );

/**
 * AJAX Handler: Delete Style Registry Item
 */
function rcb_delete_style_registry_item_handler() {
	check_ajax_referer( 'rcb_registry_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Permission denied' );

	$id = sanitize_text_field( $_POST['id'] );
	if ( empty($id) ) wp_send_json_error( 'Missing ID' );

	$registryArr = rcb_get_style_registry_data();
	$newRegistry = array();
	foreach ($registryArr as $item) {
		if ($item['id'] !== $id) {
			$newRegistry[] = $item;
		}
	}

	update_option( 'rcb_global_style_registry', wp_json_encode( $newRegistry ) );
	wp_send_json_success();
}
add_action( 'wp_ajax_rcb_delete_style_registry_item', 'rcb_delete_style_registry_item_handler' );

