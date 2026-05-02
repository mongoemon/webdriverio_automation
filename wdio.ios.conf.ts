import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config: Options.Testrunner = {
  ...sharedConfig,

  specs: ['./src/tests/ios/**/*.spec.ts'],

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT) || 4723,
  path: '/',

  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.0',
      'appium:app': path.resolve(
        process.env.IOS_APP_PATH || './apps/ios/App.app'
      ),
      'appium:bundleId': process.env.IOS_BUNDLE_ID || 'com.example.app',
      ...(process.env.IOS_UDID ? { 'appium:udid': process.env.IOS_UDID } : {}),
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:autoAcceptAlerts': true,
      'appium:reduceMotion': true,
      'appium:useNewWDA': false,
    },
  ],
};
