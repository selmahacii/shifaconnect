import { test, expect } from '@playwright/test';
import { loginAs, getTestDoctor } from './helpers/auth';

test.describe('Consultation and Prescription Flow', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
  });

  test('Full consultation and prescription generation', async ({ page }) => {
    // 1. Go to a patient profile (from global-setup)
    await page.goto('/dashboard/patients');
    await page.click('text=Kamel Amrani');
    
    // 2. Start consultation
    await page.click('text=Nouvelle Consultation');
    
    // STEP 1 - Motif
    await page.fill('textarea[placeholder*="Douleurs abdominales"]', 'Fièvre et toux sèche');
    await page.click('button:has-text("Suivant")');
    
    // STEP 2 - Vitals
    await page.fill('input[placeholder="70"]', '82'); // Weight
    await page.fill('input[placeholder="175"]', '180'); // Height
    // Check BMI calculation: 82 / (1.8*1.8) = 82 / 3.24 = 25.3
    await expect(page.locator('.text-2xl.font-bold:has-text("25.3")')).toBeVisible();
    await page.click('button:has-text("Suivant")');
    
    // STEP 3 - Diagnostic
    await page.fill('textarea[placeholder*="Diagnostic principal"]', 'Bronchite aiguë');
    await page.click('button:has-text("Suivant")');
    
    // STEP 4 - Suivi
    await page.click('button:has-text("Suivant")');
    
    // STEP 5 - Actions
    await page.click('label:has-text("Créer une ordonnance")');
    await page.click('button:has-text("Enregistrer la consultation")');
    
    // 3. Should redirect to Prescription Form
    await expect(page).toHaveURL(/\/prescriptions\/new/);
    await expect(page.locator('text=Bronchite aiguë')).toBeVisible(); // Pre-filled diagnosis
    
    // 4. Add Medication
    await page.click('button:has-text("Ajouter")');
    
    // Fill MedicationItem (isEditing by default when added)
    await page.click('button[role="combobox"]:has-text("Sélectionner...")');
    await page.fill('input[placeholder="Rechercher un médicament..."]', 'Amoxicilline');
    await page.click('text=AMOXICILLINE'); // Case sensitive in text matching usually
    
    await page.fill('input[placeholder="Ex: 500mg, 1 comprimé"]', '1g');
    await page.fill('input[placeholder="Ex: 3 fois par jour"]', '2 fois par jour');
    await page.fill('input[placeholder="Ex: 7 jours"]', '7 jours');
    await page.fill('input[placeholder="Ex: 1 boîte, 2 flacons"]', '1 boîte');
    
    await page.click('button:has-text("Enregistrer")'); // Save item
    
    // 5. Save Prescription
    await page.click('button:has-text("Enregistrer l\'ordonnance")');
    
    // 6. Verify in history
    await page.goto('/dashboard/patients');
    await page.click('text=Kamel Amrani');
    // Check history tab or sections
    await expect(page.locator('text=Bronchite aiguë')).toBeVisible();
    await expect(page.locator('text=Ordonnance')).toBeVisible();
  });

  test('BMI calculation automatically updates', async ({ page }) => {
    await page.goto('/dashboard/patients');
    await page.click('text=Kamel Amrani');
    await page.click('text=Nouvelle Consultation');
    
    // Go to vitals section
    await page.click('button:has-text("2")'); // Section 2 button
    
    await page.fill('input[placeholder="70"]', '100');
    await page.fill('input[placeholder="175"]', '200');
    // BMI = 100 / (2*2) = 25.0
    await expect(page.locator('.text-2xl.font-bold:has-text("25.0")')).toBeVisible();
    
    await page.fill('input[placeholder="70"]', '60');
    // BMI = 60 / 4 = 15.0
    await expect(page.locator('.text-2xl.font-bold:has-text("15.0")')).toBeVisible();
  });
});
