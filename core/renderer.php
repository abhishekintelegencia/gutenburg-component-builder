<?php

/**
 * Main render callback for Gutenberg dynamic block.
 */
function rcb_render_component_builder_block( $attributes, $content ) {
	$template_id = isset( $attributes['templateId'] ) ? intval( $attributes['templateId'] ) : 0;
	if ( ! $template_id ) {
		return '';
	}

	global $post;

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

	$style_registry = '';
	
	// If mode is 'query' (e.g. inside a loop), we use the global $post instead of static content
	if ( $mode === 'query' && $post ) {
		// Use real post data for dynamic fields if they exist
	}

	$output = rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post, $visibility, $content, $style_registry, $unique_id );

	if ( ! empty( $style_registry ) ) {
		$output = "<style>{$style_registry}</style>" . $output;
	}

	return $output;
}

/**
 * Render visual nodes recursively.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '', &$style_registry = '', $instance_id = '' ) {
	$html = '';

	foreach ( $nodes as $node ) {
		$type         = isset( $node['type'] ) ? $node['type'] : '';
		$id           = isset( $node['id'] ) ? $node['id'] : '';
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
		$final_styles  = array();
		$has_responsive = false;

		// Detect if any property is responsive (an array)
		foreach ( $raw_styles as $val ) {
			if ( is_array( $val ) ) {
				$has_responsive = true;
				break;
			}
		}

		if ( $has_responsive ) {
			// Scope responsive CSS to the specific instance if provided
			$selector = ( ! empty( $instance_id ) ) ? ".rcb-instance-{$instance_id} .{$id}" : ".{$id}";
			$style_registry .= rcb_generate_responsive_css( $selector, $raw_styles );
		}

		// Standard styles - Map if they exist in raw_styles, regardless of allowedSettings
		// Only map non-array values to inline styles
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
		
		// Additional properties
		$direct_props = array(
			'width', 'height', 'textAlign', 'display', 'opacity', 'zIndex',
			'position', 'top', 'left', 'right', 'bottom',
			'overflow', 'objectFit', 'boxShadow', 'transition', 'cursor',
			'justifyContent', 'alignItems', 'flexDirection', 'flexWrap', 'gap',
			'gridTemplateColumns', 'gridGap', 'gridColumn', 'gridRow'
		);

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
			if ( ( isset( $raw_styles['hoverTextColor'] ) && ! empty( $raw_styles['hoverTextColor'] ) ) || ( isset( $raw_styles['hoverColor'] ) && ! empty( $raw_styles['hoverColor'] ) ) ) {
				$h_text_color = ! empty( $raw_styles['hoverColor'] ) ? $raw_styles['hoverColor'] : $raw_styles['hoverTextColor'];
				$hover_css .= "color: {$h_text_color} !important;";
			}
			if ( ! empty( $raw_styles['hoverUnderline'] ) ) {
				$hover_css .= "text-decoration: underline !important;";
			} else {
				$hover_css .= "text-decoration: none !important;";
			}

			if ( $hover_css ) {
				$btn_selector = ( ! empty( $instance_id ) ) ? ".rcb-instance-{$instance_id} .{$id}:hover" : ".{$id}:hover";
				$style_registry .= "{$btn_selector} { {$hover_css} }";
			}
			
			// Display properties
			if ( isset( $raw_styles['display'] ) ) {
				$final_styles['display'] = $raw_styles['display'];
			}
			if ( isset( $raw_styles['flex'] ) ) {
				$final_styles['flex'] = $raw_styles['flex'];
			} elseif ( $node_columns > 0 ) {
				$final_styles['flex'] = "1 1 0%"; // Default row distribution
			}
			
			$a_self = rcb_get_responsive_value( isset( $raw_styles['alignSelf'] ) ? $raw_styles['alignSelf'] : '', 'desktop' );
			if ( $a_self !== '' ) {
				$final_styles['align-self'] = $a_self;
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
				$tag         = isset( $node['headingTag'] ) ? $node['headingTag'] : 'h2';
				$text_val    = isset( $content_data[ $field ] ) ? $content_data[ $field ] : 'Heading Title';
				
				if ( ( $mode === 'query' ) && $post ) {
					if ( $dynamic_source === 'post_title' ) {
						$text_val = get_the_title( $post );
					} elseif ( $dynamic_source === 'custom_meta' && ! empty( $dynamic_field ) ) {
						$text_val = get_post_meta( $post->ID, $dynamic_field, true );
					}
				}
				$html .= sprintf( '<%s class="rcb-heading %s" %s>%s</%s>', esc_attr( $tag ), esc_attr( $id ), $style_attr, wp_kses_post( $text_val ), esc_attr( $tag ) );
				break;

			case 'text':
				$text_val    = isset( $content_data[ $field ] ) ? $content_data[ $field ] : 'Enter description text here...';
				if ( ( $mode === 'query' ) && $post ) {
					if ( $dynamic_source === 'post_excerpt' ) {
						$text_val = get_the_excerpt( $post );
					} elseif ( $dynamic_source === 'post_content' ) {
						$text_val = $post->post_content;
					} elseif ( $dynamic_source === 'custom_meta' && ! empty( $dynamic_field ) ) {
						$text_val = get_post_meta( $post->ID, $dynamic_field, true );
					}
				}
				$html .= sprintf( '<div class="rcb-text %s" %s>%s</div>', esc_attr( $id ), $style_attr, wp_kses_post( $text_val ) );
				break;

			case 'image':
				$img_url     = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				if ( ( $mode === 'query' ) && $post ) {
					if ( $dynamic_source === 'featured_image' ) {
						$img_url = get_the_post_thumbnail_url( $post, 'large' );
					} elseif ( $dynamic_source === 'custom_meta' && ! empty( $dynamic_field ) ) {
						$img_url = get_post_meta( $post->ID, $dynamic_field, true );
					}
				}
				$html .= sprintf( '<div class="rcb-image %s" %s><img src="%s" alt="" /></div>', esc_attr( $id ), $style_attr, esc_url( $img_url ) );
				break;

			case 'button':
				$btn_text    = isset( $content_data[ $field . '_text' ] ) ? $content_data[ $field . '_text' ] : 'Learn More';
				$btn_url     = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '#';
				if ( ( $mode === 'query' ) && $post ) {
					if ( $dynamic_source === 'post_url' ) {
						$btn_url = get_permalink( $post );
					} elseif ( $dynamic_source === 'custom_meta' && ! empty( $dynamic_field ) ) {
						$btn_url = get_post_meta( $post->ID, $dynamic_field, true );
					}
				}
				$html .= sprintf( '<a href="%s" class="rcb-button %s" %s>%s</a>', esc_url( $btn_url ), esc_attr( $id ), $style_attr, esc_html( $btn_text ) );
				break;

			case 'inner_blocks':
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
	$slides_per_view = isset( $attributes['slidesPerView'] ) ? intval( $attributes['slidesPerView'] ) : 1;
	$space_between = isset( $attributes['spaceBetween'] ) ? intval( $attributes['spaceBetween'] ) : 0;
	$height = isset( $attributes['height'] ) ? $attributes['height'] : '500px';
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
	$style_registry = "
		.rcb-instance-{$unique_id} { 
			--rcb-slider-height: {$height}; 
			--rcb-arrow-color: {$arrow_color}; 
			--rcb-dot-color: {$dot_color}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-content { 
			--rcb-content-bg: {$content_bg_color}; 
			--rcb-content-padding: {$content_padding}px; 
			--rcb-content-radius: {$content_border_radius}px; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-title { 
			--rcb-title-color: {$title_color}; 
			--rcb-title-size: {$title_font_size}px; 
			--rcb-title-weight: {$title_font_weight}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-desc { 
			--rcb-desc-color: {$desc_color}; 
			--rcb-desc-size: {$desc_font_size}px; 
			--rcb-desc-weight: {$desc_font_weight}; 
		}
		.rcb-instance-{$unique_id} .rcb-slide-btn { 
			--rcb-btn-color: {$btn_color}; 
			--rcb-btn-bg: {$btn_bg_color}; 
			--rcb-btn-radius: {$btn_border_radius}px; 
			--rcb-btn-size: {$btn_font_size}px; 
		}
	";

	if ( $query->have_posts() ) {
		$final_output .= sprintf(
			'<div class="rcb-slider swiper rcb-dynamic-slider rcb-instance-%s" 
				data-arrows="%s" data-dots="%s" data-autoplay="%s" 
				data-autoplay-delay="%d" data-loop="%s" data-effect="%s" 
				data-slides-per-view="%d" data-space-between="%d"
				style="--rcb-slider-height: %s; --rcb-arrow-color: %s; --rcb-dot-color: %s;">',
			esc_attr( $unique_id ),
			$arrows ? 'true' : 'false',
			$dots ? 'true' : 'false',
			$autoplay ? 'true' : 'false',
			$autoplay_delay,
			$loop ? 'true' : 'false',
			esc_attr( $effect ),
			$slides_per_view,
			$space_between,
			esc_attr( $height ),
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
			$min_required = max( 3, $slides_per_view * 2 );
			if ( $post_count < $min_required ) {
				$repeats = ceil( $min_required / $post_count );
			}
		}
		// Max safety cap on repeats
		$repeats = min( $repeats, 10 );

		for ( $i = 0; $i < $repeats; $i++ ) {
			foreach ( $posts as $post_obj ) {
				setup_postdata( $GLOBALS['post'] =& $post_obj );
				$media_url = get_the_post_thumbnail_url( null, 'large' );
				
				$final_output .= sprintf(
					'<div class="swiper-slide rcb-slide-item v-align-%s" style="background-image: %s; background-color: %s; background-size:cover; background-position:center; width:100%%; height:100%%; position:relative; overflow:hidden;">',
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
						get_the_title()
					);
				}
				
				if ( $show_desc ) {
					$final_output .= sprintf(
						'<div class="rcb-slide-desc">%s</div>',
						get_the_excerpt()
					);
				}
				
				if ( $show_btn ) {
					$final_output .= sprintf(
						'<div class="rcb-slide-btn-wrapper"><a href="%s" class="rcb-slide-btn">%s</a></div>',
						get_permalink(),
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

	foreach ( $styles as $prop => $value ) {
		if ( ! is_array( $value ) ) {
			// standard prop would already be in inline style usually, 
			// but we handle it here if it's passed as non-responsive
			continue;
		}
		
		$kebab = strtolower( preg_replace( '/([a-z])([A-Z])/', '$1-$2', $prop ) );
		
		foreach ( $value as $device => $val ) {
			if ( $val === '' ) continue;
			
			$suffix = "";
			if ( in_array( $prop, array( 'fontSize', 'width', 'height', 'padding', 'margin', 'borderRadius', 'gap', 'gridGap' ) ) && is_numeric( $val ) ) {
				$suffix = "px";
			}

			if ( $device === 'desktop' ) $desktop .= "{$kebab}:{$val}{$suffix};";
			if ( $device === 'tablet' )  $tablet  .= "{$kebab}:{$val}{$suffix};";
			if ( $device === 'mobile' )  $mobile  .= "{$kebab}:{$val}{$suffix};";
		}
	}

	$out = "";
	if ( $desktop ) $out .= "{$selector} { {$desktop} }\n";
	if ( $tablet )  $out .= "@media (max-width: 1024px) { {$selector} { {$tablet} } }\n";
	if ( $mobile )  $out .= "@media (max-width: 767px) { {$selector} { {$mobile} } }\n";
	
	return $out;
}
