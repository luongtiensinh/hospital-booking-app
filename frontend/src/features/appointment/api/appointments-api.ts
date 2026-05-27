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

import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreatedAppointment,
  DoctorAvailability,
  DoctorCalendarDay,
} from '@/features/appointment/types/appointment.types';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api`
).replace(/\/$/, '');

function getAccessToken() {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession = window.localStorage.getItem('session');
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    return session?.access_token || null;
  } catch {
    return null;
  }
}

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return `${API_BASE_URL}${path}${query ? `?${query}` : ''}`;
}

function createAppointmentHeaders() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Ban can dang nhap lai de thuc hien thao tac nay.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export const appointmentsApi = {
  async getUpcomingAppointments(): Promise<AppointmentSummary[]> {
    const res = await fetch(
      buildUrl('/appointments', {
        upcoming: 'true',
      }),
      {
        headers: createAppointmentHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy danh sách lịch hẹn');
    return data.appointments || [];
  },

  async getDoctors(filters: AppointmentFilterValues): Promise<DoctorAvailability[]> {
    const res = await fetch(
      buildUrl('/doctors', {
        specialty: filters.specialty,
        search: filters.search,
      }),
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy danh sách bác sĩ');
    return data.doctors || [];
  },

  async getDoctorCalendar(doctorId: string, month: string) {
    const res = await fetch(buildUrl('/calendar', { doctorId, month }));
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy lịch bác sĩ');
    return data.calendar as DoctorCalendarDay[];
  },

  async getDoctorSlots(doctorId: string, date: string) {
    const res = await fetch(buildUrl('/calendar/slots', { doctorId, date }));
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi lấy slot trống');
    return data.slots as AppointmentSlot[];
  },

  async createAppointment(payload: any): Promise<CreatedAppointment> {
    const res = await fetch(buildUrl('/appointments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAppointmentHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Đặt lịch thất bại');
    return data.appointment;
  },

  async cancelAppointment(id: string): Promise<void> {
    const res = await fetch(buildUrl(`/appointments/${id}`), {
      method: 'DELETE',
      headers: createAppointmentHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Không thể hủy lịch');
  },
};
