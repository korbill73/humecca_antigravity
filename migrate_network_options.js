// Migration: Seed Network Options
// Run this to populate the product_plans table with global network options

const { createClient } = require('@supabase/supabase-js');

// Hardcoded for Quick Execution (as used in previous steps)
const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const networkOptions = [
    {
        plan_name: '10Mbps (기본)',
        price: 0,
        period: '월',
        summary: '기본 제공 네트워크',
        active: true,
        sort_order: 1
    },
    {
        plan_name: '100Mbps (Shared)',
        price: 50000,
        period: '월',
        summary: '업무용 고속 네트워크',
        active: true,
        sort_order: 2
    },
    {
        plan_name: '1Gbps (Dedicated)',
        price: 500000,
        period: '월',
        summary: '대용량 트래픽 전용',
        active: true,
        sort_order: 3
    }
];

async function seedNetworkOptions() {
    console.log('Seeding Network Options...');

    // 1. Create Parent "Network" Product if needed?
    // Our schema seems to rely on 'product_id' linking to a parent 'products' table.
    // Let's check or create the parent product first.

    // Check for product group 'option' / 'network'
    let { data: product, error } = await supabase
        .from('products')
        .select('id')
        .eq('category', 'option')
        .eq('subcategory', 'network')
        .maybeSingle();

    if (!product) {
        console.log('Creating Parent Product Group: Network Options');
        const { data: newProd, error: createError } = await supabase
            .from('products')
            .insert([{
                name: 'Network Options',
                category: 'option',
                subcategory: 'network',
                description: 'Global Network Bandwidth Options'
            }])
            .select()
            .single();

        if (createError) {
            console.error('Failed to create parent product:', createError);
            return;
        }
        product = newProd;
    }

    console.log(`Parent Product ID: ${product.id}`);

    // 2. Insert Plans
    for (const option of networkOptions) {
        // Check if exists
        const { data: existing } = await supabase
            .from('product_plans')
            .select('id')
            .eq('product_id', product.id)
            .eq('plan_name', option.plan_name)
            .maybeSingle();

        if (existing) {
            console.log(`Skipping ${option.plan_name} (Already exists)`);
        } else {
            console.log(`Inserting ${option.plan_name}...`);
            const payload = { ...option, product_id: product.id };
            const { error: insertError } = await supabase
                .from('product_plans')
                .insert([payload]);

            if (insertError) console.error(`Error inserting ${option.plan_name}:`, insertError);
            else console.log(`Inserted ${option.plan_name}`);
        }
    }

    console.log('Migration Complete.');
}

seedNetworkOptions();
