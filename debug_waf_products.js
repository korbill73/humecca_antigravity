const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkWafPlans() {
    console.log('Fetching Product ID for sec-waf...');

    // 1. Get Product ID
    const { data: product, error: prodError } = await supabase
        .from('products')
        .select('id, name')
        .eq('subcategory', 'sec-waf') // 'sec-waf' is the subcategory in config
        .maybeSingle();

    if (prodError || !product) {
        console.error('Produc Fetch Error:', prodError);
        return;
    }
    console.log('Product Found:', product);

    // 2. Get Plans
    const { data: plans, error: planError } = await supabase
        .from('product_plans')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order', { ascending: true });

    if (planError) {
        console.error('Plan Fetch Error:', planError);
        return;
    }

    console.log('\n--- WAF PLANS ---');
    plans.forEach(p => {
        console.log(`\n[${p.plan_name}] (ID: ${p.id})`);
        console.log(`- Price: ${p.price}`);
        console.log(`- Traffic: ${p.traffic}`);
        console.log(`- Bandwidth: ${p.bandwidth}`);
        console.log(`- Speed: ${p.speed}`);
        console.log(`- CPU: ${p.cpu}`);
        console.log(`- RAM: ${p.ram}`);
        console.log(`- Features: ${p.features ? p.features.substring(0, 50) + '...' : 'NULL'}`);
    });
}

checkWafPlans();
