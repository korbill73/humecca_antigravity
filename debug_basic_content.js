
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function checkContent() {
    console.log("Fetching content for ID 288 (Basic)...");

    const { data, error } = await supabase
        .from('product_plans')
        .select('features, plan_name, id')
        .eq('id', 288)
        .single();

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log("--------------------------------------------------");
    console.log(`ID: ${data.id}`);
    console.log(`Name: ${data.plan_name}`);
    console.log("Features (Raw Content):");
    console.log(JSON.stringify(data.features, null, 2));
    console.log("--------------------------------------------------");
}

checkContent();
