
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pfowkwodqsirbaqkpfmb.supabase.co';
const supabaseKey = 'sb_publishable_i8wY_NmKlt9qUZJPKH1f2A_yOwp3qlA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    const { data, error } = await supabase.from('products').select('category, subcategory, name').limit(50);
    if (error) console.error(error);
    else console.table(data);
}
checkProducts();
