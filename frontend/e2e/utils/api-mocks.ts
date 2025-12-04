import { Page, Route } from '@playwright/test';

// Mock AI plan generation response
export const mockPlanGenerationResponse = {
    plan_id: 'mock-plan-123',
    title: 'Learn React Development',
    description: 'A comprehensive plan to learn React',
    status: 'active',
    tasks: [
        {
            id: 'task-1',
            title: 'Set up development environment',
            description: 'Install Node.js, npm, and create-react-app',
            status: 'pending',
            order_index: 0,
        },
        {
            id: 'task-2',
            title: 'Learn JavaScript fundamentals',
            description: 'Master ES6+ features, promises, and async/await',
            status: 'pending',
            order_index: 1,
        },
        {
            id: 'task-3',
            title: 'Study React basics',
            description: 'Understand components, props, and state',
            status: 'pending',
            order_index: 2,
        },
    ],
};

// Mock AI chat response
export const mockChatResponse = {
    message: 'I can help you with that! Here are some suggestions...',
    suggestions: [
        {
            type: 'add_task',
            title: 'Write unit tests',
            description: 'Add comprehensive test coverage',
        },
    ],
};

// Mock file upload response
export const mockUploadResponse = {
    file_id: 'file-123',
    file_name: 'test-image.png',
    file_url: 'https://example.com/uploads/test-image.png',
    file_size: 12345,
};

/**
 * Intercept and mock AI plan generation API call
 */
export async function mockAIPlanGeneration(page: Page) {
    await page.route('**/api/plans/generate', async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockPlanGenerationResponse),
        });
    });
}

/**
 * Intercept and mock AI chat API call
 */
export async function mockAIChat(page: Page) {
    await page.route('**/api/plans/*/chat', async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockChatResponse),
        });
    });
}

/**
 * Intercept and mock file upload API call
 */
export async function mockFileUpload(page: Page) {
    await page.route('**/api/uploads/**', async (route: Route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockUploadResponse),
        });
    });
}

/**
 * Mock all API calls for faster testing
 */
export async function mockAllAPIs(page: Page) {
    await mockAIPlanGeneration(page);
    await mockAIChat(page);
    await mockFileUpload(page);
}

/**
 * Simulate network error
 */
export async function simulateNetworkError(page: Page, urlPattern: string | RegExp) {
    await page.route(urlPattern, async (route: Route) => {
        await route.abort('failed');
    });
}

/**
 * Simulate slow network
 */
export async function simulateSlowNetwork(page: Page, urlPattern: string | RegExp, delayMs: number = 3000) {
    await page.route(urlPattern, async (route: Route) => {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        await route.continue();
    });
}

/**
 * Clear all route mocks
 */
export async function clearMocks(page: Page) {
    await page.unroute('**/*');
}
