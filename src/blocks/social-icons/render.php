<?php
/**
 * Social Icons Parent Renderer
 */

echo "<!-- SOCIAL ICONS BLOCK RENDERER LOADED -->\n";

$attributes = $attributes ?? [];
$unique_id = 'rcb-social-' . ( $attributes['uniqueId'] ?? 'default' );
$style = $attributes['style'] ?? 'icon';
$alignment = $attributes['alignment'] ?? ['desktop' => 'left'];
$gap = $attributes['gap'] ?? ['desktop' => '20px'];
$borderRadius = $attributes['borderRadius'] ?? '0px';

// Responsive Alignment Mapping
$align_map = [];
foreach ((array)$alignment as $device => $val) {
    if ($val === 'left') $align_map[$device] = 'flex-start';
    elseif ($val === 'center') $align_map[$device] = 'center';
    elseif ($val === 'right') $align_map[$device] = 'flex-end';
}

$styles = [
    // Wrapper Style
    '#' . $unique_id => [
        'display' => 'flex !important',
        'flex-direction' => 'row !important',
        'flex-wrap' => 'wrap !important',
        'justify-content' => $align_map,
        'gap' => $gap,
        'margin' => $attributes['margin'] ?? '',
        'padding' => $attributes['padding'] ?? '',
    ],
    '#' . $unique_id . ' > .block-editor-inner-blocks' => [
        'display' => 'contents !important',
    ],
    '#' . $unique_id . ' .rcb-social-item' => [
        'display' => 'flex !important',
        'align-items' => 'center !important',
        'text-decoration' => 'none !important',
        'width' => 'auto !important',
    ],
    // Item Icon Style
    '#' . $unique_id . ' .rcb-social-item-icon' => [
        'font-size' => $attributes['iconSize'] ?? ['desktop' => '24px'],
        'color' => ($attributes['iconColor'] ?? '#334155') . ' !important',
        'background-color' => ($attributes['iconBgColor'] ?? 'transparent') . ' !important',
        'border-radius' => $borderRadius . ' !important',
        'padding' => '0 !important',
        'display' => ($style === 'text' ? 'none' : 'flex') . ' !important',
        'align-items' => 'center !important',
        'justify-content' => 'center !important',
        'width' => '44px !important',
        'height' => '44px !important',
        'line-height' => '1 !important',
    ],
    '#' . $unique_id . ' .rcb-social-item-icon svg' => [
        'width' => ($attributes['iconSize']['desktop'] ?? '24px') . ' !important',
        'height' => ($attributes['iconSize']['desktop'] ?? '24px') . ' !important',
        'display' => 'block !important',
    ],
    // Item Hover
    '#' . $unique_id . ' .rcb-social-item:hover .rcb-social-item-icon' => [
        'color' => ($attributes['iconHoverColor'] ?? '#1e293b') . ' !important',
        'background-color' => ($attributes['iconHoverBgColor'] ?? 'transparent') . ' !important',
    ],
    // Label Typography
    '#' . $unique_id . ' .rcb-social-item-label' => [
        'font-family' => ($attributes['labelFontFamily'] ?? 'inherit') . ' !important',
        'font-size' => $attributes['labelFontSize'] ?? ['desktop' => '14px'],
        'font-weight' => ($attributes['labelFontWeight'] ?? '400') . ' !important',
        'color' => ($attributes['labelColor'] ?? '#334155') . ' !important',
        'display' => ($style === 'icon' ? 'none' : 'inline-block') . ' !important',
    ]
];

$style_registry = "";
if ( function_exists('rcb_generate_responsive_css') ) {
    foreach ($styles as $selector => $stls) {
        $style_registry .= rcb_generate_responsive_css($selector, $stls);
    }
}

$classes = ['rcb-social-icons-wrapper', 'rcb-style-' . $style];

echo "<!-- RCB Social Icons Render Start: " . esc_attr($unique_id) . " -->\n";
if (!empty($style_registry)) {
    echo '<style>' . $style_registry . '</style>';
}

$content = trim($content);

echo '<div id="' . esc_attr($unique_id) . '" class="' . esc_attr(implode(' ', $classes)) . '">';
if (empty($content)) {
    global $post;
    if ($post) {
        $blocks = parse_blocks($post->post_content);
        foreach ($blocks as $block) {
            if ($block['blockName'] === 'rcb/social-icons' && ($block['attrs']['uniqueId'] ?? '') === ($attributes['uniqueId'] ?? '')) {
                foreach ($block['innerBlocks'] as $inner) {
                    echo render_block($inner);
                }
                break;
            }
        }
    }
} else {
    echo $content;
}
echo '</div>';
echo "<!-- RCB Social Icons Render End -->\n";
