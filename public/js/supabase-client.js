// ── Supabase Initialization ───────────────────────────────────────────
// These keys are safe to expose in the frontend for Supabase Auth & RLS
const SUPABASE_URL = 'https://gytmsldvpxpxuqamllxb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Yo-2n5xRBkxIxvMoRThlGw_OvLEYRY2';

// Initialize the Supabase client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
