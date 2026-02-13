# Earth Intelligence Platform - Spec Documentation

## 📋 Overview

This spec contains the complete requirements, design, and implementation plan for the Earth Intelligence Platform website.

## 🚀 Quick Start

### Execute Tasks Efficiently

```bash
# Tell me to execute tasks like this:
"Execute task 7.1"
"Execute tasks 7.1, 7.2, and 7.3"
"Run all remaining tasks"
```

I'll use the **efficient single-pass strategy** to avoid multiple chat summaries.

## 📁 Documentation Files

### Core Spec Files
- **requirements.md** - User stories and acceptance criteria
- **design.md** - Architecture, components, and data models
- **tasks.md** - Implementation task list with checkboxes

### Solution Documentation (NEW)
- **SOLUTION_SUMMARY.md** - Overview of the efficiency solution
- **HOW_TO_USE.md** - How to execute tasks efficiently
- **EXECUTION_STRATEGY.md** - Detailed execution strategy
- **QUICK_REFERENCE.md** - Quick commands and patterns
- **test-execution-guide.md** - Testing best practices

## 🎯 The Solution

### Problem
Chat was summarizing ~10 times during task execution, disrupting workflow.

### Solution
**Single-pass execution with maximum 2 test runs per task.**

### How It Works
```
1. Write ALL code
2. Run tests ONCE
3. Fix ALL issues (if any)
4. Run tests ONCE more (if needed)
5. Done!
```

## 🧪 Test Commands

```bash
# Run all tests once (use this!)
npm test -- --run

# Run with verbose output
npm run test:once

# Run specific test file
npm run test:file src/test/MyComponent.test.tsx

# Run with coverage
npm run test:coverage
```

## 📊 Task Progress

Check task status:
```bash
cat .kiro/specs/earth-intelligence-platform/tasks.md
```

Task format:
- `[ ]` = Not started
- `[~]` = Queued
- `[-]` = In progress
- `[x]` = Completed
- `[ ]*` = Optional task

## 🔧 Project Structure

```
earth-intelligence-platform/
├── requirements.md          # What to build
├── design.md               # How to build it
├── tasks.md                # Implementation checklist
├── SOLUTION_SUMMARY.md     # Efficiency solution overview
├── HOW_TO_USE.md          # Usage guide
├── EXECUTION_STRATEGY.md   # Detailed strategy
├── QUICK_REFERENCE.md      # Quick commands
└── test-execution-guide.md # Testing guidelines
```

## 📈 Success Metrics

With the efficient strategy:
- ✅ Test runs per task: 1-2 maximum
- ✅ Chat summaries: 0-1 per task
- ✅ Clear progress tracking
- ✅ Faster completion
- ✅ Less workflow disruption

## 🎓 Best Practices

### DO
- ✅ Write complete implementation first
- ✅ Run tests once after all code is written
- ✅ Fix all issues together in one batch
- ✅ Use `--run` flag to prevent watch mode

### DON'T
- ❌ Write code → test → fix → test (repeat)
- ❌ Run tests multiple times "just to be sure"
- ❌ Fix one issue at a time with tests between
- ❌ Use watch mode during task execution

## 🆘 Need Help?

1. **Quick commands** → Read QUICK_REFERENCE.md
2. **How to use** → Read HOW_TO_USE.md
3. **Full strategy** → Read EXECUTION_STRATEGY.md
4. **Testing guide** → Read test-execution-guide.md
5. **Ask me** → I'm here to help!

## 🎯 Next Steps

1. **Review** the HOW_TO_USE.md file
2. **Execute** a task to test the strategy
3. **Monitor** that summaries are reduced
4. **Provide feedback** if adjustments needed

## 📝 Example Usage

```
You: Execute task 7.1

Me: Executing task 7.1: Create PricingHighlights section
    [Writes all code]
    Running tests... ✓ All tests passed
    Task 7.1 complete.

You: Great! Now do tasks 7.2 and 7.3

Me: Executing task 7.2: Create PartnersGrid component
    [Writes code]
    Running tests... ✓ All tests passed
    Task 7.2 complete.
    
    Executing task 7.3: Write property test
    [Writes test]
    Running tests... ✓ Property test passed (100 iterations)
    Task 7.3 complete.
    
    Both tasks completed successfully.
```

## 🔍 Monitoring

Track progress by:
- Viewing tasks.md (checkboxes update in real-time)
- Reading my concise status updates
- Checking test output when I run tests

## ⚠️ Emergency Stop

If tests fail more than twice:
- I'll stop automatically
- Report the issue clearly
- Ask for your guidance
- Wait for your input

---

**Ready to execute tasks efficiently! Just tell me which ones to do.**
