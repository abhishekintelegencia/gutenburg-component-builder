<?php
/**
 * Header & Mega Menu Renderer
 */

$attributes = $attributes ?? [];
$menu_id = $attributes['menuId'] ?? 0;
$show_logo = $attributes['showLogo'] ?? true;
$logo_size = $attributes['logoSize'] ?? 150;
$sticky = $attributes['sticky'] ?? false;
$show_cta = $attributes['showCTA'] ?? true;
$cta_text = $attributes['ctaText'] ?? 'Enquire Now';
$cta_link = $attributes['ctaLink'] ?? '#';
$show_search = $attributes['showSearch'] ?? true;

// Site Logo
$logo_html = '';
if ($show_logo) {
    if (has_custom_logo()) {
        $logo_html = get_custom_logo();
    } else {
        $logo_html = '<a href="' . esc_url(home_url('/')) . '" class="rcb-header-logo-text">' . get_bloginfo('name') . '</a>';
    }
}

// Menu Items Logic
$menu_items = $menu_id ? wp_get_nav_menu_items($menu_id) : [];
$menu_tree = [];

if (!empty($menu_items)) {
    // Build 3-level tree
    $items_by_id = [];
    foreach ($menu_items as $item) {
        $item->children = [];
        $items_by_id[$item->ID] = $item;
    }

    foreach ($items_by_id as $id => $item) {
        if ($item->menu_item_parent == 0) {
            $menu_tree[$id] = $item;
        } else {
            if (isset($items_by_id[$item->menu_item_parent])) {
                $items_by_id[$item->menu_item_parent]->children[] = $item;
            }
        }
    }
}

$classes = ['rcb-header-wrapper'];
if ($sticky) $classes[] = 'rcb-header-sticky';

// Inline Styles
$styles = [
    'background-color: ' . ($attributes['headerBgColor'] ?? '#ffffff'),
    'padding-top: ' . ($attributes['paddingTop'] ?? 15) . 'px',
    'padding-bottom: ' . ($attributes['paddingBottom'] ?? 15) . 'px',
    '--rcb-nav-color: ' . ($attributes['navColor'] ?? '#334155'),
    '--rcb-nav-hover: ' . ($attributes['navHoverColor'] ?? '#b91c1c'),
    '--rcb-cta-bg: ' . ($attributes['ctaBgColor'] ?? '#b91c1c'),
    '--rcb-cta-text: ' . ($attributes['ctaTextColor'] ?? '#ffffff'),
    '--rcb-logo-max-width: ' . $logo_size . 'px',
    '--rcb-search-color: ' . ($attributes['searchIconColor'] ?? $attributes['navColor'] ?? '#1e293b')
];

?>

