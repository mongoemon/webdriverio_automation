import type { Options } from '@wdio/types';
import * as dotenv from 'dotenv';

dotenv.config();

export const sharedConfig: Partial<Options.Testrunner> = {
  runner: 'local',

  // Test files
  specs: ['./src/tests/**/*.spec.ts'],
  exclude: [],

  // Max parallelism
  maxInstances: Number(process.env.MAX_INSTANCES) || 1,

  // Timeouts
  waitforTimeout: Number(process.env.EXPLICIT_TIMEOUT) || 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Framework
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  // Reporters
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
      },
    ],
  ],

  // Appium service
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          relaxedSecurity: true,
          log: './reports/appium.log',
        },
      },
    ],
  ],

  // Hooks
  beforeSession(_config, _capabilities, _specs): void {
    // runs before a WebDriver session is initiated
  },

  before(_capabilities, _specs): void {
    // runs before test suite begins
  },

  async afterTest(_test, _context, { passed }): Promise<void> {
    if (!passed) {
      try {
        await browser.takeScreenshot();
      } catch {
        // session may already be dead after a hard failure
      }
    }
  },

  afterSession(_config, _capabilities, _specs): void {
    // runs after a WebDriver session ends
  },
};
