
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
export const supabaseAdmin = null; // Supabase is not used in this project setup