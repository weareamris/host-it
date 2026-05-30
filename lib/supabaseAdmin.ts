import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.https://mhyxbvnykfnvcvtsxodc.supabase.co;
    const supabaseServiceRoleKey = process.envsb_publishable_5dqYYc2U2l0Krope6TP8BA_QLTFldNQ
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
}
