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
		if ( $value === '' || $value === null ) continue;
		$css_prop = strtolower( preg_replace( '/(?<!^)[A-Z]/', '-$0', $key ) );
		
		// Add !important to font-weight to override theme defaults (as requested by user)
		$suffix = ( $css_prop === 'font-weight' ) ? ' !important' : '';
		
		$style_string .= esc_attr( $css_prop ) . ':' . esc_attr( $value ) . $suffix . ';';
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
		if ( isset( $root_styles['fontWeight'] ) ) $final_root_styles['fontWeight'] = $root_styles['fontWeight'];
		if ( isset( $root_styles['lineHeight'] ) ) $final_root_styles['lineHeight'] = $root_styles['lineHeight'];
		if ( isset( $root_styles['letterSpacing'] ) ) $final_root_styles['letterSpacing'] = $root_styles['letterSpacing'];
		if ( isset( $root_styles['textTransform'] ) ) $final_root_styles['textTransform'] = $root_styles['textTransform'];
	}
	if ( ! empty( $global_allowed_settings['spacing'] ) ) {
		if ( isset( $root_styles['padding'] ) ) $final_root_styles['padding'] = $root_styles['padding'];
		if ( isset( $root_styles['margin'] ) ) $final_root_styles['margin'] = $root_styles['margin'];
	}
	if ( ! empty( $global_allowed_settings['borders'] ) ) {
		if ( isset( $root_styles['borderRadius'] ) ) $final_root_styles['borderRadius'] = $root_styles['borderRadius'];
		if ( isset( $root_styles['border'] ) ) $final_root_styles['border'] = $root_styles['border'];
	}

	if ( ! empty( $global_allowed_settings['alignment'] ) ) {
		if ( isset( $root_styles['textAlign'] ) ) $final_root_styles['textAlign'] = $root_styles['textAlign'];
	}
	if ( ! empty( $global_allowed_settings['dimensions'] ) ) {
		if ( isset( $root_styles['width'] ) ) $final_root_styles['width'] = $root_styles['width'];
		if ( isset( $root_styles['height'] ) ) $final_root_styles['height'] = $root_styles['height'];
	}

	// Direct Props Mapping (for keys that match CSS property name in CamelCase)
	$direct_props = array( 'opacity', 'boxShadow', 'zIndex', 'overflow', 'visibility', 'cursor', 'transition', 'filter', 'backdropFilter', 'transform' );
	foreach ( $direct_props as $prop ) {
		if ( ! empty( $global_allowed_settings[ $prop ] ) && isset( $root_styles[ $prop ] ) ) {
			$final_root_styles[ $prop ] = $root_styles[ $prop ];
		}
	}

	// Custom CSS Box
	if ( ! empty( $global_allowed_settings['customStylesBox'] ) ) {
		if ( isset( $root_styles['customCssPairs'] ) && is_array( $root_styles['customCssPairs'] ) ) {
			foreach ( $root_styles['customCssPairs'] as $pair ) {
				if ( ! empty( $pair['key'] ) ) {
					$final_root_styles[ $pair['key'] ] = $pair['value'];
				}
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

		$taxonomy = isset( $attributes['taxonomy'] ) ? $attributes['taxonomy'] : '';
		$term_id  = isset( $attributes['termId'] ) ? intval( $attributes['termId'] ) : 0;
		if ( ! empty( $taxonomy ) && ! empty( $term_id ) ) {
			$args['tax_query'] = array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $term_id,
				),
			);
		}

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
				$final_output .= rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content );
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
		// Static rendering (now passing global $post to support dynamic sources mapped to current page)
		global $post;
		$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s" %s>', esc_attr( $unique_id ), $root_style_attr );
		$final_output .= rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content );
		$final_output .= '</div>';
	}

	return $final_output;
}

