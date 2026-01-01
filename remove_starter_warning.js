
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function removeWarning() {
    console.log("Searching for Starter plan to clear summary...");

    // Find Starter plan (price 0 or name Starter)
    // We updated it to 'Starter' in previous step.

    // We look for plans in website subcategory
    const { data: plans, error } = await supabase
        .from('product_plans')
        .select('*, products!inner(subcategory)')
        .eq('products.subcategory', 'website')
        .eq('plan_name', 'Starter')
        .single();

    if (error || !plans) {
        console.error("Starter plan not found or error:", error);
        // Fallback: try by price 0
        const { data: plans2 } = await supabase
            .from('product_plans')
            .select('*, products!inner(subcategory)')
            .eq('products.subcategory', 'website')
            .eq('price', 0)
            .single();

        if (plans2) {
            console.log("Found by price 0:", plans2.id);
            await clearSummary(plans2.id);
        }
        return;
    }

    console.log("Found Starter plan:", plans.id);
    await clearSummary(plans.id);
}

async function clearSummary(id) {
    const { error } = await supabase
        .from('product_plans')
        .update({ summary: '' }) // Set to empty string
        .eq('id', id);

    if (error) console.error("Error clearing summary:", error);
    else console.log("Summary cleared successfully.");
}

removeWarning();
