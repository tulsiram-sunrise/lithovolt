# Frontend Test Suite Documentation

## Overview
Comprehensive test suite for the Lithovolt frontend application using Vitest and React Testing Library.

## Test Coverage

### ✅ Common Components
- **LoadingSpinner.test.jsx**
  - Renders with different sizes (sm, md, lg)
  - Applies custom className
  - Has accessible label
  
- **ErrorMessage.test.jsx**
  - Renders default and custom messages
  - Shows/hides retry button based on onRetry prop
  - Calls onRetry callback on button click
  - Displays error icon
  
- **EmptyState.test.jsx**
  - Renders with default/custom messages
  - Displays custom icon and action button
  - LoadingState variant with spinner
  
- **ToastContainer.test.jsx**
  - Renders nothing when no toasts
  - Displays success and error toasts
  - Removes toast on close button click
  - Auto-removes toast after duration
  - Handles multiple toasts

### ✅ State Management
- **authStore.test.js**
  - Initializes with default state
  - Sets user and token on login
  - Clears state on logout
  - Updates user profile
  - Persists token to localStorage
  
- **toastStore.test.js**
  - Adds and removes toasts
  - Generates unique IDs for toasts
  - Auto-removes after default/custom duration
  - Handles multiple toasts

### ✅ Admin Pages
- **Dashboard.test.jsx**
  - Renders loading state
  - Displays metrics when loaded
  - Shows recent orders
  - Handles error state with retry
  
- **BatteryModelsPage.test.jsx**
  - Lists battery models
  - Shows loading state
  - Submits new model creation
  - Shows toast on success
  
- **OrdersPage.test.jsx**
  - Lists orders
  - Filters by status
  - Accepts/rejects/fulfills orders
  - Shows toast notifications

### ✅ Wholesaler Pages
- **OrdersPage.test.jsx**
  - Renders form and order list
  - Adds multiple order items
  - Submits order with items
  - Shows invoice for fulfilled orders
  
- **SalesPage.test.jsx**
  - Displays issued warranties
  - Validates consumer contact info
  - Issues warranty with consumer details
  - Shows certificate download button

### ✅ Customer Pages
- **WarrantiesPage.test.jsx**
  - Lists customer warranties
  - Shows certificate download button
  - Handles certificate download
  - Shows empty state
  
- **ClaimWarrantyPage.test.jsx**
  - Renders claim form
  - Submits warranty claim
  - Shows success/error messages
  - Disables button while loading

### ✅ API Services
- **api.test.js**
  - Tests all API endpoints
  - Verifies correct HTTP methods
  - Checks request parameters
  - Validates response handling

## Test Setup

### Dependencies
```json
{
  "vitest": "^1.2.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.6",
  "@testing-library/user-event": "^14.5.1",
  "@vitest/ui": "^1.2.0",
  "jsdom": "^23.2.0"
}
```

### Configuration
- **vitest.config.js**: Test runner configuration
- **src/test/setup.js**: Global test setup and mocks
- **src/test/helpers.jsx**: Test utilities and mock data

## Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Watch mode during development
npm test -- --watch
```

## Test Patterns

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { TestWrapper } from '../../../test/helpers'

it('renders component', () => {
  render(
    <TestWrapper>
      <MyComponent />
    </TestWrapper>
  )
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### API Mocking
```javascript
import * as api from '../../../services/api'
vi.mock('../../../services/api')

api.orderAPI.getOrders = vi.fn(() =>
  Promise.resolve({ data: { results: [] } })
)
```

### Async Testing
```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### User Interactions
```javascript
fireEvent.click(screen.getByText('Submit'))
fireEvent.change(input, { target: { value: 'test' } })
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **User-centric**: Test from user perspective
3. **Mock external dependencies**: API calls, timers, etc.
4. **Cleanup**: Use beforeEach/afterEach hooks
5. **Descriptive names**: Clear test descriptions
6. **Test behavior, not implementation**: Focus on what users see/do

## Mocked Utilities

### Global Mocks (setup.js)
- `window.matchMedia`
- `IntersectionObserver`
- `URL.createObjectURL`
- `URL.revokeObjectURL`
- Environment variables

### Test Helpers
- `TestWrapper`: Provides Router and Query Client
- `createTestQueryClient`: Creates isolated query client
- Mock data: users, orders, warranties, battery models

## CI/CD Integration

Add to your pipeline:
```yaml
- name: Run Frontend Tests
  run: |
    cd frontend
    npm ci
    npm test
    npm run test:coverage
```

## Maintenance

- Update tests when adding new features
- Keep mock data in sync with backend models
- Review coverage reports regularly
- Refactor tests when components change
- Add integration tests for critical flows

## Future Enhancements

- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression tests
- [ ] Performance tests
- [ ] Accessibility tests (a11y)
- [ ] Snapshot tests for complex components
- [ ] Mock Service Worker for API mocking
- [ ] Test user authentication flows
- [ ] Test file upload scenarios

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status**: Comprehensive test suite implemented with 15+ test files covering components, pages, stores, and API services.
