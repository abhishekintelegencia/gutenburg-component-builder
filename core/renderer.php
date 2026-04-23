<?php

/**
 * Main render callback — acts as a dispatcher.
 * Routes to a specialized handler based on the template_type meta.
 */
function rcb_render_component_builder_block( $attributes, $content ) {
	$template_id = isset( $attributes['templateId'] ) ? intval( $attributes['templateId'] ) : 0;
	if ( ! $template_id ) {
		return '';
	}

	global $post;
	if ( ! $post ) {
		$post = get_post();
	}

	$unique_id = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : uniqid();
	
	/**
	 * Robust Fallback for InnerBlocks in Dynamic Context:
	 * In some WP versions/configs, nested core blocks in an API v3 dynamic block 
	 * don't correctly pass their rendered content to $content. We manually 
	 * parse and render them here if $content comes in empty.
	 */
	if ( empty( $content ) && $post && ! empty( $post->post_content ) ) {
		$all_blocks = parse_blocks( $post->post_content );
		$blocks_to_check = $all_blocks;
		$found_block = null;
		
		while ( ! empty( $blocks_to_check ) ) {
			$curr = array_shift( $blocks_to_check );
			if ( $curr['blockName'] === 'reusable-component-builder/block' ) {
				if ( ( isset( $curr['attrs']['uniqueId'] ) && $curr['attrs']['uniqueId'] === $unique_id ) || ( count( $all_blocks ) === 1 ) ) {
					$found_block = $curr;
					break;
				}
			}
			if ( ! empty( $curr['innerBlocks'] ) ) {
				$blocks_to_check = array_merge( $blocks_to_check, $curr['innerBlocks'] );
			}
		}
		
		if ( $found_block && ! empty( $found_block['innerBlocks'] ) ) {
			foreach ( $found_block['innerBlocks'] as $inner_b ) {
				$content .= render_block( $inner_b );
			}
		}
	}

	$template_type = strtolower( get_post_meta( $template_id, '_component_type', true ) ?: 'visual' );

	switch ( $template_type ) {
		case 'query':
			$output = rcb_render_query_type( $attributes, $content, $template_id, $unique_id, $post );
			break;
		case 'meta':
			$output = rcb_render_meta_type( $attributes, $content, $template_id, $unique_id, $post );
			break;
		case 'visual':
		default:
			$output = rcb_render_visual_type( $attributes, $content, $template_id, $unique_id, $post );
			break;
	}

	return $output;
}

/**
 * Handler: Visual Layout
 * Renders a static visual template with no dynamic query.
 */
function rcb_render_visual_type( $attributes, $content, $template_id, $unique_id, $post ) {
	$mode         = isset( $attributes['mode'] ) ? $attributes['mode'] : 'static';
	$content_data = isset( $attributes['content'] ) ? $attributes['content'] : array();
	$styles_data  = isset( $attributes['styles'] ) ? $attributes['styles'] : array();
	$visibility   = isset( $attributes['visibilityVars'] ) ? $attributes['visibilityVars'] : array(
		'showTitle'   => true,
		'showExcerpt' => true,
		'showImage'   => true,
		'showButton'  => true,
	);

	$structure_json = get_post_meta( $template_id, '_component_structure', true );
	$structure_data = $structure_json ? json_decode( $structure_json, true ) : array();
	$nodes          = isset( $structure_data['structure'] ) ? $structure_data['structure'] : array();

	$style_registry = '';
	$inner_output   = rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content, $style_registry, $unique_id );

	$style_registry = ".rcb-instance-{$unique_id} *, .rcb-instance-{$unique_id} { box-sizing: border-box !important; position: relative; }\n" . 
	                  ".rcb-instance-{$unique_id} { width: 100% !important; overflow-x: hidden !important; }\n" .
	                  ".rcb-instance-{$unique_id} .rcb-image img { max-width: 100%; height: auto; display: block; }\n" . 
	                  ".rcb-instance-{$unique_id} .rcb-tab-item.is-hidden { display: none !important; }\n" .
	                  $style_registry;
	$output = sprintf( '<div class="rcb-component-builder rcb-instance-%s">%s</div>', esc_attr( $unique_id ), $inner_output );

	if ( ! empty( $style_registry ) ) {
		$output = "<style>{$style_registry}</style>" . $output;
	}

	return $output;
}

/**
 * Handler: Dynamic Post Loop (Query)
 * Renders a WP_Query loop with optional pagination.
 */