/**
 * Render nodes with visibility toggles and style registry support.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '' ) {
	$html = '';

	foreach ( $nodes as $node ) {
		$type         = isset( $node['type'] ) ? $node['type'] : '';
		$id           = isset( $node['id'] ) ? $node['id'] : '';
		$field        = isset( $node['field'] ) ? $node['field'] : '';
		$node_columns = isset( $node['columns'] ) ? intval( $node['columns'] ) : 1;
		$allowed      = isset( $node['allowedSettings'] ) ? (array) $node['allowedSettings'] : array();
		
		$dynamic_source = isset( $node['dynamicSource'] ) ? $node['dynamicSource'] : '';
		$dynamic_field  = isset( $node['dynamicField'] ) ? $node['dynamicField'] : '';
		
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
			if ( isset( $raw_styles['fontWeight'] ) ) $final_styles['fontWeight'] = $raw_styles['fontWeight'];
			if ( isset( $raw_styles['lineHeight'] ) ) $final_styles['lineHeight'] = $raw_styles['lineHeight'];
			if ( isset( $raw_styles['letterSpacing'] ) ) $final_styles['letterSpacing'] = $raw_styles['letterSpacing'];
			if ( isset( $raw_styles['textTransform'] ) ) $final_styles['textTransform'] = $raw_styles['textTransform'];
		}
		if ( ! empty( $allowed['borders'] ) ) {
			if ( isset( $raw_styles['borderRadius'] ) ) $final_styles['borderRadius'] = $raw_styles['borderRadius'];
			if ( isset( $raw_styles['border'] ) ) $final_styles['border'] = $raw_styles['border'];
		}

		if ( ! empty( $allowed['alignment'] ) ) {
			if ( isset( $raw_styles['textAlign'] ) ) $final_styles['textAlign'] = $raw_styles['textAlign'];
		}
		if ( ! empty( $allowed['dimensions'] ) ) {
			if ( isset( $raw_styles['width'] ) ) $final_styles['width'] = $raw_styles['width'];
			if ( isset( $raw_styles['height'] ) ) $final_styles['height'] = $raw_styles['height'];
		}

		// Direct Props Mapping (for keys that match CSS property name in CamelCase)
		$direct_props = array( 'opacity', 'boxShadow', 'zIndex', 'overflow', 'visibility', 'cursor', 'transition', 'filter', 'backdropFilter', 'transform' );
		foreach ( $direct_props as $prop ) {
			if ( ! empty( $allowed[ $prop ] ) && isset( $raw_styles[ $prop ] ) ) {
				$final_styles[ $prop ] = $raw_styles[ $prop ];
			}
		}

		// Custom CSS Box
		if ( ! empty( $allowed['customStylesBox'] ) ) {
			if ( isset( $raw_styles['customCssPairs'] ) && is_array( $raw_styles['customCssPairs'] ) ) {
				foreach ( $raw_styles['customCssPairs'] as $pair ) {
					if ( ! empty( $pair['key'] ) ) {
						$final_styles[ $pair['key'] ] = $pair['value'];
					}
				}
			}
		}

		// Background image capability for any element if enabled
		if ( ! empty( $allowed['backgroundImage'] ) ) {
			if ( isset( $content_data[ $field . '_bg_url' ] ) && ! empty( $content_data[ $field . '_bg_url' ] ) ) {
				$bg_url = esc_url( $content_data[ $field . '_bg_url' ] );
				$final_styles['background-image']    = "url('{$bg_url}')";
				$final_styles['background-size']     = isset( $raw_styles['backgroundSize'] ) ? $raw_styles['backgroundSize'] : 'cover';
				$final_styles['background-position'] = isset( $raw_styles['backgroundPosition'] ) ? $raw_styles['backgroundPosition'] : 'center';
				$final_styles['background-repeat']   = isset( $raw_styles['backgroundRepeat'] ) ? $raw_styles['backgroundRepeat'] : 'no-repeat';
			}
		}

		if ( $type === 'container' ) {

			if ( $node_columns > 1 ) {
				$final_styles['display'] = 'grid';
				$final_styles['grid-template-columns'] = "repeat({$node_columns}, 1fr)";
				$final_styles['gap'] = '20px';
			}
		}

		if ( in_array( $type, array( 'text', 'heading' ) ) ) {
			$final_styles['white-space'] = 'pre-wrap';
		}

		$style_attr = rcb_build_inline_style( $final_styles );

		switch ( $type ) {
			case 'container':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content );
				}
				$html .= sprintf( '<div class="rcb-container %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'column':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content );
				}
				$html .= sprintf( '<div class="rcb-column %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'innerblocks':
				$html .= sprintf( '<div class="rcb-inner-blocks-slot %s" %s>%s</div>', esc_attr( $id ), $style_attr, $inner_blocks_content );
				break;

			case 'heading':
				if ( ! empty( $dynamic_source ) && $post ) {
					if ( $dynamic_source === 'post_title' ) {
						$node_content = get_the_title( $post );
					} elseif ( $dynamic_source === 'post_excerpt' ) {
						$node_content = get_the_excerpt( $post );
					} elseif ( $dynamic_source === 'post_date' ) {
						$node_content = get_the_date( '', $post );
					} elseif ( $dynamic_source === 'post_author' ) {
						$node_content = get_the_author_meta( 'display_name', $post->post_author );
					} elseif ( $dynamic_source === 'term' ) {
						$terms = get_the_terms( $post, $dynamic_field );
						$node_content = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';
					} elseif ( $dynamic_source === 'custom_meta' ) {
						$node_content = get_post_meta( $post->ID, $dynamic_field, true );
					} else {
						$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
					}
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<h2 class="rcb-heading %s" %s>%s</h2>', esc_attr( $id ), $style_attr, esc_html( $node_content ) );
				break;

			case 'text':
				if ( ! empty( $dynamic_source ) && $post ) {
					if ( $dynamic_source === 'post_title' ) {
						$node_content = get_the_title( $post );
					} elseif ( $dynamic_source === 'post_excerpt' ) {
						$node_content = wp_trim_words( get_the_excerpt( $post ), 20, '...' );
					} elseif ( $dynamic_source === 'post_date' ) {
						$node_content = get_the_date( '', $post );
					} elseif ( $dynamic_source === 'post_author' ) {
						$node_content = get_the_author_meta( 'display_name', $post->post_author );
					} elseif ( $dynamic_source === 'term' ) {
						$terms = get_the_terms( $post, $dynamic_field );
						$node_content = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';
					} elseif ( $dynamic_source === 'custom_meta' ) {
						$node_content = get_post_meta( $post->ID, $dynamic_field, true );
					} else {
						$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
					}
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<div class="rcb-text %s" %s>%s</div>', esc_attr( $id ), $style_attr, wp_kses_post( $node_content ) );
				break;

			case 'image':
				$url = '';
				$alt = '';
				if ( ! empty( $dynamic_source ) && $post ) {
					if ( $dynamic_source === 'featured_image' ) {
						$url = get_the_post_thumbnail_url( $post, 'large' );
						$alt = get_the_title( $post );
					} elseif ( $dynamic_source === 'custom_meta' ) {
						$url = get_post_meta( $post->ID, $dynamic_field, true );
						$alt = 'Custom Image';
					} else {
						$url = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';
						$alt = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
					}
				} else {
					$url = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';
					$alt = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}

				if ( $url ) {
					$html .= sprintf( '<img src="%s" class="rcb-image %s" alt="%s" %s />', esc_url( $url ), esc_attr( $id ), esc_attr( $alt ), $style_attr );
				} elseif ( current_user_can( 'edit_posts' ) ) {
					$html .= sprintf( '<div class="rcb-image-placeholder %s" %s style="background:#ddd;min-height:100px;display:flex;align-items:center;justify-content:center;">Image Placeholder: %s</div>', esc_attr( $id ), $style_attr, esc_html( $field ) );
				}
				break;

			case 'button':
				if ( ! empty( $dynamic_source ) && $post ) {
					if ( $dynamic_source === 'permalink' ) {
						$btn_url = get_permalink( $post );
					} elseif ( $dynamic_source === 'custom_meta' ) {
						$btn_url = get_post_meta( $post->ID, $dynamic_field, true );
					} else {
						$btn_url = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '#';
					}
					$node_content = isset( $content_data[ $field ] ) && ! empty( $content_data[ $field ] ) ? $content_data[ $field ] : __( 'Read More', 'reusable-component-builder' );
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
