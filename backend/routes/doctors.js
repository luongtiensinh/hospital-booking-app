const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');

// GET /api/doctors?specialty=...&search=...
router.get('/', async (req, res) => {
  const { specialty, search } = req.query;
  let query = supabase.from('doctors').select('*');
  if (specialty) query = query.eq('specialty', specialty);
  if (search) query = query.ilike('full_name', `%${search}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });
  const result = (data || []).map(d => ({
    id: d.id,
    fullName: d.full_name,
    specialty: d.specialty,
    avatarUrl: d.avatar_url,
    clinicName: d.clinic_name,
    yearsOfExperience: d.years_experience,
    bio: d.bio,
  }));
  res.json({ success: true, doctors: result });
});

module.exports = router;
