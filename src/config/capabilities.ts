import * as dotenv from 'dotenv';
import path from 'path';
import type { AppConfig } from '../types';

dotenv.config();

export const androidConfig: AppConfig = {
  platform: 'android',
  packageOrBundle: process.env.ANDROID_APP_PACKAGE || 'com.example.app',
  appPath: path.resolve(
    process.env.ANDROID_APP_PATH || './apps/android/app-debug.apk'
  ),
};

export const iosConfig: AppConfig = {
  platform: 'ios',
  packageOrBundle: process.env.IOS_BUNDLE_ID || 'com.example.app',
  appPath: path.resolve(process.env.IOS_APP_PATH || './apps/ios/App.app'),
};
