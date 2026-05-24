// import type {
//   AppointmentFilterValues,
//   AppointmentSlot,
//   AppointmentSummary,
//   CreateAppointmentPayload,
//   CreatedAppointment,
//   DoctorCalendarDay,
// } from "@/features/appointment/types/appointment.types";
// import type { DoctorAvailability } from "@/features/doctor/types/doctor.types";

// export const appointmentsApi = {
//   async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
//     return [
//       {
//         id: "app-1",
//         doctorName: "BS. Nguyễn Thị Lan",
//         specialty: "Nội khoa",
//         appointmentAt: "2026-05-25T09:00:00.000Z",
//         location: "Phòng khám 102 - Tầng 1 - Khu A",
//         status: "confirmed",
//         statusLabel: "Đã xác nhận",
//         qrCodeUrl: "mock-qr-value-1",
//       },
//     ];
//   },

//   async getDoctors(filters: AppointmentFilterValues): Promise<DoctorAvailability[]> {
//     const list = [
//       {
//         id: "d1",
//         fullName: "BS. Nguyễn Thị Lan",
//         specialty: "Nội khoa",
//         yearsOfExperience: 15,
//         clinicName: "Phòng khám 102 - Tầng 1 - Khu A",
//         avatarUrl: null,
//         nextAvailableAt: "2026-05-21T08:00:00.000Z",
//         bio: "Bác sĩ nội khoa với hơn 15 năm kinh nghiệm điều trị các bệnh lý mãn tính.",
//       },
//       {
//         id: "d2",
//         fullName: "BS. Phạm Minh Đức",
//         specialty: "Tim mạch",
//         yearsOfExperience: 12,
//         clinicName: "Phòng khám 305 - Tầng 3 - Khu B",
//         avatarUrl: null,
//         nextAvailableAt: "2026-05-22T09:00:00.000Z",
//         bio: "Chuyên gia Tim mạch giàu kinh nghiệm, tận tụy với bệnh nhân.",
//       },
//       {
//         id: "d3",
//         fullName: "BS. Hoàng Thu Trang",
//         specialty: "Nhi khoa",
//         yearsOfExperience: 8,
//         clinicName: "Phòng khám 201 - Tầng 2 - Khu C",
//         avatarUrl: null,
//         nextAvailableAt: "2026-05-21T10:30:00.000Z",
//         bio: "Yêu trẻ và có chuyên môn sâu về dinh dưỡng, hô hấp trẻ em.",
//       },
//     ];
//     let result = list;
//     if (filters.specialty) {
//       result = result.filter((d) => d.specialty === filters.specialty);
//     }
//     if (filters.search) {
//       result = result.filter((d) =>
//         d.fullName.toLowerCase().includes(filters.search.toLowerCase()),
//       );
//     }
//     return result;
//   },

//   async getDoctorCalendar(
//     doctorId: string,
//     month: string,
//   ): Promise<DoctorCalendarDay[]> {
//     return [
//       { date: "2026-05-21", availableSlots: 5, status: "available" },
//       { date: "2026-05-22", availableSlots: 2, status: "limited" },
//       { date: "2026-05-23", availableSlots: 0, status: "full" },
//       { date: "2026-05-24", availableSlots: 8, status: "available" },
//       { date: "2026-05-25", availableSlots: 4, status: "available" },
//     ];
//   },

//   async getDoctorSlots(doctorId: string, date: string): Promise<AppointmentSlot[]> {
//     return [
//       {
//         id: "slot-1",
//         startAt: "08:00",
//         endAt: "08:30",
//         isBooked: false,
//         remainingCapacity: 1,
//         roomLabel: "P.102",
//       },
//       {
//         id: "slot-2",
//         startAt: "08:30",
//         endAt: "09:00",
//         isBooked: false,
//         remainingCapacity: 1,
//         roomLabel: "P.102",
//       },
//       {
//         id: "slot-3",
//         startAt: "09:00",
//         endAt: "09:30",
//         isBooked: true,
//         remainingCapacity: 0,
//         roomLabel: "P.102",
//       },
//       {
//         id: "slot-4",
//         startAt: "09:30",
//         endAt: "10:00",
//         isBooked: false,
//         remainingCapacity: 1,
//         roomLabel: "P.102",
//       },
//     ];
//   },

