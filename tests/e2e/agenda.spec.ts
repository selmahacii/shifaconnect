import { test, expect } from '@playwright/test';
import { loginAs, getTestDoctor } from './helpers/auth';

test.describe('Agenda and Appointments', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
  });

  test('Doctor can book and manage an appointment', async ({ page }) => {
    await page.goto('/dashboard/agenda');
    
    // 1. Open booking dialog
    await page.click('button:has-text("Nouveau rendez-vous")');
    
    // 2. Select patient
    await page.click('button:has-text("Rechercher un patient...")');
    await page.fill('input[placeholder*="Nom, prénom"]', 'Kamel');
    await page.click('text=Kamel Amrani');
    
    // 3. Fill details
    await page.fill('textarea[placeholder*="Motif de la consultation"]', 'Contrôle annuel');
    
    // 4. Save
    await page.click('button:has-text("Créer le rendez-vous")');
    
    // 5. Verify it appears on calendar or today's list
    // Check toast
    await expect(page.locator('text=Rendez-vous créé')).toBeVisible();
    
    // In Today's Schedule widget (if date is today)
    await expect(page.locator('aside, .card, .widget')).toContainText('Kamel Amrani');
  });

  test('Clicking appointment and starting consultation', async ({ page }) => {
    await page.goto('/dashboard/agenda');
    
    // Assuming there's an appointment from global-setup for Omar Saidani
    // Click on the appointment card in the "Today's Schedule" widget
    const omarCard = page.locator('.card:has-text("Omar Saidani"), .flex:has-text("Omar Saidani")').first();
    await omarCard.click();
    
    // Should open detail dialog
    await expect(page.locator('h2, .text-lg')).toContainText('Omar Saidani');
    
    // Click Start Consultation
    await page.click('button:has-text("Démarrer la consultation")');
    
    // Should redirect to consultation page
    await expect(page).toHaveURL(/\/consultations\/new/);
    await expect(page).toHaveURL(/patientId=/);
    await expect(page.locator('h1')).toContainText('Nouvelle consultation');
    await expect(page.locator('.card')).toContainText('Omar Saidani');
  });
});
