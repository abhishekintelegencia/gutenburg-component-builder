# Changelog

All notable changes to the **Reusable Component Builder** plugin will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.01] – 2026-05-20

### Added
- Initial plugin release.
- **Custom Post Type (CPT):** `component_template` for creating reusable component layouts.
- **Visual Template Builder:** React-based node editor supporting Container, Column, Heading, Text, Image, Button, and InnerBlocks node types.
- **Block Variations:** Each published template auto-registers as a named Gutenberg block variation under the "RCB COMPONENTS" category.
- **Base Block Hidden:** The generic "Component Builder" base block is hidden from the block inserter (Phase 1); only specific template variations are accessible.
- **Rendering Engine:** PHP server-side renderer with support for Static Visual, Dynamic Query Loop, and Meta Field display modes.
- **Responsive CSS:** Per-node responsive style generation scoped per block instance using `!important` guards.
- **Advance Dynamic Slider Block:** Swiper.js-powered slider with configurable slides-per-view, space-between, arrows, dots, autoplay, loop, and transition effects.
  - Fixed: Arrow navigation broken when `slidesPerView` > 1 due to insufficient slides for Swiper's loop mode — now auto-duplicates slides as needed.
  - Fixed: Fresh block insertion defaulting to 0px space-between causing a broken layout; default is now **5px**.
- **Social Icons Block:** Configurable icon links with brand colors and hover states.
- **Accordion Block:** Animated expand/collapse with customizable icon types.
- **Tabs Block:** Multiple tab items with active state management.
- **REST API Endpoint:** `/wp-json/rcb/v1/templates/` returns all published templates with structure data.
- **AJAX Pagination:** Query Loop blocks support paginated post loading without full page reload.

### Changed
- **Block Inserter Registration Priority:** Moved `init` hook to priority `20` to ensure templates are available at registration time.
- **Editor Template Pre-loading:** Templates are now injected into `window.rcbTemplates` via `admin_head` for instant inserter availability without API call delay.

### Fixed
- PHPCS security review pass: all user inputs sanitized, nonces validated, output escaped throughout.

### Notes
- **Global Component Settings (Root Block)** button is hidden in this release (Phase 1). The feature is preserved in source and will be activated in Phase 2.

---
