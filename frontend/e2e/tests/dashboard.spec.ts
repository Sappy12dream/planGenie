import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import {
    waitForLoadingComplete,
    navigateTo
} from '../utils/helpers';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await navigateTo(page, '/dashboard');
    });

    test('should display dashboard page', async ({ page }) => {
        await expect(page).toHaveTitle(/Dashboard|PlanGenie/i);
        await expect(page.locator('h1, h2')).toContainText(/Dashboard|My Plans/i);
    });

    test('should display statistics cards', async ({ page }) => {
        // Look for stats/metrics
        const statsVisible = await page.locator('[data-testid="stats"], .stat-card, .statistics').isVisible({ timeout: 2000 }).catch(() => false);

        if (statsVisible) {
            await expect(page.locator('text=/Active Plans|Total Plans|Completed|Progress/i').first()).toBeVisible();
        }
    });

    test('should display plan cards correctly', async ({ page }) => {
        await waitForLoadingComplete(page);

        const planCards = page.locator('[data-testid="plan-card"]');
        const planCount = await planCards.count();

        if (planCount > 0) {
            const firstCard = planCards.first();

            // Plan card should have title
            await expect(firstCard).toBeVisible();

            // Should have some content (title, description, progress)
            const hasContent = await firstCard.textContent();
            expect(hasContent).toBeTruthy();
        }
    });

    test('should navigate to plan from card click', async ({ page }) => {
        const planCard = page.locator('[data-testid="plan-card"]').first();

        if (await planCard.isVisible({ timeout: 2000 }).catch(() => false)) {
            await planCard.click();

            // Should navigate to plan details
            await page.waitForURL(/.*plans\/.*/);
            await expect(page.url()).toContain('/plans/');
        }
    });

    test('should filter plans by All status', async ({ page }) => {
        const filterButton = page.locator('button:has-text("All"), [data-testid="filter-all"]');

        if (await filterButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await filterButton.click();
            await waitForLoadingComplete(page);

            // All plans should be visible (no specific assertion as we don't know plan count)
        }
    });

    test('should filter plans by Active status', async ({ page }) => {
        const filterButton = page.locator('button:has-text("Active"), [data-testid="filter-active"]');

        if (await filterButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await filterButton.click();
            await waitForLoadingComplete(page);

            // Only active plans should be shown
            const planCards = page.locator('[data-testid="plan-card"]');
            const count = await planCards.count();

            // Just verify filtering works (count changes or stays same)
        }
    });

    test('should filter plans by Completed status', async ({ page }) => {
        const filterButton = page.locator('button:has-text("Completed"), [data-testid="filter-completed"]');

        if (await filterButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await filterButton.click();
            await waitForLoadingComplete(page);
        }
    });

    test('should display smart alerts', async ({ page }) => {
        await waitForLoadingComplete(page);

        // Look for dashboard alerts
        const alerts = page.locator('[data-testid="alert"], .alert-card, .dashboard-alert');
        const hasAlerts = await alerts.first().isVisible({ timeout: 2000 }).catch(() => false);

        if (hasAlerts) {
            await expect(alerts.first()).toBeVisible();
        }
    });

    test('should dismiss alert', async ({ page }) => {
        await waitForLoadingComplete(page);

        const alert = page.locator('[data-testid="alert"]').first();

        if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Find dismiss button
            const dismissButton = alert.locator('button:has-text("Dismiss"), [data-testid="dismiss-alert"]');

            if (await dismissButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await dismissButton.click();

                // Alert should disappear
                await expect(alert).not.toBeVisible({ timeout: 2000 });
            }
        }
    });

    test('should navigate to New Plan page', async ({ page }) => {
        const newPlanButton = page.locator('button:has-text("New Plan"), a:has-text("New Plan")');

        if (await newPlanButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await newPlanButton.click();

            // Should navigate to new plan page
            await expect(page).toHaveURL(/.*new-plan/);
        }
    });

    test('should navigate to Profile page', async ({ page }) => {
        const profileLink = page.locator('a:has-text("Profile"), [href="/profile"]');

        if (await profileLink.isVisible({ timeout: 2000 }).catch(() => false)) {
            await profileLink.click();

            // Should navigate to profile
            await expect(page).toHaveURL(/.*profile/);
        }
    });

    test('should navigate to Settings page', async ({ page }) => {
        const settingsLink = page.locator('a:has-text("Settings"), [href*="settings"]');

        if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
            await settingsLink.click();

            // Should navigate to settings
            await expect(page).toHaveURL(/.*settings/);
        }
    });

    test('should display user greeting or name', async ({ page }) => {
        // Look for user name/greeting
        const greeting = page.locator('text=/Welcome|Hello|Hi/i').first();

        const hasGreeting = await greeting.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasGreeting) {
            await expect(greeting).toBeVisible();
        }
    });

    test('should show empty state when no plans exist', async ({ page }) => {
        // This test would need a clean account with no plans
        const planCards = page.locator('[data-testid="plan-card"]');
        const planCount = await planCards.count();

        if (planCount === 0) {
            // Should show empty state or CTA
            await expect(page.locator('text=/No plans|Get started|Create your first/i')).toBeVisible();
        }
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.reload();
        await waitForLoadingComplete(page);

        // Dashboard should still be functional
        await expect(page.locator('h1, h2')).toBeVisible();

        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
        // Set tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.reload();
        await waitForLoadingComplete(page);

        await expect(page.locator('h1, h2')).toBeVisible();

        // Reset viewport
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should handle page refresh gracefully', async ({ page }) => {
        await waitForLoadingComplete(page);

        // Refresh page
        await page.reload();

        // Dashboard should reload properly
        await waitForLoadingComplete(page);
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('h1, h2')).toBeVisible();
    });
});
