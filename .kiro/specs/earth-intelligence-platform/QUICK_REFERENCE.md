# Quick Reference - Efficient Task Execution

## The Problem
Chat summarizes 10 times during task execution, disrupting workflow.

## The Solution
**Execute tasks in single-pass mode with maximum 2 test runs.**

## Quick Commands

```bash
# Run all tests once (use this!)
npm test -- --run

# Run with verbose output
npm run test:once

# Run specific test file
npm run test:file src/test/MyComponent.test.tsx

# Run with coverage
npm run test:coverage

# Check for errors without running tests
npm run lint
```

## Task Execution Pattern

```
1. Read requirements
2. Write ALL code
3. Write ALL tests
4. Run tests ONCE
5. Fix ALL issues (if any)
6. Run tests ONCE more (if needed)
7. Done!

Maximum test runs: 2
```

## What NOT to Do

❌ Write code → test → fix → test → fix → test (repeat)
❌ Run tests multiple times "just to be sure"
❌ Fix one issue at a time with test runs between each
❌ Use watch mode during task execution

## What TO Do

✅ Write complete implementation first
✅ Run tests once after all code is written
✅ Fix all issues together in one batch
✅ Use `--run` flag to prevent watch mode
✅ Report concise status to user

## For Property-Based Tests

```typescript
import fc from 'fast-check';

test('Property: Description', () => {
  fc.assert(
    fc.property(
      fc.string(), // generator
      (input) => {
        // assertion
        expect(result).toBeDefined();
      }
    ),
    { numRuns: 100 } // 100 iterations
  );
});
```

## Execution Checklist

Before completing a task:

- [ ] All code written
- [ ] All tests written
- [ ] Tests run 1-2 times max
- [ ] All issues fixed
- [ ] Results reported

## Emergency Stop

If tests fail more than twice:
1. Stop running tests
2. Report issue to user
3. Ask for guidance
4. Don't continue automatically

## Success Metrics

- Test runs per task: 1-2 max
- Chat summaries: 0-1 max
- Clear progress tracking
- Fast completion

## Remember

**Batch your work. Test once. Fix once. Done.**
