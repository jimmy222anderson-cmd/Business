# Task Execution Strategy - Preventing Multiple Chat Summaries

## Problem Statement
When executing spec tasks, especially those involving tests, the chat summarizes multiple times (around 10 times), disrupting the workflow and making it difficult to track progress.

## Root Cause
The issue occurs when:
1. Tests are run multiple times in verification cycles
2. Each test run triggers a chat summary
3. Fix attempts create additional test cycles
4. The agent retries operations multiple times

## Solution: Efficient Single-Pass Execution

### Core Principles

1. **Batch All Work**: Complete all implementation before any verification
2. **Single Test Run**: Execute tests once after implementation is complete
3. **Batch Fixes**: If tests fail, fix ALL issues together, then test once more
4. **Maximum 2 Attempts**: Initial test run + one fix cycle maximum
5. **Clear Reporting**: Provide concise status updates without verbose summaries

### Execution Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: IMPLEMENTATION (No Testing)                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Read task requirements                                   │
│ 2. Read related design/requirements docs                    │
│ 3. Write ALL implementation code                            │
│ 4. Write ALL test code (if task requires tests)            │
│ 5. Review code for completeness                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: VERIFICATION (Single Test Run)                     │
├─────────────────────────────────────────────────────────────┤
│ 6. Run: npm test -- --run                                   │
│ 7. Capture ALL test results                                 │
│ 8. Analyze results                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴───────┐
                    │               │
              Tests Pass      Tests Fail
                    │               │
                    ↓               ↓
            ┌───────────┐   ┌──────────────────────┐
            │ Complete  │   │ PHASE 3: FIX (Once)  │
            │ Task      │   ├──────────────────────┤
            └───────────┘   │ 9. Identify ALL      │
                            │    failures          │
                            │ 10. Fix ALL issues   │
                            │     together         │
                            │ 11. Run tests ONCE   │
                            │     more             │
                            └──────────────────────┘
                                      ↓
                            ┌──────────────────────┐
                            │ Report final status  │
                            │ to user              │
                            └──────────────────────┘
```

## Implementation Guidelines

### For Kiro Agent

When executing a task:

```typescript
// ✅ CORRECT APPROACH
async function executeTask(taskId: string) {
  // 1. Read all requirements
  const requirements = await readRequirements();
  const design = await readDesign();
  const taskDetails = await readTaskDetails(taskId);
  
  // 2. Implement everything
  await writeAllCode();
  await writeAllTests();
  
  // 3. Single test run
  const results = await runTests({ once: true });
  
  // 4. If failures, fix once
  if (results.failed > 0) {
    await analyzeAllFailures(results);
    await fixAllIssues();
    const finalResults = await runTests({ once: true });
    return finalResults;
  }
  
  return results;
}

// ❌ INCORRECT APPROACH (causes multiple summaries)
async function executeTaskWrong(taskId: string) {
  await writeCode();
  await runTests(); // Summary 1
  await fixIssue1();
  await runTests(); // Summary 2
  await fixIssue2();
  await runTests(); // Summary 3
  // ... continues 10 times
}
```

### Test Execution Commands

Use these commands for efficient testing:

```bash
# Single test run (preferred)
npm test -- --run

# Single test run with verbose output
npm run test:once

# Run specific test file once
npm run test:file src/test/MyComponent.test.tsx

# Run with coverage (once)
npm run test:coverage
```

### Task Execution Checklist

Before marking a task complete:

- [ ] All code written
- [ ] All tests written (if required)
- [ ] Tests run ONCE
- [ ] If failures: ALL issues fixed together
- [ ] Tests run ONCE more (if fixes were needed)
- [ ] Total test runs: 1-2 maximum
- [ ] Results reported to user

## Specific Task Types

### Type 1: Implementation Tasks (No Tests)

```
1. Read requirements ✓
2. Write implementation ✓
3. Verify with getDiagnostics (no test run) ✓
4. Report completion ✓

Test runs: 0
```

### Type 2: Implementation + Unit Tests

```
1. Read requirements ✓
2. Write implementation ✓
3. Write tests ✓
4. Run tests once: npm test -- --run ✓
5. [If needed] Fix all issues ✓
6. [If needed] Run tests once more ✓
7. Report completion ✓

Test runs: 1-2 maximum
```

### Type 3: Property-Based Tests

```
1. Read requirements ✓
2. Read design properties ✓
3. Write property test with 100+ iterations ✓
4. Run test once: npm test -- --run ✓
5. [If counterexample] Analyze and fix ✓
6. [If needed] Run test once more ✓
7. Update PBT status ✓
8. Report completion ✓

Test runs: 1-2 maximum
```

### Type 4: Integration Tests

```
1. Read requirements ✓
2. Ensure all components exist ✓
3. Write integration test ✓
4. Run test once: npm test -- --run ✓
5. [If needed] Fix integration issues ✓
6. [If needed] Run test once more ✓
7. Report completion ✓

Test runs: 1-2 maximum
```

## Debugging Strategy

When tests fail:

1. **Capture full output** from the single test run
2. **Analyze ALL failures** together (don't fix one at a time)
3. **Identify root causes** for all failures
4. **Plan fixes** for all issues
5. **Implement ALL fixes** together
6. **Run tests once more** to verify

## Communication Guidelines

### ✅ Good Communication (Concise)

```
Implementing task 5.2: Create ProductCard component

[Writes all code]

Running tests...
✓ All tests passed (12/12)

Task 5.2 complete.
```

### ❌ Bad Communication (Causes Summaries)

```
Starting task 5.2...
Writing ProductCard component...
Component written, now testing...
Test 1 failed, fixing...
Fixed issue 1, testing again...
Test 2 failed, fixing...
Fixed issue 2, testing again...
[... repeats 10 times ...]
```

## Monitoring Success

Track these metrics to ensure the strategy is working:

- **Test runs per task**: Should be 1-2 maximum
- **Chat summaries per task**: Should be 0-1 maximum
- **Time to completion**: Should decrease with batched approach
- **User interruptions**: Should be minimal

## Emergency Override

If you encounter a situation requiring more than 2 test runs:

1. **Stop** the current approach
2. **Report** to the user: "Tests are failing repeatedly. I need your input on [specific issue]."
3. **Wait** for user guidance
4. **Do not** continue running tests automatically

## Tools and Scripts

Available tools to support this strategy:

- `npm run test:once` - Run all tests once with verbose output
- `npm run test:coverage` - Run tests once with coverage
- `npm run test:file <path>` - Run specific test file once
- `scripts/test-runner.js` - Unified test runner script

## Success Criteria

This strategy is successful when:

1. ✅ Tasks complete in 1-2 test runs maximum
2. ✅ Chat summaries reduced to 0-1 per task
3. ✅ User can follow progress clearly
4. ✅ Tests pass reliably
5. ✅ Implementation matches requirements

## Notes

- This strategy prioritizes **efficiency** over **incremental verification**
- Trust the implementation process - write complete code before testing
- Batch operations reduce context switching and improve focus
- Clear, concise reporting keeps the user informed without overwhelming them
