# E2E Tests with Playwright

This directory contains end-to-end tests for the Captain Bitbeard frontend.

## Setup

### Install Dependencies

```bash
npm install
npx playwright install chromium
```

### Install System Dependencies (Linux)

On Linux, you need system libraries for Chromium:

```bash
npx playwright install-deps chromium
```

Or manually install:

```bash
sudo apt-get update
sudo apt-get install -y \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2
```

## Running Tests

### Against Local Dev Server

The dev server will start automatically:

```bash
npm run test:e2e
```

### Against Running Application

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

### With UI Mode

```bash
npm run test:e2e:ui
```

### With Browser Visible (Headed Mode)

```bash
npm run test:e2e:headed
```

### Debug Mode

```bash
npm run test:e2e:debug
```

## Test Suites

### Homepage Tests (`homepage.spec.ts`)
- Page loads correctly
- Navigation elements are visible
- Press Start 2P font loads
- Content is visible (not just blue screen)

### Authentication Tests (`auth.spec.ts`)
- Login page navigation
- Form validation
- Login with credentials

### Navigation Tests (`navigation.spec.ts`)
- Navigation links work
- Page transitions without errors
- 404 handling

### Accessibility Tests (`accessibility.spec.ts`)
- Document structure (lang, viewport, title)
- Keyboard navigation
- Image alt text
- Heading hierarchy
- Color contrast

## CI/CD Integration

Add to your workflow:

```yaml
- name: Install Playwright
  run: |
    npm install
    npx playwright install chromium
    npx playwright install-deps chromium

- name: Run E2E Tests
  run: PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Troubleshooting

### Missing System Libraries

If you see errors like `libatk-1.0.so.0: cannot open shared object file`:

```bash
npx playwright install-deps chromium
```

### Tests Failing on CI

Make sure the application is running before tests:

```yaml
- name: Start Application
  run: docker compose up -d

- name: Wait for Services
  run: sleep 30

- name: Run E2E Tests
  run: PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## Configuration

See `playwright.config.ts` for configuration options.