function rcb_render_query_type( $attributes, $content, $template_id, $unique_id, $global_post ) {
	$content_data = isset( $attributes['content'] ) ? $attributes['content'] : array();
	$styles_data  = isset( $attributes['styles'] ) ? $attributes['styles'] : array();
	$visibility   = isset( $attributes['visibilityVars'] ) ? $attributes['visibilityVars'] : array(
		'showTitle'   => true,
		'showExcerpt' => true,
		'showImage'   => true,
		'showButton'  => true,
	);

	$structure_json = get_post_meta( $template_id, '_component_structure', true );
	$structure_data = $structure_json ? json_decode( $structure_json, true ) : array();
	$nodes          = isset( $structure_data['structure'] ) ? $structure_data['structure'] : array();

	$style_registry = '';

	// Determine current page robustly
	if ( wp_doing_ajax() && isset( $_POST['paged'] ) ) {
		$paged = intval( $_POST['paged'] );
	} else {
		$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : ( ( get_query_var( 'page' ) ) ? get_query_var( 'page' ) : 1 );
	}
	$paged = max( 1, intval( $paged ) );

	$args = array(
		'post_type'      => isset( $attributes['postType'] ) ? $attributes['postType'] : 'post',
		'posts_per_page' => isset( $attributes['postsPerPage'] ) ? intval( $attributes['postsPerPage'] ) : 3,
		'post_status'    => 'publish',
		'paged'          => $paged,
	);

	if ( ! empty( $attributes['taxonomy'] ) && ! empty( $attributes['termId'] ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => $attributes['taxonomy'],
				'field'    => 'term_id',
				'terms'    => $attributes['termId'],
			),
		);
	}

	$query       = new WP_Query( $args );
	$loop_output = '';

	if ( $query->have_posts() ) {
		$layout_class = isset( $attributes['layout'] ) ? 'rcb-layout-' . $attributes['layout'] : 'rcb-layout-grid';
		$columns      = isset( $attributes['columns'] ) ? intval( $attributes['columns'] ) : 3;

		$attr_json     = wp_json_encode( $attributes );
		$wrapper_style = '';
		if ( $layout_class === 'rcb-layout-grid' ) {
			$wrapper_style = sprintf( 'display: grid; grid-template-columns: repeat(%d, 1fr); gap: 20px;', $columns );
		}

		$loop_output .= sprintf(
			'<div class="rcb-loop-wrapper rcb-loop-container %s rcb-cols-%d" data-rcb-attributes="%s" style="%s">',
			esc_attr( $layout_class ),
			$columns,
			esc_attr( $attr_json ),
			esc_attr( $wrapper_style )
		);

		while ( $query->have_posts() ) {
			$query->the_post();
			$current_post = get_post();

			$post_output  = rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, 'query', $current_post, $visibility, $content, $style_registry, $unique_id . '-' . $current_post->ID );
			$loop_output .= sprintf( '<div class="rcb-loop-item">%s</div>', $post_output );
		}

		// Pagination
		if ( isset( $attributes['pagination'] ) && $attributes['pagination'] && $query->max_num_pages > 1 ) {
			$pagination_font_size = ! empty( $attributes['paginationFontSize'] ) ? $attributes['paginationFontSize'] : '1rem';
			$pg_text_color        = ! empty( $attributes['paginationTextColor'] ) ? $attributes['paginationTextColor'] : '#333';
			$pg_bg_color          = ! empty( $attributes['paginationBgColor'] ) ? $attributes['paginationBgColor'] : '#fff';
			$pg_active_text       = ! empty( $attributes['paginationActiveTextColor'] ) ? $attributes['paginationActiveTextColor'] : '#fff';
			$pg_active_bg         = ! empty( $attributes['paginationActiveBgColor'] ) ? $attributes['paginationActiveBgColor'] : '#c82333';
			$show_text            = isset( $attributes['showPaginationText'] ) ? $attributes['showPaginationText'] : true;

			$style_registry .= " .rcb-instance-{$unique_id} .rcb-pagination a.page-numbers { background-color: {$pg_bg_color} !important; color: {$pg_text_color} !important; border: 1px solid #ccc !important; padding: 10px 18px !important; text-decoration: none !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s ease !important; line-height: 1 !important; }";
			$style_registry .= " .rcb-instance-{$unique_id} .rcb-pagination a.current.page-numbers { background-color: {$pg_active_bg} !important; color: {$pg_active_text} !important; border-color: {$pg_active_bg} !important; pointer-events: none !important; }";
			$style_registry .= " .rcb-instance-{$unique_id} .rcb-pagination a.page-numbers:hover { opacity: 0.8 !important; }";

			$loop_output .= sprintf( '<!-- RCB_DEBUG: paged=%d, max_pages=%d -->', $paged, $query->max_num_pages );
			$loop_output .= sprintf(
				'<div class="rcb-pagination" style="display: flex; gap: 10px; width: 100%% !important; justify-content: space-between; flex-wrap: wrap; align-items: center; margin-top: 40px; font-size: %s; grid-column: 1 / -1 !important;">',
				esc_attr( $pagination_font_size )
			);

			$left_arrow  = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
			$right_arrow = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

			$prev_url     = get_pagenum_link( max( 1, $paged - 1 ) );
			$prev_opacity = $paged > 1 ? '1' : '0.5';
			$prev_pointer = $paged > 1 ? 'pointer' : 'not-allowed';
			$loop_output .= sprintf(
				'<a href="%s" class="rcb-pagination-prev page-numbers" style="cursor: %s; opacity: %s;">%s %s</a>',
				esc_url( $prev_url ), $prev_pointer, $prev_opacity, $left_arrow, ( $show_text ? 'Previous' : '' )
			);

			$loop_output .= '<div style="display: flex; gap: 8px;">';
			for ( $i = 1; $i <= $query->max_num_pages; $i++ ) {
				$is_active   = ( intval( $paged ) == $i );
				$url         = get_pagenum_link( $i );
				$cur_bg      = $is_active ? $pg_active_bg : $pg_bg_color;
				$cur_txt     = $is_active ? $pg_active_text : $pg_text_color;
				$loop_output .= sprintf(
					'<a href="%s" class="page-numbers %s" style="background-color: %s !important; color: %s !important;">%d</a>',
					esc_url( $url ), $is_active ? 'current' : '',
					esc_attr( $cur_bg ), esc_attr( $cur_txt ), $i
				);
			}
			$loop_output .= '</div>';

			$next_url     = get_pagenum_link( min( $query->max_num_pages, $paged + 1 ) );
			$next_opacity = $paged < intval( $query->max_num_pages ) ? '1' : '0.5';
			$next_pointer = $paged < intval( $query->max_num_pages ) ? 'pointer' : 'not-allowed';
			$loop_output .= sprintf(
				'<a href="%s" class="rcb-pagination-next page-numbers" style="cursor: %s; opacity: %s;">%s %s</a>',
				esc_url( $next_url ), $next_pointer, $next_opacity, ( $show_text ? 'Next' : '' ), $right_arrow
			);

			$loop_output .= '</div>'; // End .rcb-pagination
		}

		$loop_output .= '</div>'; // End rcb-loop-wrapper
		wp_reset_postdata();

	} else {
		$loop_output = '<p>' . __( 'No posts found.', 'reusable-component-builder' ) . '</p>';
	}

	$output = sprintf( '<div class="rcb-component-builder rcb-instance-%s">%s</div>', esc_attr( $unique_id ), $loop_output );

	if ( ! empty( $style_registry ) ) {
		$output = "<style>{$style_registry}</style>" . $output;
	}

	return $output;
}

/**
 * Handler: Dynamic Meta Display
 * Reads post meta keys defined in the template and renders them.
 * Supports strings, arrays, and serialized ACF-style data.
 */
function rcb_render_meta_type( $attributes, $content, $template_id, $unique_id, $post ) {
	if ( ! $post ) {
		return '';
	}

	$structure_json = get_post_meta( $template_id, '_component_structure', true );
	$structure_data = $structure_json ? json_decode( $structure_json, true ) : array();
	$nodes          = isset( $structure_data['structure'] ) ? $structure_data['structure'] : array();
	$content_data   = isset( $attributes['content'] ) ? $attributes['content'] : array();
	$styles_data    = isset( $attributes['styles'] ) ? $attributes['styles'] : array();

	$style_registry = '';
	$output_html    = rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, 'meta', $post, array(), $content, $style_registry, $unique_id );

	$id_to_show = ( $post instanceof WP_Post ) ? $post->ID : ( is_numeric( $post ) ? $post : 0 );
	$output = sprintf( '<!-- RCB Meta Debug: Post ID %d, Template ID %d, Nodes: %d --><div class="rcb-component-builder rcb-meta-display rcb-instance-%s">%s</div>', $id_to_show, $template_id, count( $nodes ), esc_attr( $unique_id ), $output_html );

	if ( ! empty( $style_registry ) ) {
		$output = "<style>{$style_registry}</style>" . $output;
	}

	return $output;
}
/**
 * Safely get post meta with an ACF fallback, returning as a string.
 */
