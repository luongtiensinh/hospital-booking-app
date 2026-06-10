const express = require("express");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const crypto = require("crypto");
const supabaseClient = require("../utils/supabaseClient");
const cryptoHelper = require("../utils/crypto");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

dayjs.extend(utc);

const router = express.Router();
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAPACITY_PER_SLOT = 10;
const GENERAL_COUNTER_KEYWORD = "tổng quát".normalize("NFC");

router.use(requireAuth);

// Auto-expire appointments middleware
let lastAutoExpireRun = 0;
const AUTO_EXPIRE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function getExpiredSlotsToday(nowVN, todayStr) {
  const expiredSlots = [];
  
  const checkSlots = (startHour, endHour) => {
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const slotId = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const slotTime = dayjs(`${todayStr}T${slotId}:00+07:00`);
        if (nowVN.isAfter(slotTime.add(30, "minute"))) {
          expiredSlots.push(slotId);
        }
      }
    }
  };

  checkSlots(8, 12);
  checkSlots(13, 17);

  return expiredSlots;
}

async function autoExpireAppointments(req, res, next) {
  // Only execute this logic for staff members who actually have permissions to write under RLS policies,
  // and throttle it using an in-memory timestamp.
  const isStaff = req.user && ["admin", "doctor", "receptionist"].includes(req.user.role);
  const timeSinceLastRun = Date.now() - lastAutoExpireRun;

  if (!isStaff || timeSinceLastRun < AUTO_EXPIRE_COOLDOWN_MS) {
    return next();
  }

  try {
    lastAutoExpireRun = Date.now();
    const supabase = supabaseClient.getSupabaseClient(req);
    const nowVN = dayjs().utcOffset(7);
    const todayVNStr = nowVN.format("YYYY-MM-DD");

    console.log("[Auto-Expire] Running scheduled database updates directly...");

    // 1. Expire past confirmed appointments
    const { error: errorPast } = await supabase
      .from("appointments")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("status", "confirmed")
      .lt("appointment_date", todayVNStr);

    if (errorPast) {
      console.error("[Auto-Expire] Expiring past appointments failed:", errorPast.message);
    }

    // 2. Expire today's confirmed appointments whose slots are expired
    const expiredSlotsToday = getExpiredSlotsToday(nowVN, todayVNStr);
    if (expiredSlotsToday.length > 0) {
      const { error: errorToday } = await supabase
        .from("appointments")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("status", "confirmed")
        .eq("appointment_date", todayVNStr)
        .in("slot_id", expiredSlotsToday);

      if (errorToday) {
        console.error("[Auto-Expire] Expiring today's appointments failed:", errorToday.message);
      }
    }
  } catch (err) {
    console.error("[Auto-Expire] System error:", err);
  }
  next();
}

router.use(autoExpireAppointments);

function getTodayVN() {
  return dayjs().utcOffset(7).format("YYYY-MM-DD");
}

function getStatusLabel(status) {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "checked-in":
      return "Đã check-in";
    case "cancelled":
      return "Đã hủy";
    case "completed":
      return "Đã khám";
    case "expired":
      return "Đã hết hạn";
    default:
      return "Đang xử lý";
  }
}

function isGeneralCounter(counterName) {
  return (counterName || "")
    .normalize("NFC")
    .toLowerCase()
    .includes(GENERAL_COUNTER_KEYWORD);
}

function normalizeAppointmentTime(value) {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmedValue)) return trimmedValue;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmedValue)) return trimmedValue.slice(0, 5);

  return null;
}

function getAppointmentStartTime(appointment) {
  return (
    normalizeAppointmentTime(appointment.appointment_time) ||
    normalizeAppointmentTime(appointment.slot_id) ||
    "00:00"
  );
}

function buildAppointmentDateTime(date, timeValue) {
  const startTimeStr = normalizeAppointmentTime(timeValue) || "00:00";
  return `${date}T${startTimeStr}:00+07:00`;
}

async function getCounterInfo(supabase, counterId) {
  const { data } = await supabase
    .from("counters")
    .select("*")
    .eq("id", counterId)
    .single();
  return data;
}

