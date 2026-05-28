const express = require("express");
const dayjs = require("dayjs");
const crypto = require("crypto");
const supabaseClient = require("../utils/supabaseClient");
const cryptoHelper = require("../utils/crypto");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

const SLOT_TIMES = {
  "slot-1": "08:00",
  "slot-2": "08:30",
  "slot-3": "09:00",
  "slot-4": "09:30",
};

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
    default:
      return "Đang xử lý";
  }
}

function toAppointmentSummary(appointment) {
  const startTimeStr = SLOT_TIMES[appointment.slot_id] || "00:00";
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
  let query = supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", req.user.id)
    .order("appointment_date", { ascending: true });

  if (status) query = query.eq("status", status);
  if (upcoming !== "false") {
    const todayVN = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    query = query.gte("appointment_date", todayVN);
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

// GET /api/appointments/latest-qr
router.get("/latest-qr", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const todayVN = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", req.user.id)
    .in("status", ["confirmed", "checked-in", "completed", "cancelled"])
    .gte("appointment_date", todayVN)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })
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
      const slotTime = SLOT_TIMES[appt.slot_id] || appt.appointment_time || "00:00";
      const apptAt = dayjs(`${appt.appointment_date}T${slotTime}:00+07:00`);
      return nowDayjs.isBefore(apptAt);
    }) || data[0];
  const startTimeStr =
    SLOT_TIMES[appointment.slot_id] || appointment.appointment_time || "00:00";
  const appointmentAt = `${appointment.appointment_date}T${startTimeStr}:00+07:00`;

  // QR expires after the appointment time
  const expiresAt = appointmentAt;

  let status = "active";
  if (appointment.status === "cancelled") {
    status = "cancelled";
  } else if (
    appointment.status === "checked-in" ||
    appointment.status === "completed"
  ) {
    status = "used";
  } else if (dayjs().isAfter(dayjs(expiresAt))) {
    status = "expired";
  }

  const statusLabels = {
    active: "Còn hiệu lực",
    used: "Đã sử dụng",
    expired: "Đã hết hạn",
    cancelled: "Đã hủy",
  };

  const responseData = {
    appointmentId: appointment.id,
    qrValue: appointment.qr_code,
    expiresAt,
    status,
    statusLabel: statusLabels[status],
    doctorName: appointment.doctor_name || "Bác sĩ",
    specialty: appointment.specialty || "",
    appointmentAt,
    location: appointment.location || "Phòng khám MedCare",
    appointmentStatus: appointment.status,
    appointmentStatusLabel: getStatusLabel(appointment.status),
  };

  return res.json({ success: true, data: responseData });
});

// POST /api/appointments/verify-qr
router.post("/verify-qr", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { value } = req.body || {};

  if (!value) {
    return res.status(400).json({
      success: false,
      data: {
        outcome: "invalid",
        message: "Thiếu thông tin mã QR.",
      },
    });
  }

  // Decrypt QR value to extract appointmentId
  const appointmentId = cryptoHelper.decrypt(value);
  if (!appointmentId) {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Mã QR không hợp lệ hoặc đã bị thay đổi.",
      },
    });
  }

  // Validate UUID format before querying to avoid DB syntax errors
  // caused by tampered QR codes decrypted with a mismatched key.
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(appointmentId)) {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Mã QR không hợp lệ hoặc đã bị thay đổi.",
      },
    });
  }

  // Fetch appointment by decrypted ID
  const { data: appointment, error } = await supabase
    .from("appointments")
    .select("*")
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

  // Check if already checked in or completed
  if (
    appointment.status === "checked-in" ||
    appointment.status === "completed" ||
    appointment.qr_scanned_at
  ) {
    return res.json({
      success: true,
      data: {
        outcome: "duplicate",
        message: "Mã QR này đã được sử dụng. Đã check-in rồi.",
        appointmentId: appointment.id,
        doctorName: appointment.doctor_name,
        specialty: appointment.specialty,
        location: appointment.location,
        appointmentAt: `${appointment.appointment_date}T${appointment.appointment_time || "00:00"}:00+07:00`,
        checkedInAt: appointment.qr_scanned_at || new Date().toISOString(),
      },
    });
  }

  // Check if cancelled
  if (appointment.status === "cancelled") {
    return res.json({
      success: true,
      data: {
        outcome: "invalid",
        message: "Lịch khám này đã bị hủy bỏ trước đó.",
      },
    });
  }

  // Check if expired (QR expires after the appointment time + 30 minutes grace period)
  const expiresAt = `${appointment.appointment_date}T${appointment.appointment_time || "00:00"}:00+07:00`;
  const gracePeriodMinutes = 30;
  if (dayjs().isAfter(dayjs(expiresAt).add(gracePeriodMinutes, "minute"))) {
    return res.json({
      success: true,
      data: {
        outcome: "expired",
        message:
          "Mã QR này đã quá thời hạn check-in (lịch hẹn đã quá giờ khám).",
      },
    });
  }

  const now = new Date().toISOString();
  const { data: updatedData, error: updateError } = await supabase
    .from("appointments")
    .update({
      status: "checked-in",
      qr_scanned_at: now,
      updated_at: now,
    })
    .eq("id", appointment.id)
    .eq("status", "confirmed")
    .select();

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái check-in.",
      detail: updateError.message,
    });
  }

  if (!updatedData || updatedData.length === 0) {
    return res.json({
      success: true,
      data: {
        outcome: "duplicate",
        message: "Mã QR này đã được sử dụng. Đã check-in rồi.",
        appointmentId: appointment.id,
        doctorName: appointment.doctor_name,
        specialty: appointment.specialty,
        location: appointment.location,
        appointmentAt: `${appointment.appointment_date}T${appointment.appointment_time || "00:00"}:00+07:00`,
        checkedInAt: appointment.qr_scanned_at || now,
      },
    });
  }

  // Fetch patient name if profiles is accessible (or return default patient name)
  let patientName = "Bệnh nhân";
  const { data: patientProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", appointment.patient_id)
    .single();

  if (patientProfile) {
    patientName = patientProfile.full_name || "Bệnh nhân";
  }

  return res.json({
    success: true,
    data: {
      outcome: "valid",
      message:
        "Xác thực mã QR thành công. Bệnh nhân đã được check-in vào phòng khám.",
      appointmentId: appointment.id,
      patientName,
      doctorName: appointment.doctor_name,
      specialty: appointment.specialty,
      location: appointment.location,
      appointmentAt: `${appointment.appointment_date}T${appointment.appointment_time || "00:00"}:00+07:00`,
      checkedInAt: now,
    },
  });
});

