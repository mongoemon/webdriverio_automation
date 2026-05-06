import { BasePage } from '../BasePage';

// Selectors confirmed from live UI dump of My Demo App.app (iOS RN build)
// The iOS login screen shows a preset list of users — no free-text input.
// Selecting a user auto-fills their paired password. Tap Login to submit.
const SEL = {
  moreTab:      '~More-tab-item',
  loginButton:  '~Login Button',
  pageHint:     '~Select a username from the list below',
  loginSubmit:  '-ios class chain:**/XCUIElementTypeButton[`name == "Login"`]',
  alertOk:      '~OK',
  usernameError: '~Username is required',
  passwordError:  '~Enter Password',
};

export class LoginPage extends BasePage {
  async navigateToLogin(): Promise<void> {
    await this.tapElement(SEL.moreTab);
    await this.tapElement(SEL.loginButton);
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(SEL.pageHint);
  }

  // email maps to the username button label (e.g. 'bob@example.com').
  // password is ignored — iOS pairs credentials automatically.
  // Pass empty email to test the "username required" error path.
  async login(email: string, _password: string): Promise<void> {
    if (email) {
      await this.tapElement(`~${email}`);
    }
    await this.tapElement(SEL.loginSubmit);
  }

  async getUsernameError(): Promise<string> {
    return this.getText(SEL.usernameError);
  }

  async getPasswordError(): Promise<string> {
    return this.getText(SEL.passwordError);
  }

  async isUsernameErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.usernameError, 5000);
  }

  async isPasswordErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.passwordError, 5000);
  }

  // Call after asserting on an error alert to dismiss it before the next step.
  async dismissErrorAlert(): Promise<void> {
    try {
      await this.tapElement(SEL.alertOk);
    } catch { /* already dismissed */ }
  }
}
