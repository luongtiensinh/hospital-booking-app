const express = require("express");
const router = express.Router();
const supabase = require("../utils/supabaseClient");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

function ensureArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function isValidIndicators(indicators) {
    if (!Array.isArray(indicators)) return false;
    return indicators.every((i) => {
        if (!i || typeof i !== "object") return false;
        return typeof i.label === "string" && typeof i.value !== "undefined" && typeof i.unit === "string";
    });
}

function sanitizeText(s) {
    return typeof s === "string" ? s.trim() : "";
}

async function getPatientIdFromAppointment(supabaseClient, appointmentId) {
    return supabaseClient
        .from("appointments")
        .select("id, patient_id")
        .eq("id", appointmentId)
        .single();
}

async function getRoleForUser(supabaseClient, userId) {
    const { data, error } = await supabaseClient.from("profiles").select("role").eq("id", userId).single();
    if (error) return null;
    return data?.role ?? null;
}

// POST /api/medical-results (doctor)
router.post("/", requireAuth, requireRole(['doctor', 'admin']), async (req, res) => {
    const client = supabase.getSupabaseClient(req);

    const { appointment_id, diagnosis, indicators, conclusion } = req.body || {};

    if (!appointment_id) {
        return res.status(400).json({ success: false, message: "Thiếu appointment_id." });
    }

    const diagnosisStr = sanitizeText(diagnosis);
    const conclusionStr = sanitizeText(conclusion);

    if (!diagnosisStr) {
        return res.status(400).json({ success: false, message: "Chẩn đoán không được để trống." });
    }
    if (!conclusionStr) {
        return res.status(400).json({ success: false, message: "Kết luận không được để trống." });
    }

    const indicatorsArr = ensureArray(indicators);
    if (!isValidIndicators(indicatorsArr)) {
        return res.status(400).json({
            success: false,
            message: "indicators không hợp lệ. Mỗi chỉ số cần {label, value, unit}",
        });
    }

    const { data: appt, error: apptError } = await getPatientIdFromAppointment(client, appointment_id);
    if (apptError || !appt) {
        return res.status(404).json({ success: false, message: "Không tìm thấy lịch hẹn hoặc không truy cập được." });
    }

    const id = require("crypto").randomUUID();
    const now = new Date().toISOString();

    // Insert medical_result
    const { data: created, error: insertError } = await client
        .from("medical_results")
        .insert([
            {
                id,
                appointment_id,
                patient_id: appt.patient_id,
                doctor_id: req.user.id,
                diagnosis: diagnosisStr,
                indicators: indicatorsArr,
                conclusion: conclusionStr,
                created_at: now,
            },
        ])
        .select()
        .single();

    if (insertError || !created) {
        return res.status(500).json({ success: false, message: insertError?.message || "Không thể lưu kết quả." });
    }

    // Notification for patient
    // If notifications table isn't ready, log only.
    const { error: notifError } = await client.from("notifications").insert([
        {
            id: require("crypto").randomUUID(),
            patient_id: appt.patient_id,
            appointment_id,
            type: "medical_result",
            title: "Có kết quả xét nghiệm mới",
            message: "Bác sĩ đã gửi kết quả xét nghiệm.",
            read_at: null,
            created_at: now,
        },
    ]);

    if (notifError) {
        console.error("[medical-results] notification insert error:", notifError);
    }

    return res.status(201).json({ success: true, result: created });
});

// GET /api/medical-results (patient, doctor, admin)
router.get("/", requireAuth, requireRole(['patient', 'doctor', 'admin']), async (req, res) => {
    const client = supabase.getSupabaseClient(req);

    let query = client
        .from("medical_results")
        .select(
            "id, appointment_id, doctor_id, diagnosis, indicators, conclusion, created_at, appointments(appointment_date, slot_id, appointment_time)"
        )
        .order("created_at", { ascending: false });

    if (req.user.role === 'patient') {
        query = query.eq("patient_id", req.user.id);
    } else if (req.user.role === 'doctor') {
        query = query.eq("doctor_id", req.user.id);
    }

    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    const mapped = (data || []).map((r) => ({
        id: r.id,
        appointmentId: r.appointment_id,
        doctorId: r.doctor_id,
        diagnosis: r.diagnosis,
        indicators: r.indicators || [],
        conclusion: r.conclusion,
        createdAt: r.created_at,
        appointmentDate: r.appointments?.appointment_date,
        appointmentSlotId: r.appointments?.slot_id,
    }));

    return res.json({ success: true, data: mapped });
});

// GET /api/medical-results/:id/pdf (patient, doctor, admin)
router.get("/:id/pdf", requireAuth, requireRole(['patient', 'doctor', 'admin']), async (req, res) => {
    const client = supabase.getSupabaseClient(req);

    let query = client
        .from("medical_results")
        .select(
            "id, appointment_id, diagnosis, indicators, conclusion, created_at, appointments(appointment_date, slot_id, appointment_time), profiles:patient_id(fullname)"
        )
        .eq("id", req.params.id);

    if (req.user.role === 'patient') {
        query = query.eq("patient_id", req.user.id);
    } else if (req.user.role === 'doctor') {
        query = query.eq("doctor_id", req.user.id);
    }

    const { data: result, error } = await query.single();

    if (error || !result) {
        return res.status(404).json({ success: false, message: "Không tìm thấy kết quả." });
    }

    const patientName = result.profiles?.fullname || "Bệnh nhân";
    const appointmentDate = result.appointments?.appointment_date;

    const indicatorsLines = (result.indicators || [])
        .map((i) => `${i.label}: ${i.value} ${i.unit}`)
        .join("\\n");

    const text = [
        "KẾT QUẢ XÉT NGHIỆM",
        `Bệnh nhân: ${patientName}`,
        `Ngày khám: ${appointmentDate || ""}`,
        "---",
        "Chẩn đoán:",
        `${result.diagnosis}`,
        "---",
        "Chỉ số:",
        indicatorsLines,
        "---",
        "Kết luận:",
        `${result.conclusion}`,
        "---",
        `Phát hành lúc: ${new Date(result.created_at).toLocaleString("vi-VN")}`,
    ].join("\\n");

    const esc = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

    // Minimal PDF text-only (best-effort, không cần lib ngoài)
    const pdf = `
%PDF-1.3
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 2500 >>
stream
BT
/F1 12 Tf
72 740 Td
0 -16 Td
(${esc}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000061 00000 n 
0000000114 00000 n 
0000000219 00000 n 
0000000901 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
980
%%EOF`;

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Result-${result.appointment_id}.pdf"`,
    });

    res.send(Buffer.from(pdf, "utf8"));
});

module.exports = router;

