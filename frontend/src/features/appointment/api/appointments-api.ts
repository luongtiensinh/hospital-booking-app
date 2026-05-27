import type {
  AppointmentFilterValues,
  AppointmentSlot,
  AppointmentSummary,
  CreateAppointmentPayload,
  CreatedAppointment,
  DoctorCalendarDay,
} from '@/features/appointment/types/appointment.types';
import type { DoctorAvailability } from '@/features/doctor/types/doctor.types';
import { API_BASE_URL } from '../../../lib/api-base-url';

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
    if (!res.ok) throw new Error(data.message || 'Loi lay danh sach lich hen');
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
    if (!res.ok) throw new Error(data.message || 'Loi lay danh sach bac si');
    return data.doctors || [];
  },

  async getDoctorCalendar(doctorId: string, month: string): Promise<DoctorCalendarDay[]> {
    const res = await fetch(
      buildUrl('/calendar', { doctorId, month })
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Loi lay lich kham');
    return data.calendar || [];
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<AppointmentSlot[]> {
    const res = await fetch(
      buildUrl('/calendar/slots', { doctorId, date })
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Loi lay danh sach slot');
    return data.slots || [];
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<CreatedAppointment> {
    const res = await fetch(buildUrl('/appointments'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...createAppointmentHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Dat lich that bai');
    return data.appointment;
  },

  async cancelAppointment(id: string): Promise<void> {
    const res = await fetch(buildUrl(`/appointments/${id}`), {
      method: 'DELETE',
      headers: createAppointmentHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Khong the huy lich');
  },
};
