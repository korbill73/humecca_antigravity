
/* --- Tab Filtering Logic (Appended v2.0) --- */

// Helper to update active tab UI
function updateTabs(btn) {
    if (!btn) return;
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
}

window.filterSecurity = function (type) {
    updateTabs(event.target);

    let filtered = [];
    if (type === 'all') {
        filtered = SECURITY_PRODUCTS;
    } else if (type === 'network') {
        filtered = SECURITY_PRODUCTS.filter(p =>
            p.subcategory === 'ddos' || p.subcategory === 'sec-cleanzone'
        );
    } else if (type === 'system') {
        filtered = SECURITY_PRODUCTS.filter(p =>
            p.subcategory !== 'ddos' && p.subcategory !== 'sec-cleanzone'
        );
    }

    renderList(filtered, 'product-list-security', selectedSecurity, 'security');
};

window.filterAddon = function (type) {
    updateTabs(event.target);

    let filtered = [];
    if (type === 'all') {
        filtered = ADDON_PRODUCTS;
    } else if (type === 'data') {
        filtered = ADDON_PRODUCTS.filter(p =>
            p.subcategory.includes('backup') ||
            p.subcategory.includes('recovery') ||
            p.subcategory.includes('ha')
        );
    } else if (type === 'traffic') {
        filtered = ADDON_PRODUCTS.filter(p =>
            p.subcategory.includes('cdn') ||
            p.subcategory.includes('lb')
        );
    } else if (type === 'management') {
        filtered = ADDON_PRODUCTS.filter(p =>
            p.subcategory.includes('license') ||
            p.subcategory.includes('monitoring') ||
            p.subcategory === 'management'
        );
    }

    renderList(filtered, 'product-list-addon', selectedAddons, 'addon');
};

window.filterSolution = function (type) {
    updateTabs(event.target);

    let filtered = [];
    if (type === 'all') {
        filtered = SOLUTION_PRODUCTS;
    } else if (type === 'collab') {
        filtered = SOLUTION_PRODUCTS.filter(p =>
            p.subcategory === 'naverworks' || p.subcategory === 'solution'
        );
    } else if (type === 'web') {
        filtered = SOLUTION_PRODUCTS.filter(p => p.subcategory === 'website');
    }

    renderList(filtered, 'product-list-solution', selectedSolutions, 'solution');
};
