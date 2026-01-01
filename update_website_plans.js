
const { createClient } = require('@supabase/supabase-js');
const _url = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const _key = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(_url, _key);

async function updatePlans() {
    console.log("Updating Website Product Plans...");

    // 1. Get Product ID
    const { data: product } = await supabase.from('products')
        .select('id')
        .eq('category', 'solution')
        .eq('subcategory', 'website')
        .single();

    if (!product) { console.error("Website Product Not Found"); return; }
    console.log("Product ID:", product.id);

    // 2. Get existing plans
    const { data: plans } = await supabase.from('product_plans')
        .select('*')
        .eq('product_id', product.id)
        .order('price', { ascending: true });

    // We expect 3 plans. Names might be messy.
    // Map by approximate current name or sort order.
    // Existing: "기본형" (low price?), "고급형" (mid?), "주문 제작형" (high?)

    // Desired:
    // 1. Starter (0)
    // 2. Business (1000000)
    // 3. Enterprise (Consult)

    for (let p of plans) {
        let updates = {};

        // Heuristic mapping
        if (p.plan_name.includes('기본') || p.plan_name.includes('일반') || p.price < 50000) {
            // Starter
            updates = {
                plan_name: 'Starter',
                price: 0,
                summary: '* DB 연동 미제공 (소개 페이지만 가능)',
                sort_order: 1
            };
        } else if (p.plan_name.includes('고급') || (p.price >= 200000 && p.price < 2000000)) {
            // Enterprise (Wait, in my design Enterprise is top tier, Business is mid)
            // Let's assume Business is the middle one.
            // If current DB has "Advanced/High" as mid tier?
            // Let's map by Price comparison.
            updates = {
                plan_name: 'Business',
                price: 1000000,
                summary: '* 제휴사 별도 견적 진행',
                sort_order: 2,
                badge: 'Best Value'
            };
        } else if (p.plan_name.includes('주문') || p.price >= 2000000) {
            // Enterprise
            updates = {
                plan_name: 'Enterprise',
                price: '별도 문의', // Providing string
                summary: '* DB 연동 / 하이브리드 앱',
                sort_order: 3
            };
        }

        // Apply Update
        if (updates.plan_name) {
            console.log(`Updating Plan [${p.id}] ${p.plan_name} -> ${updates.plan_name}`);
            const { error } = await supabase.from('product_plans').update(updates).eq('id', p.id);
            if (error) console.error("Error updating:", error);
            else console.log("Success.");
        }
    }
}

updatePlans();
