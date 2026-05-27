const express = require('express');
const dayjs = require('dayjs');
const crypto = require('crypto');
const supabase = require('../utils/supabaseClient');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

function getStatusLabel(status) {
  switch (status) {
    case 'confirmed':
      return 'Da xac nhan';
    case 'cancelled':
      return 'Da huy';
    case 'completed':
      return 'Da kham';
    default:
      return 'Dang xu ly';
  }
}

function toAppointmentSummary(appointment) {
  return {
    id: appointment.id,
    doctorName: appointment.doctor_name,
    specialty: appointment.specialty,
    appointmentAt: appointment.appointment_date,
    location: appointment.location,
    status: appointment.status,
    statusLabel: getStatusLabel(appointment.status),
    qrCodeUrl: appointment.qr_code || undefined,
  };
}

async function getOwnedAppointment(id, patientId, columns = '*') {
  return supabase
    .from('appointments')
    .select(columns)
    .eq('id', id)
    .eq('patient_id', patientId)
    .single();
}

// GET /api/appointments?status=...&upcoming=true
router.get('/', async (req, res) => {
  const { status, upcoming } = req.query;
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', req.user.id)
    .order('appointment_date', { ascending: true });

  if (status) query = query.eq('status', status);
  if (upcoming !== 'false') {
    query = query.gte('appointment_date', dayjs().format('YYYY-MM-DD'));
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({
    success: true,
    appointments: (data || []).map(toAppointmentSummary),
  });
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await getOwnedAppointment(req.params.id, req.user.id);

  if (error || !data) {
    return res
      .status(404)
      .json({ success: false, message: 'Khong tim thay lich hen.' });
  }

  return res.json({
    success: true,
    appointment: data,
  });
});

// POST /api/appointments
router.post('/', async (req, res) => {
  const { doctorId, appointmentDate, slotId, doctorName, specialty, location } =
    req.body || {};

  if (!doctorId || !appointmentDate || !slotId) {
    return res.status(400).json({
      success: false,
      message: 'Thieu thong tin can thiet.',
    });
  }

  if (dayjs(appointmentDate).isBefore(dayjs(), 'day')) {
    return res.status(400).json({
      success: false,
      message: 'Ngay kham khong duoc trong qua khu.',
    });
  }

  const { data: existing, error: checkError } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', appointmentDate)
    .eq('slot_id', slotId)
    .neq('status', 'cancelled');

  if (checkError) {
    return res.status(500).json({ success: false, message: checkError.message });
  }

  if (existing && existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Slot nay da duoc dat.',
    });
  }

  const appointmentId = crypto.randomUUID();
  const qrCode = `qr-${appointmentId}-${Date.now()}`;

  const { data: createdAppointment, error: insertError } = await supabase
    .from('appointments')
    .insert([
      {
        id: appointmentId,
        doctor_id: doctorId,
        patient_id: req.user.id,
        appointment_date: appointmentDate,
        slot_id: slotId,
        doctor_name: doctorName,
        specialty,
        location,
        status: 'confirmed',
        qr_code: qrCode,
      },
    ])
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return res.status(409).json({ success: false, message: 'Slot này đã được đặt. Vui lòng chọn giờ khác.' });
    }
    return res
      .status(500)
      .json({ success: false, message: insertError.message || 'Khong the tao lich hen.' });
  }

  if (!createdAppointment) {
    return res.status(500).json({ success: false, message: 'Khong the tao lich hen.' });
  }

  return res.status(201).json({
    success: true,
    message: 'Dat lich thanh cong.',
    appointment: toAppointmentSummary(createdAppointment),
  });
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
  const { data: appointment, error: fetchError } = await getOwnedAppointment(
    req.params.id,
    req.user.id,
    'appointment_date, status, slot_id'
  );

  if (fetchError || !appointment) {
    return res.status(404).json({
      success: false,
      message: 'Khong tim thay lich hen.',
    });
  }

  if (appointment.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Lich da duoc huy.',
    });
  }

  const SLOT_TIMES = {
    'slot-1': '08:00',
    'slot-2': '08:30',
    'slot-3': '09:00',
    'slot-4': '09:30',
  };
  const startTimeStr = SLOT_TIMES[appointment.slot_id] || '00:00';
  const appointmentDateTime = dayjs(`${appointment.appointment_date}T${startTimeStr}:00`);

  if (appointmentDateTime.diff(dayjs(), 'hour') < 24) {
    return res.status(400).json({
      success: false,
      message: 'Khong the huy trong vong 24h truoc gio kham.',
    });
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)
    .eq('patient_id', req.user.id);

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: updateError.message,
    });
  }

  return res.json({
    success: true,
    message: 'Huy lich thanh cong.',
  });
});

module.exports = router;
