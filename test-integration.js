require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIntegration() {
  console.log('🧪 Testing Supabase Integration...\n');

  try {
    console.log('1. Testing database connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful');

    console.log('\n2. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      return;
    }
    
    console.log(`✅ Profiles table accessible (${profiles.length} records)`);
    if (profiles.length > 0) {
      console.log('   Sample profile:', profiles[0]);
    }

    console.log('\n3. Testing quotes table...');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(5);
    
    if (quotesError) {
      console.error('❌ Quotes table error:', quotesError.message);
      return;
    }
    
    console.log(`✅ Quotes table accessible (${quotes.length} records)`);
    if (quotes.length > 0) {
      console.log('   Sample quote:', quotes[0]);
    }

    console.log('\n🎉 Integration test successful!');
    console.log('\n✅ Ready to enable Alabama quoting!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIntegration();
