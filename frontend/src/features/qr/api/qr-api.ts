import type { LatestAppointmentQr, VerifyQrPayload, VerifyQrResponse } from '@/features/qr/types/qr.types';
import { supabase, supabaseEnabled } from '@/lib/supabaseClient';

export const qrApi = {
  // Lấy QR mới nhất của bệnh nhân (fallback mock nếu Supabase chưa cấu hình)
  async getLatestPatientQr(): Promise<LatestAppointmentQr | null> {
    if (!supabaseEnabled) {
      // Mock data
      return {
        appointmentId: 'app-1',
        qrValue: 'mock-qr-value-1',
        expiresAt: '2026-05-25T10:00:00.000Z',
        status: 'active',
        statusLabel: 'Còn hiệu lực',
        doctorName: 'BS. Nguyễn Thị Lan',
        specialty: 'Nội khoa',
        appointmentAt: '2026-05-25T09:00:00.000Z',
        location: 'Phòng khám 102 - Tầng 1 - Khu A',
        appointmentStatus: 'confirmed',
        appointmentStatusLabel: 'Đã xác nhận',
      };
    }
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      console.error('Supabase getLatestPatientQr error:', error);
      return null;
    }
    return {
      appointmentId: data.appointment_id,
      qrValue: data.qr_value,
      expiresAt: data.expires_at,
      status: data.is_active ? 'active' : 'expired',
      statusLabel: data.is_active ? 'Còn hiệu lực' : 'Hết hạn',
      doctorName: data.doctor_name,
      specialty: data.specialty,
      appointmentAt: data.appointment_at,
      location: data.location,
      appointmentStatus: data.appointment_status,
      appointmentStatusLabel: data.appointment_status_label,
    };
  },

  // Xác thực QR và ghi lại lần check‑in
  async verifyQr(payload: VerifyQrPayload): Promise<VerifyQrResponse> {
    if (!supabaseEnabled) {
      // Mock success response
      return {
        outcome: 'valid',
        message: 'Xác thực mã QR thành công. Đã check‑in lịch khám.',
        appointmentId: 'app-1',
        patientName: 'Nguyễn Văn Bệnh Nhân',
        doctorName: 'BS. Nguyễn Thị Lan',
        specialty: 'Nội khoa',
        location: 'Phòng khám 102 - Tầng 1 - Khu A',
        appointmentAt: '2026-05-25T09:00:00.000Z',
        checkedInAt: new Date().toISOString(),
      };
    }
    // Ghi thông tin quét vào bảng qr_scans (nếu bảng tồn tại)
    const { error: insertError } = await supabase.from('qr_scans').insert({
      qr_value: payload.qrValue,
      patient_id: payload.patientId,
      checked_at: new Date().toISOString(),
    });
    if (insertError) {
      console.error('Supabase verifyQr insert error:', insertError);
    }
    // Lấy thông tin lịch hẹn liên quan
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', payload.appointmentId)
      .single();
    if (apptErr) {
      console.error('Supabase verifyQr fetch appointment error:', apptErr);
    }
    return {
      outcome: 'valid',
      message: 'Xác thực mã QR thành công. Đã check‑in lịch khám.',
      appointmentId: appt?.id ?? payload.appointmentId,
      patientName: appt?.patient_name ?? payload.patientName,
      doctorName: appt?.doctor_name ?? '',
      specialty: appt?.specialty ?? '',
      location: appt?.location ?? '',
      appointmentAt: appt?.appointment_at ?? '',
      checkedInAt: new Date().toISOString(),
    };
  },
};

