require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Service role key gives full access to tables (used by backend routes)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
