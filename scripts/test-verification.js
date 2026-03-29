const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
async function run() {
  const { data } = await supabase.from('coach_profiles').select('id, is_published, is_verified');
  console.log(data);
}
run();
