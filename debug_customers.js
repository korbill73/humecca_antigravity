
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const configContent = fs.readFileSync('./supabase_config.js', 'utf8');
const supabaseUrl = configContent.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/)[1];
const supabaseKey = configContent.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomers() {
    console.log('Checking "customers" table...');
    const { data, error } = await supabase
        .from('customers')
        .select('*');

    if (error) {
        console.error('Error fetching customers:', error);
    } else {
        console.log(`Success! Found ${data.length} customers.`);
        console.log(data);
    }
}

checkCustomers();
