<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds an inline CSS style attribute string from a styles array.
 */
function rcb_build_inline_style( $styles ) {
	if ( empty( $styles ) || ! is_array( $styles ) ) {
		return '';
	}

	$style_string = '';
	foreach ( $styles as $key => $value ) {
		if ( empty( $value ) ) continue;
		$css_prop = strtolower( preg_replace( '/(?<!^)[A-Z]/', '-$0', $key ) );
		$style_string .= esc_attr( $css_prop ) . ':' . esc_attr( $value ) . ';';
	}

	return $style_string ? 'style="' . $style_string . '"' : '';
}

/**
 * Main render callback for Gutenberg dynamic block.
 */
function rcb_render_component_builder_block( $attributes, $content ) {
	$template_id = isset( $attributes['templateId'] ) ? intval( $attributes['templateId'] ) : 0;
	if ( ! $template_id ) {
		return '';
	}

	$unique_id      = isset( $attributes['uniqueId'] ) ? $attributes['uniqueId'] : uniqid();
	$mode           = isset( $attributes['mode'] ) ? $attributes['mode'] : 'static';
	$content_data   = isset( $attributes['content'] ) ? $attributes['content'] : array();
	$styles_data    = isset( $attributes['styles'] ) ? $attributes['styles'] : array();
	$visibility     = isset( $attributes['visibilityVars'] ) ? $attributes['visibilityVars'] : array(
		'showTitle'   => true,
		'showExcerpt' => true,
		'showImage'   => true,
		'showButton'  => true,
	);

	$structure_json = get_post_meta( $template_id, '_component_structure', true );
	$structure_data = $structure_json ? json_decode( $structure_json, true ) : array();
	$nodes          = isset( $structure_data['structure'] ) ? $structure_data['structure'] : array();
	
	$style_registry_raw     = isset( $structure_data['styleRegistry'] ) ? (array) $structure_data['styleRegistry'] : array();
	$style_registry = array();
	foreach ( $style_registry_raw as $item ) {
		$style_registry[] = is_array( $item ) ? $item['property'] : $item;
	}

	$global_allowed_settings = isset( $structure_data['globalAllowedSettings'] ) ? (array) $structure_data['globalAllowedSettings'] : array();
	$global_custom_keys      = isset( $structure_data['globalCustomStyles'] ) ? (array) $structure_data['globalCustomStyles'] : array();

	// Prepare root styles
	$root_styles = isset( $styles_data['_root'] ) ? $styles_data['_root'] : array();
	$final_root_styles = array();

	// Standard allowed styles (Global)
	if ( ! empty( $global_allowed_settings['color'] ) ) {
		if ( isset( $root_styles['color'] ) ) $final_root_styles['color'] = $root_styles['color'];
		if ( isset( $root_styles['backgroundColor'] ) ) $final_root_styles['backgroundColor'] = $root_styles['backgroundColor'];
	}
	if ( ! empty( $global_allowed_settings['typography'] ) ) {
		if ( isset( $root_styles['fontSize'] ) ) $final_root_styles['fontSize'] = $root_styles['fontSize'];
	}
	if ( ! empty( $global_allowed_settings['spacing'] ) ) {
		if ( isset( $root_styles['padding'] ) ) $final_root_styles['padding'] = $root_styles['padding'];
		if ( isset( $root_styles['margin'] ) ) $final_root_styles['margin'] = $root_styles['margin'];
	}
	if ( ! empty( $global_allowed_settings['borders'] ) ) {
		if ( isset( $root_styles['borderRadius'] ) ) $final_root_styles['borderRadius'] = $root_styles['borderRadius'];
	}

	// Custom allowed styles (Legacy & Registry)
	$all_custom_keys = array_unique( array_merge( $global_custom_keys, $style_registry ) );
	foreach ( $all_custom_keys as $key ) {
		// Convert kebab-case to camelCase for lookup (e.g. z-index -> zIndex)
		$camel_key = str_replace(' ', '', lcfirst(ucwords(str_replace('-', ' ', $key))));
		
		if ( ! empty( $global_allowed_settings[ $key ] ) ) {
			if ( isset( $root_styles[ $camel_key ] ) ) {
				$final_root_styles[ $camel_key ] = $root_styles[ $camel_key ];
			} elseif ( isset( $root_styles[ $key ] ) ) {
				$final_root_styles[ $key ] = $root_styles[ $key ];
			}
		}
	}
	$root_style_attr = rcb_build_inline_style( $final_root_styles );

	$final_output = '';

	if ( $mode === 'query' ) {
		$post_type      = isset( $attributes['postType'] ) ? $attributes['postType'] : 'post';
		$posts_per_page = isset( $attributes['postsPerPage'] ) ? intval( $attributes['postsPerPage'] ) : 3;
		$layout         = isset( $attributes['layout'] ) ? $attributes['layout'] : 'grid';
		$columns        = isset( $attributes['columns'] ) ? intval( $attributes['columns'] ) : 3;
		$pagination     = isset( $attributes['pagination'] ) ? $attributes['pagination'] : false;

		$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

		$args = array(
			'post_type'      => $post_type,
			'posts_per_page' => $posts_per_page,
			'post_status'    => 'publish',
			'paged'          => $paged,
		);

		$query = new WP_Query( $args );

		if ( $query->have_posts() ) {
			$wrapper_style = '';
			if ( $layout === 'grid' ) {
				$wrapper_style = sprintf( 'style="display:grid;grid-template-columns:repeat(%d,1fr);gap:20px;"', $columns );
			}
			$final_output .= sprintf( '<div class="rcb-loop-wrapper rcb-layout-%s" %s>', esc_attr( $layout ), $wrapper_style );

			while ( $query->have_posts() ) {
				$query->the_post();
				global $post;

				$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s rcb-loop-item" %s>', esc_attr( $unique_id ), $root_style_attr );
				$final_output .= rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content, $style_registry );
				$final_output .= '</div>';
			}

			$final_output .= '</div>';

			if ( $pagination ) {
				$final_output .= '<div class="rcb-pagination" style="margin-top:20px;">';
				$final_output .= paginate_links( array(
					'total'     => $query->max_num_pages,
					'current'   => $paged,
					'prev_text' => __( '&laquo; Previous' ),
					'next_text' => __( 'Next &raquo;' ),
				) );
				$final_output .= '</div>';
			}

			wp_reset_postdata();
		} else {
			$final_output .= '<p>' . __( 'No posts found.', 'reusable-component-builder' ) . '</p>';
		}
	} else {
		// Static rendering
		$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s" %s>', esc_attr( $unique_id ), $root_style_attr );
		$final_output .= rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, null, $visibility, $content, $style_registry );
		$final_output .= '</div>';
	}

	return $final_output;
}

