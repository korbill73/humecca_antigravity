
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function checkPremium() {
    console.log("Searching for 'Premium' plans...");

    // Get all plans with content 'Premium' in name
    const { data: plans, error } = await supabase
        .from('product_plans')
        .select(`
            id, 
            plan_name, 
            active, 
            sort_order, 
            products (
                category, 
                subcategory
            )
        `)
        .ilike('plan_name', '%Premium%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${plans.length} plans matching 'Premium':`);
    plans.forEach(p => {
        console.log(`--------------------------------------------------`);
        console.log(`ID: ${p.id}`);
        console.log(`Name: ${p.plan_name}`);
        console.log(`Active: ${p.active}`);
        console.log(`Category: ${p.products?.category} > ${p.products?.subcategory}`);
    });
}

checkPremium();
