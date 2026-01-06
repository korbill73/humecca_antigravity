// Calculator Data - Pricing & Products

// Global lists for calculator steps
let MAIN_PRODUCTS = [];      // Step 1: Server, Colocation, VPN
let NETWORK_PRODUCTS = [];   // Step 2: Network (Bandwidth)
let SECURITY_PRODUCTS = [];  // Step 3: Security (DDoS, Firewall)
let ADDON_PRODUCTS = [];     // Step 4: Addons (Backup, Monitor, Software)
let SOLUTION_PRODUCTS = [];  // Step 5: Solutions (Groupware, MS365)

// Hardcoded Discounts (Standard Policy) - Step 6
const DISCOUNTS = [
    { id: 'term_1', name: '1년 약정 (-5%)', rate: 0.05, months: 12 },
    { id: 'term_2', name: '2년 약정 (-10%)', rate: 0.10, months: 24 },
    { id: 'term_3', name: '3년 약정 (-15%)', rate: 0.15, months: 36 },
    { id: 'term_0', name: '무약정', rate: 0, months: 1 }
];

// [User Config] Excluded Items from Calculator
// Add subcategories or keywords here to hide them from the calculator steps
// This allows hiding items that are active in DB but hidden in website menus
const EXCLUDED_KEYWORDS = [
    // Example: 'v3_net_server', 'dbsafer'
    // 'some_subcategory_code'
];

/**
 * Fetch Data from Supabase
 * Merges 'products' and 'product_plans' tables
 * populates the global lists above
 */
async function fetchCalculatorData() {
    // FIX: Prioritize 'window.sb' which is the initialized client from supabase_config.js
    let db = window.sb;

    if (!db) {
        console.error('Supabase Client (window.sb) not found. Check supabase_config.js');
        // Fallback or Alert
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            // Worst case attempt: try to use global if it looks like a client (unlikely if name collision)
        }
        alert('데이터베이스 연결 실패. 페이지를 새로고침 해주세요.');
        return;
    }

    try {
        console.log('[Calculator] Fetching all products from DB...');

        // 1. Fetch ALL Active Products
        // We need 'category' and 'subcategory' to sort them into steps
        const { data: products, error: pError } = await db
            .from('products')
            .select('id, name, category, subcategory')
            .eq('active', true);

        if (pError) throw pError;
        if (!products || products.length === 0) {
            console.warn('[Calculator] No products found in DB.');
            return;
        }

        const productIds = products.map(p => p.id);

        // 2. Fetch Active Plans for these products
        const { data: plans, error: plError } = await db
            .from('product_plans')
            .select('*')
            .in('product_id', productIds)
            .eq('active', true)
            .order('sort_order', { ascending: true });

        if (plError) throw plError;

        // 3. Clear Lists
        MAIN_PRODUCTS = [];
        SECURITY_PRODUCTS = [];
        ADDON_PRODUCTS = [];
        SOLUTION_PRODUCTS = [];

        // 4. Categorize Plans
        plans.forEach(plan => {
            const product = products.find(p => p.id === plan.product_id);
            if (!product) return;

            // Normalize Price
            const priceStr = String(plan.price || '0').replace(/[^0-9]/g, '');
            const priceVal = parseInt(priceStr, 10) || 0;

            const item = {
                id: `db_${plan.id}`,
                name: plan.plan_name,
                product_name: product.name,
                price: priceVal,
                cpu: plan.cpu,
                ram: plan.ram,
                storage: plan.storage, // or hdd
                desc: plan.summary || '',
                // Keep raw cat/subcat for filtering logic
                category: product.category,
                subcategory: product.subcategory
            };

            const cat = item.category;
            const sub = item.subcategory;

            // [Filter] Check Excluded Keywords OR Tag [HIDE] / [숨김]
            const shouldExclude = EXCLUDED_KEYWORDS.some(k =>
                (sub && sub.includes(k)) ||
                (item.name && item.name.includes(k)) ||
                (item.product_name && item.product_name.includes(k))
            );

            if (shouldExclude) return;

            // [New] Check for Hidden Tag in Summary or Name
            if ((item.desc && (item.desc.includes('[숨김]') || item.desc.includes('[HIDE]'))) ||
                (item.name && (item.name.includes('[숨김]') || item.name.includes('[HIDE]')))) {
                console.log(`[Calculator] Hidden Item Skipped: ${item.name} (${item.id})`);
                return; // Skip hidden items
            }

            // Logic to Sort into Steps
            // The original `cat` and `sub` variables were based on `product.category` and `product.subcategory`.
            // Now they are based on `item.category` and `item.subcategory` which are derived from `product`.
            // This ensures consistency with the exclusion check.
            // const cat = product.category; // This line is now redundant as `cat` is defined above
            // const sub = product.subcategory; // This line is now redundant as `sub` is defined above

            // Step 1: Main (IDC: hosting/colocation, VPN: vpn-service)
            if ((cat === 'idc' && (sub === 'hosting' || sub === 'colocation')) || cat === 'vpn') {
                MAIN_PRODUCTS.push(item);
            }
            // Step 2: Network Options (New Step)
            else if (sub === 'network' || product.name.includes('Network')) {
                NETWORK_PRODUCTS.push(item);
            }
            // Step 3: Security
            else if (cat === 'security') {
                SECURITY_PRODUCTS.push(item);
            }
            // Step 5: Solution (Step 4 is Solution in code, but UI says 4)
            else if (cat === 'solution') {
                SOLUTION_PRODUCTS.push(item);
            }
            // Step 4: Addons (Catch-all)
            else {
                ADDON_PRODUCTS.push(item);
            }
        });

        console.log(`[Calculator] Data Loaded: Main(${MAIN_PRODUCTS.length}), Sec(${SECURITY_PRODUCTS.length}), Sol(${SOLUTION_PRODUCTS.length}), Addon(${ADDON_PRODUCTS.length})`);

    } catch (err) {
        console.error('[Calculator] DB Fetch Error:', err);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}
