# Testing Guide - Captain Bitbeard

Comprehensive testing strategy and guidelines.

## Test Coverage

### Backend Tests (Jest + TypeScript)

**Location:** `backend/src/__tests__/`

**Run Tests:**
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Categories:**

1. **Unit Tests** - Service layer
   - `services/minio.service.test.ts` - MinIO operations
   - `services/game.service.test.ts` - Game CRUD logic

2. **Integration Tests** - API endpoints
   - `controllers/game.controller.test.ts` - Full API testing

**Coverage Threshold:** 70% (branches, functions, lines, statements)

### Frontend Tests (Vitest + React Testing Library)

**Location:** `frontend/src/__tests__/`

**Run Tests:**
```bash
cd frontend

# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

**Test Categories:**

1. **Component Tests**
   - `components/GameGrid.test.tsx` - Game library grid
   - `components/RomUpload.test.tsx` - ROM upload form

2. **Integration Tests** (Future)
   - API integration
   - Router navigation

## Test Structure

### Backend Test Example

```typescript
import { GameService } from '../../services/game.service';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    it('should create a game with ROM upload', async () => {
      // Arrange
      const mockGame = { /* ... */ };
      prisma.game.create.mockResolvedValue(mockGame);

      // Act
      const result = await gameService.createGame({ /* ... */ });

      // Assert
      expect(result).toEqual(mockGame);
      expect(prisma.game.create).toHaveBeenCalled();
    });
  });
});
```

### Frontend Test Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { GameGrid } from '../../components/GameGrid';

describe('GameGrid', () => {
  it('should render games after loading', async () => {
    // Arrange
    vi.mocked(api.gameApi.getGames).mockResolvedValue({
      data: { games: mockGames }
    });

    // Act
    render(<GameGrid />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Super Mario Bros')).toBeInTheDocument();
    });
  });
});
```

## Mocking Strategy

### Backend Mocks

**Prisma Client:**
```typescript
// Mocked in __tests__/setup.ts
jest.mock('@prisma/client');
```

**MinIO Client:**
```typescript
// Mocked in __tests__/setup.ts
jest.mock('minio');
```

### Frontend Mocks

**API Services:**
```typescript
vi.mock('../../services/api');
vi.mocked(api.gameApi.getGames).mockResolvedValue({ /* ... */ });
```

**Browser APIs:**
```typescript
// Screen orientation, wake lock, etc.
// Mocked in __tests__/setup.ts
```

## Test Data

### Mock Games

```typescript
const mockGames = [
  {
    id: '1',
    title: 'Super Mario Bros',
    system: 'nes',
    romPath: 'roms/nes/mario.nes',
    coverUrl: 'http://localhost:9000/covers/1.jpg',
  },
];
```

### Mock Files

```typescript
const mockRomFile = new File(['test'], 'game.nes', {
  type: 'application/octet-stream',
});
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

```yaml
# Backend
- npm ci
- npm run test:coverage

# Frontend
- npm ci
- npm run test
```

**Coverage Upload:**
- Codecov integration
- Coverage reports in artifacts

## Coverage Reports

### View Coverage Locally

**Backend:**
```bash
cd backend
npm run test:coverage
open coverage/lcov-report/index.html
```

**Frontend:**
```bash
cd frontend
npm run test:coverage
open coverage/index.html
```

## Writing New Tests

### Backend Service Test

1. Create `src/__tests__/services/your-service.test.ts`
2. Mock dependencies (Prisma, MinIO, etc.)
3. Test all public methods
4. Test error cases
5. Aim for >70% coverage

### Frontend Component Test

1. Create `src/__tests__/components/YourComponent.test.tsx`
2. Mock API calls
3. Test rendering
4. Test user interactions
5. Test loading/error states

### API Integration Test

1. Use `supertest` for HTTP testing
2. Mock service layer
3. Test all endpoints
4. Test validation
5. Test error responses

## Best Practices

### General

- **AAA Pattern:** Arrange, Act, Assert
- **One Assertion per Test:** Keep tests focused
- **Descriptive Names:** Use "should..." format
- **Clean Up:** Clear mocks in `beforeEach`
- **Isolation:** Tests should not depend on each other

### Backend

- Mock external dependencies (DB, S3, APIs)
- Test business logic thoroughly
- Validate error handling
- Test edge cases
- Use factories for test data

### Frontend

- Test user behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Wait for async operations (`waitFor`)
- Test accessibility
- Avoid snapshot tests for complex components

### What NOT to Test

- Third-party libraries (EmulatorJS, Prisma, etc.)
- Framework internals (React, Express)
- Trivial code (getters/setters)
- Implementation details

## Debugging Tests

### Backend

```bash
# Run specific test file
npm test -- game.service.test.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose
```

### Frontend

```bash
# Run specific test
npm test -- GameGrid.test.tsx

# UI mode (interactive)
npm run test:ui

# Debug in browser
npm run test:ui
# Then open browser to http://localhost:51204/__vitest__/
```

## Test Maintenance

### When to Update Tests

- Feature changes
- Bug fixes
- Refactoring
- API changes
- New edge cases discovered

### Keeping Tests Green

1. Run tests before committing
2. Fix failing tests immediately
3. Don't skip or disable tests
4. Update tests with code changes
5. Review test failures in CI

## Future Enhancements

- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] Load tests for API
- [ ] Accessibility audits
- [ ] Security tests (OWASP ZAP)
- [ ] Mutation testing

## Troubleshooting

### Common Issues

**"Cannot find module..."**
- Check mock paths
- Verify imports
- Run `npm install`

**"Timeout exceeded..."**
- Increase timeout in test
- Check for unresolved promises
- Verify async/await usage

**"Element not found..."**
- Use `waitFor` for async elements
- Check component rendering
- Verify test data

### Getting Help

- Check test output carefully
- Read error stack traces
- Review documentation
- Ask in GitHub Discussions

---

**Test responsibly, Captain! 🧪🏴‍☠️**
