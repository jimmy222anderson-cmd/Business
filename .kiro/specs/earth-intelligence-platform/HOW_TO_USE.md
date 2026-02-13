# How to Use This Spec - Avoiding Multiple Chat Summaries

## Quick Start

When you want me to execute tasks from this spec, use one of these commands:

### Execute a Single Task
```
Execute task 7.1 from the earth-intelligence-platform spec
```

### Execute Multiple Tasks
```
Execute tasks 7.1, 7.2, and 7.3 from the earth-intelligence-platform spec
```

### Execute All Remaining Tasks
```
Run all remaining tasks from the earth-intelligence-platform spec
```

## Important: Execution Mode

I will execute tasks using the **efficient single-pass strategy** documented in:
- `EXECUTION_STRATEGY.md` - Full strategy details
- `QUICK_REFERENCE.md` - Quick command reference
- `test-execution-guide.md` - Testing guidelines

This means:
- ✅ I'll write all code first, then test once
- ✅ Maximum 2 test runs per task
- ✅ Minimal chat summaries (0-1 per task)
- ✅ Clear, concise progress updates

## What to Expect

### Good Execution (What You'll See)
```
Executing task 7.1: Create PricingHighlights section

[I write all the code]

Running tests...
✓ All tests passed

Task 7.1 complete. Ready for next task.
```

### What You Won't See Anymore
```
Starting task...
Writing code...
Testing... (Summary 1)
Fixing issue 1...
Testing... (Summary 2)
Fixing issue 2...
Testing... (Summary 3)
[... repeats 10 times ...]
```

## Task Types

### Implementation Tasks (No Tests)
- I'll write the code
- Verify with diagnostics
- Report completion
- **Test runs: 0**

### Implementation + Tests
- I'll write implementation
- Write tests
- Run tests once
- Fix if needed
- Run tests once more if needed
- **Test runs: 1-2 max**

### Property-Based Tests
- I'll write the property test
- Run with 100+ iterations once
- Fix if counterexample found
- Run once more if needed
- Update PBT status
- **Test runs: 1-2 max**

## Monitoring Progress

You can check progress by:
1. Viewing the tasks.md file (checkboxes update in real-time)
2. Reading my concise status updates
3. Checking test output when I run tests

## If Something Goes Wrong

If tests fail repeatedly (more than 2 runs):
- I'll stop automatically
- Report the issue clearly
- Ask for your guidance
- Wait for your input

## Commands You Can Use

```bash
# View current task status
cat .kiro/specs/earth-intelligence-platform/tasks.md

# Run tests yourself
npm test -- --run

# Run specific test
npm run test:file src/test/MyComponent.test.tsx

# Check for errors
npm run lint

# Build the project
npm run build
```

## Tips for Best Results

1. **Let me complete tasks fully** - Don't interrupt mid-task
2. **Review after completion** - Check the work when I report done
3. **Provide feedback** - Tell me if something needs adjustment
4. **Trust the process** - The single-pass strategy is efficient

## Example Session

```
You: Execute tasks 7.1 and 7.2

Me: Executing task 7.1: Create PricingHighlights section
    [Writes code]
    Running tests... ✓ All tests passed
    Task 7.1 complete.
    
    Executing task 7.2: Create PartnersGrid component
    [Writes code]
    Running tests... ✓ All tests passed
    Task 7.2 complete.
    
    Both tasks completed successfully.

You: Great! Now do task 7.3

Me: Executing task 7.3: Write property test for responsive grid
    [Writes test]
    Running tests... ✓ Property test passed (100 iterations)
    Task 7.3 complete.
```

## Files Created for This Solution

1. **EXECUTION_STRATEGY.md** - Detailed execution strategy
2. **QUICK_REFERENCE.md** - Quick command reference
3. **test-execution-guide.md** - Testing guidelines
4. **HOW_TO_USE.md** - This file
5. **scripts/test-runner.js** - Unified test runner
6. **package.json** - Updated with efficient test scripts

## Summary

The solution prevents multiple chat summaries by:
- Batching all work before testing
- Running tests maximum 2 times per task
- Fixing all issues together
- Providing concise status updates
- Using efficient test commands

**Just tell me which tasks to execute, and I'll handle them efficiently!**