function rcb_get_meta_value_with_fallback( $post_id, $meta_key ) {
	$meta_value = '';
	
	// Prioritize ACF get_field for better compatibility with field labels and keys
	if ( function_exists( 'get_field' ) ) {
		$meta_value = get_field( $meta_key, $post_id );
	}
	
	// Fallback to native WP meta
	if ( empty( $meta_value ) ) {
		$meta_value = get_post_meta( $post_id, $meta_key, true );
	}

	if ( is_array( $meta_value ) ) {
		if ( isset( $meta_value['url'] ) ) return $meta_value['url'];
		$meta_value = implode( ', ', array_filter( array_map( 'strval', $meta_value ) ) );
	} elseif ( is_serialized( $meta_value ) ) {
		$unserialized = maybe_unserialize( $meta_value );
		$meta_value = is_array( $unserialized ) ? implode( ', ', array_filter( array_map( 'strval', $unserialized ) ) ) : strval( $unserialized );
	} elseif ( is_object( $meta_value ) && ! method_exists( $meta_value, '__toString' ) ) {
		$meta_value = '';
	}
	
	$final_val = strval( $meta_value );
	
	if ( $final_val === '' ) {
		return '';
	}

	return $final_val;
}

/**
 * Resolve data for a specific node based on its mode (Static vs Dynamic)
 */
function rcb_resolve_node_data( $node, $content_data, $mode, $post = null ) {
	$field          = isset( $node['field'] ) ? $node['field'] : '';
	$type           = isset( $node['type'] ) ? $node['type'] : '';
	$dynamic_source = isset( $node['dynamicSource'] ) ? $node['dynamicSource'] : '';
	$dynamic_field  = isset( $node['dynamicField'] ) ? $node['dynamicField'] : '';
	
	$data = array(
		'text' => '',
		'url'  => '',
		'img'  => '',
		'tag'  => 'div',
	);

	switch ( $type ) {
		case 'heading':
			$data['tag']  = isset( $node['headingTag'] ) ? $node['headingTag'] : 'h2';
			$manual_text  = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
			$data['text'] = $manual_text;

			if ( empty( $data['text'] ) && ! empty( $dynamic_source ) ) {
				$dynamic_val = '';
				$lower_source = strtolower( $dynamic_source );
				$post_id_to_use = ( $post instanceof WP_Post ) ? $post->ID : ( is_numeric( $post ) ? $post : get_the_ID() );
				
				if ( ( $lower_source === 'post_title' || strpos( $lower_source, 'title' ) !== false ) && $post ) {
					$dynamic_val = ( $post instanceof WP_Post ) ? $post->post_title : get_the_title( $post_id_to_use );
				} elseif ( ( strpos( $lower_source, 'meta' ) !== false ) && $post && ! empty( $dynamic_field ) ) {
					$dynamic_val = rcb_get_meta_value_with_fallback( $post_id_to_use, $dynamic_field );
				}
				
				if ( ! empty( $dynamic_val ) ) {
					$data['text'] = $dynamic_val;
				}
			}
			
			if ( empty( $data['text'] ) ) {
				$data['text'] = 'Heading Title';
			}
			break;

		case 'text':
			$manual_text  = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
			$data['text'] = $manual_text;

			if ( empty( $data['text'] ) && ! empty( $dynamic_source ) ) {
				$dynamic_val = '';
				$lower_source = strtolower( $dynamic_source );
				$post_id_to_use = ( $post instanceof WP_Post ) ? $post->ID : ( is_numeric( $post ) ? $post : get_the_ID() );

				if ( ( $lower_source === 'post_title' || strpos( $lower_source, 'title' ) !== false ) && $post ) {
					$dynamic_val = ( $post instanceof WP_Post ) ? $post->post_title : get_the_title( $post_id_to_use );
				} elseif ( $lower_source === 'post_excerpt' && $post ) {
					$dynamic_val = get_the_excerpt( $post_id_to_use );
				} elseif ( $lower_source === 'post_content' && $post ) {
					$dynamic_val = apply_filters( 'the_content', get_post_field( 'post_content', $post_id_to_use ) );
				} elseif ( ( strpos( $lower_source, 'meta' ) !== false ) && $post && ! empty( $dynamic_field ) ) {
					$dynamic_val = rcb_get_meta_value_with_fallback( $post_id_to_use, $dynamic_field );
				}

				if ( ! empty( $dynamic_val ) ) {
					$data['text'] = $dynamic_val;
				}
			}

			if ( empty( $data['text'] ) ) {
				$data['text'] = 'Enter text here...';
			}
			break;

		case 'image':
			$manual_img = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';
			$data['img'] = $manual_img;

			if ( empty( $data['img'] ) && ! empty( $dynamic_source ) ) {
				$dynamic_img = '';
				$lower_source = strtolower( $dynamic_source );
				$post_id_to_use = ( $post instanceof WP_Post ) ? $post->ID : ( is_numeric( $post ) ? $post : get_the_ID() );

				if ( $lower_source === 'featured_image' && $post ) {
					$dynamic_img = get_the_post_thumbnail_url( $post_id_to_use, 'large' );
				} elseif ( ( strpos( $lower_source, 'meta' ) !== false ) && $post && ! empty( $dynamic_field ) ) {
					$dynamic_img = rcb_get_meta_value_with_fallback( $post_id_to_use, $dynamic_field );
				}

				if ( ! empty( $dynamic_img ) ) {
					$data['img'] = $dynamic_img;
				}
			}

			if ( empty( $data['img'] ) ) {
				$data['img'] = 'https://via.placeholder.com/600x400?text=Image';
			}
			break;

		case 'button':
			$manual_text = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
			$manual_url  = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';

			$data['text'] = $manual_text;
			$data['url']  = $manual_url;

			if ( ( empty( $data['text'] ) || empty( $data['url'] ) ) && ! empty( $dynamic_source ) ) {
				$lower_source = strtolower( $dynamic_source );
				$post_id_to_use = ( $post instanceof WP_Post ) ? $post->ID : ( is_numeric( $post ) ? $post : get_the_ID() );

				if ( ( $lower_source === 'permalink' || $lower_source === 'post_url' || strpos( $lower_source, 'url' ) !== false ) && $post ) {
					if ( empty( $data['url'] ) ) $data['url'] = get_permalink( $post_id_to_use );
				} elseif ( ( strpos( $lower_source, 'meta' ) !== false ) && $post && ! empty( $dynamic_field ) ) {
					$resolved_meta = rcb_get_meta_value_with_fallback( $post_id_to_use, $dynamic_field );
					if ( ! empty( $resolved_meta ) ) {
						if ( empty( $data['text'] ) ) $data['text'] = $resolved_meta;
						if ( empty( $data['url'] ) )  $data['url']  = $resolved_meta;
					}
				}
			}

			if ( empty( $data['text'] ) ) $data['text'] = 'Learn More';
			if ( empty( $data['url'] ) )  $data['url']  = '#';
			break;
	}

	return $data;
}

