import { BasePage } from './BasePage';

// Selectors confirmed from live UI dump of mda-2.2.0-25.apk
const SEL = {
  menuButton:       '~View menu',
  loginMenuItem:    '~Login Menu Item',
  usernameInput:    'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameET")',
  passwordInput:    'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/passwordET")',
  loginButton:      '~Tap to login with given credentials',
  usernameError:    'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameErrorTV")',
  passwordError:    'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/passwordErrorTV")',
};

export class LoginPage extends BasePage {
  // Navigate from Products screen → hamburger menu → Log In
  async navigateToLogin(): Promise<void> {
    await this.tapElement(SEL.menuButton);
    await this.tapElement(SEL.loginMenuItem);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(SEL.usernameInput);
  }

  async login(email: string, password: string): Promise<void> {
    await this.typeText(SEL.usernameInput, email);
    await this.typeText(SEL.passwordInput, password);
    await this.hideKeyboard();
    await this.tapElement(SEL.loginButton);
  }

  async getUsernameError(): Promise<string> {
    return this.getText(SEL.usernameError);
  }

  async getPasswordError(): Promise<string> {
    return this.getText(SEL.passwordError);
  }

  async isUsernameErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.usernameError, 3000);
  }

  async isPasswordErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.passwordError, 3000);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return this.isEnabled(SEL.loginButton);
  }
}
