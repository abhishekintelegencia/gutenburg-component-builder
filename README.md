# Reusable Component Builder System

**Version:** 0.01  
**Author:** Intelegencia  
**Text Domain:** `reusable-component-builder`  
**Requires:** WordPress 6.0+, PHP 7.4+

---

## Overview

The Reusable Component Builder is a WordPress plugin that allows you to create reusable visual component templates via a Custom Post Type (CPT) and embed them as Gutenberg blocks with independent content and styling per page.

---

## Features

- **Visual Template Builder** – Build component layouts using a React-based node editor (Containers, Columns, Headings, Text, Images, Buttons, InnerBlocks).
- **Block Variations** – Each saved template automatically appears as its own named variation in the Gutenberg block inserter under the "RCB COMPONENTS" category.
- **Dynamic Rendering** – Supports Static Visual Layout, Dynamic Post Loop (Query), and Meta Field display modes.
- **Responsive Styles** – Node-level responsive controls for Desktop, Tablet, and Mobile.
- **Advanced Dynamic Slider** – A dedicated Swiper.js-powered block for rendering post/event sliders with full configuration (arrows, dots, autoplay, spaceBetween, slidesPerView, transitions).
- **Social Icons Block** – Configurable icon links with brand colors and hover states.
- **Accordion Block** – Animated expand/collapse with customizable icon types.
- **Tabs Block** – Multiple tab items with active state management.

---

## Installation

1. Upload the `reusable-component-builder` folder to `/wp-content/plugins/`.
2. Activate the plugin from the **Plugins** menu in WordPress.
3. Navigate to **Component Templates → Add New** to create your first template.
4. Insert templates into pages via the Gutenberg block inserter under the **RCB COMPONENTS** category.

---

## Directory Structure

```
reusable-component-builder/
├── assets/             # Frontend JS and CSS assets
├── build/              # Compiled Gutenberg block assets (auto-generated)
├── core/               # PHP renderers (renderer.php, ajax-handler.php)
├── cpt/                # Custom Post Type registration (component-template.php)
├── src/
│   ├── blocks/         # Individual Gutenberg block source files
│   │   ├── advance-dynamic-slider/
│   │   ├── component-builder/
│   │   ├── accordion/
│   │   ├── social-icons/
│   │   ├── slider/
│   │   └── tabs/
│   └── builder/        # React Template Builder UI (index.js, style.scss)
├── CHANGELOG.md
├── README.md
└── reusable-component-builder.php
```

---

## Development

**Install dependencies:**
```bash
npm install
```

**Build for production:**
```bash
npm run build
```

**Development watch mode:**
```bash
npm run start
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## License

This plugin is proprietary software. All rights reserved.
