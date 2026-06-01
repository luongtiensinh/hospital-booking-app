const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const supabaseClient = require("../utils/supabaseClient");

dayjs.extend(utc);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAPACITY_PER_SLOT = 10;

// Tạo 48 slot/ngày: 08:00 - 11:50, 13:00 - 16:50
function generateDailySlots() {
  const slots = [];
  
  // Buổi sáng: 8h đến 12h (không tính 12h) -> 24 slots
  let m = dayjs().hour(8).minute(0).second(0);
  while (m.hour() < 12) {
    slots.push({
      id: m.format("HH:mm"),
      startAt: m.format("HH:mm"),
      endAt: m.add(10, "minute").format("HH:mm"),
      session: "morning",
      capacity: CAPACITY_PER_SLOT,
    });
    m = m.add(10, "minute");
  }

  // Buổi chiều: 13h đến 17h (không tính 17h) -> 24 slots
  let a = dayjs().hour(13).minute(0).second(0);
  while (a.hour() < 17) {
    slots.push({
      id: a.format("HH:mm"),
      startAt: a.format("HH:mm"),
      endAt: a.add(10, "minute").format("HH:mm"),
      session: "afternoon",
      capacity: CAPACITY_PER_SLOT,
    });
    a = a.add(10, "minute");
  }

  return slots;
}

const DAILY_SLOTS = generateDailySlots();
const TOTAL_DAILY_CAPACITY = DAILY_SLOTS.length * CAPACITY_PER_SLOT;

function getAvailabilityStatus(availableCapacity, totalCapacity, dateStr) {
  // Check day of week
  const dateObj = dayjs(dateStr);
  const dayOfWeek = dateObj.day(); // 0: Sun, 1: Mon, ... 6: Sat

  if (dayOfWeek === 0) return "closed"; // Sunday closed
  if (availableCapacity <= 0) return "full";
  if (availableCapacity <= Math.ceil(totalCapacity * 0.2)) return "limited";
  return "available";
}

// Lấy thông tin quầy
async function getCounterInfo(supabase, counterId) {
  const { data } = await supabase.from("counters").select("*").eq("id", counterId).single();
  return data;
}

// GET /api/calendar?counterId=xxx&month=yyyy-MM
router.get("/", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { counterId, month } = req.query;

  if (!counterId || !month) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  if (!UUID_REGEX.test(counterId)) {
    return res.status(400).json({ success: false, message: "Invalid counter ID" });
  }

  const monthStart = dayjs(`${month}-01`).startOf("month");
  if (!monthStart.isValid()) {
    return res.status(400).json({ success: false, message: "Invalid month format. Expect yyyy-MM" });
  }

  const counter = await getCounterInfo(supabase, counterId);
  if (!counter) {
    return res.status(404).json({ success: false, message: "Counter not found" });
  }

  const monthEnd = monthStart.endOf("month");
  const fromDate = monthStart.format("YYYY-MM-DD");
  const toDate = monthEnd.format("YYYY-MM-DD");

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("appointment_date, slot_id")
    .eq("counter_id", counterId)
    .gte("appointment_date", fromDate)
    .lte("appointment_date", toDate)
    .neq("status", "cancelled");

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const bookedByDate = new Map();
  (appointments || []).forEach((row) => {
    const date = row.appointment_date;
    if (!bookedByDate.has(date)) bookedByDate.set(date, 0);
    bookedByDate.set(date, bookedByDate.get(date) + 1);
  });

  const daysInMonth = monthStart.daysInMonth();
  const calendar = Array.from({ length: daysInMonth }).map((_, idx) => {
    const currentDay = monthStart.add(idx, "day");
    const date = currentDay.format("YYYY-MM-DD");
    const dayOfWeek = currentDay.day();

    // Chủ nhật đóng cửa
    if (dayOfWeek === 0) {
      return { date, availableCapacity: 0, status: "closed" };
    }

    // Thứ 7 chỉ mở cho "Khám tổng quát" (Quầy 1 - giả sử là "Quầy 1" có trong tên)
    if (dayOfWeek === 6 && !(counter.name || "").toLowerCase().includes("tổng quát")) {
      return { date, availableCapacity: 0, status: "closed" };
    }

    const booked = bookedByDate.get(date) ?? 0;
    const availableCapacity = Math.max(0, TOTAL_DAILY_CAPACITY - booked);

    return {
      date,
      availableCapacity,
      status: getAvailabilityStatus(availableCapacity, TOTAL_DAILY_CAPACITY, date),
    };
  });

  return res.json({ success: true, calendar });
});

// GET /api/calendar/slots?counterId=xxx&date=yyyy-MM-dd
router.get("/slots", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { counterId, date } = req.query;

  if (!counterId || !date) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  if (!UUID_REGEX.test(counterId)) {
    return res.status(400).json({ success: false, message: "Invalid counter ID" });
  }

  if (!dayjs(date).isValid()) {
    return res.status(400).json({ success: false, message: "Invalid date format" });
  }

  const counter = await getCounterInfo(supabase, counterId);
  if (!counter) {
    return res.status(404).json({ success: false, message: "Counter not found" });
  }

  // Check limits for weekend
  const dateObj = dayjs(date);
  const dayOfWeek = dateObj.day();
  
  if (dayOfWeek === 0 || (dayOfWeek === 6 && !(counter.name || "").toLowerCase().includes("tổng quát"))) {
    return res.json({ success: true, slots: [] }); // No slots available
  }

  // Lấy các slot đã đặt
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("slot_id")
    .eq("counter_id", counterId)
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const bookedBySlotId = new Map();
  (appointments || []).forEach((row) => {
    const sId = row.slot_id;
    if (!bookedBySlotId.has(sId)) bookedBySlotId.set(sId, 0);
    bookedBySlotId.set(sId, bookedBySlotId.get(sId) + 1);
  });

  const now = dayjs().utcOffset(7);
  const isToday = dateObj.format("YYYY-MM-DD") === now.format("YYYY-MM-DD");

  const slots = DAILY_SLOTS.map((s) => {
    const booked = bookedBySlotId.get(s.id) ?? 0;
    const remainingCapacity = Math.max(0, s.capacity - booked);
    
    let isPast = false;
    if (isToday) {
      const slotTime = dayjs(`${date}T${s.startAt}:00+07:00`);
      if (now.isAfter(slotTime)) {
        isPast = true;
      }
    }

    return {
      ...s,
      remainingCapacity,
      isBooked: remainingCapacity <= 0,
      isPast,
    };
  });

  return res.json({ success: true, slots });
});

module.exports = router;