function toAppointmentSummary(appointment, counter) {
  const startTimeStr = getAppointmentStartTime(appointment);
  const appointmentAt = buildAppointmentDateTime(
    appointment.appointment_date,
    startTimeStr,
  );

  // Dynamic expiration check
  let status = appointment.status;
  const gracePeriodMinutes = 30;
  if (
    status === "confirmed" &&
    dayjs().isAfter(dayjs(appointmentAt).add(gracePeriodMinutes, "minute"))
  ) {
    status = "expired";
  }

  return {
    id: appointment.id,
    patient_id: appointment.patient_id,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time || null,
    slot_id: appointment.slot_id || null,
    notes: appointment.notes || null,
    status,
    statusLabel: getStatusLabel(status),
    counterName: counter?.name || "Quầy",
    counterRoom: counter?.room || "Phòng",
    counters: counter ? { name: counter.name, room: counter.room } : null,
    appointmentAt,
    qrCodeUrl: appointment.qr_code || undefined,
    profiles: appointment.profiles || null,
  };
}

async function getOwnedAppointment(supabase, id, patientId, columns = "*") {
  return supabase
    .from("appointments")
    .select(columns)
    .eq("id", id)
    .eq("patient_id", patientId)
    .single();
}

// GET /api/appointments?status=...&upcoming=true
router.get("/", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { status, upcoming } = req.query;
  const { role, id: userId } = req.user;

  let selectQuery = "*, counters(*)";
  if (role === "admin" || role === "doctor") {
    selectQuery = "*, counters(*), profiles!fk_appointments_patient(fullname, phone)";
  }

  let query = supabase
    .from("appointments")
    .select(selectQuery)
    .order("appointment_date", { ascending: true })
    .order("slot_id", { ascending: true });

  if (role !== "admin" && role !== "doctor") {
    query = query.eq("patient_id", userId);
  }
  // admin: không filter → lấy toàn bộ

  if (status) query = query.eq("status", status);
  if (upcoming !== "false") {
    const todayVN = getTodayVN();
    query = query.gte("appointment_date", todayVN);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({
    success: true,
    appointments: (data || []).map((appt) =>
      toAppointmentSummary(appt, appt.counters),
    ),
  });
});

// GET /api/appointments/history
router.get("/history", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { role, id: userId } = req.user;

  let selectQuery = "*, counters(*)";
  if (role === "admin" || role === "doctor") {
    selectQuery = "*, counters(*), profiles!fk_appointments_patient(fullname, phone)";
  }

  let query = supabase
    .from("appointments")
    .select(selectQuery)
    .order("appointment_date", { ascending: false })
    .order("slot_id", { ascending: false });

  if (role !== "admin" && role !== "doctor") {
    query = query.eq("patient_id", userId);
  }
  // admin: không filter

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.json({
    success: true,
    appointments: (data || []).map((appt) =>
      toAppointmentSummary(appt, appt.counters),
    ),
  });
});

