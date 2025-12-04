import { test as base, expect, Page } from '@playwright/test';

// Extend the base test with custom fixtures
type AuthFixtures = {
    authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
    // Create an authenticated page fixture
    authenticatedPage: async ({ page }, use) => {
        // Check if we have stored authentication state
        const authFile = '.auth/user.json';

        try {
            // Try to load the stored authentication state
            await page.context().addCookies(
                JSON.parse(require('fs').readFileSync(authFile, 'utf-8'))
            );
        } catch (error) {
            // If no stored auth, perform login
            await page.goto('/auth/login');

            // Fill in login form
            await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
            await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');

            // Submit login form
            await page.click('button[type="submit"]');

            // Wait for navigation to dashboard
            await page.waitForURL('**/dashboard');

            // Save authentication state
            const cookies = await page.context().cookies();
            require('fs').mkdirSync('.auth', { recursive: true });
            require('fs').writeFileSync(authFile, JSON.stringify(cookies));
        }

        // Use the authenticated page
        await use(page);
    },
});

export { expect };

// Helper function to login
export async function login(
    page: Page,
    email: string = process.env.TEST_USER_EMAIL || 'test@example.com',
    password: string = process.env.TEST_USER_PASSWORD || 'TestPassword123!'
) {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// Helper function to logout
export async function logout(page: Page) {
    // Navigate to profile or settings
    await page.goto('/profile');

    // Click logout button
    await page.click('text=Logout');

    // Wait for redirect to login page
    await page.waitForURL('**/auth/login');
}

// Helper to create a test user (if needed)
export async function createTestUser(
    page: Page,
    email: string,
    password: string
) {
    await page.goto('/auth/signup');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
}
