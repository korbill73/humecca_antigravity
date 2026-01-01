
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function checkBasic() {
    console.log("Searching for 'Basic' plans...");

    // Get all plans with content 'Basic' in name
    const { data: plans, error } = await supabase
        .from('product_plans')
        .select(`
            id, 
            plan_name, 
            plan_id, 
            active, 
            sort_order, 
            product_id, 
            products (
                category, 
                subcategory
            )
        `)
        .ilike('plan_name', '%Basic%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${plans.length} plans matching 'Basic':`);
    plans.forEach(p => {
        console.log(`--------------------------------------------------`);
        console.log(`ID: ${p.id}`);
        console.log(`Name: ${p.plan_name}`);
        console.log(`User ID (Slug): ${p.plan_id}`);
        console.log(`Active: ${p.active}`);
        console.log(`Sort Order: ${p.sort_order}`);
        console.log(`Category: ${p.products?.category} > ${p.products?.subcategory}`);
    });
}

checkBasic();
