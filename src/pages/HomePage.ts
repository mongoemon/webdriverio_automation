import { BasePage } from './BasePage';

// Selectors confirmed from live UI dump of mda-2.2.0-25.apk
const SEL = {
  productList:   '~Displays all products of catalog',
  productTitle:  '~Product Title',
  menuButton:    '~View menu',
  cartButton:    '~View cart',
  logoutItem:    '~Logout Menu Item',
  loginMenuItem: '~Login Menu Item',
};

export class HomePage extends BasePage {
  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(SEL.productList);
  }

  async isHomePageDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.productList);
  }

  async getProductCount(): Promise<number> {
    const items = await this.waitForElements(SEL.productTitle);
    return items.length;
  }

  async tapFirstProduct(): Promise<void> {
    const items = await this.waitForElements(SEL.productTitle);
    await items[0].click();
  }

  async tapMenuButton(): Promise<void> {
    await this.tapElement(SEL.menuButton);
  }

  async logout(): Promise<void> {
    await this.tapElement(SEL.menuButton);
    await this.tapElement(SEL.logoutItem);
    await this.tapElement('android=new UiSelector().text("LOGOUT")');
    // Wait for the menu button to be visible — stable across both logged-in and guest states
    await this.waitForElement(SEL.menuButton);
  }

  async tapCart(): Promise<void> {
    await this.tapElement(SEL.cartButton);
  }
}
