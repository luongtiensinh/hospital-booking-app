import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { ProtectedRoute, GuestRoute } from '../route-guards';
import { useAuthSession } from '@/features/auth/hooks/use-auth-session';

// Mock the auth hook
vi.mock('@/features/auth/hooks/use-auth-session', () => ({
  useAuthSession: vi.fn(),
}));

// Helper component to check current location
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

describe('Route Guards', () => {
  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to login', () => {
      // Mock unauthenticated
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: false, role: null });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should not show protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      // Should redirect to login
      expect(screen.getByTestId('location-display').textContent).toBe('/login');
    });

    it('renders children for authenticated users without role restrictions', () => {
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: true, role: 'patient' });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to forbidden when user lacks required role', () => {
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: true, role: 'patient' });

      render(
        <MemoryRouter initialEntries={['/admin-dashboard']}>
          <Routes>
            <Route path="/forbidden" element={<LocationDisplay />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
      expect(screen.getByTestId('location-display').textContent).toBe('/forbidden');
    });

    it('renders children when user has required role', () => {
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: true, role: 'admin' });

      render(
        <MemoryRouter initialEntries={['/admin-dashboard']}>
          <Routes>
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  describe('GuestRoute', () => {
    it('redirects authenticated users to dashboard', () => {
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: true, role: 'patient' });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/" element={<LocationDisplay />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div>Login Page</div>
                </GuestRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
      expect(screen.getByTestId('location-display').textContent).toBe('/');
    });

    it('renders children for unauthenticated users', () => {
      vi.mocked(useAuthSession).mockReturnValue({ isAuthenticated: false, role: null });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div>Login Page</div>
                </GuestRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
