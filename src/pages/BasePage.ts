import type { ElementOptions } from '../types';

export abstract class BasePage {
  protected get platform(): string {
    return browser.isAndroid ? 'android' : 'ios';
  }

  protected async waitForElement(
    selector: string,
    options: ElementOptions = {}
  ): Promise<ChainablePromiseElement> {
    const { timeout = 15000, interval = 500 } = options;
    const element = await $(selector);
    await element.waitForDisplayed({ timeout, interval });
    return element;
  }

  protected async waitForElements(
    selector: string,
    options: ElementOptions = {}
  ): Promise<WebdriverIO.ElementArray> {
    const { timeout = 15000 } = options;
    await browser.waitUntil(
      async () => {
        const elements = await $$(selector);
        return elements.length > 0;
      },
      { timeout, timeoutMsg: `No elements found for selector: ${selector}` }
    );
    return $$(selector);
  }

  protected async tapElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  protected async typeText(selector: string, text: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.clearValue();
    await element.setValue(text);
  }

  protected async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return element.getText();
  }

  async isDisplayed(selector: string, timeout = 5000): Promise<boolean> {
    try {
      const element = await $(selector);
      return element.waitForDisplayed({ timeout });
    } catch {
      return false;
    }
  }

  protected async isEnabled(selector: string): Promise<boolean> {
    const element = await $(selector);
    return element.isEnabled();
  }

  protected async scrollToElement(selector: string): Promise<void> {
    const element = await $(selector);
    await element.scrollIntoView();
  }

  protected async hideKeyboard(): Promise<void> {
    try {
      await driver.hideKeyboard();
    } catch {
      // keyboard may not be present
    }
  }

  protected async takeScreenshot(name: string): Promise<void> {
    await browser.saveScreenshot(`./reports/screenshots/${name}.png`);
  }

  abstract waitForPageLoad(): Promise<void>;
}
