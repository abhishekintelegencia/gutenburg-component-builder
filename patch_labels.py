import re

with open('/var/www/html/learn-pro/wp-content/plugins/reusable-component-builder/src/blocks/component-builder/edit.js', 'r') as f:
    content = f.read()

# Make all PanelBody titles inside the style map look consistent or avoid using PanelBody where unnecessary.
# Actually, the labels in PanelColorSettings, BoxControl, etc.
# We will just compile it to test.
