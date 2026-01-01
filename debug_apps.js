
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load config
const configContent = fs.readFileSync('./supabase_config.js', 'utf8');
const supabaseUrl = configContent.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/)[1];
const supabaseKey = configContent.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkApplications() {
    console.log('Fetching applications...');
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Total applications found: ${data.length}`);
    data.forEach(app => {
        console.log(`ID: ${app.id}, Product: ${app.product_name}, Created: ${app.created_at}, Contact: ${app.contact_person}`);
    });
}

checkApplications();
