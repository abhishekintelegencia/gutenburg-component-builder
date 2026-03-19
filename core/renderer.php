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
 * Recursively renders the visual structure nodes.
 * In "query" mode, the first heading/text/image/button of each type
 * is automatically mapped to the current WP_Post data.
 */
function rcb_render_visual_nodes( $nodes, $content_data, $styles_data, $mode, $post = null, &$assigned = array() ) {
	$html = '';

	if ( empty( $assigned ) ) {
		$assigned = array(
			'heading' => false,
			'text'    => false,
			'image'   => false,
			'button'  => false,
		);
	}

	$visibility = array(
		'showTitle'   => true,
		'showExcerpt' => true,
		'showImage'   => true,
		'showButton'  => true,
	);

	foreach ( $nodes as $node ) {
		$type  = isset( $node['type'] ) ? $node['type'] : '';
		$id    = isset( $node['id'] ) ? $node['id'] : '';
		$field = isset( $node['field'] ) ? $node['field'] : '';

		$node_styles = isset( $styles_data[ $field ] ) ? $styles_data[ $field ] : array();

		// Container background image from content
		if ( $type === 'container' && isset( $content_data[ $field . '_bg_url' ] ) && ! empty( $content_data[ $field . '_bg_url' ] ) ) {
			$bg_url = esc_url( $content_data[ $field . '_bg_url' ] );
			$node_styles['background-image'] = "url('{$bg_url}')";
			$node_styles['background-size']     = 'cover';
			$node_styles['background-position'] = 'center';
		}

		$style_attr = rcb_build_inline_style( $node_styles );

		switch ( $type ) {
			case 'container':
				$children_html = '';
				if ( ! empty( $node['children'] ) && is_array( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes( $node['children'], $content_data, $styles_data, $mode, $post, $assigned );
				}
				$html .= sprintf( '<div class="rcb-container %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
				break;

			case 'heading':
				if ( $mode === 'query' ) {
					if ( ! $visibility['showTitle'] || $assigned['heading'] ) continue 2;
					$node_content = get_the_title( $post );
					$assigned['heading'] = true;
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<h2 class="rcb-heading %s" %s>%s</h2>', esc_attr( $id ), $style_attr, esc_html( $node_content ) );
				break;

			case 'text':
				if ( $mode === 'query' ) {
					if ( ! $visibility['showExcerpt'] || $assigned['text'] ) continue 2;
					$node_content = wp_trim_words( get_the_excerpt( $post ), 20, '...' );
					$assigned['text'] = true;
				} else {
					$node_content = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}
				$html .= sprintf( '<div class="rcb-text %s" %s>%s</div>', esc_attr( $id ), $style_attr, wp_kses_post( $node_content ) );
				break;

			case 'image':
				if ( $mode === 'query' ) {
					if ( ! $visibility['showImage'] || $assigned['image'] ) continue 2;
					$url = get_the_post_thumbnail_url( $post, 'large' );
					if ( ! $url ) $url = 'https://via.placeholder.com/600x400?text=No+Image';
					$assigned['image'] = true;
					$alt = get_the_title( $post );
				} else {
					$url = isset( $content_data[ $field . '_url' ] ) ? $content_data[ $field . '_url' ] : '';
					$alt = isset( $content_data[ $field ] ) ? $content_data[ $field ] : '';
				}

				if ( $url ) {
					$html .= sprintf( '<img src="%s" class="rcb-image %s" alt="%s" %s />', esc_url( $url ), esc_attr( $id ), esc_attr( $alt ), $style_attr );
				} else {
					$html .= sprintf( '<div class="rcb-image-placeholder %s" %s style="background:#ccc;min-height:100px;display:flex;align-items:center;justify-content:center;">No Image</div>', esc_attr( $id ), $style_attr );
				}
				break;

			case 'button':
				if ( $mode === 'query' ) {
					if ( ! $visibility['showButton'] || $assigned['button'] ) continue 2;
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

	// Fetch template structure
	$structure_json = get_post_meta( $template_id, '_component_structure', true );
	$structure_data = $structure_json ? json_decode( $structure_json, true ) : array();
	$nodes          = isset( $structure_data['structure'] ) ? $structure_data['structure'] : array();

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

				// Create fresh assigned tracking per post
				$assigned_per_post = array(
					'heading' => false,
					'text'    => false,
					'image'   => false,
					'button'  => false,
				);

				// Thread visibility into a filterable global for node rendering
				// We pass visibility through a filter-friendly mechanism
				add_filter( 'rcb_loop_visibility', function() use ( $visibility ) { return $visibility; } );

				$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s rcb-loop-item">', esc_attr( $unique_id ) );
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
		// Static rendering
		$final_output .= sprintf( '<div class="rcb-instance rcb-instance-%s">', esc_attr( $unique_id ) );
		$final_output .= rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, null, $visibility, $content );
		$final_output .= '</div>';
	}

	return $final_output;
}

/**
 * Render nodes with visibility toggles passed explicitly.
 */
function rcb_render_visual_nodes_with_visibility( $nodes, $content_data, $styles_data, $mode, $post = null, $visibility = array(), $inner_blocks_content = '' ) {
	$html = '';
	$assigned = array(
		'heading' => false,
		'text'    => false,
		'image'   => false,
		'button'  => false,
	);

	foreach ( $nodes as $node ) {
		$type  = isset( $node['type'] ) ? $node['type'] : '';
		$id    = isset( $node['id'] ) ? $node['id'] : '';
		$field = isset( $node['field'] ) ? $node['field'] : '';
		$node_columns = isset( $node['columns'] ) ? intval( $node['columns'] ) : 1;

		$node_styles = isset( $styles_data[ $field ] ) ? $styles_data[ $field ] : array();

		// Container background image
		if ( $type === 'container' ) {
			if ( isset( $content_data[ $field . '_bg_url' ] ) && ! empty( $content_data[ $field . '_bg_url' ] ) ) {
				$bg_url = esc_url( $content_data[ $field . '_bg_url' ] );
				$node_styles['background-image']    = "url('{$bg_url}')";
				$node_styles['background-size']     = 'cover';
				$node_styles['background-position'] = 'center';
			}

			if ( $node_columns > 1 ) {
				$node_styles['display'] = 'grid';
				$node_styles['grid-template-columns'] = "repeat({$node_columns}, 1fr)";
				$node_styles['gap'] = '20px';
			}
		}

		$style_attr = rcb_build_inline_style( $node_styles );

		switch ( $type ) {
			case 'container':
				$children_html = '';
				if ( ! empty( $node['children'] ) ) {
					$children_html = rcb_render_visual_nodes_with_visibility( $node['children'], $content_data, $styles_data, $mode, $post, $visibility, $inner_blocks_content );
				}
				$html .= sprintf( '<div class="rcb-container %s" %s>%s</div>', esc_attr( $id ), $style_attr, $children_html );
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