// GET /api/appointments/:id
router.get("/:id", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { data, error } = await getOwnedAppointment(
    supabase,
    req.params.id,
    req.user.id,
  );

  if (error || !data) {
    return res
      .status(404)
      .json({ success: false, message: "Khong tim thay lich hen." });
  }

  return res.json({
    success: true,
    appointment: data,
  });
});

// POST /api/appointments
router.post("/", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { doctorId, appointmentDate, slotId, doctorName, specialty, location } =
    req.body || {};

  if (!doctorId || !appointmentDate || !slotId) {
    return res.status(400).json({
      success: false,
      message: "Thieu thong tin can thiet.",
    });
  }

  const parsedDate = dayjs(appointmentDate);
  if (!parsedDate.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày khám không hợp lệ.",
    });
  }

  // Validate both appointment date and the slot start time (Vietnam timezone) so we
  // block booking slots that are already in the past on the current day.
  const startTimeStr = SLOT_TIMES[slotId];
  if (!startTimeStr) {
    return res.status(400).json({
      success: false,
      message: "Khung giờ khám không hợp lệ.",
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
      message: "Thời gian khám không hợp lệ.",
    });
  }

  if (appointmentDateTime.isBefore(dayjs())) {
    return res.status(400).json({
      success: false,
      message: "Thời gian khám không được ở trong quá khứ.",
    });
  }

  const { data: existing, error: checkError } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", appointmentDate)
    .eq("slot_id", slotId)
    .neq("status", "cancelled");

  if (checkError) {
    return res
      .status(500)
      .json({ success: false, message: checkError.message });
  }

  if (existing && existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: "Slot nay da duoc dat.",
    });
  }

  const appointmentId = crypto.randomUUID();
  const qrCode = cryptoHelper.encrypt(appointmentId);

  const { data: createdAppointment, error: insertError } = await supabase
    .from("appointments")
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
        status: "confirmed",
        qr_code: qrCode,
      },
    ])
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Slot này đã được đặt. Vui lòng chọn giờ khác.",
      });
    }
    return res.status(500).json({
      success: false,
      message: insertError.message || "Khong the tao lich hen.",
    });
  }

  if (!createdAppointment) {
    return res
      .status(500)
      .json({ success: false, message: "Khong the tao lich hen." });
  }

  return res.status(201).json({
    success: true,
    message: "Dat lich thanh cong.",
    appointment: toAppointmentSummary(createdAppointment),
  });
});

// DELETE /api/appointments/:id
router.delete("/:id", async (req, res) => {
  const supabase = supabaseClient.getSupabaseClient(req);
  const { data: appointment, error: fetchError } = await getOwnedAppointment(
    supabase,
    req.params.id,
    req.user.id,
    "appointment_date, status, slot_id",
  );

  if (fetchError || !appointment) {
    return res.status(404).json({
      success: false,
      message: "Khong tim thay lich hen.",
    });
  }

  if (appointment.status === "cancelled") {
    return res.status(400).json({
      success: false,
      message: "Lich da duoc huy.",
    });
  }
  if (appointment.status !== "confirmed") {
    return res.status(400).json({
      success: false,
      message: "Chỉ có thể hủy lịch hẹn ở trạng thái đã xác nhận.",
    });
  }

  const startTimeStr = SLOT_TIMES[appointment.slot_id] || "00:00";
  // Parse using Vietnam timezone offset to avoid server-local timezone drift (e.g. UTC on cloud).
  const appointmentDateTime = dayjs(
    `${appointment.appointment_date}T${startTimeStr}:00+07:00`,
  );

  if (appointmentDateTime.diff(dayjs(), "hour") < 24) {
    return res.status(400).json({
      success: false,
      message: "Khong the huy trong vong 24h truoc gio kham.",
    });
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", req.params.id)
    .eq("patient_id", req.user.id);

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: updateError.message,
    });
  }

  return res.json({
    success: true,
    message: "Huy lich thanh cong.",
  });
});

module.exports = router;
