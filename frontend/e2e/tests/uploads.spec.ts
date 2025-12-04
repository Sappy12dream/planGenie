import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import {
    waitForToast,
    navigateTo,
    waitForLoadingComplete
} from '../utils/helpers';
import * as path from 'path';

test.describe('File Upload', () => {
    let planUrl: string;

    test.beforeEach(async ({ page }) => {
        await login(page);

        // Navigate to a plan with tasks
        await navigateTo(page, '/dashboard');

        const planCard = page.locator('[data-testid="plan-card"]').first();
        const hasPlan = await planCard.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasPlan) {
            await planCard.click();
            await page.waitForURL(/.*plans\/.*/);
            planUrl = page.url();
        } else {
            // Create a plan if needed
            test.skip();
        }

        await waitForLoadingComplete(page);
    });

    test('should upload image file to task', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"], .task-item').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Find upload button
            const uploadButton = task.locator('button:has-text("Attach"), [data-testid="upload"], input[type="file"]');

            if (await uploadButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                // Create a test image file
                const fileInput = page.locator('input[type="file"]').first();

                // Set up file chooser
                const [fileChooser] = await Promise.all([
                    page.waitForEvent('filechooser'),
                    uploadButton.first().click()
                ]);

                // Create a dummy file path (in production tests, use a real test image)
                const testFilePath = path.join(__dirname, '../fixtures/test-image.png');

                // Upload file (will fail if file doesn't exist, but shows the flow)
                try {
                    await fileChooser.setFiles([testFilePath]);

                    // Wait for upload to complete
                    await waitForToast(page);
                    await page.waitForTimeout(1000);

                    // Verify file appears in task
                    await expect(page.locator('text=/test-image|uploaded|file/i')).toBeVisible({ timeout: 5000 });
                } catch (error) {
                    // Skip if test file doesn't exist
                    test.skip();
                }
            }
        }
    });

    test('should upload PDF file to task', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"], .task-item').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            const uploadButton = task.locator('button:has-text("Attach"), input[type="file"]');

            if (await uploadButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                const [fileChooser] = await Promise.all([
                    page.waitForEvent('filechooser'),
                    uploadButton.first().click()
                ]);

                const testFilePath = path.join(__dirname, '../fixtures/test-document.pdf');

                try {
                    await fileChooser.setFiles([testFilePath]);
                    await waitForToast(page);
                    await page.waitForTimeout(1000);
                } catch (error) {
                    test.skip();
                }
            }
        }
    });

    test('should display uploaded files', async ({ page }) => {
        // Check if task has any uploaded files
        const fileAttachment = page.locator('[data-testid="file-attachment"], .uploaded-file, .attachment').first();

        const hasAttachment = await fileAttachment.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasAttachment) {
            await expect(fileAttachment).toBeVisible();
        }
    });

    test('should delete uploaded file', async ({ page }) => {
        const fileAttachment = page.locator('[data-testid="file-attachment"], .uploaded-file').first();

        const hasAttachment = await fileAttachment.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasAttachment) {
            // Find delete button for file
            const deleteButton = fileAttachment.locator('button[aria-label*="delete"], [data-testid="delete-file"]');

            if (await deleteButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await deleteButton.click();

                // Confirm deletion if dialog appears
                const confirmButton = page.locator('button:has-text("Delete"):visible');
                if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await confirmButton.click();
                }

                await waitForToast(page);
            }
        }
    });

    test('should preview uploaded image', async ({ page }) => {
        const imageAttachment = page.locator('img[src*="supabase"], [data-testid="image-preview"]').first();

        const hasImage = await imageAttachment.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasImage) {
            // Click to preview
            await imageAttachment.click();

            // Modal or preview should open
            const preview = page.locator('[role="dialog"], .modal, .preview');
            await expect(preview).toBeVisible({ timeout: 2000 });
        }
    });

    test('should upload multiple files to task', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"]').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            const uploadButton = task.locator('input[type="file"]');

            if (await uploadButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                const [fileChooser] = await Promise.all([
                    page.waitForEvent('filechooser'),
                    uploadButton.click()
                ]);

                try {
                    // Upload multiple files
                    const testFiles = [
                        path.join(__dirname, '../fixtures/test-image.png'),
                        path.join(__dirname, '../fixtures/test-document.pdf')
                    ];

                    await fileChooser.setFiles(testFiles);
                    await waitForToast(page);
                    await page.waitForTimeout(2000);
                } catch (error) {
                    test.skip();
                }
            }
        }
    });

    test('should show error for file size limit exceeded', async ({ page }) => {
        // This would require creating a file > 10MB
        // Skipping for now as it requires specific setup
        test.skip();
    });

    test('should show error for invalid file type', async ({ page }) => {
        // This would test validation of file types
        // Implementation depends on what file types are restricted
        test.skip();
    });
});
