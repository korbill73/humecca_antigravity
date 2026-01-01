
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function checkWebsiteProducts() {
    console.log("Searching for 'Website' solution products...");

    // Based on admin_logic, they likely have subcategory = 'website'
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            category, 
            subcategory,
            product_plans (
                id, plan_name, price, features, sort_order
            )
        `)
        .eq('category', 'solution')
        .eq('subcategory', 'website');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${products.length} products:`);
    products.forEach(p => {
        console.log(`[Product] ${p.name} (${p.subcategory})`);
        p.product_plans.forEach(plan => {
            console.log(`  - Plan: ${plan.plan_name}, Price: ${plan.price}`);
        });
    });
}

checkWebsiteProducts();
