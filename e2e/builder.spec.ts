import { test, expect } from '@playwright/test';

test.describe('Query Builder E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the builder workspace
    await page.goto('/builder');
  });

  test('should load the builder and verify default state', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/RealQL/);
    
    // The "Add Rule" button should be visible in the root group
    const addRuleBtn = page.getByRole('button', { name: 'Rule' }).first();
    await expect(addRuleBtn).toBeVisible();
  });

  test('should allow adding a rule and executing a query', async ({ page }) => {
    // Click Add Rule
    await page.getByRole('button', { name: 'Rule' }).first().click();

    // Verify a rule appears by checking for the operator combobox (select)
    // There are three selects in a rule: field, operator, value (if it's a select).
    // The operator select will be present.
    const operatorSelect = page.getByRole('combobox').nth(1);
    await expect(operatorSelect).toBeVisible();

    // Execute query using the toolbar button
    const executeBtn = page.getByRole('button', { name: 'Execute query' });
    await expect(executeBtn).toBeVisible();
    await executeBtn.click();

    // Verify results show up
    const resultsHeader = page.getByRole('heading', { name: 'Results' });
    await expect(resultsHeader).toBeVisible();
  });

  test('should open the history sidebar', async ({ page }) => {
    // Look for History button in the Header
    const historyBtn = page.getByRole('button', { name: 'History & Presets' });
    await expect(historyBtn).toBeVisible();
    
    // Click it
    await historyBtn.click();

    // Verify sidebar title appears
    const sidebarTitle = page.locator('h2', { hasText: 'Query History & Presets' });
    await expect(sidebarTitle).toBeVisible();
    
    // Close sidebar
    const closeBtn = page.getByRole('button', { name: 'Close history sidebar' });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    
    // Should disappear
    await expect(sidebarTitle).not.toBeVisible();
  });
});
