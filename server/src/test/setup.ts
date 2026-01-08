/**
 * Test setup file
 * This file is executed before all tests
 */

import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Suppress console output during tests (optional)
// You can comment these out if you want to see logs during tests
if (process.env.NODE_ENV === 'test') {
  // global.console = {
  //   ...console,
  //   log: () => {},
  //   info: () => {},
  //   warn: () => {},
  // };
}

