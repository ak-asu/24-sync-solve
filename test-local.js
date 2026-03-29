import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function run() {
  const {data} = await supabase.from('profiles').select('full_name').in('id', (
    await supabase.from('coach_profiles').select('user_id').in('id', ['0a1479fc-328c-45d5-af87-ea5425bcef3f', 'f9b2eead-2933-40f3-b8e9-04abed1c5a19', 'ed631dbe-5602-4827-b5c9-4ebd3e72206d'])
  ).data.map(d => d.user_id));
  console.log(data);
}
run();
