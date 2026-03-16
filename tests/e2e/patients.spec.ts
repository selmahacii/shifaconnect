import { test, expect } from '@playwright/test';
import { loginAs, getTestDoctor } from './helpers/auth';

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    const { email, password } = getTestDoctor();
    await loginAs(page, email, password);
  });

  test('Doctor can create a new patient (full flow)', async ({ page }) => {
    await page.goto('/dashboard/patients');
    await page.click('text=Nouveau patient');

    // STEP 1 — Identité
    await page.fill('input[name="firstName"]', 'Mohammed');
    await page.fill('input[name="lastName"]', 'Amrani');
    await page.fill('input[name="dateOfBirth"]', '15/06/1985');
    await page.click('label:has-text("Masculin")');
    await page.click('button:has-text("Suivant")');

    // STEP 2 — Contact
    await page.fill('input[name="phone"]', '0771234567');
    await page.click('button:has-text("Sélectionner une wilaya")');
    await page.click('text=31 - Oran');
    await page.click('button:has-text("Suivant")');

    // STEP 3 — Antécédents
    await page.click('button:has-text("Sélectionner")'); // Blood type trigger
    await page.click('text=O+');
    
    // Add allergy
    const allergyInput = page.locator('div:has-text("Allergies") input');
    await allergyInput.fill('Pénicilline');
    await allergyInput.press('Enter');
    
    // Add chronic condition
    const chronicInput = page.locator('div:has-text("Maladies chroniques") input');
    await chronicInput.fill('Diabète type 2');
    await chronicInput.press('Enter');

    await page.click('button:has-text("Créer le patient")');

    // Expect redirect to patient detail page
    await expect(page).toHaveURL(/\/dashboard\/patients\/cl/); // cuid starts with cl
    await expect(page.locator('h1')).toContainText('Mohammed Amrani');
    
    // Check badges
    await expect(page.locator('.badge:has-text("Pénicilline"), .bg-destructive:has-text("Pénicilline")')).toBeVisible();
    await expect(page.locator('text=Diabète type 2')).toBeVisible();
  });

  test('Search finds patient by name', async ({ page }) => {
    await page.goto('/dashboard/patients');
    
    // Search for "Amrani"
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('Amrani');
    
    // Expect matching patients
    await expect(page.locator('table, .grid')).toContainText('Amrani');
    
    // Clear search
    await searchInput.fill('');
    // Expect all patients (at least the ones from global-setup)
    await expect(page.locator('text=Fatima')).toBeVisible();
  });

  test('Validation prevents invalid phone number', async ({ page }) => {
    await page.goto('/dashboard/patients');
    await page.click('text=Nouveau patient');

    // Fill Step 1
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Validation');
    await page.fill('input[name="dateOfBirth"]', '01/01/1990');
    await page.click('label:has-text("Masculin")');
    await page.click('button:has-text("Suivant")');

    // Fill invalid phone (prefix 02)
    await page.fill('input[name="phone"]', '0226666666');
    await page.click('button:has-text("Suivant")');

    // Expect error message
    // The actual error message from schema is "Le numéro de téléphone doit contenir 10 chiffres commençant par 0"
    // or the one in the specific component. From schemas.ts: 'Le numéro de téléphone doit contenir 10 chiffres commençant par 0'
    // The component might override it or show a summary.
    await expect(page.locator('text=Numéro de téléphone invalide')).toBeVisible();
  });
});
