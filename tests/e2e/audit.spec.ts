import { test, expect } from '@playwright/test';
import { loginAs, getTestDoctor } from './helpers/auth';

test.describe('Audit Trail Verification', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
  });

  test('Patient creation is logged in audit trail', async ({ page }) => {
    // 1. Create a patient
    await page.goto('/dashboard/patients');
    await page.click('button:has-text("Nouveau Patient")');
    
    const uniqueLastName = `AuditTest_${Date.now()}`;
    await page.fill('input[placeholder="Nom"]', uniqueLastName);
    await page.fill('input[placeholder="Prénom"]', 'Test');
    await page.fill('input[placeholder="DD/MM/YYYY"]', '01/01/1980');
    await page.click('button:has-text("Femme")');
    
    await page.click('button:has-text("Suivant")'); // Identity -> Contact
    await page.fill('input[placeholder="05XXXXXXXX"]', '0550123456');
    await page.click('button:has-text("Suivant")'); // Contact -> Medical
    await page.click('button:has-text("Enregistrer le patient")');
    
    await expect(page.locator('text=Patient créé avec succès')).toBeVisible();
    
    // 2. Go to Audit Log
    await page.goto('/dashboard/settings/audit');
    
    // 3. Verify the log entry exists
    await expect(page.locator('table')).toContainText('PATIENT');
    await expect(page.locator('table')).toContainText('CREATE');
    // It should be the first row since it's sorted by desc
    const firstRowLabel = page.locator('table tbody tr').first();
    await expect(firstRowLabel).toContainText('PATIENT');
    await expect(firstRowLabel).toContainText('Création');
  });
});
