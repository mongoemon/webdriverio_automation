import { BasePage } from '../BasePage';

// Selectors confirmed from live UI dump of My Demo App.app (iOS RN build)
const SEL = {
  catalogScreen: '~Catalog-screen',
  productItem:   '~ProductItem',
  moreTab:       '~More-tab-item',
  logoutItem:    '~LogOut-menu-item',
  cartTab:       '~Cart-tab-item',
};

export class HomePage extends BasePage {
  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(SEL.catalogScreen);
  }

  async isHomePageDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.catalogScreen);
  }

  async getProductCount(): Promise<number> {
    const items = await this.waitForElements(SEL.productItem);
    return items.length;
  }

  async tapFirstProduct(): Promise<void> {
    const items = await this.waitForElements(SEL.productItem);
    await items[0].click();
  }

  async tapMenuButton(): Promise<void> {
    await this.tapElement(SEL.moreTab);
  }

  async logout(): Promise<void> {
    await this.tapElement(SEL.moreTab);
    await this.tapElement(SEL.logoutItem);
    // After logout iOS navigates directly to the Login screen
    await this.waitForElement('~Select a username from the list below');
  }

  async tapCart(): Promise<void> {
    await this.tapElement(SEL.cartTab);
  }
}
