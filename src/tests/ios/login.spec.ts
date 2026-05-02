import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { validUser, errorMessages } from '../../data/testData';

describe('iOS - Login', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;

  before(async () => {
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  beforeEach(async () => {
    await driver.reloadSession();
    await homePage.waitForPageLoad();
    await loginPage.navigateToLogin();
  });

  it('should login with valid credentials and navigate to products', async () => {
    await loginPage.login(validUser.email, validUser.password);
    await homePage.waitForPageLoad();

    expect(await homePage.isHomePageDisplayed()).toBe(true);
  });

  it('should display products after login', async () => {
    await loginPage.login(validUser.email, validUser.password);
    await homePage.waitForPageLoad();

    const count = await homePage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  it('should show username error when username is empty', async () => {
    await loginPage.login('', validUser.password);

    expect(await loginPage.isUsernameErrorDisplayed()).toBe(true);
    const msg = await loginPage.getUsernameError();
    expect(msg).toBe(errorMessages.usernameRequired);
  });

  it('should show password error when password is empty', async () => {
    await loginPage.login(validUser.email, '');

    expect(await loginPage.isPasswordErrorDisplayed()).toBe(true);
    const msg = await loginPage.getPasswordError();
    expect(msg).toBe(errorMessages.passwordRequired);
  });

  it('should logout successfully and show login option in menu again', async () => {
    await loginPage.login(validUser.email, validUser.password);
    await homePage.waitForPageLoad();
    await homePage.logout();

    await homePage.tapMenuButton();
    const loginItemVisible = await loginPage.isDisplayed('~Login Menu Item', 5000);
    expect(loginItemVisible).toBe(true);
  });
});
