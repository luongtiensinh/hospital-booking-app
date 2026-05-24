const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');
const dayjs = require('dayjs');

// GET /api/appointments/:id - chi tiết lịch hẹn
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ success: false, error: error.message });
  res.json({ success: true, appointment: data });
});

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

  // race‑condition check: slot already booked?
  const { data: existing, error: checkErr } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', appointmentDate)
    .eq('slot_id', slotId);

  if (checkErr) return res.status(500).json({ success: false, error: checkErr.message });
  if (existing && existing.length > 0) {
    return res.status(409).json({ success: false, message: 'Slot này đã được đặt.' });
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

// DELETE /api/appointments/:id - hủy lịch (cần >24h trước giờ khám)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { data: appt, error: fetchErr } = await supabase
    .from('appointments')
    .select('appointment_date, status')
    .eq('id', id)
    .single();

  if (fetchErr) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch hẹn.' });
  if (appt.status === 'cancelled') return res.status(400).json({ success: false, message: 'Lịch đã được hủy.' });

  // kiểm tra thời gian hủy (cần ít nhất 24h trước lịch)
  if (dayjs(appt.appointment_date).diff(dayjs(), 'hour') < 24) {
    return res.status(400).json({ success: false, message: 'Không thể hủy trong vòng 24h trước giờ khám.' });
  }

  const { error: updErr } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
  if (updErr) return res.status(500).json({ success: false, error: updErr.message });

  res.json({ success: true, message: 'Hủy lịch thành công.' });
});

module.exports = router;