// GET /api/appointments/overview — Dashboard aggregate data
router.get("/overview", async (req, res) => {
  try {
    const supabase = supabaseClient.getSupabaseClient(req);
    const patientId = req.user.id;
    const todayVN = getTodayVN();

    const { data: allAppointments, error } = await supabase
      .from("appointments")
      .select("*, counters(*)")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: true })
      .order("slot_id", { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Fetch test results for dashboard
    const { data: resultsData, error: resultsError } = await supabase
      .from("test_results")
      .select(`
        id,
        result,
        diagnosis,
        pdf_url,
        created_at,
        appointments!inner (
          patient_id,
          counters (
            name
          )
        )
      `)
      .eq("appointments.patient_id", patientId)
      .order("created_at", { ascending: false });

    if (resultsError) {
      console.error("[GET /overview] Fetching test results failed:", resultsError.message);
    }

    const appointments = allAppointments || [];

    const upcoming = appointments.filter(
      (a) =>
        (a.status === "confirmed" || a.status === "checked-in") &&
        a.appointment_date >= todayVN,
    );

    const completed = appointments.filter((a) => a.status === "completed");

    const nextRaw = upcoming.find((a) => a.status === "confirmed") ?? null;
    const nextAppointment = nextRaw
      ? toAppointmentSummary(nextRaw, nextRaw.counters)
      : null;

    const mappedResults = (resultsData || []).slice(0, 3).map((r) => ({
      id: r.id,
      examName: r.appointments?.counters?.name || "Kết quả khám",
      reportedAt: r.created_at,
      summary: `Chẩn đoán: ${r.diagnosis || "Chưa có"}`,
      status: "reviewed",
      statusLabel: "Đã có kết quả",
      pdfUrl: r.pdf_url,
    }));

    return res.json({
      success: true,
      overview: {
        upcomingCount: upcoming.length,
        completedCount: completed.length,
        unreadResultsCount: (resultsData || []).length,
        billingOutstanding: 0,
        nextAppointment,
        recentResults: mappedResults,
      },
    });
  } catch (err) {
    console.error("[GET /overview] Lỗi hệ thống:", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// GET /api/appointments/latest-qr
// (Moved here BEFORE /:id to prevent route conflict)
router.get("/latest-qr", async (req, res) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });

  const supabase = supabaseClient.getSupabaseClient(req);
  const todayVN = getTodayVN();

  const { data, error } = await supabase
    .from("appointments")
    .select("*, counters(*)")
    .eq("patient_id", req.user.id)
    .in("status", ["confirmed", "checked-in", "completed", "cancelled"])
    .gte("appointment_date", todayVN)
    .order("appointment_date", { ascending: true })
    .order("slot_id", { ascending: true })
    .limit(10);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  if (!data || data.length === 0) {
    return res.json({ success: true, data: null });
  }

  const nowDayjs = dayjs();
  const appointment =
    data.find((appt) => {
      if (appt.status !== "confirmed") return false;
      const slotTime = getAppointmentStartTime(appt);
      const apptAt = dayjs(
        buildAppointmentDateTime(appt.appointment_date, slotTime),
      );
      return nowDayjs.isBefore(apptAt);
    }) || data[0];

  // Auto-regenerate qr_code if missing (e.g. legacy appointments)
  let qrValue = appointment.qr_code;
  if (!qrValue) {
    qrValue = cryptoHelper.encrypt(appointment.id);
    await supabase
      .from("appointments")
      .update({ qr_code: qrValue })
      .eq("id", appointment.id);
  }

  const startTimeStr = getAppointmentStartTime(appointment);
  const appointmentAt = buildAppointmentDateTime(
    appointment.appointment_date,
    startTimeStr,
  );
  const expiresAt = appointmentAt;

  let status = "active";
  if (appointment.status === "cancelled") {
    status = "cancelled";
  } else if (appointment.status === "expired") {
    status = "expired";
  } else if (
    appointment.status === "checked-in" ||
    appointment.status === "completed"
  ) {
    status = "used";
  } else if (dayjs().isAfter(dayjs(expiresAt).add(30, "minute"))) {
    // Grace period 30 phút sau giờ khám
    status = "expired";
  }

  const statusLabels = {
    active: "Còn hiệu lực",
    used: "Đã sử dụng",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy",
  };

  const appStatus = appointment.status === "confirmed" && dayjs().isAfter(dayjs(expiresAt).add(30, "minute")) ? "expired" : appointment.status;

  const responseData = {
    appointmentId: appointment.id,
    qrValue,
    expiresAt,
    status,
    statusLabel: statusLabels[status],
    counterName: appointment.counters?.name || "Quầy",
    counterRoom: appointment.counters?.room || "Phòng",
    appointmentAt,
    appointmentStatus: appStatus,
    appointmentStatusLabel: getStatusLabel(appStatus),
  };

  return res.json({ success: true, data: responseData });
});

// GET /api/appointments/:id
router.get("/:id", async (req, res, next) => {
  if (!UUID_REGEX.test(req.params.id)) {
    return next();
  }

  const supabase = supabaseClient.getSupabaseClient(req);
  const { data, error } = await supabase
    .from("appointments")
    .select("*, counters(*)")
    .eq("id", req.params.id)
    .eq("patient_id", req.user.id)
    .single();

  if (error || !data) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy lịch hẹn." });
  }

  return res.json({
    success: true,
    appointment: data,
    summary: toAppointmentSummary(data, data.counters),
  });
});