//   async createAppointment(
//     payload: CreateAppointmentPayload,
//   ): Promise<CreatedAppointment> {
//     return {
//       id: `app-${Math.random().toString(36).substr(2, 9)}`,
//       status: "confirmed",
//       statusLabel: "Đã xác nhận",
//       appointmentAt: `${payload.appointmentDate}T09:00:00.000Z`,
//       doctorName: payload.doctorId === "d2" ? "BS. Phạm Minh Đức" : "BS. Nguyễn Thị Lan",
//       specialty: payload.doctorId === "d2" ? "Tim mạch" : "Nội khoa",
//       location:
//         payload.doctorId === "d2"
//           ? "Phòng khám 305 - Tầng 3 - Khu B"
//           : "Phòng khám 102 - Tầng 1 - Khu A",
//     };
//   },
// };

import { supabase } from '@/lib/supabaseClient';
import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreatedAppointment,
  DoctorAvailability,
  DoctorCalendarDay,
} from '@/features/appointment/types/appointment.types';

// Lấy danh sách các bác sĩ (từ bảng `doctors`)
async function fetchDoctors(): Promise<DoctorAvailability[]> {
  const { data, error } = await supabase.from('doctors').select('*');
  if (error) throw error;
  return data.map((d: any) => ({
    id: d.id,
    fullName: d.full_name,
    specialty: d.specialty,
    yearsOfExperience: d.years_experience,
    clinicName: d.clinic_name,
    avatarUrl: d.avatar_url,
    nextAvailableAt: d.next_available_at,
    bio: d.bio,
  }));
}

// Các hàm còn lại sẽ dùng `supabase` tương tự, ví dụ:
export const appointmentsApi = {
  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'confirmed')
      .order('appointment_at', { ascending: true })
      .limit(5);
    if (error) throw error;
    return data.map((a: any) => ({
      id: a.id,
      doctorName: a.doctor_name,
      specialty: a.specialty,
      appointmentAt: a.appointment_at,
      location: a.location,
      status: a.status,
      statusLabel: a.status_label,
      qrCodeUrl: a.qr_code,
    }));
  },

  async getDoctors(filters: AppointmentFilterValues): Promise<DoctorAvailability[]> {
    const doctors = await fetchDoctors();
    // Áp dụng filter phía client (specialty, search)
    let result = doctors;
    if (filters.specialty) {
      result = result.filter((d) => d.specialty === filters.specialty);
    }
    if (filters.search) {
      result = result.filter((d) =>
        d.fullName.toLowerCase().includes(filters.search!.toLowerCase()),
      );
    }
    return result;
  },

  async getDoctorCalendar(doctorId: string, month: string) {
    const { data, error } = await supabase
      .from('doctor_calendar')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('month', month);
    if (error) throw error;
    return data as DoctorCalendarDay[];
  },

  async getDoctorSlots(doctorId: string, date: string) {
    const { data, error } = await supabase
      .from('doctor_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('date', date);
    if (error) throw error;
    return data as AppointmentSlot[];
  },

  async createAppointment(payload: any): Promise<CreatedAppointment> {
    // Thêm vào bảng `appointments`
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          doctor_id: payload.doctorId,
          patient_id: payload.patientId,
          appointment_date: payload.appointmentDate,
          slot_id: payload.slotId,
          status: 'confirmed',
        },
      ])
      .single();
    if (error) throw error;
    return {
      id: data.id,
      status: data.status,
      statusLabel: 'Đã xác nhận',
      appointmentAt: data.appointment_date,
      doctorName: data.doctor_name,
      specialty: data.specialty,
      location: data.location,
    };
  },
};
