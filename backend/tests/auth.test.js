import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Override env vars before requiring anything
process.env.SUPABASE_URL = 'http://localhost:9999';
process.env.SUPABASE_KEY = 'dummy-key-for-test';
import authRouter from '../routes/auth';
const supabase = require('../utils/supabaseClient');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use((err, _req, res, _next) => {
  res.status(500).json({ success: false, message: err.message });
});

// -----------------------------------------------
describe('Auth API Routes', () => {
  beforeEach(() => {
    supabase.rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    supabase.auth.signUp = vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null });
    supabase.auth.signInWithPassword = vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null });
    supabase.auth.refreshSession = vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null });
  });

  // ------- REGISTER -------
  describe('POST /api/auth/register', () => {
    it('should return 400 when all fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.fullname).toContain('trống');
      expect(res.body.errors.phone).toContain('trống');
      expect(res.body.errors.cccd).toContain('trống');
      expect(res.body.errors.password).toContain('trống');
    });

    it('should return 400 for invalid phone format', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullname: 'Test User',
        phone: 'abc',       // invalid
        cccd: '012345678901',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body.errors.phone).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullname: 'Test User',
        phone: '0912345678',
        cccd: '012345678901',
        password: '123',   // too short
      });
      expect(res.status).toBe(400);
      expect(res.body.errors.password).toContain('8 ký tự');
    });

    it('should return 409 when phone already exists', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ phone: '0912345678', cccd: '999999999999' }],
        error: null,
      });

      const res = await request(app).post('/api/auth/register').send({
        fullname: 'Jane Doe',
        phone: '0912345678',
        cccd: '012345678901',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.errors.phone).toContain('đã được sử dụng');
    });

    it('should return 201 on successful registration', async () => {
      // Step 1: rpc check_existing_profiles → no duplicates
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });
      // Step 2: auth.signUp → success
      supabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-uuid-123',
            user_metadata: { fullname: 'John Doe' },
          },
          session: {
            access_token: 'access_token_abc',
            refresh_token: 'refresh_token_xyz',
          },
        },
        error: null,
      });

      const res = await request(app).post('/api/auth/register').send({
        fullname: 'John Doe',
        phone: '0912345678',
        cccd: '012345678901',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.session.accessToken).toBe('access_token_abc');
      expect(res.body.session.user.fullName).toBe('John Doe');
      // Verify correct RPC was called
      expect(supabase.rpc).toHaveBeenCalledWith('check_existing_profiles', {
        phone_val: '0912345678',
        cccd_val: '012345678901',
      });
    });
  });

  // ------- LOGIN -------
  describe('POST /api/auth/login', () => {
    it('should return 400 when identifier or password is empty', async () => {
      const res = await request(app).post('/api/auth/login').send({
        identifier: '',
        password: '',
      });
      expect(res.status).toBe(400);
    });

    it('should return 401 when profile is not found by identifier', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const res = await request(app).post('/api/auth/login').send({
        identifier: '0000000000',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Sai thông tin đăng nhập');
    });

    it('should return 401 when password is wrong', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ phone: '0912345678', cccd: '012345678901', role: 'patient' }],
        error: null,
      });
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const res = await request(app).post('/api/auth/login').send({
        identifier: '0912345678',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Sai thông tin đăng nhập');
    });

    it('should return 200 with session on successful login', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [{ phone: '0912345678', cccd: '012345678901', role: 'patient' }],
        error: null,
      });
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'user-uuid-123' },
          session: {
            access_token: 'access_token_abc',
            refresh_token: 'refresh_token_xyz',
          },
        },
        error: null,
      });

      const res = await request(app).post('/api/auth/login').send({
        identifier: '0912345678',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.session.accessToken).toBe('access_token_abc');
      expect(res.body.session.user.role).toBe('patient');
    });
  });

  // ------- LOGOUT -------
  describe('POST /api/auth/logout', () => {
    it('should return 204 on logout', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(204);
    });
  });
});
