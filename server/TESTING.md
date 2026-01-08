# Testing Guide

This document describes the testing setup and practices for the Cashplan.io backend server.

## Test Framework

We use the following testing tools:

- **Mocha**: Test runner and framework
- **Chai**: Assertion library
- **Sinon**: Mocking and stubbing library
- **c8**: Code coverage tool

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

Tests are located alongside their source files with a `.test.ts` suffix:

```
src/
├── services/
│   ├── calculator.ts
│   └── calculator.test.ts
├── models/
│   ├── events.ts
│   ├── events.test.ts
│   ├── plan.ts
│   └── plan.test.ts
├── utils/
│   ├── user-id.ts
│   └── user-id.test.ts
└── test/
    └── setup.ts
```

## Test Naming Convention

Following the project's kebab-case convention:

- ✅ `calculator.test.ts`
- ✅ `user-id.test.ts`
- ✅ `financial-calculator.test.ts`
- ❌ `CalculatorTest.ts`
- ❌ `Calculator.test.ts`

## Writing Tests

### Basic Structure

```typescript
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = someFunction(input);
      
      // Assert
      expect(result).to.equal('expected');
    });
  });
});
```

### Using beforeEach and afterEach

```typescript
describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // Clean up if needed
  });

  it('should calculate', () => {
    const result = calculator.calculate();
    expect(result).to.exist;
  });
});
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).to.equal('expected');
});
```

### Using Sinon for Mocking

```typescript
import sinon from 'sinon';

describe('API Service', () => {
  it('should call external API', () => {
    const stub = sinon.stub(fetch, 'get').resolves({ data: 'mocked' });
    
    const result = await apiService.getData();
    
    expect(stub.calledOnce).to.be.true;
    expect(result.data).to.equal('mocked');
    
    stub.restore();
  });
});
```

## Test Coverage

We aim for high test coverage, especially for:

- Business logic (calculators, services)
- Utility functions
- Model transformations
- API endpoints (integration tests)

Run coverage reports with:
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Test Environment

Tests use a separate `.env.test` file with test-specific configuration:

- In-memory SQLite database (`:memory:`)
- Test OAuth credentials
- Debug logging disabled

## Best Practices

1. **Descriptive Test Names**: Use clear, descriptive test names that explain what is being tested
   ```typescript
   ✅ it('should calculate monthly payment with 5% interest rate')
   ❌ it('test1')
   ```

2. **One Assertion Per Test**: Focus each test on a single behavior
   ```typescript
   ✅ it('should return positive liquidity')
   ✅ it('should calculate correct asset value')
   ❌ it('should calculate everything')
   ```

3. **Arrange-Act-Assert Pattern**: Structure tests clearly
   ```typescript
   it('should add two numbers', () => {
     // Arrange
     const a = 1, b = 2;
     
     // Act
     const result = add(a, b);
     
     // Assert
     expect(result).to.equal(3);
   });
   ```

4. **Test Edge Cases**: Include tests for boundary conditions, error cases, and edge cases
   ```typescript
   it('should handle zero values')
   it('should handle negative values')
   it('should handle empty arrays')
   it('should throw error for invalid input')
   ```

5. **Avoid Test Interdependence**: Each test should be independent and not rely on others
   ```typescript
   ✅ Use beforeEach to set up fresh state
   ❌ Don't rely on previous test's state
   ```

6. **Keep Tests Fast**: Unit tests should run quickly
   - Mock external dependencies
   - Use in-memory databases for tests
   - Avoid unnecessary delays

## Continuous Integration

Tests are run automatically on:
- Every commit (pre-commit hook - if configured)
- Pull requests
- Before deployment

Ensure all tests pass before pushing code.

## Debugging Tests

### Run a specific test file
```bash
npx mocha --require tsx/cjs --extensions ts src/services/calculator.test.ts
```

### Run a specific test
```bash
npx mocha --require tsx/cjs --extensions ts src/services/calculator.test.ts --grep "should calculate basic income"
```

### Enable debug output
```bash
DEBUG=* npm test
```

## Example Tests

See the following files for test examples:

- `src/services/calculator.test.ts` - Complex business logic testing
- `src/models/events.test.ts` - Model transformation testing
- `src/utils/user-id.test.ts` - Utility function testing

## Adding New Tests

When adding new functionality:

1. Write tests first (TDD approach recommended)
2. Ensure tests cover happy path and edge cases
3. Run tests locally before committing
4. Update this guide if introducing new testing patterns

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Sinon Mocking Library](https://sinonjs.org/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