// POST /api/appointments
router.post("/", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { counterId, appointmentDate, slotId } = req.body || {};

  // Anti-abuse: Block booking if patient has >= 3 expired/no-show appointments (in the last 30 days)
  const nowVN = dayjs().utcOffset(7);
  const thirtyDaysAgoStr = nowVN.subtract(30, "day").format("YYYY-MM-DD");

  const { data: patientAppts, error: countExpiredError } = await supabase
    .from("appointments")
    .select("id, appointment_date, slot_id, appointment_time, status")
    .eq("patient_id", req.user.id)
    .in("status", ["confirmed", "expired"])
    .gte("appointment_date", thirtyDaysAgoStr);

  if (countExpiredError) {
    return res.status(500).json({
      success: false,
      message: countExpiredError.message
    });
  }

  let expiredCount = 0;
  if (patientAppts) {
    for (const appt of patientAppts) {
      if (appt.status === "expired") {
        expiredCount++;
      } else if (appt.status === "confirmed") {
        const startTimeStr = getAppointmentStartTime(appt);
        const apptDateTime = dayjs(`${appt.appointment_date}T${startTimeStr}:00+07:00`);
        if (nowVN.isAfter(apptDateTime.add(30, "minute"))) {
          expiredCount++;
        }
      }
    }
  }

  if (expiredCount >= 3) {
    return res.status(403).json({
      success: false,
      message: "Tài khoản của bạn đã bị khóa tính năng đặt lịch do không đến khám đúng hẹn từ 3 lần trở lên.",
    });
  }

  if (!counterId || !appointmentDate || !slotId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết.",
    });
  }

  if (!UUID_REGEX.test(counterId)) {
    return res.status(400).json({
      success: false,
      message: "Mã quầy không hợp lệ.",
    });
  }

  const parsedDate = dayjs(appointmentDate);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày khám không hợp lệ.",
    });
  }

  // Combine date + slot time into a full datetime in Vietnam timezone (+07:00)
  const appointmentDateTime = dayjs(
    buildAppointmentDateTime(appointmentDate, slotId),
  );

  if (!appointmentDateTime.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Thời gian khám không hợp lệ.",
    });
  }

  if (appointmentDateTime.isBefore(dayjs())) {
    return res.status(400).json({
      success: false,
      message: "Thời gian khám không được ở trong quá khứ.",
    });
  }

  const counter = await getCounterInfo(supabase, counterId);
  if (!counter) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy quầy." });
  }

  // Verify weekend rules
  const dayOfWeek = dayjs(appointmentDate).day();
  if (dayOfWeek === 0) {
    return res.status(400).json({
      success: false,
      message: "Bệnh viện không làm việc ngày Chủ nhật.",
    });
  }
  if (dayOfWeek === 6 && !isGeneralCounter(counter.name)) {
    return res.status(400).json({
      success: false,
      message: "Thứ 7 chỉ mở cho Quầy Khám tổng quát.",
    });
  }

  // Check duplicate booking for the SAME patient on the same day + slot
  const { data: existingForPatient, error: checkPatientError } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", req.user.id)
    .eq("appointment_date", appointmentDate)
    .eq("slot_id", slotId)
    .neq("status", "cancelled");

  if (checkPatientError) {
    return res
      .status(500)
      .json({ success: false, message: checkPatientError.message });
  }

  if (existingForPatient && existingForPatient.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Bạn đã đặt lịch ở thời gian này rồi.",
    });
  }

  // Check capacity
  const { data: existingSlots, error: checkSlotsError } = await supabase
    .from("appointments")
    .select("id")
    .eq("counter_id", counterId)
    .eq("appointment_date", appointmentDate)
    .eq("slot_id", slotId)
    .neq("status", "cancelled");

  if (checkSlotsError) {
    return res
      .status(500)
      .json({ success: false, message: checkSlotsError.message });
  }

  if (existingSlots && existingSlots.length >= CAPACITY_PER_SLOT) {
    return res.status(409).json({
      success: false,
      message: "Slot này đã đầy. Vui lòng chọn giờ khác.",
    });
  }

  const appointmentId = crypto.randomUUID();
  const qrCode = cryptoHelper.encrypt(appointmentId);

  const { data: createdAppointment, error: insertError } = await supabase
    .from("appointments")
    .insert([
      {
        id: appointmentId,
        counter_id: counterId,
        patient_id: req.user.id,
        appointment_date: appointmentDate,
        appointment_time: slotId, // store time here as well if needed
        slot_id: slotId,
        status: "confirmed",
        qr_code: qrCode,
      },
    ])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({
      success: false,
      message: insertError.message || "Không thể tạo lịch hẹn.",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Đặt lịch thành công.",
    appointment: toAppointmentSummary(createdAppointment, counter),
  });
});

