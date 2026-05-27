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

function buildMockCalendar(month: string): DoctorCalendarDay[] {
  const fallbackMonth = month || '2026-05';

  return [
    { date: `${fallbackMonth}-21`, availableSlots: 5, status: 'available' },
    { date: `${fallbackMonth}-22`, availableSlots: 2, status: 'limited' },
    { date: `${fallbackMonth}-23`, availableSlots: 0, status: 'full' },
    { date: `${fallbackMonth}-24`, availableSlots: 8, status: 'available' },
    { date: `${fallbackMonth}-25`, availableSlots: 4, status: 'available' },
  ];
}

function buildMockSlots(): AppointmentSlot[] {
  return [
    {
      id: 'slot-1',
      startAt: '08:00',
      endAt: '08:30',
      isBooked: false,
      remainingCapacity: 1,
      roomLabel: 'P.102',
    },
    {
      id: 'slot-2',
      startAt: '08:30',
      endAt: '09:00',
      isBooked: false,
      remainingCapacity: 1,
      roomLabel: 'P.102',
    },
    {
      id: 'slot-3',
      startAt: '09:00',
      endAt: '09:30',
      isBooked: true,
      remainingCapacity: 0,
      roomLabel: 'P.102',
    },
    {
      id: 'slot-4',
      startAt: '09:30',
      endAt: '10:00',
      isBooked: false,
      remainingCapacity: 1,
      roomLabel: 'P.102',
    },
  ];
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

  async getDoctorCalendar(_doctorId: string, month: string): Promise<DoctorCalendarDay[]> {
    // Backend hien chua mount /api/calendar, tam dung mock de tranh 404 runtime.
    return buildMockCalendar(month);
  },

  async getDoctorSlots(_doctorId: string, _date: string): Promise<AppointmentSlot[]> {
    // Backend hien chua mount /api/calendar/slots, tam dung mock de tranh 404 runtime.
    return buildMockSlots();
  },

  async createAppointment(payload: unknown): Promise<CreatedAppointment> {
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
