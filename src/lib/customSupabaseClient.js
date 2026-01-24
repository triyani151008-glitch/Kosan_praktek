import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtszwdoxqzooqgsrjmge.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0c3p3ZG94cXpvb3Fnc3JqbWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTAwNDMsImV4cCI6MjA4Mzc4NjA0M30.mNBR4Gk_FI_HmvqhLKL9I0EtkQKpzPNGfQ1AQq6Ywcw';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