// DELETE /api/appointments/:id
router.delete("/:id", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { reason } = req.body || {};
  const { role, id: userId } = req.user;

  // Admin có thể hủy bất kỳ lịch nào; patient chỉ hủy lịch của mình
  let appointmentFetch;
  if (role === "admin") {
    appointmentFetch = await supabase
      .from("appointments")
      .select("*")
      .eq("id", req.params.id)
      .single();
  } else {
    appointmentFetch = await getOwnedAppointment(
      supabase,
      req.params.id,
      userId,
      "*",
    );
  }

  const { data: appointment, error: fetchError } = appointmentFetch;

  if (fetchError || !appointment) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy lịch hẹn." });
  }

  if (appointment.status === "cancelled") {
    return res
      .status(400)
      .json({ success: false, message: "Lịch đã được hủy." });
  }
  if (appointment.status !== "confirmed") {
    return res.status(400).json({
      success: false,
      message: "Chỉ có thể hủy lịch hẹn ở trạng thái đã xác nhận.",
    });
  }

  const startTimeStr = getAppointmentStartTime(appointment);
  const appointmentDateTime = dayjs(
    buildAppointmentDateTime(appointment.appointment_date, startTimeStr),
  );

  if (role !== "admin" && appointmentDateTime.diff(dayjs(), "hour") < 24) {
    return res.status(400).json({
      success: false,
      message: "Không thể hủy trong vòng 24h trước giờ khám.",
    });
  }

  // Anti-spam: max 3 cancellations in 7 days
  if (role !== "admin") {
    const sevenDaysAgo = dayjs().subtract(7, "day").toISOString();
    const { data: recentCancellations, error: countError } = await supabase
      .from("cancellation_logs")
      .select("id", { count: "exact" })
      .eq("patient_id", req.user.id)
      .gte("cancelled_at", sevenDaysAgo);

    if (countError) {
      return res
        .status(500)
        .json({ success: false, message: countError.message });
    }

    if (recentCancellations && recentCancellations.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã hủy lịch tối đa 3 lần trong tuần. Không thể hủy thêm.",
      });
    }
  }

  const cancelledAt = new Date().toISOString();

  // Transaction-like updates
  let updateQuery = supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_at: cancelledAt,
      cancellation_reason: reason,
    })
    .eq("id", req.params.id);

  if (role !== "admin") {
    updateQuery = updateQuery.eq("patient_id", userId);
  }

  const { error: updateError } = await updateQuery;

  if (updateError) {
    return res
      .status(500)
      .json({ success: false, message: updateError.message });
  }

  // Log
  await supabase.from("cancellation_logs").insert([
    {
      appointment_id: req.params.id,
      patient_id: appointment.patient_id,
      reason: reason || "",
      cancelled_by: req.user.id,
      cancelled_at: cancelledAt,
    },
  ]);

  return res.json({
    success: true,
    message: "Hủy lịch thành công.",
  });
});