/**
 * Render visual nodes recursively.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '', &$style_registry = '', $instance_id = '' ) {
	$html = '';

	foreach ( $nodes as $node ) {
		$type         = isset( $node['type'] ) ? $node['type'] : '';
		$id           = ( isset( $node['id'] ) && ! empty( $node['id'] ) ) ? $node['id'] : 'rcb-node-' . uniqid();
		$field        = isset( $node['field'] ) ? $node['field'] : '';
		$node_columns = isset( $node['columns'] ) ? intval( $node['columns'] ) : 1;
		$allowed      = isset( $node['allowedSettings'] ) ? (array) $node['allowedSettings'] : array();
		
		$dynamic_source = isset( $node['dynamicSource'] ) ? $node['dynamicSource'] : '';
		$dynamic_field  = isset( $node['dynamicField'] ) ? $node['dynamicField'] : '';

		// Visibility filtering
		if ( ! empty( $visibility ) ) {
			if ( $type === 'heading' && isset( $visibility['showTitle'] ) && ! $visibility['showTitle'] && $dynamic_source === 'post_title' ) continue;
			if ( $type === 'text' && isset( $visibility['showExcerpt'] ) && ! $visibility['showExcerpt'] && ( $dynamic_source === 'post_excerpt' || $dynamic_source === 'post_content' ) ) continue;
			if ( $type === 'image' && isset( $visibility['showImage'] ) && ! $visibility['showImage'] && $dynamic_source === 'featured_image' ) continue;
			if ( $type === 'button' && isset( $visibility['showButton'] ) && ! $visibility['showButton'] ) continue;
		}
		
		$raw_styles    = isset( $styles_data[ $field ] ) ? $styles_data[ $field ] : array();
		
		// Map Context Data
		$node_data = rcb_resolve_node_data( $node, $content_data, $mode, $post );
		
		// 1. Prepare Layout Defaults & Enforce Critical Properties
		if ( $type === 'container' ) {
			// Ensure display is set
			if ( ! isset( $raw_styles['display'] ) && ! isset( $raw_styles['displayMode'] ) ) {
				$raw_styles['display'] = 'grid';
			}
			
			// Resolve Grid Columns if in grid mode
			$display_val = rcb_get_responsive_value( $raw_styles['displayMode'] ?? ( $raw_styles['display'] ?? 'grid' ), 'desktop' );
			if ( $display_val === 'grid' ) {
				if ( ! isset( $raw_styles['gridTemplateColumns'] ) || ( isset( $raw_styles['gridTemplateColumns'] ) && $raw_styles['gridTemplateColumns'] === 'custom' && empty( $raw_styles['customGridTemplate'] ) ) ) {
					$raw_styles['gridTemplateColumns'] = "repeat({$node_columns}, 1fr)";
				} elseif ( isset( $raw_styles['gridTemplateColumns'] ) && $raw_styles['gridTemplateColumns'] === 'custom' ) {
					$raw_styles['gridTemplateColumns'] = $raw_styles['customGridTemplate'];
				}
				
				if ( ! isset( $raw_styles['gap'] ) && ! isset( $raw_styles['gridGap'] ) && $node_columns > 1 ) {
					$raw_styles['gap'] = '20px';
				}
			}
		}

		if ( $type === 'column' ) {
			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $dev ) {
				$w = rcb_get_responsive_value( $raw_styles['customColumnWidth'] ?? '', $dev );
				$u = rcb_get_responsive_value( $raw_styles['customColumnWidthUnit'] ?? '', $dev ) ?: '%';
				
				if ( $w ) {
					$raw_styles['width'][$dev] = "{$w}{$u}";
					$raw_styles['flex'][$dev]  = "0 1 {$w}{$u}";
				} elseif ( $dev === 'mobile' ) {
					// Force 100% on mobile if no width set
					$raw_styles['flex'][$dev]  = "1 1 100%";
					$raw_styles['maxWidth'][$dev] = "100%";
					
					// Normalize padding shorthand to allow precision horizontal capping
					if ( isset( $raw_styles['padding'] ) ) {
						$p_shorthand = $raw_styles['padding'];
						foreach ( array( 'Top', 'Right', 'Bottom', 'Left' ) as $dir ) {
							$k = 'padding' . $dir;
							if ( ! isset( $raw_styles[ $k ] ) ) $raw_styles[ $k ] = $p_shorthand;
						}
						unset( $raw_styles['padding'] );
					}

					// Precision cap horizontal overflow while strictly preserving height
					foreach ( array( 'paddingLeft', 'paddingRight' ) as $p_key ) {
						if ( isset( $raw_styles[ $p_key ] ) ) {
							$p_raw = is_array( $raw_styles[ $p_key ] ) ? ( $raw_styles[ $p_key ]['mobile'] ?? null ) : $raw_styles[ $p_key ];
							if ( $p_raw !== null ) {
								$p_num = floatval( preg_replace( '/[^0-9.]/', '', strval( $p_raw ) ) );
								if ( $p_num > 40 ) {
									if ( is_array( $raw_styles[ $p_key ] ) ) $raw_styles[ $p_key ]['mobile'] = 20;
									else $raw_styles[ $p_key ] = array( 'desktop' => $raw_styles[ $p_key ], 'mobile' => 20 );
								}
							}
						}
					}

					// Correct overflow and margins
					if ( ! isset( $raw_styles['overflow'] ) ) $raw_styles['overflow'][$dev] = "hidden";
					if ( ! isset( $raw_styles['margin'] ) )   $raw_styles['margin'][$dev]   = "0";
				} else {
					if ( ! isset( $raw_styles['flex'][$dev] ) && ! isset( $raw_styles['flex'] ) ) {
						$raw_styles['flex'][$dev] = '1 1 0%';
					}
				}
			}
		}

		if ( $type === 'button' ) {
			// Padding X/Y logic
			if ( ! isset( $raw_styles['padding'] ) && ( isset( $raw_styles['paddingX'] ) || isset( $raw_styles['paddingY'] ) ) ) {
				$padding_x = isset( $raw_styles['paddingX'] ) ? floatval( $raw_styles['paddingX'] ) : 1;
				$padding_y = isset( $raw_styles['paddingY'] ) ? floatval( $raw_styles['paddingY'] ) : 0.5;
				$raw_styles['padding'] = "{$padding_y}rem {$padding_x}rem";
			}
			
			// Text Size Presets
			$size_map = array( 'S' => '12px', 'M' => '14px', 'L' => '16px', 'XL' => '20px', '1XL' => '24px', '2XL' => '32px' );
			if ( ! isset( $raw_styles['fontSize'] ) && isset( $raw_styles['textSizePreset'] ) && isset( $size_map[ $raw_styles['textSizePreset'] ] ) ) {
				$raw_styles['fontSize'] = $size_map[ $raw_styles['textSizePreset'] ];
			}

			// Ensure display properties for button
			if ( ! isset( $raw_styles['display'] ) ) $raw_styles['display'] = 'inline-flex';
			if ( ! isset( $raw_styles['alignItems'] ) ) $raw_styles['alignItems'] = 'center';
			if ( ! isset( $raw_styles['justifyContent'] ) ) $raw_styles['justifyContent'] = 'center';
			if ( ! isset( $raw_styles['gap'] ) ) $raw_styles['gap'] = '8px';
			if ( ! isset( $raw_styles['transition'] ) ) $raw_styles['transition'] = 'all 0.3s ease-in-out';
			if ( ! isset( $raw_styles['textDecoration'] ) ) $raw_styles['textDecoration'] = 'none';

			// Ensure borders show up (default to solid if width/color set)
			if ( ! isset( $raw_styles['borderStyle'] ) && ( isset( $raw_styles['borderWidth'] ) || isset( $raw_styles['borderColor'] ) ) ) {
				$raw_styles['borderStyle'] = 'solid';
			}
		}

		// 2. Generate Responsive CSS Registry (Aggressive !important)
		$selector = ( ! empty( $instance_id ) ) ? ".rcb-instance-{$instance_id} .{$id}" : ".{$id}";
		$style_registry .= rcb_generate_responsive_css( $selector, $raw_styles );

		// 3. Specialized Registry Styles (Hover, Children)
		if ( $type === 'button' ) {
			$hover_css = '';
			if ( isset( $raw_styles['hoverBgColor'] ) ) $hover_css .= "background-color: {$raw_styles['hoverBgColor']} !important;";
			if ( isset( $raw_styles['hoverColor'] ) )   $hover_css .= "color: {$raw_styles['hoverColor']} !important;";
			elseif ( isset( $raw_styles['hoverTextColor'] ) ) $hover_css .= "color: {$raw_styles['hoverTextColor']} !important;";
			
			if ( ! empty( $raw_styles['hoverUnderline'] ) ) $hover_css .= "text-decoration: underline !important;";
			elseif ( isset( $raw_styles['hoverUnderline'] ) ) $hover_css .= "text-decoration: none !important;";

			if ( $hover_css ) {
				$style_registry .= "{$selector}:hover { {$hover_css} }\n";
			}
			
			// Icon Styles
			$icon_init_css = '';
			if ( isset( $raw_styles['iconColor'] ) ) $icon_init_css .= "color: {$raw_styles['iconColor']} !important;";
			if ( isset( $raw_styles['iconBgColor'] ) ) $icon_init_css .= "background-color: {$raw_styles['iconBgColor']} !important;";
			if ( isset( $raw_styles['iconBorderColor'] ) ) $icon_init_css .= "border-color: {$raw_styles['iconBorderColor']} !important;";
			
			if ( $icon_init_css ) {
				$i_sel = ( ! empty( $instance_id ) ) ? ".rcb-instance-{$instance_id} .{$id} .rcb-button-icon" : ".{$id} .rcb-button-icon";
				$style_registry .= "{$i_sel} { {$icon_init_css} }\n";
			}

			$icon_hover_css = '';
			if ( isset( $raw_styles['iconHoverBgColor'] ) ) $icon_hover_css .= "background-color: {$raw_styles['iconHoverBgColor']} !important;";
			if ( isset( $raw_styles['iconHoverColor'] ) )   $icon_hover_css .= "color: {$raw_styles['iconHoverColor']} !important;";
			if ( $icon_hover_css ) {
				$i_sel = ( ! empty( $instance_id ) ) ? ".rcb-instance-{$instance_id} .{$id}:hover .rcb-button-icon" : ".{$id}:hover .rcb-button-icon";
				$style_registry .= "{$i_sel} { {$icon_hover_css} }\n";
			}
		}

		// 4. Fallback/Standard inline styles
		$final_styles = array();
		$direct_props = array(
			'color', 'backgroundColor', 'padding', 'margin', 'fontSize', 'fontWeight', 
			'lineHeight', 'letterSpacing', 'textTransform', 'fontFamily', 'borderRadius',
			'border', 'borderColor', 'borderWidth', 'borderStyle', 'textAlign'
		);
		foreach ( $direct_props as $p ) {
			if ( isset( $raw_styles[$p] ) && ! is_array( $raw_styles[$p] ) ) {
				$final_styles[$p] = $raw_styles[$p];
			}
		}

		// Background image capability for any element
		$bg_url = '';
		if ( isset( $content_data[ $field . '_bg_url' ] ) && ! empty( $content_data[ $field . '_bg_url' ] ) ) {
			$bg_url = $content_data[ $field . '_bg_url' ];
		} elseif ( isset( $content_data[ $field . '_backgroundImage' ] ) && ! empty( $content_data[ $field . '_backgroundImage' ] ) ) {
			$bg_url = $content_data[ $field . '_backgroundImage' ];
		}
		
		if ( $bg_url ) {
			$bg_url = esc_url( $bg_url );
			$bg_rules = "background-image: url('{$bg_url}') !important; background-size: " . ( $raw_styles['backgroundSize'] ?? 'cover' ) . " !important; background-position: " . ( $raw_styles['backgroundPosition'] ?? 'center' ) . " !important; background-repeat: " . ( $raw_styles['backgroundRepeat'] ?? 'no-repeat' ) . " !important;";
			$style_registry .= "{$selector} { {$bg_rules} }\n";
			$final_styles['background-image'] = "url('{$bg_url}')";
		}

		$style_attr = rcb_build_inline_style( $final_styles );

		switch ( $type ) {
			case 'container':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content, $style_registry, $instance_id );
				}
				$html .= sprintf( '<div class="rcb-container %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'column':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content, $style_registry, $instance_id );
				}
				$html .= sprintf( '<div class="rcb-column %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;


			case 'heading':
				$tag         = $node_data['tag'];
				$text_val    = $node_data['text'];
				$html .= sprintf( '<%s class="rcb-heading %s" %s>%s</%s>', esc_attr( $tag ), esc_attr( $id ), $style_attr, wp_kses_post( $text_val ), esc_attr( $tag ) );
				break;

			case 'text':
				$text_val    = $node_data['text'];
				$html .= sprintf( '<div class="rcb-text %s" %s>%s</div>', esc_attr( $id ), $style_attr, wp_kses_post( $text_val ) );
				break;

			case 'image':
				$img_url     = $node_data['img'];
				$html .= sprintf( '<div class="rcb-image %s" %s><img src="%s" alt="" /></div>', esc_attr( $id ), $style_attr, esc_url( $img_url ) );
				break;

			case 'button':
				$btn_text    = $node_data['text'];
				$btn_url     = $node_data['url'];

				$icon_mode = isset( $content_data[ $field . '_icon_mode' ] ) ? $content_data[ $field . '_icon_mode' ] : 'Default';
				$icon_size = isset( $raw_styles['iconSize'] ) ? floatval( $raw_styles['iconSize'] ) : 1.25;
				$icon_html = '';

				if ( $icon_mode !== 'Default' ) {
					$icon_style = "display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: {$icon_size}em; line-height: 1; transition: all 0.3s ease-in-out;";
					if ( $icon_mode === 'Icon with Bg' ) {
						$icon_style .= "margin-left: 4px; width: " . ($icon_size * 1.875) . "em; height: " . ($icon_size * 1.875) . "em; border-width: " . (isset($raw_styles['iconBorderWidth']) ? $raw_styles['iconBorderWidth'] : 0.1) . "rem; border-style: solid;";
					}
					$icon_html = sprintf(
						'<span class="rcb-button-icon" style="%s"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>',
						esc_attr( $icon_style )
					);
				}

				// Hover styles are handled via style registry
				$style_attr = rcb_build_inline_style( $final_styles );

				$html .= sprintf( 
					'<div class="rcb-button-wrapper %s"><a href="%s" class="rcb-button %s" %s>%s%s</a></div>', 
					esc_attr( $id . '-wrapper' ),
					esc_url( $btn_url ), 
					esc_attr( $id ), 
					$style_attr, 
					esc_html( $btn_text ), 
					$icon_html 
				);
				break;

			case 'innerblocks':
				$html .= sprintf( '<div class="rcb-inner-blocks %s" %s>%s</div>', esc_attr( $id ), $style_attr, $inner_blocks_content );
				break;
			
			case 'testimonial':
				$avatar_url = isset( $content_data[ $field . '_avatar_url' ] ) ? $content_data[ $field . '_avatar_url' ] : '';
				$rating = isset( $content_data[ $field . '_rating' ] ) ? intval( $content_data[ $field . '_rating' ] ) : 5;
				$rating_color = isset( $raw_styles['ratingColor'] ) ? $raw_styles['ratingColor'] : '#facc15';
				
				if ( ( $mode === 'query' ) && $post ) {
					// Optionally pull avatar from dynamic source if needed
				}
				
				$testimonial_html = '';
				if ( ! empty( $avatar_url ) ) {
					$avatar_size = isset( $raw_styles['avatarSize'] ) ? $raw_styles['avatarSize'] : 80;
					$avatar_radius = isset( $raw_styles['avatarBorderRadius'] ) ? $raw_styles['avatarBorderRadius'] : 50;
					$testimonial_html .= sprintf(
						'<div class="rcb-testimonial-avatar"><img src="%s" style="width:%dpx; height:%dpx; border-radius:%d%%; object-fit:cover;" /></div>',
						esc_url( $avatar_url ),
						$avatar_size,
						$avatar_size,
						$avatar_radius
					);
				}
				
				$stars = '';
				for ( $i = 1; $i <= 5; $i++ ) {
					$color = ( $i <= $rating ) ? $rating_color : '#ccc';
					$stars .= '<span style="color:' . $color . '; margin:0 2px;">★</span>';
				}
				$testimonial_html .= '<div class="rcb-testimonial-rating">' . $stars . '</div>';
				
				$html .= sprintf( '<div class="rcb-testimonial %s" %s>%s</div>', esc_attr( $id ), $style_attr, $testimonial_html );
				break;
		}
	}

	return $html;
}

/**
 * Render dynamic slider block.
 */
