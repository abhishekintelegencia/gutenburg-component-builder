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

    // RCB Tabs Initialization and Logic
    function initTabs() {
        const tabWrappers = document.querySelectorAll('.rcb-tabs-wrapper');
        
        tabWrappers.forEach(wrapper => {
            const nav = wrapper.querySelector('.rcb-tabs-nav');
            // Select all possible tab items and filter for those with a valid data-label
            // This is safer than restrictive CSS selectors that might fail due to nesting
            const allItems = wrapper.querySelectorAll('.rcb-tab-item');
            const tabItems = Array.from(allItems).filter(item => item.hasAttribute('data-label'));
            
            if (!nav || tabItems.length === 0) return;
            if (nav.children.length > 0) return; // Already initialized

            tabItems.forEach((item, index) => {
                const label = item.getAttribute('data-label') || 'Tab ' + (index + 1);
                const iconClass = item.getAttribute('data-icon');
                const navItem = document.createElement('div');
                navItem.className = 'rcb-tabs-nav-item' + (index === 0 ? ' is-active' : '');
                
                let iconHtml = '';
                if (iconClass) {
                    iconHtml = `<span class="rcb-tabs-nav-icon dashicons ${iconClass}"></span> `;
                }
                
                navItem.innerHTML = `${iconHtml}<span class="rcb-tabs-nav-label">${label}</span>`;
                
                navItem.addEventListener('click', () => {
                    // Update Nav
                    wrapper.querySelectorAll('.rcb-tabs-nav-item').forEach(i => i.classList.remove('is-active'));
                    navItem.classList.add('is-active');
                    
                    // Update Content
                    tabItems.forEach(child => child.classList.add('is-hidden'));
                    item.classList.remove('is-hidden');
                });

                nav.appendChild(navItem);

                // Initial state
                if (index !== 0) {
                    item.classList.add('is-hidden');
                }
            });
        });
    }

    initTabs();

    // --- RCB Header Logic ---
    
    // Sticky Header
    const header = document.querySelector('.rcb-header-wrapper.rcb-header-sticky');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('is-sticky');
            } else {
                header.classList.remove('is-sticky');
            }
        });
    }

    // Search Overlay
    const searchToggle = document.querySelector('.rcb-search-toggle');
    const searchOverlay = document.querySelector('.rcb-search-overlay');
    const searchClose = document.querySelector('.rcb-search-close');

    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            const input = searchOverlay.querySelector('input');
            if (input) setTimeout(() => input.focus(), 300);
        });
    }

    if (searchClose && searchOverlay) {
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    // Mobile Toggle
    const mobileToggle = document.querySelector('.rcb-mobile-toggle');
    const mobileDrawer = document.querySelector('.rcb-mobile-drawer');
    const mobileClose = document.querySelector('.rcb-mobile-close');
    const mobileNavContainer = document.querySelector('.rcb-mobile-nav-container');
    const desktopNav = document.querySelector('.rcb-header-nav .rcb-nav-list');

    if (mobileToggle && mobileDrawer && desktopNav && mobileNavContainer) {
        // Clone nav for mobile
        if (!mobileNavContainer.children.length) {
            const mobileMenu = desktopNav.cloneNode(true);
            mobileMenu.className = 'rcb-mobile-nav-list';
            mobileNavContainer.appendChild(mobileMenu);

            // Handle mobile accordions for submenus
            mobileMenu.querySelectorAll('.has-dropdown > a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const parent = link.parentElement;
                    const dropdown = parent.querySelector('.rcb-dropdown-container');
                    
                    if (dropdown) {
                        const isOpen = parent.classList.contains('mobile-open');
                        
                        // Close others
                        mobileMenu.querySelectorAll('.mobile-open').forEach(openItem => {
                            if (openItem !== parent) openItem.classList.remove('mobile-open');
                        });

                        parent.classList.toggle('mobile-open');
                    }
                });
            });
        }

        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });
    }

    if (mobileClose && mobileDrawer) {
        mobileClose.addEventListener('click', () => {
            mobileDrawer.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // --- Desktop Click-to-Open (Arrow) ---
    document.querySelectorAll('.rcb-header-nav .rcb-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const parentLi = this.closest('.rcb-nav-item');
            if (!parentLi) return;

            const isActive = parentLi.classList.contains('is-active');

            // Close other open menus
            document.querySelectorAll('.rcb-nav-item.is-active').forEach(item => {
                if (item !== parentLi) item.classList.remove('is-active');
            });

            parentLi.classList.toggle('is-active');
        });
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.rcb-nav-item.has-dropdown')) {
            document.querySelectorAll('.rcb-nav-item.is-active').forEach(item => {
                item.classList.remove('is-active');
            });
        }
    });
});
