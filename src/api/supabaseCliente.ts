import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvfiaquovixeeolamks.supabase.co';
const supabaseKey = 'sb_publishable_iA1xLhu6oGA4_qOCvURkW_id6LfSZ5';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
  }
});