function rcb_render_advance_dynamic_slider_block( $attributes, $content ) {
	$unique_id = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : uniqid();
	$post_type = isset( $attributes['postType'] ) ? $attributes['postType'] : 'post';
	$posts_per_page = isset( $attributes['postsPerPage'] ) ? intval( $attributes['postsPerPage'] ) : 10;
	$taxonomy = isset( $attributes['taxonomy'] ) ? $attributes['taxonomy'] : '';
	$term_id = isset( $attributes['termId'] ) ? intval( $attributes['termId'] ) : 0;

	// Slide Settings
	$bg_type = isset( $attributes['bgType'] ) ? $attributes['bgType'] : 'image';
	$bg_color = isset( $attributes['bgColor'] ) ? $attributes['bgColor'] : '#3b82f6';
	$overlay_opacity = isset( $attributes['overlayOpacity'] ) ? $attributes['overlayOpacity'] : 0.3;
	$overlay_color = isset( $attributes['overlayColor'] ) ? $attributes['overlayColor'] : '#000000';
	$vertical_alignment = isset( $attributes['verticalAlignment'] ) ? $attributes['verticalAlignment'] : 'center';
	$content_alignment = isset( $attributes['contentAlignment'] ) ? $attributes['contentAlignment'] : 'center';
	
	$show_content_bg = isset( $attributes['showContentBg'] ) ? $attributes['showContentBg'] : false;
	$content_bg_color = isset( $attributes['contentBgColor'] ) ? $attributes['contentBgColor'] : 'rgba(0,0,0,0.5)';
	$content_padding = isset( $attributes['contentPadding'] ) ? intval( $attributes['contentPadding'] ) : 40;
	$content_border_radius = isset( $attributes['contentBorderRadius'] ) ? intval( $attributes['contentBorderRadius'] ) : 8;

	$show_title = isset( $attributes['showTitle'] ) ? $attributes['showTitle'] : true;
	$title_color = isset( $attributes['titleColor'] ) ? $attributes['titleColor'] : '#ffffff';
	$title_font_size = isset( $attributes['titleFontSize'] ) ? intval( $attributes['titleFontSize'] ) : 40;
	$title_font_weight = isset( $attributes['titleFontWeight'] ) ? $attributes['titleFontWeight'] : '700';

	$show_desc = isset( $attributes['showDesc'] ) ? $attributes['showDesc'] : true;
	$desc_color = isset( $attributes['descColor'] ) ? $attributes['descColor'] : '#eeeeee';
	$desc_font_size = isset( $attributes['descFontSize'] ) ? intval( $attributes['descFontSize'] ) : 18;
	$desc_font_weight = isset( $attributes['descFontWeight'] ) ? $attributes['descFontWeight'] : '400';

	$show_btn = isset( $attributes['showBtn'] ) ? $attributes['showBtn'] : true;
	$btn_text = isset( $attributes['btnText'] ) ? $attributes['btnText'] : 'Read More';
	$btn_color = isset( $attributes['btnColor'] ) ? $attributes['btnColor'] : '#ffffff';
	$btn_bg_color = isset( $attributes['btnBgColor'] ) ? $attributes['btnBgColor'] : '#3b82f6';
	$btn_border_radius = isset( $attributes['btnBorderRadius'] ) ? intval( $attributes['btnBorderRadius'] ) : 4;
	$btn_font_size = isset( $attributes['btnFontSize'] ) ? intval( $attributes['btnFontSize'] ) : 16;

	// Swiper Settings
	$arrows = isset( $attributes['arrows'] ) ? $attributes['arrows'] : true;
	$dots = isset( $attributes['dots'] ) ? $attributes['dots'] : true;
	$autoplay = isset( $attributes['autoplay'] ) ? $attributes['autoplay'] : false;
	$autoplay_delay = isset( $attributes['autoplayDelay'] ) ? intval( $attributes['autoplayDelay'] ) : 3000;
	$loop = isset( $attributes['loop'] ) ? $attributes['loop'] : true;
	$effect = isset( $attributes['effect'] ) ? $attributes['effect'] : 'slide';
	
	// Helper to extract responsive values
	$get_v = function($val, $device = 'desktop') {
		if ( is_array($val) ) return isset($val[$device]) ? $val[$device] : '';
		if ( is_object($val) ) {
			$arr = (array) $val;
			return isset($arr[$device]) ? $arr[$device] : (isset($arr['desktop']) ? $arr['desktop'] : '');
		}
		return $val;
	};

	$slides_per_view = $get_v( isset( $attributes['slidesPerView'] ) ? $attributes['slidesPerView'] : 1 );
	$space_between = $get_v( isset( $attributes['spaceBetween'] ) ? $attributes['spaceBetween'] : 0 );
	$height = $get_v( isset( $attributes['height'] ) ? $attributes['height'] : '500px' );
	$arrow_color = isset( $attributes['arrowColor'] ) ? $attributes['arrowColor'] : '#ffffff';
	$dot_color = isset( $attributes['dotColor'] ) ? $attributes['dotColor'] : '#3b82f6';

	$args = array(
		'post_type' => $post_type,
		'posts_per_page' => $posts_per_page,
		'post_status' => 'publish',
	);

	if ( ! empty( $taxonomy ) && ! empty( $term_id ) ) {
		$args['tax_query'] = array(
			array(
				'taxonomy' => $taxonomy,
				'field' => 'term_id',
				'terms' => $term_id,
			),
		);
	}

	$query = new WP_Query( $args );
	$final_output = '';
	
	// Generate Responsive CSS
	$resp_styles = array();
	$resp_attrs = array(
		'height' => '.rcb-instance-' . $unique_id,
		'contentPadding' => '.rcb-instance-' . $unique_id . ' .rcb-slide-content',
		'titleFontSize' => '.rcb-instance-' . $unique_id . ' .rcb-slide-title',
		'descFontSize' => '.rcb-instance-' . $unique_id . ' .rcb-slide-desc',
		'btnFontSize' => '.rcb-instance-' . $unique_id . ' .rcb-slide-btn',
	);

	foreach ($resp_attrs as $attr => $sel) {
		if (isset($attributes[$attr])) {
			if (!isset($resp_styles[$sel])) $resp_styles[$sel] = array();
			$resp_styles[$sel][($attr === 'contentPadding' ? 'padding' : ($attr === 'titleFontSize' || $attr === 'descFontSize' || $attr === 'btnFontSize' ? 'fontSize' : $attr))] = $attributes[$attr];
		}
	}

	$style_registry = "";
	foreach ($resp_styles as $sel => $stls) {
		$style_registry .= rcb_generate_responsive_css($sel, $stls);
	}

	// Add non-responsive vars
	$style_registry .= "
		.rcb-instance-{$unique_id} { 
			--rcb-arrow-color: {$arrow_color}; 
			--rcb-dot-color: {$dot_color}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-content { 
			--rcb-content-bg: {$content_bg_color}; 
			--rcb-content-radius: {$content_border_radius}px; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-title { 
			--rcb-title-color: {$title_color}; 
			--rcb-title-weight: {$title_font_weight}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-desc { 
			--rcb-desc-color: {$desc_color}; 
			--rcb-desc-weight: {$desc_font_weight}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-btn { 
			--rcb-btn-color: {$btn_color}; 
			--rcb-btn-bg: {$btn_bg_color}; 
			--rcb-btn-radius: {$btn_border_radius}px; 
		}
	";

	// Breakpoints for Swiper
	$breakpoints = array();
	if (isset($attributes['slidesPerView']) || isset($attributes['spaceBetween'])) {
		$spv = isset($attributes['slidesPerView']) ? (array)$attributes['slidesPerView'] : array('desktop' => 1);
		$gap = isset($attributes['spaceBetween']) ? (array)$attributes['spaceBetween'] : array('desktop' => 0);
		
		$breakpoints[768] = array(
			'slidesPerView' => isset($spv['tablet']) ? intval($spv['tablet']) : (isset($spv['desktop']) ? intval($spv['desktop']) : 1),
			'spaceBetween' => isset($gap['tablet']) ? intval($gap['tablet']) : (isset($gap['desktop']) ? intval($gap['desktop']) : 0),
		);
		$breakpoints[0] = array(
			'slidesPerView' => isset($spv['mobile']) ? intval($spv['mobile']) : (isset($spv['tablet']) ? intval($spv['tablet']) : (isset($spv['desktop']) ? intval($spv['desktop']) : 1)),
			'spaceBetween' => isset($gap['mobile']) ? intval($gap['mobile']) : (isset($gap['tablet']) ? intval($gap['tablet']) : (isset($gap['desktop']) ? intval($gap['desktop']) : 0)),
		);
	}

	if ( $query->have_posts() ) {
		$final_output .= sprintf(
			'<div class="rcb-slider swiper rcb-dynamic-slider rcb-instance-%s" 
				data-arrows="%s" data-dots="%s" data-autoplay="%s" 
				data-autoplay-delay="%d" data-loop="%s" data-effect="%s" 
				data-slides-per-view="%d" data-space-between="%d"
				data-breakpoints=\'%s\'
				style="--rcb-arrow-color: %s; --rcb-dot-color: %s;">',
			esc_attr( $unique_id ),
			$arrows ? 'true' : 'false',
			$dots ? 'true' : 'false',
			$autoplay ? 'true' : 'false',
			$autoplay_delay,
			$loop ? 'true' : 'false',
			esc_attr( $effect ),
			$slides_per_view,
			$space_between,
			esc_attr( json_encode( $breakpoints ) ),
			esc_attr( $arrow_color ),
			esc_attr( $dot_color )
		);

		$final_output .= '<div class="swiper-wrapper">';

		$posts = $query->posts;
		$post_count = count( $posts );
		
		// To ensure the slider always looks full and loop works correctly, 
		// Swiper 11 Loop works best with at least 3 slides total.
		$repeats = 1;
		if ( $post_count > 0 ) {
			// Increase safety margin for Swiper 11 loop mode to prevent it from silently disabling loop and breaking arrows/autoslide
			$min_required = max( 6, $slides_per_view * 4 );
			if ( $post_count < $min_required ) {
				$repeats = ceil( $min_required / $post_count );
			}
		}
		// Max safety cap on repeats
		$repeats = min( $repeats, 10 );

		for ( $i = 0; $i < $repeats; $i++ ) {
			foreach ( $posts as $post_obj ) {
				$p_id = $post_obj->ID;
				$p_title = get_the_title( $p_id );
				$p_excerpt = has_excerpt( $p_id ) ? get_the_excerpt( $p_id ) : wp_trim_words( $post_obj->post_content, 20 );
				$p_permalink = get_permalink( $p_id );
				$media_url = get_the_post_thumbnail_url( $p_id, 'large' );
				
				$final_output .= sprintf(
					'<div class="swiper-slide rcb-slide-item v-align-%s" style="background-image: %s; background-color: %s; background-size:cover; background-position:center; position:relative; overflow:hidden;">',
					esc_attr( $vertical_alignment ),
					( $bg_type === 'image' && $media_url ) ? "url('{$media_url}')" : "none",
					( $bg_type === 'color' || ( $bg_type === 'image' && ! $media_url ) ) ? esc_attr( $bg_color ) : 'transparent'
				);
				
				if ( $bg_type === 'image' && $media_url ) {
					$final_output .= sprintf(
						'<div class="rcb-slide-overlay" style="background-color: %s; opacity: %s; position:absolute; top:0; left:0; width:100%%; height:100%%; z-index:1;"></div>',
						esc_attr( $overlay_color ),
						esc_attr( $overlay_opacity )
					);
				}
				
				$final_output .= sprintf(
					'<div class="rcb-slide-content align-%s %s" style="position:relative; z-index:2;">',
					esc_attr( $content_alignment ),
					$show_content_bg ? 'has-card' : ''
				);
				
				if ( $show_title ) {
					$final_output .= sprintf(
						'<h2 class="rcb-slide-title">%s</h2>',
						esc_html( $p_title )
					);
				}
				
				if ( $show_desc ) {
					$final_output .= sprintf(
						'<div class="rcb-slide-desc">%s</div>',
						esc_html( $p_excerpt )
					);
				}
				
				if ( $show_btn ) {
					$final_output .= sprintf(
						'<div class="rcb-slide-btn-wrapper"><a href="%s" class="rcb-slide-btn">%s</a></div>',
						esc_url( $p_permalink ),
						esc_html( $btn_text )
					);
				}
				
				$final_output .= '</div>'; // .rcb-slide-content
				$final_output .= '</div>'; // .rcb-slide-item
			}
		}

		$final_output .= '</div>'; // .swiper-wrapper

		if ( $arrows ) {
			$final_output .= '<div class="swiper-button-next"></div>';
			$final_output .= '<div class="swiper-button-prev"></div>';
		}
		if ( $dots ) {
			$final_output .= '<div class="swiper-pagination"></div>';
		}

		$final_output .= '</div>'; // .swiper

		wp_reset_postdata();
	}

	if ( ! empty( $style_registry ) ) {
		$final_output = "<style>{$style_registry}</style>" . $final_output;
	}

	return $final_output;
}

/**
 * Register taxonomies rest routes manually if needed (already handled by show_in_rest)
 */

function rcb_build_inline_style( $styles ) {
	$style_str = '';
	foreach ( $styles as $prop => $val ) {
		if ( is_array( $val ) ) {
			continue;
		}
		if ( $val !== '' ) {
			// Convert camelCase to kebab-case
			$kebab = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $prop ) );
			$style_str .= "{$kebab}:{$val};";
		}
	}
	return $style_str ? 'style="' . esc_attr( $style_str ) . '"' : '';
}

function rcb_get_responsive_value( $val, $device = 'desktop' ) {
	if ( is_array( $val ) ) {
		return isset( $val[ $device ] ) ? $val[ $device ] : '';
	}
	return $val;
}

function rcb_generate_responsive_css( $selector, $styles ) {
	$desktop = "";
	$tablet  = "";
	$mobile  = "";

	foreach ( $styles as $prop => $data ) {
		if ( empty( $data ) ) continue;

		$kebab = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $prop ) );
		$values = ( is_array( $data ) ) ? $data : array( 'desktop' => $data );

		foreach ( $values as $device => $val ) {
			if ( $val === '' ) continue;

			// Property mapping for responsive CSS
			$prop_name = $kebab;
			if ( $prop_name === 'display-mode' ) $prop_name = 'display';
			if ( $prop_name === 'flex-gap' || $prop_name === 'grid-gap' ) $prop_name = 'gap';

			$suffix = "";
			if ( in_array( $prop_name, array( 'font-size', 'margin', 'padding', 'gap', 'border-width', 'letter-spacing', 'min-height', 'min-width', 'height', 'width', 'flex-basis' ) ) && is_numeric( $val ) ) {
				$suffix = "px";
			}

			if ( $device === 'desktop' ) $desktop .= "{$prop_name}:{$val}{$suffix} !important;";
			if ( $device === 'tablet' )  $tablet  .= "{$prop_name}:{$val}{$suffix} !important;";
			if ( $device === 'mobile' )  $mobile  .= "{$prop_name}:{$val}{$suffix} !important;";
		}
	}

	$out = "";
	if ( $desktop ) $out .= "{$selector} { {$desktop} }\n";
	if ( $tablet )  $out .= "@media (max-width: 1024px) { {$selector} { {$tablet} } }\n";
	if ( $mobile )  $out .= "@media (max-width: 767px) { {$selector} { {$mobile} } }\n";
	
	return $out;
}



