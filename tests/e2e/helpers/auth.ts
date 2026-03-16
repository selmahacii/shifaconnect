import { Page, expect } from '@playwright/test';

/**
 * Helper to log in a doctor
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for dashboard or check URL
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  await expect(page.locator('h1, h2, span')).toContainText('Tableau de bord', { timeout: 10000 });
}

/**
 * Helper to log out
 */
export async function logout(page: Page) {
  // Assuming there is a logout button in the sidebar or header
  // Let's look for a button with text "Déconnexion" or an icon
  const logoutButton = page.locator('button:has-text("Déconnexion"), a:has-text("Déconnexion")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Fallback if it's in a profile menu
    await page.locator('button[aria-label="Profile"], .user-menu').click();
    await page.locator('text=Déconnexion').click();
  }
  
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Returns test credentials from environment
 */
export function getTestDoctor() {
  return {
    email: process.env.TEST_DOCTOR_EMAIL || 'doctor@test.dz',
    password: process.env.TEST_DOCTOR_PASSWORD || 'Password123!',
  };
}
