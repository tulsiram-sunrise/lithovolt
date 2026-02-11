# Frontend Testing - Quick Start

## Installation

```bash
cd frontend
npm install
```

This will install all testing dependencies:
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- @vitest/ui
- jsdom

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm test -- --watch

# Run specific test file
npm test -- LoadingSpinner.test.jsx

# Run tests matching a pattern
npm test -- --grep "admin"
```

### Interactive UI

```bash
# Open Vitest UI in browser
npm run test:ui
```

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
# Open coverage/index.html in browser
```

## Test Files Structure

```
frontend/src/
├── components/
│   └── common/
│       ├── LoadingSpinner.jsx
│       ├── LoadingSpinner.test.jsx  ✅
│       ├── ErrorMessage.jsx
│       ├── ErrorMessage.test.jsx    ✅
│       ├── EmptyState.jsx
│       ├── EmptyState.test.jsx      ✅
│       ├── ToastContainer.jsx
│       └── ToastContainer.test.jsx  ✅
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.test.jsx       ✅
│   │   ├── BatteryModelsPage.jsx
│   │   ├── BatteryModelsPage.test.jsx ✅
│   │   └── OrdersPage.test.jsx      ✅
│   ├── wholesaler/
│   │   ├── OrdersPage.test.jsx      ✅
│   │   └── SalesPage.test.jsx       ✅
│   └── customer/
│       ├── WarrantiesPage.test.jsx  ✅
│       └── ClaimWarrantyPage.test.jsx ✅
├── store/
│   ├── authStore.test.js            ✅
│   └── toastStore.test.js           ✅
├── services/
│   └── api.test.js                  ✅
└── test/
    ├── setup.js                     (global setup)
    └── helpers.jsx                  (test utilities)
```

## Writing New Tests

### 1. Create test file next to component

```javascript
// MyComponent.test.jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '../../../test/helpers'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <MyComponent />
      </TestWrapper>
    )
    
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### 2. Mock API calls

```javascript
import * as api from '../../../services/api'
import { vi } from 'vitest'

vi.mock('../../../services/api')

api.orderAPI.getOrders = vi.fn(() =>
  Promise.resolve({ data: { results: [] } })
)
```

### 3. Test user interactions

```javascript
import { fireEvent, waitFor } from '@testing-library/react'

it('handles button click', async () => {
  render(<MyComponent />)
  
  const button = screen.getByText('Submit')
  fireEvent.click(button)
  
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

## Debugging Tests

### Console output

```bash
# Run single test with console output
npm test -- MyComponent.test.jsx

# Add debug statements in test
import { screen } from '@testing-library/react'
screen.debug() // prints DOM tree
```

### Isolate failing test

```javascript
// Use .only to run single test
it.only('this test only', () => {
  // ...
})

// Skip tests
it.skip('skip this test', () => {
  // ...
})
```

## Common Test Patterns

### Testing forms

```javascript
const input = screen.getByLabelText(/email/i)
fireEvent.change(input, { target: { value: 'test@example.com' } })
expect(input.value).toBe('test@example.com')
```

### Testing async operations

```javascript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

### Testing loading states

```javascript
expect(screen.getByText('Loading...')).toBeInTheDocument()
```

### Testing error states

```javascript
expect(screen.getByText(/error/i)).toBeInTheDocument()
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test
      
      - name: Generate coverage
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
```

## Troubleshooting

### Tests hanging
- Check for missing `await` on async operations
- Ensure all API mocks return resolved promises
- Look for infinite loops in components

### "Cannot find module" errors
- Check import paths are correct
- Ensure test files are in correct location
- Verify vitest.config.js is correct

### Mock not working
- Ensure vi.mock() is called before imports
- Check mock is returning correct data structure
- Clear mocks with vi.clearAllMocks() in beforeEach

### Timeout errors
- Increase timeout: `waitFor(() => {}, { timeout: 5000 })`
- Check if API call is actually being made
- Verify mock is resolving, not hanging

## Best Practices

✅ **DO**
- Test user behavior, not implementation
- Use accessible queries (getByRole, getByLabelText)
- Mock external dependencies
- Keep tests focused and small
- Use descriptive test names

❌ **DON'T**
- Test implementation details
- Use arbitrary waitFor delays
- Access component state directly
- Write tests that depend on each other
- Mock everything (test real logic when possible)

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Total Test Files**: 15+  
**Test Coverage Goal**: >80%  
**Estimated Run Time**: ~5-10 seconds

Run `npm test` to get started! 🚀
