import { Page, expect } from '@playwright/test';

/**
 * Wait for a toast notification to appear
 */
export async function waitForToast(page: Page, message?: string) {
    const toast = page.locator('[data-sonner-toast]');
    await toast.waitFor({ state: 'visible', timeout: 5000 });

    if (message) {
        await expect(toast).toContainText(message);
    }

    return toast;
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete(page: Page) {
    // Wait for any loading spinners to disappear
    await page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 10000 }).catch(() => {
        // Ignore if no loading indicator found
    });

    // Wait for skeleton loaders to disappear
    await page.waitForSelector('.skeleton', { state: 'hidden', timeout: 10000 }).catch(() => {
        // Ignore if no skeleton found
    });
}

/**
 * Navigate and wait for page to be ready
 */
export async function navigateTo(page: Page, url: string) {
    await page.goto(url);
    await waitForLoadingComplete(page);
    await page.waitForLoadState('networkidle');
}

/**
 * Fill form and submit
 */
export async function fillAndSubmitForm(
    page: Page,
    formData: Record<string, string>,
    submitButtonText: string = 'Submit'
) {
    for (const [selector, value] of Object.entries(formData)) {
        await page.fill(selector, value);
    }

    await page.click(`button:has-text("${submitButtonText}")`);
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
    await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
    return page.waitForResponse(
        (response) => {
            const url = response.url();
            if (typeof urlPattern === 'string') {
                return url.includes(urlPattern);
            }
            return urlPattern.test(url);
        },
        { timeout: 10000 }
    );
}

/**
 * Check if element is visible
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
    try {
        const element = page.locator(selector);
        await element.waitFor({ state: 'visible', timeout: 2000 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Cleanup test data - delete all plans created during test
 */
export async function cleanupTestPlans(page: Page) {
    await page.goto('/dashboard');
    await waitForLoadingComplete(page);

    // Find all delete buttons (if any plans exist)
    const deleteButtons = page.locator('[data-testid="delete-plan"]');
    const count = await deleteButtons.count();

    for (let i = 0; i < count; i++) {
        // Click the first delete button (since DOM updates after each delete)
        await deleteButtons.first().click();

        // Confirm deletion in dialog
        await page.click('button:has-text("Delete")');

        // Wait for toast confirmation
        await waitForToast(page);

        // Wait a bit for UI to update
        await page.waitForTimeout(500);
    }
}

/**
 * Retry an action with exponential backoff
 */
export async function retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await action();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page) {
    await page.waitForLoadState('networkidle');
}

/**
 * Generate random test data
 */
export function generateTestData(prefix: string = 'Test') {
    const timestamp = Date.now();
    return {
        planTitle: `${prefix} Plan ${timestamp}`,
        planDescription: `This is a test plan created at ${new Date().toISOString()}`,
        taskTitle: `${prefix} Task ${timestamp}`,
        taskDescription: `Test task description ${timestamp}`,
        email: `test${timestamp}@example.com`,
    };
}
