// Calculator Data - Pricing & Products

// Global lists for calculator steps
let MAIN_PRODUCTS = [];      // Step 1: Server, Colocation, VPN
let SECURITY_PRODUCTS = [];  // Step 2: Security (DDoS, Firewall)
let ADDON_PRODUCTS = [];     // Step 3: Addons (Backup, Monitor, Software)
let SOLUTION_PRODUCTS = [];  // Step 4: Solutions (Groupware, MS365)

// Hardcoded Discounts (Standard Policy) - Step 5
const DISCOUNTS = [
    { id: 'term_1', name: '1년 약정 (-5%)', rate: 0.05, months: 12 },
    { id: 'term_2', name: '2년 약정 (-10%)', rate: 0.10, months: 24 },
    { id: 'term_3', name: '3년 약정 (-15%)', rate: 0.15, months: 36 },
    { id: 'term_0', name: '무약정', rate: 0, months: 1 }
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

            // Logic to Sort into Steps
            const cat = product.category;
            const sub = product.subcategory;

            // Step 1: Main (IDC: hosting/colocation, VPN: vpn-service)
            if ((cat === 'idc' && (sub === 'hosting' || sub === 'colocation')) || cat === 'vpn') {
                MAIN_PRODUCTS.push(item);
            }
            // Step 2: Security
            else if (cat === 'security') {
                SECURITY_PRODUCTS.push(item);
            }
            // Step 4: Solution
            else if (cat === 'solution') {
                SOLUTION_PRODUCTS.push(item);
            }
            // Step 3: Addons (Catch-all for 'addon' subcategory or Management)
            else {
                // e.g. cat='idc', sub='management' -> Addon
                // e.g. cat='security', sub='addon' -> Security?? explicit check above handles 'security' cat
                // Let's put everything else in Addons
                ADDON_PRODUCTS.push(item);
            }
        });

        console.log(`[Calculator] Data Loaded: Main(${MAIN_PRODUCTS.length}), Sec(${SECURITY_PRODUCTS.length}), Sol(${SOLUTION_PRODUCTS.length}), Addon(${ADDON_PRODUCTS.length})`);

    } catch (err) {
        console.error('[Calculator] DB Fetch Error:', err);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}