/**
 * Render nodes with visibility toggles and style registry support.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '', $style_registry = array() ) {
	$html = '';
	$assigned = array(
		'heading' => false,
		'text'    => false,
		'image'   => false,
		'button'  => false,
	);

	foreach ( $nodes as $node ) {
		$type         = isset( $node['type'] ) ? $node['type'] : '';
		$id           = isset( $node['id'] ) ? $node['id'] : '';
		$field        = isset( $node['field'] ) ? $node['field'] : '';
		$node_columns = isset( $node['columns'] ) ? intval( $node['columns'] ) : 1;
		$allowed      = isset( $node['allowedSettings'] ) ? (array) $node['allowedSettings'] : array();
		
		$raw_styles    = isset( $styles_data[ $field ] ) ? $styles_data[ $field ] : array();
		$final_styles  = array();

		// Standard styles based on 'allowed'
		if ( ! empty( $allowed['color'] ) ) {
			if ( isset( $raw_styles['color'] ) ) $final_styles['color'] = $raw_styles['color'];
			if ( isset( $raw_styles['backgroundColor'] ) ) $final_styles['backgroundColor'] = $raw_styles['backgroundColor'];
		}
		if ( ! empty( $allowed['spacing'] ) ) {
			if ( isset( $raw_styles['padding'] ) ) $final_styles['padding'] = $raw_styles['padding'];
			if ( isset( $raw_styles['margin'] ) ) $final_styles['margin'] = $raw_styles['margin'];
		}
		if ( ! empty( $allowed['typography'] ) ) {
			if ( isset( $raw_styles['fontSize'] ) ) $final_styles['fontSize'] = $raw_styles['fontSize'];
		}
		if ( ! empty( $allowed['borders'] ) ) {
			if ( isset( $raw_styles['borderRadius'] ) ) $final_styles['borderRadius'] = $raw_styles['borderRadius'];
		}

		// Custom styles from registry if allowed
		foreach ( $style_registry as $style_item ) {
			$key = is_array( $style_item ) ? $style_item['property'] : $style_item;
			// Convert kebab-case to camelCase for lookup (e.g. z-index -> zIndex)
			$camel_key = str_replace(' ', '', lcfirst(ucwords(str_replace('-', ' ', $key))));

			if ( ! empty( $allowed[ $key ] ) ) {
				if ( isset( $raw_styles[ $camel_key ] ) ) {
					$final_styles[ $camel_key ] = $raw_styles[ $camel_key ];
				} elseif ( isset( $raw_styles[ $key ] ) ) {
					$final_styles[ $key ] = $raw_styles[ $key ];
				}
			}
		}

		// Special case for container background image
		if ( $type === 'container' ) {
			if ( isset( $content_data[ $field . '_bg_url' ] ) && ! empty( $content_data[ $field . '_bg_url' ] ) ) {
				$bg_url = esc_url( $content_data[ $field . '_bg_url' ] );
				$final_styles['background-image']    = "url('{$bg_url}')";
				$final_styles['background-size']     = 'cover';
				$final_styles['background-position'] = 'center';
			}

			if ( $node_columns > 1 ) {
				$final_styles['display'] = 'grid';
				$final_styles['grid-template-columns'] = "repeat({$node_columns}, 1fr)";
				$final_styles['gap'] = '20px';
			}
		}

		$style_attr = rcb_build_inline_style( $final_styles );

		switch ( $type ) {
			case 'container':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content, $style_registry );
				}
				$html .= sprintf( '<div class="rcb-container %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'column':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content, $style_registry );
				}
				$html .= sprintf( '<div class="rcb-column %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'innerblocks':
				$html .= sprintf( '<div class="rcb-inner-blocks-slot %s" %s>%s</div>', esc_attr( $id ), $style_attr, $inner_blocks_content );
				break;

			case 'heading':
				if ( $mode === 'query' ) {
					if ( empty( $visibility['showTitle'] ) || $assigned['heading'] ) break;
					$node_content = get_the_title( $post );
					$assigned['heading'] = true;
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<h2 class="rcb-heading %s" %s>%s</h2>', esc_attr( $id ), $style_attr, esc_html( $node_content ) );
				break;

			case 'text':
				if ( $mode === 'query' ) {
					if ( empty( $visibility['showExcerpt'] ) || $assigned['text'] ) break;
					$node_content = wp_trim_words( get_the_excerpt( $post ), 20, '...' );
					$assigned['text'] = true;
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<div class="rcb-text %s" %s>%s</div>', esc_attr( $id ), $style_attr, wp_kses_post( $node_content ) );
				break;

			case 'image':
				if ( $mode === 'query' ) {
					if ( empty( $visibility['showImage'] ) || $assigned['image'] ) break;
					$url = get_the_post_thumbnail_url( $post, 'large' );
					if ( ! $url ) $url = 'https://via.placeholder.com/600x400?text=No+Image';
					$alt = get_the_title( $post );
					$assigned['image'] = true;
				} else {
					$url = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';
					$alt = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}

				if ( $url ) {
					$html .= sprintf( '<img src="%s" class="rcb-image %s" alt="%s" %s />', esc_url( $url ), esc_attr( $id ), esc_attr( $alt ), $style_attr );
				} else {
					$html .= sprintf( '<div class="rcb-image-placeholder %s" %s style="background:#ddd;min-height:100px;display:flex;align-items:center;justify-content:center;">Image Placeholder: %s</div>', esc_attr( $id ), $style_attr, esc_html( $field ) );
				}
				break;

			case 'button':
				if ( $mode === 'query' ) {
					if ( empty( $visibility['showButton'] ) || $assigned['button'] ) break;
					$btn_url      = get_permalink( $post );
					$node_content = __( 'Read More', 'reusable-component-builder' );
					$assigned['button'] = true;
				} else {
					$btn_url      = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '#';
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : 'Button';
				}
				$html .= sprintf( '<a href="%s" class="rcb-button %s" %s style="display:inline-block;">%s</a>', esc_url( $btn_url ), esc_attr( $id ), $style_attr, esc_html( $node_content ) );
				break;
		}
	}

	return $html;
}
