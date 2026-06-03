const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);

// ---------------------------------------------------------------
// GET /api/results
// - patient:  chỉ lấy kết quả lịch hẹn của mình
// - doctor:   chỉ lấy kết quả lịch hẹn của bác sĩ đó
// - admin:    lấy toàn bộ
// ---------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let selectQuery = `
      id,
      result,
      diagnosis,
      pdf_url,
      created_at,
      updated_at,
      appointment_id,
      appointments${role === "patient" ? "!inner" : ""} (
        id,
        patient_id,
        appointment_date,
        status
      )
    `;

    let query = supabase
      .from("test_results")
      .select(selectQuery)
      .order("created_at", { ascending: false });

    if (role === "patient") {
      // Chỉ trả về kết quả cho lịch hẹn của patient hiện tại
      query = query.eq("appointments.patient_id", userId);
    }
    // admin: không thêm filter → lấy tất cả

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    // Lọc bỏ các bản ghi mà join appointments không khớp (đối với patient query)
    const results = (data || []).filter((r) => r.appointments !== null);

    return res.json({ success: true, results });
  } catch (err) {
    console.error("[GET /results]", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

// ---------------------------------------------------------------
// GET /api/results/appointments
// Dành cho bác sĩ: xem danh sách lịch hẹn hôm nay (checked-in + confirmed)
// để có thể nhập kết quả
// ---------------------------------------------------------------
router.get(
  "/appointments",
  requireRole(["doctor", "admin"]),
  async (req, res) => {
    try {
      const { role, id: userId } = req.user;

      let query = supabase
        .from("appointments")
        .select(
          `
        id,
        patient_id,
        appointment_date,
        appointment_time,
        slot_id,
        status,
        notes,
        profiles:patient_id (
          fullname,
          phone
        )
      `,
        )
        .in("status", ["confirmed", "checked-in", "completed"])
        .order("appointment_date", { ascending: true })
        .order("slot_id", { ascending: true });
      // admin: không filter → lấy tất cả

      const { data, error } = await query;
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      return res.json({ success: true, appointments: data || [] });
    } catch (err) {
      console.error("[GET /results/appointments]", err);
      return res.status(500).json({ success: false, message: "Lỗi server." });
    }
  },
);

// ---------------------------------------------------------------
// POST /api/results
// Bác sĩ hoặc admin nhập kết quả cho một lịch hẹn
// Body: { appointmentId, diagnosis, result, indicators[] }
// ---------------------------------------------------------------
router.post("/", requireRole(["doctor", "admin"]), async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { appointmentId, diagnosis, result, indicators } = req.body || {};

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu appointmentId." });
    }
    if (!diagnosis) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu chẩn đoán (diagnosis)." });
    }

    // Lưu kết quả
    const { data: newResult, error: insertError } = await supabase
      .from("test_results")
      .insert([
        {
          appointment_id: appointmentId,
          diagnosis: diagnosis.trim(),
          result: result || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return res
        .status(500)
        .json({ success: false, message: insertError.message });
    }

    // Cập nhật trạng thái lịch hẹn → completed
    await supabase
      .from("appointments")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", appointmentId);

    return res.status(201).json({
      success: true,
      message: "Đã lưu kết quả khám thành công.",
      result: newResult,
    });
  } catch (err) {
    console.error("[POST /results]", err);
    return res.status(500).json({ success: false, message: "Lỗi server." });
  }
});

module.exports = router;
