
const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://qjilwacgqjswuvrxpamm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaWx3YWNncWpzd3V2cnhwYW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxNTM0MzYsImV4cCI6MjA0NzcyOTQzNnw.sQGdZ2Xw_xXqWbW6Q4vwXwXw_xXqWbW6Q4vwXwXw_xX');

async function check() {
    const { data: prods } = await sb.from('products').select('*').eq('subcategory', 'network');
    console.log('Parent Products (Network):', prods);

    if (prods && prods.length > 0) {
        const { data: plans } = await sb.from('product_plans').select('*').eq('product_id', prods[0].id);
        console.log('Network Plans:', plans);
    }
}
check();