// POST /api/appointments/verify-qr
// (Moved here BEFORE /:id/check-in to prevent Express route conflict)
router.post("/verify-qr", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { value } = req.body || {};

  const valTrimmed = String(value || "").trim();
  if (!valTrimmed) {
    return res.status(400).json({
      success: false,
      data: { outcome: "invalid", message: "Thiếu thông tin mã QR hoặc mã check-in." },
    });
  }

  let appointmentId = null;

  if (valTrimmed.length === 8 && /^[0-9a-f]{8}$/i.test(valTrimmed)) {
    // Treat as 8-character hex short check-in code (first 8 chars of UUID)
    const shortCode = valTrimmed.toLowerCase();
    
    // Use DB-level filter with ilike to find UUID starting with the short code
    const { data: appts, error: fetchErr } = await supabase
      .from("appointments")
      .select("id")
      .in("status", ["confirmed", "checked-in"])
      .gte("id", `${shortCode}-0000-0000-0000-000000000000`)
      .lte("id", `${shortCode}-ffff-ffff-ffff-ffffffffffff`)
      .limit(1);
    
    if (fetchErr) {
      return res.status(500).json({
        success: false,
        message: "Lỗi kết nối cơ sở dữ liệu.",
        detail: fetchErr.message,
      });
    }

    if (!appts || appts.length === 0) {
      return res.json({
        success: true,
        data: {
          outcome: "invalid",
          message: "Không tìm thấy lịch hẹn khớp với mã nhập tay.",
        },
      });
    }
    appointmentId = appts[0].id;
  } else {
    appointmentId = cryptoHelper.decrypt(valTrimmed);
    if (!appointmentId) {
      return res.json({
        success: true,
        data: {
          outcome: "invalid",
          message: "Mã QR không hợp lệ hoặc đã bị thay đổi.",
        },
      });
    }
  }

  if (!UUID_REGEX.test(appointmentId)) {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Mã QR không hợp lệ hoặc đã bị thay đổi.",
      },
    });
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*, counters(*), profiles!fk_appointments_patient(fullname)")
    .eq("id", appointmentId)
    .single();

  if (error || !appointment) {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Không tìm thấy thông tin lịch hẹn khám.",
      },
    });
  }

  if (
    appointment.status === "checked-in" ||
    appointment.status === "completed" ||
    appointment.qr_scanned_at
  ) {
    return res.json({
      success: true,
      data: {
        outcome: "duplicate",
        message: "Mã QR này đã được sử dụng. Bệnh nhân đã check-in rồi.",
        appointmentId: appointment.id,
        patientName: appointment.profiles?.fullname || "Bệnh nhân",
        counterName: appointment.counters?.name,
        counterRoom: appointment.counters?.room,
        appointmentAt: buildAppointmentDateTime(
          appointment.appointment_date,
          getAppointmentStartTime(appointment),
        ),
        checkedInAt: appointment.qr_scanned_at || new Date().toISOString(),
      },
    });
  }

  if (appointment.status === "expired") {
    return res.json({
      success: true,
      data: {
        outcome: "expired",
        message: "Mã QR này đã hết hạn do bệnh nhân không đến khám đúng giờ.",
        appointmentAt: buildAppointmentDateTime(
          appointment.appointment_date,
          getAppointmentStartTime(appointment),
        ),
        patientName: appointment.profiles?.fullname || "Bệnh nhân",
        counterName: appointment.counters?.name,
        counterRoom: appointment.counters?.room,
      },
    });
  }

  if (appointment.status === "cancelled") {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Lịch khám này đã bị hủy bỏ trước đó.",
      },
    });
  }

  const expiresAt = buildAppointmentDateTime(
    appointment.appointment_date,
    getAppointmentStartTime(appointment),
  );
  const gracePeriodMinutes = 30;
  if (dayjs().isAfter(dayjs(expiresAt).add(gracePeriodMinutes, "minute"))) {
    return res.json({
      success: true,
      data: {
        outcome: "expired",
        message: "Mã QR này đã quá thời hạn check-in (hơn 30 phút sau giờ hẹn).",
        appointmentAt: expiresAt,
        patientName: appointment.profiles?.fullname || "Bệnh nhân",
        counterName: appointment.counters?.name,
        counterRoom: appointment.counters?.room,
      },
    });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "checked-in", qr_scanned_at: now, updated_at: now })
    .eq("id", appointment.id)
    .eq("status", "confirmed");

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái check-in.",
      detail: updateError.message,
    });
  }

  const patientName = appointment.profiles?.fullname || "Bệnh nhân";

  return res.json({
    success: true,
    data: {
      outcome: "valid",
      message:
        "Xác thực mã QR thành công. Bệnh nhân đã được check-in vào phòng khám.",
      appointmentId: appointment.id,
      patientName,
      counterName: appointment.counters?.name,
      counterRoom: appointment.counters?.room,
      appointmentAt: buildAppointmentDateTime(
        appointment.appointment_date,
        getAppointmentStartTime(appointment),
      ),
      checkedInAt: now,
    },
  });
});

// POST /api/appointments/:id/check-in
// Admin or Doctor checks in a patient manually (manual override, not via QR scan)
router.post("/:id/check-in", requireRole(["admin", "doctor"]), async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const appointmentId = req.params.id;

  if (!UUID_REGEX.test(appointmentId)) {
    return res.status(400).json({
      success: false,
      message: "Mã lịch hẹn không hợp lệ.",
    });
  }

  // Get current appointment status
  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appointment) {
    return res.status(404).json({
      success: false,
      message: "Không tìm thấy lịch hẹn.",
    });
  }

  if (appointment.status === "cancelled") {
    return res.status(400).json({
      success: false,
      message: "Không thể check-in lịch hẹn đã bị hủy.",
    });
  }

  if (appointment.status === "completed" || appointment.status === "checked-in") {
    return res.status(400).json({
      success: false,
      message: `Lịch hẹn đã ở trạng thái ${appointment.status === "completed" ? "đã khám" : "đã check-in"}.`,
    });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "checked-in", qr_scanned_at: now, updated_at: now })
    .eq("id", appointmentId)
    .eq("status", "confirmed");

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái check-in.",
      detail: updateError.message,
    });
  }

  return res.json({
    success: true,
    message: "Check-in bệnh nhân thành công.",
  });
});


module.exports = router;
