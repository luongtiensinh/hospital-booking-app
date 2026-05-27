const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const supabase = require('../utils/supabaseClient');

// GET /api/calendar?doctorId=xxx&month=yyyy-MM
router.get('/', async (req, res) => {
  const { doctorId, month } = req.query;
  
  if (!doctorId || !month) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  // Đối với logic thực tế, bạn có thể truy vấn Supabase để tính toán số lượng slot còn lại.
  // Ở đây chúng ta tạm tạo dữ liệu mẫu theo tháng được yêu cầu để đáp ứng UI.
  const calendar = [
    { date: `${month}-21`, availableSlots: 5, status: 'available' },
    { date: `${month}-22`, availableSlots: 2, status: 'limited' },
    { date: `${month}-23`, availableSlots: 0, status: 'full' },
    { date: `${month}-24`, availableSlots: 8, status: 'available' },
    { date: `${month}-25`, availableSlots: 4, status: 'available' },
  ];
  
  return res.json({ success: true, calendar });
});

// GET /api/calendar/slots?doctorId=xxx&date=yyyy-MM-dd
router.get('/slots', async (req, res) => {
  const { doctorId, date } = req.query;
  
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  // Lấy các slot đã được đặt trong ngày của bác sĩ (trừ các slot bị hủy)
  const { data: booked } = await supabase
    .from('appointments')
    .select('slot_id')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled');
    
  const bookedSlotIds = (booked || []).map(b => b.slot_id);

  // Danh sách slot mẫu
  const baseSlots = [
    { id: 'slot-1', startAt: '08:00', endAt: '08:30', roomLabel: 'P.102' },
    { id: 'slot-2', startAt: '08:30', endAt: '09:00', roomLabel: 'P.102' },
    { id: 'slot-3', startAt: '09:00', endAt: '09:30', roomLabel: 'P.102' },
    { id: 'slot-4', startAt: '09:30', endAt: '10:00', roomLabel: 'P.102' },
  ];

  // Map lại để xác định slot nào đã bị đặt
  const slots = baseSlots.map(s => {
    const isBooked = bookedSlotIds.includes(s.id);
    return {
      ...s,
      isBooked,
      remainingCapacity: isBooked ? 0 : 1
    };
  });

  return res.json({ success: true, slots });
});

module.exports = router;
