const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const dayjs = require('dayjs');

// POST /api/appointments - tạo lịch hẹn
router.post('/', async (req, res) => {
  const { doctorId, patientId, appointmentDate, slotId } = req.body || {};

  // validation
  if (!doctorId || !patientId || !appointmentDate || !slotId) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin cần thiết.' });
  }
  if (dayjs(appointmentDate).isBefore(dayjs())) {
    return res.status(400).json({ success: false, message: 'Ngày khám không được trong quá khứ.' });
  }

  // create appointment
  const { data: newAppt, error: insertErr } = await supabase
    .from('appointments')
    .insert([
      {
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: appointmentDate,
        slot_id: slotId,
        status: 'confirmed',
      },
    ])
    .single();

  if (insertErr) return res.status(500).json({ success: false, error: insertErr.message });

  // generate simple QR code string (could be replaced with real image later)
  const qrCode = `qr-${newAppt.id}-${Date.now()}`;
  await supabase.from('appointments').update({ qr_code: qrCode }).eq('id', newAppt.id);

  res.status(201).json({
    success: true,
    message: 'Đặt lịch thành công.',
    appointment: { ...newAppt, qr_code: qrCode },
  });
});

module.exports = router;
