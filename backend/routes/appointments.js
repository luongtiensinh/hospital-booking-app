const express = require('express');
const dayjs = require('dayjs');
const crypto = require('crypto');
const supabase = require('../utils/supabaseClient');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

const SLOT_TIMES = {
  'slot-1': '08:00',
  'slot-2': '08:30',
  'slot-3': '09:00',
  'slot-4': '09:30',
};

function getStatusLabel(status) {
  switch (status) {
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Đã khám';
    default:
      return 'Đang xử lý';
  }
}

function toAppointmentSummary(appointment) {
  const startTimeStr = SLOT_TIMES[appointment.slot_id] || '00:00';
  const appointmentAt = `${appointment.appointment_date}T${startTimeStr}:00+07:00`;

  return {
    id: appointment.id,
    doctorName: appointment.doctor_name,
    specialty: appointment.specialty,
    appointmentAt,
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
    const todayVN = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    query = query.gte('appointment_date', todayVN);
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

  const parsedDate = dayjs(appointmentDate);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      success: false,
      message: 'Định dạng ngày khám không hợp lệ.',
    });
  }

  // Validate both appointment date and the slot start time (Vietnam timezone) so we
  // block booking slots that are already in the past on the current day.
  const startTimeStr = SLOT_TIMES[slotId];
  if (!startTimeStr) {
    return res.status(400).json({
      success: false,
      message: 'Khung giờ khám không hợp lệ.',
    });
  }

  // Combine date + slot time into a full datetime in Vietnam timezone (+07:00)
  // and compare with the current time.
  const appointmentDateTime = dayjs(
    `${appointmentDate}T${startTimeStr}:00+07:00`,
  );

  if (!appointmentDateTime.isValid()) {
    return res.status(400).json({
      success: false,
      message: 'Thời gian khám không hợp lệ.',
    });
  }

  if (appointmentDateTime.isBefore(dayjs())) {
    return res.status(400).json({
      success: false,
      message: 'Thời gian khám không được ở trong quá khứ.',
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
        appointment_time: startTimeStr,
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
  if (appointment.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ có thể hủy lịch hẹn ở trạng thái đã xác nhận.',
    });
  }


  const startTimeStr = SLOT_TIMES[appointment.slot_id] || '00:00';
  // Parse using Vietnam timezone offset to avoid server-local timezone drift (e.g. UTC on cloud).
  const appointmentDateTime = dayjs(
    `${appointment.appointment_date}T${startTimeStr}:00+07:00`,
  );


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
