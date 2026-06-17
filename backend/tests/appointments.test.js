import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

process.env.SUPABASE_URL = 'http://localhost:9999';
process.env.SUPABASE_KEY = 'dummy-key-for-test';

const supabase = require('../utils/supabaseClient');
supabase.createAuthenticatedClient = vi.fn().mockReturnValue(supabase);

const appointmentsRouter = require('../routes/appointments');

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentsRouter);
app.use((err, _req, res, _next) => {
  res.status(500).json({ success: false, message: err.message });
});

// A builder to mock Supabase chained calls
const createMockQuery = () => {
  const query = {
    _data: [],
    _error: null,
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: query._data?.[0] || null, error: query._error })),
    then: function (resolve) {
      resolve({ data: this._data, error: this._error });
    }
  };
  return query;
};

describe('Appointments API Routes', () => {
  let mockQuery;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = createMockQuery();
    supabase.from = vi.fn().mockReturnValue(mockQuery);
    
    // We can also override getSupabaseClient to just return the mocked supabase
    supabase.getSupabaseClient = vi.fn().mockReturnValue(supabase);
    
    // Mock for requireAuth middleware
    supabase.auth.getUser = vi.fn().mockResolvedValue({
      data: { user: { id: 'patient-uuid-123', email: 'test@example.com' } },
      error: null
    });

    // Default global mock for 'profiles' table to pass requireAuth
    supabase.from = vi.fn((table) => {
      const q = createMockQuery();
      if (table === 'profiles') {
        q._data = [{ id: 'patient-uuid-123', role: 'patient' }];
      }
      return q;
    });
  });

  describe('POST /api/appointments (Create Appointment)', () => {
    it('should return 400 if missing information', async () => {
      const res = await request(app).post('/api/appointments')
        .set('Authorization', 'Bearer test-token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Thiếu thông tin cần thiết');
    });

    it('should return 403 if patient has >= 3 expired/no-show appointments', async () => {
      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'patient-uuid-123', role: 'patient' }];
        } else if (table === 'appointments') {
          q._data = [
            { status: 'expired' },
            { status: 'expired' },
            { status: 'expired' }
          ];
        }
        return q;
      });

      const res = await request(app).post('/api/appointments')
        .set('Authorization', 'Bearer test-token')
        .send({
          counterId: '11111111-2222-3333-4444-555555555555',
          appointmentDate: '2029-01-01',
          slotId: '08:00'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('khóa tính năng đặt lịch');
    });

    it('should successfully book an appointment if rules are met', async () => {
      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'patient-uuid-123', role: 'patient' }];
        } else if (table === 'counters') {
          q._data = [{ id: '11111111-2222-3333-4444-555555555555', name: 'Khám tổng quát' }];
        } else if (table === 'appointments') {
          q._data = []; // No existing conflicts
          q.insert = vi.fn().mockImplementation(() => {
            q._data = [{ id: 'new-appt-id', appointment_date: '2029-01-01', slot_id: '08:00', status: 'confirmed' }];
            return q;
          });
        }
        return q;
      });

      const res = await request(app).post('/api/appointments')
        .set('Authorization', 'Bearer test-token')
        .send({
          counterId: '11111111-2222-3333-4444-555555555555',
          appointmentDate: '2029-01-01', // Use future date
          slotId: '08:00'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.appointment.status).toBe('confirmed');
    });
  });

  describe('DELETE /api/appointments/:id (Cancel Appointment)', () => {
    it('should return 400 if cancelling within 24h', async () => {
      const today = new Date();
      today.setHours(today.getHours() + 1);
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const apptDate = yyyy + '-' + mm + '-' + dd;
      const apptTime = String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0');

      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'patient-uuid-123', role: 'patient' }];
        } else if (table === 'appointments') {
          q._data = [{ id: '11111111-2222-3333-4444-555555555555', patient_id: 'patient-uuid-123', status: 'confirmed', appointment_date: apptDate, appointment_time: apptTime }];
        }
        return q;
      });

      const res = await request(app).delete('/api/appointments/11111111-2222-3333-4444-555555555555')
        .set('Authorization', 'Bearer test-token');
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('trong vòng 24h');
    });

    it('should successfully cancel if > 24h and within cancel limit', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const yyyy = futureDate.getFullYear();
      const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
      const dd = String(futureDate.getDate()).padStart(2, '0');
      const apptDate = yyyy + '-' + mm + '-' + dd;

      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'patient-uuid-123', role: 'patient' }];
        } else if (table === 'appointments') {
          q._data = [{ id: '11111111-2222-3333-4444-555555555555', patient_id: 'patient-uuid-123', status: 'confirmed', appointment_date: apptDate, slot_id: '10:00' }];
        } else if (table === 'cancellation_logs') {
          q._data = [];
        }
        return q;
      });

      const res = await request(app).delete('/api/appointments/11111111-2222-3333-4444-555555555555')
        .set('Authorization', 'Bearer test-token')
        .send({ reason: 'Bận việc' });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Hủy lịch thành công');
    });
  });

  describe('QR Check-in', () => {
    it('should return 400 for missing QR code in verify-qr', async () => {
      const res = await request(app).post('/api/appointments/verify-qr')
        .set('Authorization', 'Bearer test-token')
        .send({}); // Send empty body instead of invalid qrCode to match valTrimmed missing
      
      expect(res.status).toBe(400);
      expect(res.body.data.message).toContain('Thiếu thông tin mã QR');
    });

    it('should return 403 if patient tries to check in without proper role', async () => {
      // Mock requireAuth to return patient role
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'patient-uuid-123', email: 'test@example.com' } },
        error: null
      });
      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'patient-uuid-123', role: 'patient' }]; // patient role cannot check-in
        }
        return q;
      });

      const res = await request(app).post('/api/appointments/11111111-2222-3333-4444-555555555555/check-in')
        .set('Authorization', 'Bearer test-token');
      
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Yêu cầu vai trò');
    });

    it('should successfully check-in if valid conditions are met by staff', async () => {
      // Mock requireAuth to return doctor role
      supabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'staff-uuid-123', email: 'staff@example.com' } },
        error: null
      });
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const apptDate = yyyy + '-' + mm + '-' + dd;
      
      supabase.from = vi.fn((table) => {
        const q = createMockQuery();
        if (table === 'profiles') {
          q._data = [{ id: 'staff-uuid-123', role: 'doctor' }]; // doctor can check-in
        } else if (table === 'appointments') {
          q._data = [{ id: '11111111-2222-3333-4444-555555555555', status: 'confirmed', appointment_date: apptDate }];
          q.update = vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: '11111111-2222-3333-4444-555555555555', status: 'checked-in' },
                    error: null
                  })
                }),
                then: function (resolve) { resolve({ data: [], error: null }); }
              }),
              then: function (resolve) { resolve({ data: [], error: null }); }
            })
          });
        }
        return q;
      });

      const res = await request(app).post('/api/appointments/11111111-2222-3333-4444-555555555555/check-in')
        .set('Authorization', 'Bearer test-token');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Check-in bệnh nhân thành công');
    });
  });
});
