const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');

// GET /api/doctors?specialty=...&search=...
router.get('/', async (req, res) => {
  const { specialty, search } = req.query;
  let query = supabase.from('doctors').select('*');
  if (specialty) query = query.eq('specialty', specialty);
  // Some deployments might use different column naming conventions.
  // We try a best-effort search against common variants.
  if (search) {
    query = query.or(
      [
        `full_name.ilike.%${search}%`,
        `fullname.ilike.%${search}%`,
        `fullName.ilike.%${search}%`,
      ].join(','),
    );
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });
  const result = (data || []).map(d => ({
    id: d.id,
    fullName: d.full_name ?? d.fullname ?? d.fullName ?? 'Bác sĩ',
    specialty: d.specialty ?? '',
    avatarUrl: d.avatar_url ?? d.avatarUrl ?? null,
    clinicName: d.clinic_name ?? d.clinicName ?? 'Đang cập nhật',
    yearsOfExperience: Number(d.years_experience ?? d.yearsExperience ?? d.years_of_experience ?? 0) || 0,
    bio: d.bio ?? '',
  }));
  res.json({ success: true, doctors: result });
});

module.exports = router;
