import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvfiaquovixeeolamks.supabase.co';
const supabaseKey = 'sb_publishable_iA1xLGhu6OgA4_q0cVURkw_id6LfSZ5';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'public' },
  auth: { persistSession: false },
});