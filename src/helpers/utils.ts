import * as fs from 'fs';
import * as path from 'path';

export class Utils {
  static async pause(ms: number): Promise<void> {
    await browser.pause(ms);
  }

  static async waitUntil(
    condition: () => Promise<boolean>,
    timeout = 15000,
    errorMessage = 'Condition not met within timeout'
  ): Promise<void> {
    await browser.waitUntil(condition, { timeout, timeoutMsg: errorMessage });
  }

  static async retryAction<T>(
    action: () => Promise<T>,
    retries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await action();
      } catch (err) {
        lastError = err as Error;
        if (attempt < retries) await browser.pause(delayMs);
      }
    }
    throw lastError;
  }

  static ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static async saveScreenshot(name: string): Promise<void> {
    const screenshotDir = path.resolve('./reports/screenshots');
    this.ensureDir(screenshotDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(screenshotDir, `${name}_${timestamp}.png`);
    await browser.saveScreenshot(filePath);
  }

  static getPlatform(): 'android' | 'ios' {
    return browser.isAndroid ? 'android' : 'ios';
  }

  static async getAppVersion(): Promise<string> {
    if (browser.isAndroid) {
      const caps = browser.capabilities as Record<string, string>;
      return caps['appium:appVersion'] ?? 'unknown';
    } else {
      const caps = browser.capabilities as Record<string, string>;
      return caps['appium:bundleVersion'] ?? 'unknown';
    }
  }

  static generateEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}+${timestamp}@example.com`;
  }

  static randomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  }
}