<header class="<?php echo esc_attr(implode(' ', $classes)); ?>" style="<?php echo esc_attr(implode('; ', $styles)); ?>">
    <div class="rcb-container">
        <div class="rcb-header-inner">
            <!-- Logo Area -->
            <div class="rcb-header-logo">
                <?php echo $logo_html; ?>
            </div>

            <!-- Navigation Area -->
            <nav class="rcb-header-nav">
                <ul class="rcb-nav-list">
                    <?php foreach ($menu_tree as $item): ?>
                        <?php 
                            $has_children = !empty($item->children);
                            // Only trigger mega menu if the item has a specific CSS class "mega-menu"
                            $is_mega = $has_children && in_array('mega-menu', (array) $item->classes);
                            
                            $li_classes = ['rcb-nav-item'];
                            if ($has_children) $li_classes[] = 'has-dropdown';
                            if ($is_mega) $li_classes[] = 'is-mega';
                            foreach ((array)$item->classes as $cls) if($cls) $li_classes[] = $cls;
                        ?>
                        <li class="<?php echo esc_attr(implode(' ', $li_classes)); ?>">
                            <div class="rcb-nav-item-inner">
                                <a href="<?php echo esc_url($item->url); ?>">
                                    <?php echo esc_html($item->title); ?>
                                </a>
                                <?php if ($has_children): ?>
                                    <span class="rcb-dropdown-toggle dashicons dashicons-arrow-down-alt2"></span>
                                <?php endif; ?>
                            </div>

                            <?php if ($has_children): ?>
                                <?php 
                                    $dropdown_styles = [
                                        'background-color: ' . ($attributes['megaDropdownBg'] ?? '#ffffff'),
                                        'color: ' . ($attributes['megaDropdownTextColor'] ?? '#1e293b')
                                    ];
                                ?>
                                <div class="rcb-dropdown-container <?php echo $is_mega ? 'rcb-mega-menu' : 'rcb-standard-menu'; ?>" style="<?php echo esc_attr(implode('; ', $dropdown_styles)); ?>">
                                    <div class="rcb-dropdown-inner">
                                        <?php if ($is_mega): ?>
                                            <div class="rcb-mega-grid">
                                                <?php foreach ($item->children as $col): ?>
                                                    <div class="rcb-mega-col">
                                                        <h4 class="rcb-mega-title">
                                                            <?php if ($col->url && $col->url !== '#'): ?>
                                                                <a href="<?php echo esc_url($col->url); ?>"><?php echo esc_html($col->title); ?></a>
                                                            <?php else: ?>
                                                                <?php echo esc_html($col->title); ?>
                                                            <?php endif; ?>
                                                        </h4>
                                                        <?php if (!empty($col->children)): ?>
                                                            <ul class="rcb-mega-links">
                                                                <?php foreach ($col->children as $sub): ?>
                                                                    <li><a href="<?php echo esc_url($sub->url); ?>"><?php echo esc_html($sub->title); ?></a></li>
                                                                <?php endforeach; ?>
                                                            </ul>
                                                        <?php endif; ?>
                                                    </div>
                                                <?php endforeach; ?>
                                            </div>
                                        <?php else: ?>
                                            <ul class="rcb-standard-list">
                                                <?php foreach ($item->children as $child): ?>
                                                    <li><a href="<?php echo esc_url($child->url); ?>"><?php echo esc_html($child->title); ?></a></li>
                                                <?php endforeach; ?>
                                            </ul>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </nav>

            <!-- Actions Area -->
            <div class="rcb-header-actions">
                <?php if ($show_search): ?>
                    <button class="rcb-search-toggle" aria-label="Search" style="color: var(--rcb-search-color);">
                        <span class="dashicons dashicons-search"></span>
                    </button>
                    <!-- Search Overlay (Hidden by default) -->
                    <div class="rcb-search-overlay">
                        <div class="rcb-search-inner">
                            <form role="search" method="get" class="rc_search_form" action="<?php echo esc_url(home_url('/')); ?>">
                                <input type="search" class="search-field" placeholder="Search..." value="" name="s" />
                                <button type="submit" class="search-submit"><span class="dashicons dashicons-search"></span></button>
                            </form>
                            <button class="rcb-search-close"><span class="dashicons dashicons-no-alt"></span></button>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ($show_cta): ?>
                    <a href="<?php echo esc_url($cta_link); ?>" class="rcb-header-cta">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                <?php endif; ?>

                <!-- Mobile Toggle -->
                <button class="rcb-mobile-toggle" aria-label="Toggle Menu">
                    <span class="rcb-burger"></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div class="rcb-mobile-drawer">
        <div class="rcb-mobile-inner">
             <div class="rcb-mobile-header">
                <div class="rcb-mobile-logo"><?php echo $logo_html; ?></div>
                <button class="rcb-mobile-close"><span class="dashicons dashicons-no-alt"></span></button>
             </div>
             <div class="rcb-mobile-nav-container">
                 <!-- Mobile Nav logic will be handled via JS/CSS -->
             </div>
             <?php if ($show_cta): ?>
                <div class="rcb-mobile-footer">
                    <a href="<?php echo esc_url($cta_link); ?>" class="rcb-header-cta" style="display: block; text-align: center;">
                        <?php echo esc_html($cta_text); ?>
                    </a>
                </div>
             <?php endif; ?>
        </div>
    </div>
</header>
