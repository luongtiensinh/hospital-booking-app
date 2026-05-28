const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const supabase = require("../utils/supabaseClient");

const BASE_SLOTS = [
  { id: "slot-1", startAt: "08:00", endAt: "08:30", roomLabel: "P.102" },
  { id: "slot-2", startAt: "08:30", endAt: "09:00", roomLabel: "P.102" },
  { id: "slot-3", startAt: "09:00", endAt: "09:30", roomLabel: "P.102" },
  { id: "slot-4", startAt: "09:30", endAt: "10:00", roomLabel: "P.102" },
];

function getAvailabilityStatus(availableSlots, totalSlots) {
  if (availableSlots <= 0) return "full";
  if (availableSlots <= Math.ceil(totalSlots * 0.4)) return "limited";
  return "available";
}

// GET /api/calendar?doctorId=xxx&month=yyyy-MM
router.get("/", async (req, res) => {
  const { doctorId, month } = req.query;

  if (!doctorId || !month) {
    return res
      .status(400)
      .json({ success: false, message: "Missing parameters" });
  }

  const monthStart = dayjs(`${month}-01`).startOf("month");
  if (!monthStart.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Invalid month format. Expect yyyy-MM",
    });
  }

  const monthEnd = monthStart.endOf("month");
  const fromDate = monthStart.format("YYYY-MM-DD");
  const toDate = monthEnd.format("YYYY-MM-DD");
  const totalSlotsPerDay = BASE_SLOTS.length;

  const { data: booked, error } = await supabase.rpc("get_booked_slots", {
    doctor_uuid: doctorId,
    start_date: fromDate,
    end_date: toDate,
  });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const bookedByDate = new Map();
  (booked || []).forEach((row) => {
    const date = row.appointment_date;
    const slotId = row.slot_id ?? row.slotId ?? row.slot;
    if (!date || !slotId) return;
    if (!bookedByDate.has(date)) bookedByDate.set(date, new Set());
    bookedByDate.get(date).add(slotId);
  });

  const daysInMonth = monthStart.daysInMonth();
  const calendar = Array.from({ length: daysInMonth }).map((_, idx) => {
    const date = monthStart.add(idx, "day").format("YYYY-MM-DD");
    const bookedSlots = bookedByDate.get(date)?.size ?? 0;
    const availableSlots = Math.max(0, totalSlotsPerDay - bookedSlots);

    return {
      date,
      availableSlots,
      status: getAvailabilityStatus(availableSlots, totalSlotsPerDay),
    };
  });

  return res.json({ success: true, calendar });
});

// GET /api/calendar/slots?doctorId=xxx&date=yyyy-MM-dd
router.get("/slots", async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res
      .status(400)
      .json({ success: false, message: "Missing parameters" });
  }

  // Validate date before querying DB
  if (!dayjs(date).isValid()) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid date format" });
  }

  // Lấy các slot đã được đặt trong ngày của bác sĩ (trừ các slot bị hủy)
  const { data: booked, error } = await supabase.rpc("get_booked_slots", {
    doctor_uuid: doctorId,
    start_date: date,
    end_date: date,
  });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const bookedSlotIds = (booked || [])
    .map((row) => row.slot_id ?? row.slotId ?? row.slot)
    .filter(Boolean);

  // Map lại để xác định slot nào đã bị đặt
  const slots = BASE_SLOTS.map((s) => {
    const isBooked = bookedSlotIds.includes(s.id);
    return {
      ...s,
      isBooked,
      remainingCapacity: isBooked ? 0 : 1,
    };
  });

  return res.json({ success: true, slots });
});

module.exports = router;
