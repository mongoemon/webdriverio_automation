import type { Options } from '@wdio/types';
import { sharedConfig } from './wdio.shared.conf';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config: Options.Testrunner = {
  ...sharedConfig,

  specs: ['./src/tests/android/**/*.spec.ts'],

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT) || 4723,
  path: '/',

  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
      'appium:app': path.resolve(
        process.env.ANDROID_APP_PATH || './apps/android/app-debug.apk'
      ),
      'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.example.app',
      'appium:appActivity':
        process.env.ANDROID_APP_ACTIVITY || 'com.example.app.MainActivity',
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
      'appium:ignoreHiddenApiPolicyError': true,
    },
  ],
};
