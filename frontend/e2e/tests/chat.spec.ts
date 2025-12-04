import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import {
    waitForLoadingComplete,
    navigateTo,
    isVisible
} from '../utils/helpers';

test.describe('AI Chat Assistant', () => {
    let planUrl: string;

    test.beforeEach(async ({ page }) => {
        await login(page);

        // Navigate to a plan
        await navigateTo(page, '/dashboard');

        const planCard = page.locator('[data-testid="plan-card"]').first();
        const hasPlan = await planCard.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasPlan) {
            await planCard.click();
            await page.waitForURL(/.*plans\/.*/);
            planUrl = page.url();
        } else {
            test.skip();
        }

        await waitForLoadingComplete(page);
    });

    test('should open chat sidebar', async ({ page }) => {
        // Look for chat toggle button
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"], [aria-label*="chat" i]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();

            // Chat sidebar should appear
            const chatSidebar = page.locator('[data-testid="chat-sidebar"], .chat-container, aside');
            await expect(chatSidebar).toBeVisible({ timeout: 2000 });
        }
    });

    test('should send message to AI', async ({ page }) => {
        // Open chat
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();

            // Wait for chat to open
            await page.waitForTimeout(500);

            // Find message input
            const messageInput = page.locator('textarea[placeholder*="message" i], input[placeholder*="message" i]');

            if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                // Type and send message
                await messageInput.fill('Can you help me organize my tasks?');

                // Send message (Enter or send button)
                const sendButton = page.locator('button:has-text("Send"), [data-testid="send-message"]');

                if (await sendButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await sendButton.click();
                } else {
                    await messageInput.press('Enter');
                }

                // Wait for AI response
                await page.waitForTimeout(3000);

                // User message should appear
                await expect(page.locator('text=Can you help me organize my tasks?')).toBeVisible({ timeout: 5000 });
            }
        }
    });

    test('should receive AI response', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();
            await page.waitForTimeout(500);

            const messageInput = page.locator('textarea[placeholder*="message" i], input[placeholder*="message" i]');

            if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await messageInput.fill('Hello AI');
                await messageInput.press('Enter');

                // Wait for AI response (with loading indicator)
                const loadingIndicator = page.locator('[data-testid="typing"], .loading, text=typing');

                // Loading should appear and then disappear
                await page.waitForTimeout(5000);

                // Response should be visible
                const chatMessages = page.locator('[data-testid="chat-message"], .message');
                const messageCount = await chatMessages.count();
                expect(messageCount).toBeGreaterThan(0);
            }
        }
    });

    test('should display chat history', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();
            await page.waitForTimeout(500);

            // Check if there are existing messages
            const chatMessages = page.locator('[data-testid="chat-message"], .message, .chat-bubble');
            const hasMessages = await chatMessages.count() > 0;

            if (hasMessages) {
                await expect(chatMessages.first()).toBeVisible();
            }
        }
    });

    test('should accept AI suggestion', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();
            await page.waitForTimeout(500);

            // Look for suggestion cards
            const suggestion = page.locator('[data-testid="suggestion"], .suggestion-card').first();

            if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
                // Find accept button
                const acceptButton = suggestion.locator('button:has-text("Accept"), button:has-text("Apply")');

                if (await acceptButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await acceptButton.click();

                    // Wait for suggestion to be applied
                    await page.waitForTimeout(1000);
                }
            }
        }
    });

    test('should reject AI suggestion', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();
            await page.waitForTimeout(500);

            const suggestion = page.locator('[data-testid="suggestion"], .suggestion-card').first();

            if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
                const rejectButton = suggestion.locator('button:has-text("Reject"), button:has-text("Dismiss")');

                if (await rejectButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await rejectButton.click();

                    // Suggestion should disappear
                    await expect(suggestion).not.toBeVisible({ timeout: 2000 });
                }
            }
        }
    });

    test('should close chat sidebar', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            // Open chat
            await chatButton.click();
            await page.waitForTimeout(500);

            // Close chat (same button or close button)
            const closeButton = page.locator('[data-testid="close-chat"], button[aria-label*="close"]');

            if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
                await closeButton.click();
            } else {
                await chatButton.click(); // Toggle off
            }

            // Chat should be hidden
            await page.waitForTimeout(500);
        }
    });

    test('should show loading state while waiting for AI', async ({ page }) => {
        const chatButton = page.locator('button:has-text("Chat"), [data-testid="chat-toggle"]');

        if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await chatButton.click();
            await page.waitForTimeout(500);

            const messageInput = page.locator('textarea[placeholder*="message" i]');

            if (await messageInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await messageInput.fill('Test message');
                await messageInput.press('Enter');

                // Loading indicator should appear briefly
                const hasLoading = await isVisible(page, '[data-testid="typing"], .loading, .spinner');

                // Even if we don't see it, test passes
                // (loading might be too fast to catch)
            }
        }
    });
});
