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
		
		// Add !important to font-weight and font-family to override theme defaults
		$suffix = ( $css_prop === 'font-weight' || $css_prop === 'font-family' ) ? ' !important' : '';
		
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

		$paged = 1;
		if ( $pagination ) {
			// On singular pages, custom loops usually shouldn't sync with the main page's 'paged' value
			// unless we are specifically on an archive. This prevents "No posts found" if the URL has /page/X/
			if ( ! is_singular() ) {
				$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
			}
		}

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
		global $post;
		$style_registry = '';
		$inner_html = rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content, $style_registry );
		
		$final_output .= ( ! empty( $style_registry ) ) ? '<style>' . $style_registry . '</style>' : '';
		$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s" %s>', esc_attr( $unique_id ), $root_style_attr );
		$final_output .= $inner_html;
		$final_output .= '</div>';
	}

	return $final_output;
}

/**
 * Render nodes with visibility toggles and style registry support.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '', &$style_registry = '' ) {
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

		// Standard styles - Map if they exist in raw_styles, regardless of allowedSettings
		// This ensures robustness if allowedSettings ever gets out of sync or missing
		if ( isset( $raw_styles['color'] ) ) $final_styles['color'] = $raw_styles['color'];
		if ( isset( $raw_styles['backgroundColor'] ) ) $final_styles['backgroundColor'] = $raw_styles['backgroundColor'];
		
		if ( isset( $raw_styles['padding'] ) ) $final_styles['padding'] = $raw_styles['padding'];
		if ( isset( $raw_styles['margin'] ) ) $final_styles['margin'] = $raw_styles['margin'];

		if ( isset( $raw_styles['fontSize'] ) ) $final_styles['fontSize'] = $raw_styles['fontSize'];
		if ( isset( $raw_styles['fontWeight'] ) ) $final_styles['fontWeight'] = $raw_styles['fontWeight'];
		if ( isset( $raw_styles['lineHeight'] ) ) $final_styles['lineHeight'] = $raw_styles['lineHeight'];
		if ( isset( $raw_styles['letterSpacing'] ) ) $final_styles['letterSpacing'] = $raw_styles['letterSpacing'];
		if ( isset( $raw_styles['textTransform'] ) ) $final_styles['textTransform'] = $raw_styles['textTransform'];
		if ( isset( $raw_styles['fontFamily'] ) ) $final_styles['fontFamily'] = $raw_styles['fontFamily'];

		if ( isset( $raw_styles['borderRadius'] ) ) $final_styles['borderRadius'] = $raw_styles['borderRadius'];
		if ( isset( $raw_styles['border'] ) ) $final_styles['border'] = $raw_styles['border'];

		if ( isset( $raw_styles['textAlign'] ) ) $final_styles['textAlign'] = $raw_styles['textAlign'];
		
		if ( isset( $raw_styles['width'] ) ) $final_styles['width'] = $raw_styles['width'];
		if ( isset( $raw_styles['height'] ) ) $final_styles['height'] = $raw_styles['height'];

		// Direct Props Mapping
		$direct_props = array( 'opacity', 'boxShadow', 'zIndex', 'overflow', 'visibility', 'cursor', 'transition', 'filter', 'backdropFilter', 'transform' );
		foreach ( $direct_props as $prop ) {
			if ( isset( $raw_styles[ $prop ] ) ) {
				$final_styles[ $prop ] = $raw_styles[ $prop ];
			}
		}

		// Custom CSS Box
		if ( ! empty( $allowed['customStylesBox'] ) ) {
			if ( isset( $raw_styles['customCssPairs'] ) && is_array( $raw_styles['customCssPairs'] ) ) {
				foreach ( $raw_styles['customCssPairs'] as $pair ) {
					if ( ! empty( $pair['key'] ) && ! empty( $pair['value'] ) ) {
						$final_styles[ $pair['key'] ] = $pair['value'];
					}
				}
			}

			// Handle raw CSS string
			if ( isset( $raw_styles['customStylesRaw'] ) && ! empty( $raw_styles['customStylesRaw'] ) ) {
				$raw_rules = explode( ';', $raw_styles['customStylesRaw'] );
				foreach ( $raw_rules as $rule ) {
					$parts = explode( ':', $rule, 2 );
					if ( count( $parts ) === 2 ) {
						$key = trim( $parts[0] );
						$val = trim( $parts[1] );
						if ( ! empty( $key ) && ! empty( $val ) ) {
							$final_styles[ $key ] = $val;
						}
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

		// Handle Advanced Button Settings
		if ( $type === 'button' && ! empty( $allowed['buttonSettings'] ) ) {
			// Padding X/Y only if standard padding is not set
			if ( ! isset( $final_styles['padding'] ) && ( isset( $raw_styles['paddingX'] ) || isset( $raw_styles['paddingY'] ) ) ) {
				$padding_x = isset( $raw_styles['paddingX'] ) ? floatval( $raw_styles['paddingX'] ) : 1;
				$padding_y = isset( $raw_styles['paddingY'] ) ? floatval( $raw_styles['paddingY'] ) : 0.5;
				$final_styles['padding'] = "{$padding_y}rem {$padding_x}rem";
			}

			// Border Radius/Width Rem
			if ( ! isset( $final_styles['borderRadius'] ) && isset( $raw_styles['borderRadiusRem'] ) ) {
				$final_styles['border-radius'] = floatval( $raw_styles['borderRadiusRem'] ) . 'rem';
			}
			if ( ! isset( $final_styles['border'] ) && isset( $raw_styles['borderWidthRem'] ) ) {
				$final_styles['border-width'] = floatval( $raw_styles['borderWidthRem'] ) . 'rem';
				if ( ! isset( $final_styles['border-style'] ) ) $final_styles['border-style'] = 'solid';
				if ( isset( $raw_styles['borderColor'] ) ) $final_styles['border-color'] = $raw_styles['borderColor'];
			}

			// Text Size Presets
			$size_map = array( 'S' => '12px', 'M' => '14px', 'L' => '16px', 'XL' => '20px', '1XL' => '24px', '2XL' => '32px' );
			if ( ! isset( $final_styles['fontSize'] ) && isset( $raw_styles['textSizePreset'] ) && isset( $size_map[ $raw_styles['textSizePreset'] ] ) ) {
				$final_styles['font-size'] = $size_map[ $raw_styles['textSizePreset'] ];
			}

			// Add direct typography mapping for buttons if not already mapped
			if ( ! isset( $final_styles['fontFamily'] ) && isset( $raw_styles['fontFamily'] ) ) $final_styles['fontFamily'] = $raw_styles['fontFamily'];
			if ( ! isset( $final_styles['fontWeight'] ) && isset( $raw_styles['fontWeight'] ) ) $final_styles['fontWeight'] = $raw_styles['fontWeight'];
			if ( ! isset( $final_styles['textTransform'] ) && isset( $raw_styles['textTransform'] ) ) $final_styles['textTransform'] = $raw_styles['textTransform'];
			if ( ! isset( $final_styles['lineHeight'] ) && isset( $raw_styles['lineHeight'] ) ) $final_styles['lineHeight'] = $raw_styles['lineHeight'];
			if ( ! isset( $final_styles['letterSpacing'] ) && isset( $raw_styles['letterSpacing'] ) ) $final_styles['letterSpacing'] = $raw_styles['letterSpacing'];
			if ( ! isset( $final_styles['fontSize'] ) && isset( $raw_styles['fontSize'] ) ) $final_styles['fontSize'] = $raw_styles['fontSize'];

			// Hover States
			$hover_css = '';
			if ( isset( $raw_styles['hoverBgColor'] ) && ! empty( $raw_styles['hoverBgColor'] ) ) {
				$hover_css .= "background-color: {$raw_styles['hoverBgColor']} !important;";
			}
			if ( isset( $raw_styles['hoverTextColor'] ) && ! empty( $raw_styles['hoverTextColor'] ) ) {
				$hover_css .= "color: {$raw_styles['hoverTextColor']} !important;";
			}
			if ( ! empty( $raw_styles['hoverUnderline'] ) ) {
				$hover_css .= "text-decoration: underline !important;";
			} else {
				$hover_css .= "text-decoration: none !important;";
			}

			if ( ! empty( $hover_css ) ) {
				$style_registry .= ".rcb-button.{$id}:hover { {$hover_css} }";
			}
			
			// Icon Hover
			if ( ! empty( $allowed['iconSettings'] ) ) {
				$icon_hover_css = '';
				if ( isset( $raw_styles['iconHoverBgColor'] ) && ! empty( $raw_styles['iconHoverBgColor'] ) ) {
					$icon_hover_css .= "background-color: {$raw_styles['iconHoverBgColor']} !important;";
				}
				if ( isset( $raw_styles['iconHoverColor'] ) && ! empty( $raw_styles['iconHoverColor'] ) ) {
					$icon_hover_css .= "color: {$raw_styles['iconHoverColor']} !important;";
				}
				if ( isset( $raw_styles['iconHoverBorderColor'] ) && ! empty( $raw_styles['iconHoverBorderColor'] ) ) {
					$icon_hover_css .= "border-color: {$raw_styles['iconHoverBorderColor']} !important;";
				}
				if ( ! empty( $icon_hover_css ) ) {
					$style_registry .= ".rcb-button.{$id}:hover .rcb-button-icon { {$icon_hover_css} }";
				}
			}
		}

		if ( $type === 'container' ) {
			$display_mode = isset( $raw_styles['displayMode'] ) ? $raw_styles['displayMode'] : 'grid';
			
			// Handle Content Max Width
			if ( isset( $raw_styles['contentMaxWidth'] ) && ! empty( $raw_styles['contentMaxWidth'] ) ) {
				$final_styles['max-width'] = $raw_styles['contentMaxWidth'];
				$final_styles['margin-left'] = 'auto';
				$final_styles['margin-right'] = 'auto';
				$final_styles['width'] = '100%';
			}

			if ( $node_columns > 1 || $display_mode === 'flex' || isset( $raw_styles['displayMode'] ) ) {
				if ( $display_mode === 'flex' ) {
					$final_styles['display'] = 'flex';
					$final_styles['flex-direction'] = isset( $raw_styles['flexDirection'] ) ? $raw_styles['flexDirection'] : 'row';
					$final_styles['flex-wrap'] = isset( $raw_styles['flexWrap'] ) ? $raw_styles['flexWrap'] : 'wrap';
					$final_styles['justify-content'] = isset( $raw_styles['justifyContent'] ) ? $raw_styles['justifyContent'] : 'flex-start';
					$final_styles['align-items'] = isset( $raw_styles['alignItems'] ) ? $raw_styles['alignItems'] : 'stretch';
					if ( isset( $raw_styles['flexGap'] ) && $raw_styles['flexGap'] !== '' ) {
						$final_styles['gap'] = $raw_styles['flexGap'];
					}
				} else {
					$final_styles['display'] = 'grid';
					$template_cols = isset( $raw_styles['gridTemplateColumns'] ) ? $raw_styles['gridTemplateColumns'] : '';
					if ( $template_cols === 'custom' ) {
						$template_cols = isset( $raw_styles['customGridTemplate'] ) ? $raw_styles['customGridTemplate'] : '';
					}
					if ( empty( $template_cols ) ) {
						$template_cols = "repeat(" . ( $node_columns > 0 ? $node_columns : 1 ) . ", 1fr)";
					}
					$final_styles['grid-template-columns'] = $template_cols;
					
					// Handle Grid Gaps
					if ( isset( $raw_styles['gridGap'] ) && $raw_styles['gridGap'] !== '' ) {
						$final_styles['column-gap'] = $raw_styles['gridGap'];
						$final_styles['row-gap'] = isset( $raw_styles['rowGap'] ) ? $raw_styles['rowGap'] : $raw_styles['gridGap'];
					} elseif ( isset( $raw_styles['rowGap'] ) && $raw_styles['rowGap'] !== '' ) {
						$final_styles['row-gap'] = $raw_styles['rowGap'];
					} elseif ( ! isset( $final_styles['gap'] ) && $node_columns > 1 ) {
						$final_styles['gap'] = '20px';
					}
				}
			}
		}

		if ( $type === 'column' ) {
			if ( isset( $raw_styles['customColumnWidth'] ) && $raw_styles['customColumnWidth'] !== '' ) {
				$unit = isset( $raw_styles['customColumnWidthUnit'] ) ? $raw_styles['customColumnWidthUnit'] : '%';
				$final_styles['width'] = $raw_styles['customColumnWidth'] . $unit;
				$final_styles['flex'] = "0 0 {$final_styles['width']}"; // For flex containers compatibility
			}
			if ( isset( $raw_styles['alignSelf'] ) && $raw_styles['alignSelf'] !== '' ) {
				$final_styles['align-self'] = $raw_styles['alignSelf'];
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
				} elseif ( ! empty( $dynamic_source ) ) {
					// Don't show generic placeholders for missing dynamic images on frontend
					break; 
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

				$btn_target = isset( $content_data[ $field . '_target' ] ) ? $content_data[ $field . '_target' ] : '_self';
				$align      = isset( $raw_styles['buttonAlign'] ) ? $raw_styles['buttonAlign'] : 'start';
				$align_map  = array( 'start' => 'flex-start', 'center' => 'center', 'end' => 'flex-end' );
				$justify    = isset( $align_map[ $align ] ) ? $align_map[ $align ] : 'flex-start';

				$icon_mode = isset( $content_data[ $field . '_icon_mode' ] ) ? $content_data[ $field . '_icon_mode' ] : 'Default';
				$icon_html = '';
				$icon_size = isset( $raw_styles['iconSize'] ) ? floatval( $raw_styles['iconSize'] ) : 0.8;

				if ( $icon_mode !== 'Default' ) {
					$icon_style = "font-size:{$icon_size}em; line-height:1; transition:all 0.3s ease-in-out;";
					if ( $icon_mode === 'Icon with Bg' ) {
						$icon_bg      = isset( $raw_styles['iconBgColor'] ) ? $raw_styles['iconBgColor'] : '#f0f0f0';
						$icon_col     = isset( $raw_styles['iconColor'] ) ? $raw_styles['iconColor'] : 'inherit';
						$icon_bd_col  = isset( $raw_styles['iconBorderColor'] ) ? $raw_styles['iconBorderColor'] : 'transparent';
						$icon_bd_w    = isset( $raw_styles['iconBorderWidth'] ) ? floatval( $raw_styles['iconBorderWidth'] ) : 0.1;
						$circle_size  = $icon_size * 1.875; 
						$icon_style  .= "background:{$icon_bg}; color:{$icon_col}; border:{$icon_bd_w}rem solid {$icon_bd_col}; border-radius:50%; width:{$circle_size}em; height:{$circle_size}em;";
					} else {
						$icon_col     = isset( $raw_styles['iconColor'] ) ? $raw_styles['iconColor'] : 'inherit';
						$icon_style   .= "color:{$icon_col};";
					}
					$icon_svg  = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
					$icon_html = sprintf( '<span class="rcb-button-icon" style="display:inline-flex;align-items:center;justify-content:center;%s">%s</span>', esc_attr( $icon_style ), $icon_svg );
				}

				// Scoped CSS for hover
				$btn_css_id = 'rcb-btn-' . $id;
				$hover_css  = '';
				
				$h_bg     = isset( $raw_styles['hoverBgColor'] ) ? $raw_styles['hoverBgColor'] : '';
				$h_col    = isset( $raw_styles['hoverColor'] ) ? $raw_styles['hoverColor'] : '';
				$h_bd_col = isset( $raw_styles['hoverBorderColor'] ) ? $raw_styles['hoverBorderColor'] : '';
				$h_und    = isset( $raw_styles['hoverUnderline'] ) && $raw_styles['hoverUnderline'] ? 'underline' : 'none';

				if ( $h_bg || $h_col || $h_bd_col || $h_und !== 'none' ) {
					$hover_css .= ".{$btn_css_id}:hover {";
					if ( $h_bg ) $hover_css .= "background-color:{$h_bg} !important;";
					if ( $h_col ) $hover_css .= "color:{$h_col} !important;";
					if ( $h_bd_col ) $hover_css .= "border-color:{$h_bd_col} !important;";
					$hover_css .= "text-decoration:{$h_und} !important;";
					$hover_css .= "}";
				}

				// Icon Hover
				$hi_bg  = isset( $raw_styles['iconHoverBgColor'] ) ? $raw_styles['iconHoverBgColor'] : '';
				$hi_col = isset( $raw_styles['iconHoverColor'] ) ? $raw_styles['iconHoverColor'] : '';
				if ( $hi_bg || $hi_col ) {
					$hover_css .= ".{$btn_css_id}:hover .rcb-button-icon {";
					if ( $hi_bg ) $hover_css .= "background-color:{$hi_bg} !important;";
					if ( $hi_col ) $hover_css .= "color:{$hi_col} !important;";
					$hover_css .= "}";
				}

				$style_tag = $hover_css ? "<style>{$hover_css}</style>" : '';

				$btn_style_inline = "display:inline-flex;align-items:center;gap:8px;text-decoration:none;transition:all 0.3s ease-in-out;";
				$final_style_attr = str_replace( 'style="', 'style="' . $btn_style_inline, $style_attr );

				$html .= sprintf( 
					'%s<div class="rcb-button-wrapper" style="display:flex;width:100%%;justify-content:%s;">
						<a href="%s" target="%s" class="rcb-button %s %s" %s>%s %s</a>
					</div>', 
					$style_tag,
					esc_attr( $justify ),
					esc_url( $btn_url ), 
					esc_attr( $btn_target ),
					esc_attr( $id ), 
					esc_attr( $btn_css_id ),
					$final_style_attr,
					esc_html( $node_content ),
					$icon_html
				);
				break;
		}
	}

	return $html;
}
