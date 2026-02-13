# Test Execution Guide

## Problem
During task execution, tests are run multiple times causing chat to summarize repeatedly (around 10 times), which disrupts the workflow.

## Solution
This guide provides a streamlined approach to execute tests efficiently in one pass.

## Quick Test Execution

### Run All Tests Once
```bash
npm test -- --run --reporter=verbose
```

### Run Specific Test File
```bash
npm test -- --run src/test/[filename].test.tsx
```

### Run Tests with Coverage
```bash
npm test -- --run --coverage
```

## Test Execution Strategy

### For Task Execution:
1. **Write all code first** - Complete the implementation before running any tests
2. **Run tests once** - Execute the test suite one time after code is complete
3. **Fix issues in batch** - If tests fail, fix all issues together, then run tests once more
4. **Maximum 2 test runs** - Initial run + one fix attempt maximum

### Avoiding Multiple Test Cycles:
- ✅ DO: Write complete implementation → Run tests once → Fix all failures → Run tests once more
- ❌ DON'T: Write code → Test → Fix → Test → Fix → Test (repeat)

## Test Configuration

The project uses Vitest with the following configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Property-Based Testing

For property-based tests (PBT), use fast-check library:

```typescript
import fc from 'fast-check';

test('Property: Description', () => {
  fc.assert(
    fc.property(
      fc.string(), // generator
      (input) => {
        // property assertion
        expect(someFunction(input)).toBeDefined();
      }
    ),
    { numRuns: 100 } // Run 100 iterations
  );
});
```

## Integration with Tasks

When executing spec tasks:
1. Read the task requirements
2. Implement the complete solution
3. Run tests ONCE using: `npm test -- --run`
4. If failures occur, analyze ALL failures together
5. Fix ALL issues in one batch
6. Run tests ONE more time
7. Report results to user

## Debugging Failed Tests

If tests fail:
1. Review the error output carefully
2. Identify the root cause
3. Fix the implementation (not the test, unless test is incorrect)
4. Verify the fix addresses the requirement
5. Run tests again

## Best Practices

- **Batch operations**: Group related changes together
- **Single verification**: Run tests once after completing work
- **Clear reporting**: Provide concise pass/fail status
- **Limit retries**: Maximum 2 test execution attempts per task
- **Focus on requirements**: Ensure implementation matches acceptance criteria

## Example Workflow

```
Task: Implement feature X with tests

Step 1: Read requirements ✓
Step 2: Write implementation code ✓
Step 3: Write tests ✓
Step 4: Run tests once → npm test -- --run ✓
Step 5: [If failures] Fix all issues ✓
Step 6: [If needed] Run tests once more → npm test -- --run ✓
Step 7: Report completion ✓

Total test runs: 1-2 maximum
```

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm test -- --run` | Run all tests once (no watch mode) |
| `npm test -- --run --reporter=verbose` | Run with detailed output |
| `npm test -- --run [file]` | Run specific test file |
| `npm test -- --run --coverage` | Run with coverage report |
| `npm run build` | Build for production |
| `npm run lint` | Run linter |

## Notes

- This guide is specifically designed to prevent the "10 chat summaries" problem
- Always use `--run` flag to prevent watch mode
- Batch your work to minimize test execution cycles
- Focus on getting it right in 1-2 attempts rather than many small iterations
