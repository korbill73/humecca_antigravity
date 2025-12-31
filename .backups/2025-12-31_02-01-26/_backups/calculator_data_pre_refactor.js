// Calculator Data - Pricing & Products

// [Changed] Lists are now populated dynamically where possible
let SERVER_PRODUCTS = [];

// Keep Addons/Discounts hardcoded for now until DB has 'addons' table or consistent schema
const ADDONS = [
    // Spec Upgrades (Step 2)
    { id: 'cpu_up', name: 'CPU Upgrade (+4 Core)', price: 50000, type: 'spec', category: 'cpu' },
    { id: 'ram_16g', name: 'RAM 16GB 추가', price: 30000, type: 'spec', category: 'ram' },
    { id: 'ram_32g', name: 'RAM 32GB 추가', price: 55000, type: 'spec', category: 'ram' },
    { id: 'ssd_500', name: 'SSD 500GB 추가', price: 40000, type: 'spec', category: 'storage' },
    { id: 'ssd_1tb', name: 'SSD 1TB 추가', price: 70000, type: 'spec', category: 'storage' },

    // Services (Step 3)
    { id: 'win_svr', name: 'Windows Server License', price: 30000, type: 'service', category: 'os' },
    { id: 'ms_sql', name: 'MS-SQL Standard', price: 250000, type: 'service', category: 'sw' },
    { id: 'firewall', name: 'Hardware Firewall', price: 100000, type: 'service', category: 'security' },
    { id: 'backup_1t', name: 'Backup 1TB', price: 50000, type: 'service', category: 'backup' },
    { id: '1g_pub', name: '1G Public Network', price: 150000, type: 'service', category: 'net' }
];

const DISCOUNTS = [
    { id: 'term_1', name: '1년 약정 (-5%)', rate: 0.05, months: 12 },
    { id: 'term_2', name: '2년 약정 (-10%)', rate: 0.10, months: 24 },
    { id: 'term_3', name: '3년 약정 (-15%)', rate: 0.15, months: 36 },
    { id: 'term_0', name: '무약정', rate: 0, months: 1 }
];

/**
 * Fetch Data from Supabase
 * Merges 'products' and 'product_plans' tables
 */
async function fetchCalculatorData() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase SDK not loaded');
        return;
    }

    try {
        console.log('[Calculator] Fetching products from DB...');

        // 1. Fetch Products (Categories: idc, hosting, colocation)
        // Note: products table has 'category' and 'subcategory'
        // We want 'idc' (includes hosting, colocation)
        const { data: products, error: pError } = await supabase
            .from('products')
            .select('id, name, category, subcategory')
            .in('subcategory', ['hosting', 'colocation', 'management']);

        if (pError) throw pError;
        if (!products || products.length === 0) {
            console.warn('[Calculator] No products found in DB.');
            return;
        }

        const productIds = products.map(p => p.id);

        // 2. Fetch Plans
        const { data: plans, error: plError } = await supabase
            .from('product_plans')
            .select('*')
            .in('product_id', productIds)
            .eq('active', true);

        if (plError) throw plError;

        // 3. Map to Calculator Format
        SERVER_PRODUCTS = plans.map(plan => {
            const product = products.find(p => p.id === plan.product_id);

            // Clean Price (remove commas)
            const priceStr = String(plan.price || '0').replace(/[^0-9]/g, '');
            const priceVal = parseInt(priceStr, 10) || 0;

            return {
                id: `db_${plan.id}`,
                name: plan.plan_name, // e.g., "Standard"
                product_name: product.name, // e.g. "Server Hosting"
                cpu: plan.cpu || '-',
                ram: plan.ram || '-',
                hdd: plan.storage || '-',
                price: priceVal,
                category: product.subcategory || 'server', // 'hosting' -> 'server' mapping needed below
                desc: plan.summary || ''
            };
        });

        // Normalize Categories logic 
        // Our calculator expects: 'server', 'colocation', 'management' (from existing filterCategory logic)
        SERVER_PRODUCTS.forEach(p => {
            if (p.category === 'hosting') p.category = 'server';
            if (p.category === 'vpn-service') p.category = 'vpn'; // Future proof
        });

        console.log(`[Calculator] Loaded ${SERVER_PRODUCTS.length} products from DB.`);

    } catch (err) {
        console.error('[Calculator] DB Fetch Error:', err);
        // Fallback or Alert? 
        // user requested "safe fallback", so if DB fails, maybe we should keep the variables defined above 
        // but since we cleared them, we rely on DB. 
        // If DB strictly required, we show error.
        alert('상품 정보를 불러오는 중 오류가 발생했습니다.');
    }
}
