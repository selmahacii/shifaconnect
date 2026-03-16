import { test, expect } from '@playwright/test';
import { loginAs, logout, getTestDoctor } from './helpers/auth';
import { db } from '../../src/lib/db';

test.describe('Authentication Flow', () => {
  const testRegEmail = 'reg-test@playwright.dz';

  test.afterAll(async () => {
    // Cleanup the registration test account
    await db.auditLog.deleteMany({ where: { user: { email: testRegEmail } } });
    await db.user.deleteMany({ where: { email: testRegEmail } });
  });

  test('Doctor can register', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Dr. Test Playwright');
    await page.fill('input[name="email"]', testRegEmail);
    await page.fill('input[name="phone"]', '0555123456');
    await page.fill('input[name="clinicName"]', 'Cabinet Test');
    
    // Select Wilaya
    await page.click('button:has([data-lucide="map-pin"])');
    await page.click('text=Alger');
    
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    
    // Accept terms (checkbox)
    await page.click('button[role="checkbox"]');
    
    await page.click('button[type="submit"]');
    
    // Expect redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    // Sidebar should show doctor name
    await expect(page.locator('aside, nav')).toContainText('Dr. Test Playwright');
  });

  test('Doctor can login', async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Tableau de bord');
  });

  test('Invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');
    
    // Expect error message in French (toast or form message)
    // Based on code: toast contains 'Erreur de connexion'
    await expect(page.locator('text=Erreur de connexion')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/dashboard/patients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Logout works', async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
    
    await logout(page);
    
    await expect(page).toHaveURL(/\/login/);
    
    // Try to go back
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
