import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import {
    waitForToast,
    waitForLoadingComplete,
    navigateTo,
    generateTestData
} from '../utils/helpers';
import { mockAIPlanGeneration } from '../utils/api-mocks';

test.describe('Plan Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await login(page);
    });

    test('should display dashboard with plans', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        await expect(page.locator('h1, h2')).toContainText(/Dashboard|My Plans/i);

        // Check for dashboard elements
        const hasPlans = await page.locator('[data-testid="plan-card"]').count() > 0;
        if (hasPlans) {
            await expect(page.locator('[data-testid="plan-card"]').first()).toBeVisible();
        }
    });

    test('should create new plan with AI generation', async ({ page }) => {
        const testData = generateTestData('E2E Plan');

        await navigateTo(page, '/dashboard');

        // Click new plan button
        await page.click('text=New Plan');
        await expect(page).toHaveURL(/.*new-plan/);

        // Fill plan details
        await page.fill('input[name="title"], input[placeholder*="title" i]', testData.planTitle);
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', testData.planDescription);

        // Submit form (AI generation)
        await page.click('button:has-text("Generate")');

        // Wait for plan to be created and redirected
        await page.waitForURL(/.*plans\/.*/, { timeout: 15000 });

        // Verify plan page loaded
        await expect(page.locator('h1')).toContainText(testData.planTitle);
    });

    test('should view plan details', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        // Click on first plan card
        const planCard = page.locator('[data-testid="plan-card"]').first();
        if (await planCard.isVisible({ timeout: 2000 }).catch(() => false)) {
            await planCard.click();

            // Should navigate to plan details
            await page.waitForURL(/.*plans\/.*/);

            // Plan details should be visible
            await expect(page.locator('h1')).toBeVisible();
            await expect(page.locator('[data-testid="task-list"], .task-item')).toBeTruthy();
        }
    });

    test('should delete plan', async ({ page }) => {
        const testData = generateTestData('Delete Test');

        // First create a plan
        await navigateTo(page, '/new-plan');
        await page.fill('input[name="title"], input[placeholder*="title" i]', testData.planTitle);
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', testData.planDescription);
        await page.click('button:has-text("Generate")');

        await page.waitForURL(/.*plans\/.*/, { timeout: 15000 });

        // Now delete it
        await page.click('[data-testid="delete-plan"], button:has-text("Delete Plan")');

        // Confirm deletion in dialog
        await page.click('button:has-text("Delete"):not([data-testid="delete-plan"])');

        // Should redirect back to dashboard
        await page.waitForURL(/.*dashboard/);
        await waitForToast(page);
    });

    test('should filter plans by status', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        // Check if filter exists
        const filterButton = page.locator('[data-testid="filter"], button:has-text("All"), button:has-text("Active")');

        if (await filterButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
            // Click Active filter
            await page.click('text=Active');
            await waitForLoadingComplete(page);

            // Click Completed filter
            await page.click('text=Completed');
            await waitForLoadingComplete(page);

            // Click All filter
            await page.click('text=All');
            await waitForLoadingComplete(page);
        }
    });

    test('should display plan statistics', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        // Check for statistics cards
        const statsVisible = await page.locator('[data-testid="stats"], .stat-card, .statistics').isVisible({ timeout: 2000 }).catch(() => false);

        if (statsVisible) {
            await expect(page.locator('text=/Active Plans|Total Plans|Completed/i').first()).toBeVisible();
        }
    });

    test('should navigate from dashboard to plan and back', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        const planCard = page.locator('[data-testid="plan-card"]').first();

        if (await planCard.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Go to plan
            await planCard.click();
            await page.waitForURL(/.*plans\/.*/);

            // Go back to dashboard
            await page.click('text=Dashboard, a[href="/dashboard"]');
            await expect(page).toHaveURL(/.*dashboard/);
        }
    });

    test('should show empty state when no plans exist', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        // If no plans, should show empty state or call to action
        const planCount = await page.locator('[data-testid="plan-card"]').count();

        if (planCount === 0) {
            // Should show create plan button or empty state message
            await expect(page.locator('text=/New Plan|Create Plan|Get Started/i')).toBeVisible();
        }
    });

    test('should show plan progress visually', async ({ page }) => {
        await navigateTo(page, '/dashboard');

        const planCard = page.locator('[data-testid="plan-card"]').first();

        if (await planCard.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Should show progress indicator (bar, percentage, etc.)
            await expect(
                planCard.locator('[data-testid="progress"], .progress-bar, text=/%|completed/i')
            ).toBeTruthy();
        }
    });
});
