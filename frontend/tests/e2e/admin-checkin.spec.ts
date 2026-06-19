import { test, expect } from '@playwright/test';

test.describe('Admin/Doctor QR Check-in', () => {
  test.beforeEach(async ({ page }) => {
    // Populate local storage for Admin BEFORE loading
    await page.addInitScript(() => {
      localStorage.setItem('medcare-auth-session', JSON.stringify({
        state: {
          accessToken: 'admin-jwt-token',
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            fullName: 'Admin User',
            role: 'admin'
          },
          isBootstrapped: true
        },
        version: 0
      }));
    });

    // Mock auth profile so AuthBootstrapper completes even without a real backend (CI)
    await page.route('**/api/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { id: 'admin-123', email: 'admin@example.com', fullName: 'Admin User', role: 'admin', avatarUrl: null }
        })
      });
    });

    // Mock verification
    await page.route(/.*\/api\/appointments\/verify-qr.*/, async route => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      };

      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: corsHeaders });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            outcome: 'valid',
            message: 'Hợp lệ',
            appointmentId: 'test-appt-id',
            patientName: 'Nguyen Van A',
            counterName: 'Khám tổng quát',
            appointmentAt: '2029-01-01T08:00:00Z'
          }
        })
      });
    });

    // Mock manual check-in
    await page.route(/.*\/api\/appointments\/test-appt-id\/check-in.*/, async route => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      };

      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: corsHeaders });
        return;
      }

      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Check-in bệnh nhân thành công.'
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should verify QR code and check-in patient successfully', async ({ page }) => {
    await page.goto('/qr-check-in');

    // Wait for the QR scanner page to load
    await expect(page.getByText('Quét QR bệnh nhân')).toBeVisible();

    // Since we can't easily use the camera in E2E, we'll simulate manual code entry
    // Usually there's an input field for manual check-in code
    const input = page.getByPlaceholder(/nhập mã qr hoặc mã check-in/i);
    await input.fill('abcdef12');

    const checkButton = page.getByRole('button', { name: 'Xác nhận mã' });
    await checkButton.click();

    // Verification result should appear and show success immediately
    await expect(page.getByText('Nguyen Van A')).toBeVisible();
    await expect(page.getByText('Check-in thành công')).toBeVisible();
  });
});
