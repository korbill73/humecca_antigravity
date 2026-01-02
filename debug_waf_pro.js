const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkWafProPlans() {
    console.log('Fetching Product ID for sec-waf-pro...');

    // 1. Get Product ID
    const { data: product, error: prodError } = await supabase
        .from('products')
        .select('id, name')
        .eq('subcategory', 'sec-waf-pro')
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

    console.log('\n--- WAF PRO PLANS ---');
    plans.forEach(p => {
        console.log(`\n[${p.plan_name}] (ID: ${p.id})`);
        console.log(`- Features: ${p.features ? p.features.substring(0, 50) + '...' : 'NULL'}`);
    });
}

checkWafProPlans();
