document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        const pageLink = e.target.closest('.rcb-pagination a.page-numbers');
        if (!pageLink) return;
        
        e.preventDefault();
        console.log('RCB Pagination clicked', pageLink.getAttribute('href'));

        const wrapper = pageLink.closest('.rcb-loop-wrapper');
        if (!wrapper) {
            console.error('RCB Pagination: Loop wrapper not found.');
            return;
        }

        // Extract page number from URL
        const href = pageLink.getAttribute('href');
        let pageNum = 1;
        
        // Try to get page from format /page/2/ or ?paged=2
        const pageMatch = href.match(/\/page\/(\d+)/);
        if (pageMatch) {
            pageNum = parseInt(pageMatch[1], 10);
        } else {
            const urlParts = href.split('?');
            if (urlParts.length > 1) {
                const urlParams = new URLSearchParams(urlParts[1]);
                if (urlParams.has('paged')) {
                    pageNum = parseInt(urlParams.get('paged'), 10);
                } else if (urlParams.has('page')) {
                    pageNum = parseInt(urlParams.get('page'), 10);
                }
            }
        }

        if (!pageNum) return;

        const attributesData = wrapper.getAttribute('data-rcb-attributes');
        if (!attributesData) return;

        wrapper.style.opacity = '0.5';
        wrapper.style.pointerEvents = 'none';

        const formData = new FormData();
        formData.append('action', 'rcb_load_loop_page');
        formData.append('nonce', rcbAjax.nonce); // Provided by wp_localize_script
        formData.append('paged', pageNum);
        formData.append('attributes', attributesData);

        fetch(rcbAjax.ajaxurl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data && data.data.html) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.data.html;

                // Remove the previous style tag if it exists (the PHP renderer prepends <style> before the wrapper)
                const prev = wrapper.previousElementSibling;
                if (prev && prev.tagName.toLowerCase() === 'style') {
                    prev.remove();
                }

                // Replace the wrapper with the new HTML elements (which includes both <style> and <div class="rcb-loop-wrapper">)
                wrapper.replaceWith(...tempDiv.childNodes);
                
                // Scroll up slightly so the user sees the top of the new items
                // Only if the top of the wrapper is above the viewport
                // We use the new wrapper that got inserted
                setTimeout(() => {
                    const newWrapper = document.querySelector(`[data-rcb-attributes='${attributesData}']`);
                    if (newWrapper) {
                        const rect = newWrapper.getBoundingClientRect();
                        if (rect.top < 0) {
                            newWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                }, 50);

            }
        })
        .catch(err => {
            console.error('RCB Pagination error:', err);
        })
        .finally(() => {
            wrapper.style.opacity = '1';
            wrapper.style.pointerEvents = 'all';
        });
    });

    // RCB Accordion Toggle Logic
    document.body.addEventListener('click', function(e) {
        const header = e.target.closest('.rcb-accordion-header');
        if (!header) return;

        const item = header.closest('.rcb-accordion-item');
        if (!item) return;

        const wrapper = item.closest('.rcb-accordion-wrapper');
        const isHorizontal = wrapper && wrapper.classList.contains('rcb-acc-horizontal');
        const isOpen = item.classList.contains('is-open');
        
        // If not horizontal, close other items (standard accordion behavior)
        if (!isHorizontal && wrapper) {
            const items = wrapper.querySelectorAll('.rcb-accordion-item');
            items.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('is-open');
                    const content = otherItem.querySelector('.rcb-accordion-content');
                    if (content) content.style.display = 'none';
                }
            });
        }

        // Toggle current item
        if (isOpen) {
            item.classList.remove('is-open');
            const content = item.querySelector('.rcb-accordion-content');
            if (content) content.style.display = 'none';
        } else {
            item.classList.add('is-open');
            const content = item.querySelector('.rcb-accordion-content');
            if (content) content.style.display = 'block';
        }
    });
});
