# E2E Testing Guide - PlanGenie

Comprehensive guide for running and writing end-to-end tests using Playwright.

## Table of Contents
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Installation

### 1. Install Dependencies

The Playwright package is already installed. If you need to reinstall:

```bash
cd frontend
npm install -D @playwright/test --legacy-peer-deps
```

### 2. Install Browsers

Install Playwright browsers (Chromium, Firefox, WebKit):

```bash
npx playwright install
```

### 3. Set Up Test Environment

Copy the test environment template:

```bash
cp .env.test.example .env.test.local
```

Edit `.env.test.local` with your test credentials:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3004
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

## Running Tests

### All Tests

Run all E2E tests:

```bash
npm run test:e2e
```

### Specific Browser

```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

### Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### UI Mode (Interactive)

Best for debugging and development:

```bash
npm run test:e2e:ui
```

### Debug Mode

Run with Playwright Inspector:

```bash
npm run test:e2e:debug
```

### Specific Test File

```bash
npm run test:e2e -- auth.spec.ts
npm run test:e2e -- plans.spec.ts
```

### Specific Test

```bash
npm run test:e2e -- -g "should login with valid credentials"
```

### Generate Tests (Codegen)

Record user actions to generate test code:

```bash
npm run test:e2e:codegen
```

## Test Structure

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   └── auth.ts              # Authentication fixtures
│   ├── utils/
│   │   ├── helpers.ts           # Test helper functions
│   │   └── api-mocks.ts         # API mocking utilities
│   └── tests/
│       ├── auth.spec.ts         # Authentication tests
│       ├── plans.spec.ts        # Plan management tests
│       ├── tasks.spec.ts        # Task management tests
│       ├── uploads.spec.ts      # File upload tests
│       ├── chat.spec.ts         # AI chat tests
│       └── dashboard.spec.ts    # Dashboard tests
├── playwright.config.ts          # Playwright configuration
└── .env.test.local              # Test environment variables
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { login } from '../fixtures/auth';
import { waitForToast, navigateTo } from '../utils/helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should do something', async ({ page }) => {
    await navigateTo(page, '/some-page');
    
    // Your test assertions
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Fixtures

Authentication fixture for logged-in tests:

```typescript
import { login, logout } from '../fixtures/auth';

test('needs authentication', async ({ page }) => {
  await login(page);
  
  // Your test code
  
  await logout(page);
});
```

### Using Helper Functions

```typescript
import { 
  waitForToast, 
  waitForLoadingComplete,
  navigateTo,
  generateTestData 
} from '../utils/helpers';

test('helper example', async ({ page }) => {
  // Generate test data
  const testData = generateTestData('My Test');
  
  // Navigate and wait for loading
  await navigateTo(page, '/dashboard');
  
  // Wait for toast notification
  await waitForToast(page, 'Success');
});
```

### API Mocking

Mock API calls for faster, deterministic tests:

```typescript
import { mockAIPlanGeneration, mockAIChat } from '../utils/api-mocks';

test('with mocked API', async ({ page }) => {
  await mockAIPlanGeneration(page);
  
  // Now AI calls will return mock data
  await page.goto('/new-plan');
  // ...
});
```

## Best Practices

### 1. Use Data Attributes

Add `data-testid` attributes to your components:

```tsx
<button data-testid="submit-button">Submit</button>
```

Then select in tests:

```typescript
await page.click('[data-testid="submit-button"]');
```

### 2. Wait for Elements

Always wait for elements before interacting:

```typescript
// Good
await page.locator('button').waitFor();
await page.click('button');

// Better - implicit waiting
await expect(page.locator('button')).toBeVisible();
await page.click('button');
```

### 3. Use Soft Assertions

For multiple checks that shouldn't stop the test:

```typescript
await expect.soft(page.locator('h1')).toContainText('Title');
await expect.soft(page.locator('p')).toContainText('Description');
```

### 4. Clean Up Test Data

```typescript
test.afterEach(async ({ page }) => {
  // Delete created test data
  await cleanupTestPlans(page);
});
```

### 5. Handle Flaky Tests

Use retries for flaky tests:

```typescript
test('potentially flaky test', async ({ page }) => {
  test.setTimeout(30000); // 30 seconds
  test.slow(); // Mark as slow (3x timeout)
  
  // Test code
});
```

## Debugging

### 1. Debug Mode

Run with inspector:

```bash
npm run test:e2e:debug
```

### 2. Headed Mode

See the browser while tests run:

```bash
npm run test:e2e:headed
```

### 3. Screenshots

Automatically captured on failure. Manual screenshot:

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 4. Videos

Videos are recorded on failure. Check `test-results/` folder.

### 5. Traces

View traces for failed tests:

```bash
npx playwright show-trace test-results/trace.zip
```

### 6. Console Logs

See browser console:

```typescript
page.on('console', msg => console.log(msg.text()));
```

## CI/CD Integration

### GitHub Actions

Tests automatically run on:
- Push to `main` or `develop` branches
- Pull requests

### Required Secrets

Add these to your GitHub repository secrets:

- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

### View Results

1. Go to Actions tab in GitHub
2. Click on the workflow run
3. Download artifacts (playwright-report, test-videos)

## Troubleshooting

### Tests Timeout

**Problem**: Tests timeout waiting for elements

**Solution**:
```typescript
// Increase timeout
test.setTimeout(60000); // 60 seconds

// Or increase action timeout
await page.click('button', { timeout: 30000 });
```

### Element Not Found

**Problem**: `Element not found` errors

**Solution**:
```typescript
// Wait for element
await page.waitForSelector('button');

// Or use timeout
await page.click('button', { timeout: 10000 });

// Check if visible first
if (await page.locator('button').isVisible({ timeout: 2000 })) {
  await page.click('button');
}
```

### Authentication Issues

**Problem**: Tests fail because not authenticated

**Solution**:
```typescript
// Use login fixture
await login(page);

// Or check authentication state
const isLoggedIn = page.url().includes('/dashboard');
if (!isLoggedIn) {
  await login(page);
}
```

### Slow Tests

**Problem**: Tests run too slowly

**Solution**:
- Use API mocking for AI calls
- Run tests in parallel
- Use `test.skip()` for non-critical tests during development

```typescript
// Mock AI to avoid actual API calls
await mockAIPlanGeneration(page);
```

### Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solution**:
```typescript
// Add explicit waits
await page.waitForLoadState('networkidle');

// Retry flaky operations
await retryAction(async () => {
  await page.click('button');
}, 3);

// Increase timeout
test.setTimeout(60000);
```

### Browser Installation Fails

**Problem**: `npx playwright install` fails

**Solution**:
```bash
# Install with specific browser
npx playwright install chromium

# Install with dependencies
npx playwright install --with-deps

# Use system browser (for CI)
npm run test:e2e -- --project=chromium
```

## Test Coverage

Current test coverage:
- **Authentication**: 8 tests (login, signup, logout, protected routes)
- **Plans**: 9 tests (create, view, delete, filter, statistics)
- **Tasks**: 10 tests (CRUD, reorder, due dates, priorities, subtasks)
- **Uploads**: 8 tests (upload, preview, delete, validation)
- **Chat**: 8 tests (send, receive, suggestions, history)
- **Dashboard**: 15 tests (display, navigation, filtering, responsive)

**Total**: 58+ E2E test scenarios

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

---

**Questions?** Check the main [README.md](../README.md) or open an issue on GitHub.
