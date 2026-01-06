const { createClient } = require('@supabase/supabase-js');
// Hardcoded for Quick Inspection
const SUPABASE_URL = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA'; // Usually anon key should check env but using what was in file
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectPlan() {
    const { data, error } = await supabase
        .from('product_plans')
        .select('*')
        .eq('plan_name', '1U 랙 마운트'); // Or close match

    if (error) {
        console.error(error);
        return;
    }

    // Also try to find by subcategory if name mismatch
    if (data.length === 0) {
        console.log("No exact match for '1U 랙 마운트', searching all colocation plans...");
        const { data: allPlans } = await supabase
            .from('products')
            .select('id')
            .eq('subcategory', 'colocation')
            .single();

        if (allPlans) {
            const { data: plans } = await supabase
                .from('product_plans')
                .select('*')
                .eq('product_id', allPlans.id);
            console.log(JSON.stringify(plans, null, 2));
        }
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

inspectPlan();
