/**
 * Appium-specific helpers for common native interactions.
 */
export class AppiumHelper {
  static async acceptAlert(): Promise<void> {
    try {
      await browser.acceptAlert();
    } catch {
      // no alert present
    }
  }

  static async dismissAlert(): Promise<void> {
    try {
      await browser.dismissAlert();
    } catch {
      // no alert present
    }
  }

  static async getAlertText(): Promise<string | null> {
    try {
      return await browser.getAlertText();
    } catch {
      return null;
    }
  }

  static async setClipboard(text: string): Promise<void> {
    await browser.setClipboard(Buffer.from(text).toString('base64'), 'plaintext');
  }

  static async getClipboard(): Promise<string> {
    const encoded = await browser.getClipboard('plaintext');
    return Buffer.from(encoded, 'base64').toString('utf8');
  }

  static async terminateApp(packageOrBundle: string): Promise<void> {
    await browser.terminateApp(packageOrBundle, {});
  }

  static async activateApp(packageOrBundle: string): Promise<void> {
    await browser.activateApp(packageOrBundle);
  }

  static async backgroundApp(seconds: number): Promise<void> {
    await browser.background(seconds);
  }

  static async isAppInstalled(packageOrBundle: string): Promise<boolean> {
    return browser.isAppInstalled(packageOrBundle);
  }

  static async getDeviceTime(): Promise<string> {
    return browser.getDeviceTime();
  }

  static async lockDevice(seconds = 3): Promise<void> {
    await browser.lock(seconds);
  }

  static async unlockDevice(): Promise<void> {
    await browser.unlock();
  }

  static async rotateToLandscape(): Promise<void> {
    await browser.setOrientation('LANDSCAPE');
  }

  static async rotateToPortrait(): Promise<void> {
    await browser.setOrientation('PORTRAIT');
  }

  static async getNetworkConnection(): Promise<number> {
    if (browser.isAndroid) {
      return browser.getNetworkConnection();
    }
    throw new Error('getNetworkConnection is only available on Android');
  }

  static async setNetworkConnection(value: number): Promise<void> {
    if (browser.isAndroid) {
      await browser.setNetworkConnection({ type: value });
      return;
    }
    throw new Error('setNetworkConnection is only available on Android');
  }

  // Network states: 0=no connection, 1=airplane, 2=wifi only, 4=data only, 6=wifi+data
  static readonly NETWORK = {
    NONE: 0,
    AIRPLANE: 1,
    WIFI_ONLY: 2,
    DATA_ONLY: 4,
    WIFI_AND_DATA: 6,
  };
}
