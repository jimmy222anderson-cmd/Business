#!/usr/bin/env node

/**
 * Unified Test Runner
 * 
 * This script runs tests efficiently in a single pass to avoid
 * multiple chat summaries during task execution.
 * 
 * Usage:
 *   node scripts/test-runner.js [options]
 * 
 * Options:
 *   --file <path>    Run specific test file
 *   --coverage       Include coverage report
 *   --verbose        Detailed output
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  file: null,
  coverage: false,
  verbose: false,
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--file' && args[i + 1]) {
    options.file = args[i + 1];
    i++;
  } else if (args[i] === '--coverage') {
    options.coverage = true;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  }
}

// Build test command
const testArgs = ['test', '--', '--run'];

if (options.verbose) {
  testArgs.push('--reporter=verbose');
}

if (options.coverage) {
  testArgs.push('--coverage');
}

if (options.file) {
  testArgs.push(options.file);
}

console.log('🧪 Running tests...\n');
console.log(`Command: npm ${testArgs.join(' ')}\n`);

// Execute tests
const testProcess = spawn('npm', testArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed. Review the output above.');
  }
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  process.exit(1);
});
