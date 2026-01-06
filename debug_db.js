
const { createClient } = require('@supabase/supabase-js');

// Hardcoded keys from supabase_config.js
const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    console.log("Fetching Security Products...");
    const { data: products, error: pErr } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'security');

    if (pErr) { console.error(pErr); return; }

    console.log(`Found ${products.length} security products.`);

    for (const p of products) {
        console.log(`\nProduct: ${p.name} (ID: ${p.id}, Sub: ${p.subcategory})`);

        const { data: plans, error: plErr } = await supabase
            .from('product_plans')
            .select('*')
            .eq('product_id', p.id);

        if (plErr) console.error(plErr);
        else {
            if (plans.length === 0) console.log("  No plans.");
            plans.forEach(plan => {
                console.log(`  - Plan: "${plan.plan_name}" (ID: ${plan.id}, Sort: ${plan.sort_order})`);
                console.log(`    Price: ${plan.price}, Active: ${plan.active}, Summary: "${plan.summary}"`);
                console.log(`    Features: ${JSON.stringify(plan.features)}`);
            });
        }
    }
}

run();
