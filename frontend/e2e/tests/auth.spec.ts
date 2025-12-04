import { test, expect } from '@playwright/test';
import { login, logout, createTestUser } from '../fixtures/auth';
import { waitForToast, generateTestData } from '../utils/helpers';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any existing session
        await page.context().clearCookies();
    });

    test('should display login page', async ({ page }) => {
        await page.goto('/auth/login');

        await expect(page).toHaveTitle(/Login|PlanGenie/);
        await expect(page.locator('h1, h2')).toContainText(/Login|Sign in/i);
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
        await login(page);

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/);

        // Dashboard should be visible
        await expect(page.locator('h1, h2')).toContainText(/Dashboard|My Plans/i);
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/auth/login');

        await page.fill('input[type="email"]', 'invalid@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        // Wait for error message
        await waitForToast(page);
        await expect(page.locator('[data-sonner-toast]')).toContainText(/Invalid|Error|incorrect/i);
    });

    test('should logout successfully', async ({ page }) => {
        // First login
        await login(page);
        await expect(page).toHaveURL(/.*dashboard/);

        // Then logout
        await logout(page);

        // Should redirect to login
        await expect(page).toHaveURL(/.*auth\/login/);
    });

    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to login
        await expect(page).toHaveURL(/.*auth\/login/);
    });

    test('should signup with new account', async ({ page }) => {
        const testData = generateTestData('E2E');

        await page.goto('/auth/signup');

        await page.fill('input[type="email"]', testData.email);
        await page.fill('input[type="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');

        // Should redirect to dashboard after successful signup
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should persist session on page refresh', async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/.*dashboard/);

        // Refresh the page
        await page.reload();

        // Should still be on dashboard (session persisted)
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('h1, h2')).toContainText(/Dashboard|My Plans/i);
    });

    test('should navigate between login and signup', async ({ page }) => {
        await page.goto('/auth/login');

        // Click sign up link
        await page.click('text=Sign up');
        await expect(page).toHaveURL(/.*auth\/signup/);

        // Click login link
        await page.click('text=Login');
        await expect(page).toHaveURL(/.*auth\/login/);
    });

    test('should show validation errors for empty fields', async ({ page }) => {
        await page.goto('/auth/login');

        // Try to submit without filling fields
        await page.click('button[type="submit"]');

        // Should show validation errors (browser validation or custom)
        const emailInput = page.locator('input[type="email"]');
        const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);
        expect(isRequired).toBe(true);
    });
});
