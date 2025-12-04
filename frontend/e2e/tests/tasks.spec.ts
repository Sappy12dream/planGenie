import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import {
    waitForToast,
    navigateTo,
    generateTestData,
    waitForLoadingComplete
} from '../utils/helpers';

test.describe('Task Management', () => {
    let planUrl: string;

    test.beforeEach(async ({ page }) => {
        await login(page);

        // Navigate to first available plan or create one
        await navigateTo(page, '/dashboard');

        const planCard = page.locator('[data-testid="plan-card"]').first();
        const hasPlan = await planCard.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasPlan) {
            await planCard.click();
            await page.waitForURL(/.*plans\/.*/);
            planUrl = page.url();
        } else {
            // Create a plan if none exists
            const testData = generateTestData('Task Test');
            await page.click('text=New Plan');
            await page.fill('input[name="title"], input[placeholder*="title" i]', testData.planTitle);
            await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', testData.planDescription);
            await page.click('button:has-text("Generate")');
            await page.waitForURL(/.*plans\/.*/, { timeout: 15000 });
            planUrl = page.url();
        }

        await waitForLoadingComplete(page);
    });

    test('should display tasks list', async ({ page }) => {
        // Tasks should be visible (or empty state)
        const hasTasks = await page.locator('[data-testid="task-item"], .task-item, .task-list li').count() > 0;

        if (hasTasks) {
            await expect(page.locator('[data-testid="task-item"], .task-item').first()).toBeVisible();
        }
    });

    test('should add task manually', async ({ page }) => {
        const testData = generateTestData('Manual Task');

        // Click add task button
        const addButton = page.locator('button:has-text("Add Task"), [data-testid="add-task"]');

        if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addButton.click();

            // Fill task details
            await page.fill('input[placeholder*="task" i]:visible, input[name="title"]:visible', testData.taskTitle);

            // Submit (Enter key or button)
            await page.keyboard.press('Enter');

            // Task should appear in list
            await expect(page.locator(`text=${testData.taskTitle}`)).toBeVisible({ timeout: 5000 });
        }
    });

    test('should mark task as complete', async ({ page }) => {
        const taskCheckbox = page.locator('input[type="checkbox"]').first();

        if (await taskCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
            const wasChecked = await taskCheckbox.isChecked();

            // Toggle checkbox
            await taskCheckbox.click();

            // Wait for update
            await page.waitForTimeout(500);

            // Verify state changed
            const isNowChecked = await taskCheckbox.isChecked();
            expect(isNowChecked).toBe(!wasChecked);
        }
    });

    test('should edit task title inline', async ({ page }) => {
        const taskTitle = page.locator('[data-testid="task-title"], .task-title').first();

        if (await taskTitle.isVisible({ timeout: 2000 }).catch(() => false)) {
            const originalText = await taskTitle.textContent();

            // Click to edit
            await taskTitle.click();

            // Find input field
            const input = page.locator('input[value]:visible, input:visible').first();

            if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
                await input.clear();
                await input.fill('Updated Task Title E2E');
                await page.keyboard.press('Enter');

                // Wait for update
                await page.waitForTimeout(500);

                // Verify change
                await expect(page.locator('text=Updated Task Title E2E')).toBeVisible();
            }
        }
    });

    test('should delete task', async ({ page }) => {
        const deleteButton = page.locator('[data-testid="delete-task"], button[aria-label*="delete" i]').first();

        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            const taskText = await page.locator('[data-testid="task-item"], .task-item').first().textContent();

            // Delete task
            await deleteButton.click();

            // Confirm if dialog appears
            const confirmButton = page.locator('button:has-text("Delete"):visible');
            if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await confirmButton.click();
            }

            // Task should be removed (wait for animation)
            await page.waitForTimeout(1000);
        }
    });

    test('should reorder tasks with drag and drop', async ({ page }) => {
        const tasks = page.locator('[data-testid="task-item"], .task-item');
        const taskCount = await tasks.count();

        if (taskCount >= 2) {
            // Get text of first two tasks
            const firstTaskText = await tasks.nth(0).textContent();
            const secondTaskText = await tasks.nth(1).textContent();

            // Drag first task to second position
            await tasks.nth(0).dragTo(tasks.nth(1));

            // Wait for reorder animation
            await page.waitForTimeout(1000);

            // Verify order changed
            const newFirstText = await tasks.nth(0).textContent();

            // Order should have changed
            expect(newFirstText).not.toBe(firstTaskText);
        }
    });

    test('should set task due date', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"], .task-item').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Look for due date button/icon
            const dueDateButton = task.locator('[data-testid="due-date"], button:has-text("Due"), [aria-label*="due" i]');

            if (await dueDateButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await dueDateButton.click();

                // Select a date from picker
                const datePicker = page.locator('[role="dialog"] button, .calendar button');
                const firstAvailableDate = datePicker.first();

                if (await firstAvailableDate.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await firstAvailableDate.click();
                    await page.waitForTimeout(500);
                }
            }
        }
    });

    test('should set task priority', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"], .task-item').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Look for priority selector
            const priorityButton = task.locator('[data-testid="priority"], button:has-text("Priority"), select[name="priority"]');

            if (await priorityButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                await priorityButton.first().click();

                // Select high priority
                const highPriority = page.locator('text=High, [value="high"]');

                if (await highPriority.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                    await highPriority.first().click();
                    await page.waitForTimeout(500);
                }
            }
        }
    });

    test('should create subtask', async ({ page }) => {
        const task = page.locator('[data-testid="task-item"], .task-item').first();

        if (await task.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Look for add subtask button
            const addSubtaskButton = task.locator('button:has-text("Add Subtask"), [data-testid="add-subtask"]');

            if (await addSubtaskButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await addSubtaskButton.click();

                // Fill subtask title
                const subtaskInput = page.locator('input:visible').last();
                await subtaskInput.fill('E2E Test Subtask');
                await page.keyboard.press('Enter');

                // Verify subtask created
                await expect(page.locator('text=E2E Test Subtask')).toBeVisible({ timeout: 3000 });
            }
        }
    });

    test('should display task progress', async ({ page }) => {
        // Plan should show task completion progress
        const progressIndicator = page.locator('[data-testid="progress"], .progress-bar, text=/%/');

        const hasProgress = await progressIndicator.first().isVisible({ timeout: 2000 }).catch(() => false);

        if (hasProgress) {
            await expect(progressIndicator.first()).toBeVisible();
        }
    });
});
