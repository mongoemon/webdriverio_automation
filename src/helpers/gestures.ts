import type { SwipeOptions, Coordinate } from '../types';

export class Gestures {
  static async swipe(options: SwipeOptions): Promise<void> {
    const { direction, duration = 800, percentage = 0.7 } = options;
    const { width, height } = await browser.getWindowSize();

    const centerX = width / 2;
    const centerY = height / 2;
    const swipeLength = Math.min(width, height) * percentage;

    let from: Coordinate;
    let to: Coordinate;

    switch (direction) {
      case 'up':
        from = { x: centerX, y: centerY + swipeLength / 2 };
        to = { x: centerX, y: centerY - swipeLength / 2 };
        break;
      case 'down':
        from = { x: centerX, y: centerY - swipeLength / 2 };
        to = { x: centerX, y: centerY + swipeLength / 2 };
        break;
      case 'left':
        from = { x: centerX + swipeLength / 2, y: centerY };
        to = { x: centerX - swipeLength / 2, y: centerY };
        break;
      case 'right':
        from = { x: centerX - swipeLength / 2, y: centerY };
        to = { x: centerX + swipeLength / 2, y: centerY };
        break;
    }

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: from.x, y: from.y })
      .down()
      .pause(100)
      .move({ x: to.x, y: to.y, duration })
      .up()
      .perform();
  }

  static async swipeUntilVisible(
    selector: string,
    direction: 'up' | 'down' = 'up',
    maxSwipes = 10
  ): Promise<boolean> {
    for (let i = 0; i < maxSwipes; i++) {
      try {
        const element = await $(selector);
        const isDisplayed = await element.isDisplayed();
        if (isDisplayed) return true;
      } catch {
        // element not found yet
      }
      await this.swipe({ direction });
      await browser.pause(500);
    }
    return false;
  }

  static async tap(x: number, y: number): Promise<void> {
    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y })
      .down()
      .up()
      .perform();
  }

  static async longPress(selector: string, durationMs = 1500): Promise<void> {
    const element = await $(selector);
    const location = await element.getLocation();
    const size = await element.getSize();

    const x = Math.round(location.x + size.width / 2);
    const y = Math.round(location.y + size.height / 2);

    await browser.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x, y })
      .down()
      .pause(durationMs)
      .up()
      .perform();
  }

  static async doubleTap(selector: string): Promise<void> {
    const element = await $(selector);
    await element.doubleClick();
  }

  static async pinchZoom(
    selector: string,
    scale: number,
    velocity: number
  ): Promise<void> {
    if (browser.isIOS) {
      const element = await $(selector);
      await browser.execute('mobile: pinch', {
        elementId: (element as WebdriverIO.Element).elementId,
        scale,
        velocity,
      });
    }
    // Android pinch via W3C multi-pointer actions can be added as needed
  }
}
