
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function fixPlanNames() {
    console.log("Fixing Plan Names...");

    // 1. Rename 100,000 -> "Starter (기본형)"
    // 2. Rename 500,000 -> "Business (비즈니스)"
    // 3. Rename 0 (Free) if exists, or delete.
    // 4. Rename '별도 문의' -> "Enterprise (주문 제작형)"

    // Filter by category 'solution' and subcategory 'website'

    const { data: plans, error } = await supabase
        .from('product_plans')
        .select('*')
        .eq('category', 'solution')
        .eq('subcategory', 'website');

    if (error) { console.error(error); return; }

    for (let p of plans) {
        let newName = p.plan_name;

        if (p.price === 100000) {
            newName = "Starter (기본형)";
        } else if (p.price === 500000) {
            newName = "Business (비즈니스)";
        } else if (typeof p.price === 'string' || p.price === 0 || p.plan_name.includes('주문') || p.plan_name.includes('Enterprise')) {
            newName = "Enterprise (주문 제작형)";
        }

        if (newName !== p.plan_name) {
            console.log(`Updating ${p.plan_name} -> ${newName}`);
            await supabase.from('product_plans').update({ plan_name: newName }).eq('id', p.id);
        }
    }
    console.log("Done.");
}

fixPlanNames();
