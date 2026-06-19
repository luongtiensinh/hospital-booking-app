import { test, expect } from '@playwright/test';

test.describe('Booking Flow (Patient)', () => {
  test.beforeEach(async ({ page }) => {
    // Populate local storage to simulate an authenticated patient BEFORE loading the page
    await page.addInitScript(() => {
      localStorage.setItem('medcare-auth-session', JSON.stringify({
        state: {
          accessToken: 'fake-jwt-token',
          user: {
            id: 'patient-123',
            email: 'patient@example.com',
            fullName: 'Nguyen Van A',
            phone: '0901234567',
            role: 'patient'
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
          user: { id: 'patient-123', email: 'patient@example.com', fullName: 'Nguyen Van A', phone: '0901234567', role: 'patient', avatarUrl: null }
        })
      });
    });

    await page.route('**/api/counters', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          counters: [
            { id: 'counter-1', name: 'Khám tổng quát', room: '101' },
            { id: 'counter-2', name: 'Khám nhi', room: '102' }
          ]
        })
      });
    });

    await page.route(/.*\/api\/calendar.*/, async route => {
      const url = route.request().url();
      const method = route.request().method();
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      };

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: corsHeaders });
        return;
      }

      if (url.includes('/slots')) {
        await route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            slots: [
              { id: '08:00', startAt: '08:00', endAt: '08:10', session: 'morning', capacity: 3, remainingCapacity: 3, isBooked: false },
              { id: '08:10', startAt: '08:10', endAt: '08:20', session: 'morning', capacity: 3, remainingCapacity: 0, isBooked: true }
            ]
          })
        });
      } else {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
        
        const formatDate = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        
        await route.fulfill({
          status: 200,
          headers: corsHeaders,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            calendar: [
              { date: formatDate(today), status: 'available', availableCapacity: 10 },
              { date: formatDate(tomorrow), status: 'available', availableCapacity: 10 },
              { date: formatDate(dayAfter), status: 'available', availableCapacity: 10 }
            ]
          })
        });
      }
    });

    await page.route('**/api/appointments*', async route => {
      const url = route.request().url();
      const method = route.request().method();
      
      if (method === 'POST' && !url.includes('check-in')) {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            appointment: { id: 'test-appt-id', status: 'confirmed' },
            message: 'Đặt lịch khám thành công.'
          })
        });
      } else if (method === 'GET' && url.includes('upcoming=true')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            appointments: []
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should complete the 3-step booking wizard successfully', async ({ page }) => {
    // Go to appointments page
    await page.goto('/appointments');

    // Wait for the booking wizard to appear
    await expect(page.getByRole('heading', { name: 'Chọn Quầy Khám' })).toBeVisible();

    // Step 1: Select a counter
    // The counter we mocked has name "Khám tổng quát"
    await page.getByText('Khám tổng quát').click();
    
    // Step 2: Select a date and slot
    // For date, since it's a calendar or date picker, we'll wait for the next step UI
    await expect(page.getByText('Ngày & Giờ khám')).toBeVisible();
    
    // Click the date we mocked ('2029-01-01' -> day 1, with 10c capacity)
    await page.locator('button:visible').filter({ hasText: /10c|10 chỗ/i }).first().click();
    
    // The slots should be loaded. We mocked '08:00' as available and '08:10' as full.
    await page.waitForTimeout(2000); // Wait a bit for React Query to finish

    const availableSlot = page.getByRole('button', { name: /08:00/i });
    await availableSlot.click();
    
    // Step 3: Confirm booking
    await expect(page.getByText('Xác nhận đặt lịch').first()).toBeVisible();
    
    // Check if patient info is displayed correctly
    await expect(page.getByText('Khám tổng quát')).toBeVisible();

    // Click confirm booking
    await page.getByRole('button', { name: /xác nhận đặt lịch/i }).click();

    // Success message and redirection or completion screen
    await expect(page.getByText('Đặt lịch thành công!')).toBeVisible();
  });

  test('should cancel an appointment successfully', async ({ page }) => {
    // Mock the appointment history API
    await page.route('**/api/appointments/history*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          appointments: [
            {
              id: 'appt-to-cancel',
              appointmentAt: '2029-01-01T08:00:00Z',
              status: 'confirmed',
              statusLabel: 'Chờ khám',
              counterName: 'Khám tổng quát',
              counterRoom: '101'
            }
          ]
        })
      });
    });

    // Mock the cancel API
    await page.route('**/api/appointments/appt-to-cancel', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Hủy lịch thành công.'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to appointment history
    await page.goto('/appointments/history');

    // Wait for history to load
    await expect(page.getByText('Khám tổng quát')).toBeVisible();

    // Click the cancel button
    await page.getByRole('button', { name: /hủy lịch/i }).click();

    // Dialog appears, enter reason
    await expect(page.getByText('Lý do hủy')).toBeVisible();
    await page.getByPlaceholder(/nhập lý do/i).fill('Tôi bận việc đột xuất');

    // Confirm cancellation
    await page.getByRole('button', { name: 'Đồng ý hủy lịch' }).click();

    // Success message
    await expect(page.getByText('Đã hủy lịch hẹn thành công')).toBeVisible();
  });
});
