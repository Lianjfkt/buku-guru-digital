import { test, expect } from '@playwright/test';

test.describe('Autentikasi & Navigasi Publik', () => {
  test('halaman login menampilkan judul dan form login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Ruang Guru/);
    await expect(page.locator('text=Ruang Guru')).toBeVisible();
    await expect(page.locator('text=Masuk dengan Google')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('validasi form login memerlukan email dan password', async ({ page }) => {
    await page.goto('/login');
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    // Native HTML5 validation atau Zod alert
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });
});

