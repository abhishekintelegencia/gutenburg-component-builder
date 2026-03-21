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
				
				// Pass the ACTUAL registry data
				wp_localize_script( 'rcb-builder-js', 'rcbGlobalConfig', array(
					'styleRegistry' => rcb_get_style_registry_data()
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

// Add "Duplicate" row action to Component Templates list
function rcb_duplicate_component_action( $actions, $post ) {
	if ( $post->post_type === 'component_template' ) {
		$url = wp_nonce_url( admin_url( 'admin.php?action=rcb_duplicate_component&post=' . $post->ID ), 'rcb_duplicate_' . $post->ID );
		$actions['duplicate'] = '<a href="' . $url . '" title="' . esc_attr__( 'Duplicate this component', 'reusable-component-builder' ) . '">' . __( 'Duplicate', 'reusable-component-builder' ) . '</a>';
	}
	return $actions;
}
add_filter( 'post_row_actions', 'rcb_duplicate_component_action', 10, 2 );

// Handle the duplication process
function rcb_handle_duplicate_action() {
	if ( isset( $_GET['action'] ) && $_GET['action'] === 'rcb_duplicate_component' && isset( $_GET['post'] ) ) {
		$post_id = intval( $_GET['post'] );
		check_admin_referer( 'rcb_duplicate_' . $post_id );

		$post = get_post( $post_id );
		if ( ! $post ) {
			wp_die( __( 'Post not found.', 'reusable-component-builder' ) );
		}

		$current_user = wp_get_current_user();
		$new_post = array(
			'post_title'   => $post->post_title . ' (Copy)',
			'post_content' => $post->post_content,
			'post_status'  => 'draft',
			'post_type'    => $post->post_type,
			'post_author'  => $current_user->ID,
		);

		$new_post_id = wp_insert_post( $new_post );

		if ( $new_post_id ) {
			// Copy all post meta (which includes _component_structure and other settings)
			$meta = get_post_custom( $post_id );
			foreach ( $meta as $key => $values ) {
				foreach ( $values as $value ) {
					add_post_meta( $new_post_id, $key, maybe_unserialize( $value ) );
				}
			}

			// Redirect back to the post list
			wp_redirect( admin_url( 'edit.php?post_type=component_template' ) );
			exit;
		} else {
			wp_die( __( 'Failed to duplicate the component.', 'reusable-component-builder' ) );
		}
	}
}
add_action( 'admin_action_rcb_duplicate_component', 'rcb_handle_duplicate_action' );

/**
 * Helper to get the Style Registry from options.
 * Handles migration from legacy comma-separated string to JSON array of objects.
 */
function rcb_get_style_registry_data() {
	$option_name = 'rcb_allowed_style_registry';
	$raw_data = get_option( $option_name, '' );

	// If it's a JSON string, decode it.
	if ( ! empty( $raw_data ) && ( strpos( $raw_data, '[' ) === 0 || strpos( $raw_data, '{' ) === 0 ) ) {
		$decoded = json_decode( $raw_data, true );
		if ( is_array( $decoded ) ) {
			return $decoded;
		}
	}

	// Migration logic: if it's a comma-separated string (old format)
	if ( ! empty( $raw_data ) && is_string( $raw_data ) ) {
		$items = array_filter( array_map( 'trim', explode( ',', $raw_data ) ) );
		$new_data = array();
		foreach ( $items as $item ) {
			$new_data[] = array(
				'id'       => uniqid(),
				'label'    => ucfirst( $item ),
				'property' => $item
			);
		}
		update_option( $option_name, wp_json_encode( $new_data ) );
		return $new_data;
	}

	return array();
}

/**
 * Add a settings sub-menu for Global Allowed Styles.
 */
function rcb_add_global_settings_menu() {
	add_submenu_page(
		'edit.php?post_type=component_template',
		__( 'Allowed Style Control', 'reusable-component-builder' ),
		__( 'Allowed Style Control', 'reusable-component-builder' ),
		'manage_options',
		'rcb-allowed-styles',
		'rcb_render_global_settings_page'
	);
}
add_action( 'admin_menu', 'rcb_add_global_settings_menu' );

/**
 * Render the Global Allowed Style Control settings page.
 */
function rcb_render_global_settings_page() {
	$registry = rcb_get_style_registry_data();
	?>
	<div class="wrap" id="rcb-style-registry-admin">
		<h1><?php _e( 'Global Allowed Style Controls', 'reusable-component-builder' ); ?></h1>
		<p><?php _e( 'Manage the CSS properties that users are allowed to control via the component builder.', 'reusable-component-builder' ); ?></p>
		
		<div class="rcb-settings-layout" style="display: flex; gap: 30px; margin-top: 20px;">
			<div class="rcb-settings-form" style="flex: 0 0 350px; background: #fff; padding: 20px; border: 1px solid #ccd0d4; border-radius: 4px; align-self: flex-start;">
				<h3><?php _e( 'Add/Edit Style Control', 'reusable-component-builder' ); ?></h3>
				<form id="rcb-style-control-form">
					<input type="hidden" id="rcb_style_id" name="id" value="">
					
					<div style="margin-bottom: 15px;">
						<label style="display: block; font-weight: 600; margin-bottom: 5px;"><?php _e( 'Style label name', 'reusable-component-builder' ); ?></label>
						<input type="text" id="rcb_style_label" name="label" class="widefat" placeholder="e.g. Z-Index" required>
					</div>
					
					<div style="margin-bottom: 20px;">
						<label style="display: block; font-weight: 600; margin-bottom: 5px;"><?php _e( 'Predefined style name', 'reusable-component-builder' ); ?></label>
						<select id="rcb_style_property" name="property" class="widefat" required>
							<option value=""><?php _e( '-- Select Property --', 'reusable-component-builder' ); ?></option>
							<optgroup label="Layout">
								<option value="z-index">z-index</option>
								<option value="opacity">opacity</option>
								<option value="overflow">overflow</option>
								<option value="cursor">cursor</option>
							</optgroup>
							<optgroup label="Visual">
								<option value="scale">scale</option>
								<option value="rotate">rotate</option>
								<option value="transition">transition</option>
								<option value="filter">filter</option>
								<option value="backdrop-filter">backdrop-filter</option>
							</optgroup>
						</select>
					</div>
					
					<button type="submit" class="button button-primary"><?php _e( 'Register Style Control', 'reusable-component-builder' ); ?></button>
					<button type="button" id="rcb-reset-form" class="button" style="display:none;"><?php _e( 'Cancel', 'reusable-component-builder' ); ?></button>
				</form>
			</div>
			
			<div class="rcb-settings-list" style="flex: 1;">
				<table class="wp-list-table widefat fixed striped">
					<thead>
						<tr>
							<th><?php _e( 'Label', 'reusable-component-builder' ); ?></th>
							<th><?php _e( 'CSS Property', 'reusable-component-builder' ); ?></th>
							<th style="width: 150px;"><?php _e( 'Actions', 'reusable-component-builder' ); ?></th>
						</tr>
					</thead>
					<tbody id="rcb-style-registry-table-body">
						<?php if ( empty( $registry ) ) : ?>
							<tr><td colspan="3"><?php _e( 'No styles registered yet.', 'reusable-component-builder' ); ?></td></tr>
						<?php else : ?>
							<?php foreach ( $registry as $item ) : ?>
								<tr data-id="<?php echo esc_attr( $item['id'] ); ?>" data-label="<?php echo esc_attr( $item['label'] ); ?>" data-property="<?php echo esc_attr( $item['property'] ); ?>">
									<td><strong><?php echo esc_html( $item['label'] ); ?></strong></td>
									<td><code><?php echo esc_html( $item['property'] ); ?></code></td>
									<td>
										<button class="button button-small rcb-edit-style"><?php _e( 'Edit', 'reusable-component-builder' ); ?></button>
										<button class="button button-small button-link-delete rcb-delete-style"><?php _e( 'Delete', 'reusable-component-builder' ); ?></button>
									</td>
								</tr>
							<?php endforeach; ?>
						<?php endif; ?>
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<script type="text/javascript">
	jQuery(document).ready(function($) {
		const $form = $('#rcb-style-control-form');
		const $tableBody = $('#rcb-style-registry-table-body');
		const $submitBtn = $form.find('button[type="submit"]');
		const $resetBtn = $('#rcb-reset-form');

		// Handle Save/Add
		$form.on('submit', function(e) {
			e.preventDefault();
			const data = {
				action: 'rcb_save_style_registry_item',
				nonce: '<?php echo wp_create_nonce( "rcb_style_registry_nonce" ); ?>',
				id: $('#rcb_style_id').val(),
				label: $('#rcb_style_label').val(),
				property: $('#rcb_style_property').val()
			};

			$submitBtn.prop('disabled', true).text('Saving...');

			$.post(ajaxurl, data, function(response) {
				if (response.success) {
					location.reload();
				} else {
					alert(response.data || 'Error saving style control.');
					$submitBtn.prop('disabled', false).text('Register Style Control');
				}
			});
		});

		// Handle Edit click
		$tableBody.on('click', '.rcb-edit-style', function() {
			const $tr = $(this).closest('tr');
			$('#rcb_style_id').val($tr.data('id'));
			$('#rcb_style_label').val($tr.data('label'));
			$('#rcb_style_property').val($tr.data('property'));
			
			$submitBtn.text('Update Style Control');
			$resetBtn.show();
		});

		$resetBtn.on('click', function() {
			$form[0].reset();
			$('#rcb_style_id').val('');
			$submitBtn.text('Register Style Control');
			$(this).hide();
		});

		// Handle Delete
		$tableBody.on('click', '.rcb-delete-style', function() {
			if (!confirm('Are you sure you want to delete this style control?')) return;
			
			const $tr = $(this).closest('tr');
			const data = {
				action: 'rcb_delete_style_registry_item',
				nonce: '<?php echo wp_create_nonce( "rcb_style_registry_nonce" ); ?>',
				id: $tr.data('id')
			};

			$.post(ajaxurl, data, function(response) {
				if (response.success) {
					$tr.fadeOut(function() { $(this).remove(); });
				} else {
					alert('Error deleting style.');
				}
			});
		});
	});
	</script>
	<?php
}

/**
 * AJAX Handler: Save or Update Style Registry Item.
 */
function rcb_save_style_registry_item() {
	check_ajax_referer( 'rcb_style_registry_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

	$id       = ! empty( $_POST['id'] ) ? sanitize_text_field( $_POST['id'] ) : uniqid();
	$label    = sanitize_text_field( $_POST['label'] );
	$property = sanitize_text_field( $_POST['property'] );

	if ( empty( $label ) || empty( $property ) ) {
		wp_send_json_error( 'Label and Property are required.' );
	}

	$registry = rcb_get_style_registry_data();
	$found = false;

	foreach ( $registry as &$item ) {
		if ( $item['id'] === $id ) {
			$item['label']    = $label;
			$item['property'] = $property;
			$found = true;
			break;
		}
	}

	if ( ! $found ) {
		$registry[] = array(
			'id'       => $id,
			'label'    => $label,
			'property' => $property
		);
	}

	update_option( 'rcb_allowed_style_registry', wp_json_encode( $registry ) );
	wp_send_json_success();
}
add_action( 'wp_ajax_rcb_save_style_registry_item', 'rcb_save_style_registry_item' );

/**
 * AJAX Handler: Delete Style Registry Item.
 */
function rcb_delete_style_registry_item() {
	check_ajax_referer( 'rcb_style_registry_nonce', 'nonce' );
	if ( ! current_user_can( 'manage_options' ) ) wp_send_json_error( 'Unauthorized' );

	$id = sanitize_text_field( $_POST['id'] );
	$registry = rcb_get_style_registry_data();
	
	$new_registry = array_filter( $registry, function( $item ) use ( $id ) {
		return $item['id'] !== $id;
	} );

	update_option( 'rcb_allowed_style_registry', wp_json_encode( array_values( $new_registry ) ) );
	wp_send_json_success();
}
add_action( 'wp_ajax_rcb_delete_style_registry_item', 'rcb_delete_style_registry_item' );
