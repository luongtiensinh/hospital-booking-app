require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL in backend/.env");
}

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY in backend/.env");
}

// Backend uses anon key (public) for Supabase access.
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

function createAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function getSupabaseClient(req) {
  if (req && req.accessToken) {
    return createAuthenticatedClient(req.accessToken);
  }
  return supabase;
}

module.exports = supabase;
module.exports.getSupabaseClient = getSupabaseClient;
module.exports.createAuthenticatedClient = createAuthenticatedClient;
