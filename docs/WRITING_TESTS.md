# Writing Tests — Step-by-Step Guide

This guide walks you through everything you need to add a new automated test to this
project — from identifying what to test, to finding selectors, to writing the code.

---

## Table of Contents

1. [Mental model — what a test actually does](#1-mental-model--what-a-test-actually-does)
2. [Anatomy of a test file](#2-anatomy-of-a-test-file)
3. [Anatomy of a Page Object](#3-anatomy-of-a-page-object)
4. [Step-by-step: Add a new test to an existing page](#4-step-by-step-add-a-new-test-to-an-existing-page)
5. [Step-by-step: Add a completely new screen](#5-step-by-step-add-a-completely-new-screen)
6. [Selectors — how to point at elements](#6-selectors--how-to-point-at-elements)
7. [Waiting for things — the most important concept](#7-waiting-for-things--the-most-important-concept)
8. [Assertions — how to check a result](#8-assertions--how-to-check-a-result)
9. [Common patterns and recipes](#9-common-patterns-and-recipes)
10. [Checklist before submitting a test](#10-checklist-before-submitting-a-test)

---

## 1. Mental model — what a test actually does

A test mimics what a human tester would do:

```
Human tester                         Automated test
─────────────────────────────────    ─────────────────────────────────────
1. Open the app                      driver.reloadSession()
2. Look at the screen                waitForPageLoad()
3. Tap the Username field            await loginPage.login(email, password)
4. Type "bob@example.com"            (same — login() does all of this)
5. Tap the Password field
6. Type "10203040"
7. Tap LOGIN
8. Wait for home screen              await homePage.waitForPageLoad()
9. Check products are visible        expect(count).toBeGreaterThan(0)
```

Your job is to translate the manual steps into code.

---

## 2. Anatomy of a test file

Open [src/tests/android/login.spec.ts](../src/tests/android/login.spec.ts):

```typescript
// ── 1. Imports ──────────────────────────────────────────────────
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { validUser, errorMessages } from '../../data/testData';

// ── 2. Test suite (groups related tests) ────────────────────────
describe('Android - Login', () => {

  // ── 3. Page object instances ───────────────────────────────────
  let loginPage: LoginPage;
  let homePage: HomePage;

  // ── 4. Runs ONCE before the suite starts ───────────────────────
  before(async () => {
    loginPage = new LoginPage();
    homePage = new HomePage();
  });

  // ── 5. Runs before EACH individual test ────────────────────────
  beforeEach(async () => {
    await driver.reloadSession();        // restart the app fresh
    await homePage.waitForPageLoad();    // app opens on Products screen
    await loginPage.navigateToLogin();   // open menu → tap Log In
  });

  // ── 6. Individual test ─────────────────────────────────────────
  it('should login with valid credentials', async () => {
    await loginPage.login(validUser.email, validUser.password);
    await homePage.waitForPageLoad();

    expect(await homePage.isHomePageDisplayed()).toBe(true);
  });

});
```

### Key keywords

| Keyword | When it runs | Use it for |
|---|---|---|
| `before` | Once before the whole suite | Creating page objects |
| `beforeEach` | Before every `it` block | Resetting app state |
| `after` | Once after the whole suite | Cleanup |
| `afterEach` | After every `it` block | Taking screenshots on failure |
| `describe` | Grouping | Organising tests by feature |
| `it` | Each test case | One specific scenario |

---

## 3. Anatomy of a Page Object

Open [src/pages/LoginPage.ts](../src/pages/LoginPage.ts):

```typescript
import { BasePage } from './BasePage';

// Selectors are stored as constants at the top — confirm them with
// Appium Inspector or `adb exec-out uiautomator dump /dev/tty` (see SELECTORS_GUIDE.md)
const SEL = {
  menuButton:    '~View menu',
  loginMenuItem: '~Login Menu Item',
  usernameInput: 'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameET")',
  passwordInput: 'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/passwordET")',
  loginButton:   '~Tap to login with given credentials',
  usernameError: 'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameErrorTV")',
};

export class LoginPage extends BasePage {

  // ── 1. Navigate to this screen ─────────────────────────────────
  //    The app opens on Products — go through the hamburger menu
  async navigateToLogin(): Promise<void> {
    await this.tapElement(SEL.menuButton);
    await this.tapElement(SEL.loginMenuItem);
    await this.waitForPageLoad();
  }

  // ── 2. waitForPageLoad — required by BasePage ──────────────────
  //    Confirms the screen is ready before tests interact with it
  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(SEL.usernameInput);
  }

  // ── 3. Actions — what a user does on this screen ───────────────
  async login(email: string, password: string): Promise<void> {
    await this.typeText(SEL.usernameInput, email);
    await this.typeText(SEL.passwordInput, password);
    await this.hideKeyboard();
    await this.tapElement(SEL.loginButton);
  }

  // ── 4. Getters — read information from the screen ──────────────
  async getUsernameError(): Promise<string> {
    return this.getText(SEL.usernameError);
  }

  // ── 5. State checks — is something visible/enabled? ────────────
  async isUsernameErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(SEL.usernameError, 3000);
  }
}
```

### Methods inherited from BasePage

These are available in every page class without re-writing them:

| Method | What it does |
|---|---|
| `waitForElement(selector)` | Waits up to 15s for element to appear, then returns it |
| `waitForElements(selector)` | Waits for at least one element to appear, returns array |
| `tapElement(selector)` | Waits for element, then taps it |
| `typeText(selector, text)` | Clears the field, then types text |
| `getText(selector)` | Returns the text content of an element |
| `isDisplayed(selector)` | Returns `true`/`false` — does not throw if missing |
| `isEnabled(selector)` | Returns `true` if element is interactable |
| `scrollToElement(selector)` | Scrolls until element is visible |
| `hideKeyboard()` | Dismisses the on-screen keyboard |
| `takeScreenshot(name)` | Saves a screenshot to `reports/screenshots/` |

---

## 4. Step-by-step: Add a new test to an existing page

**Scenario:** You want to verify that after a failed login, the user can successfully
log in on the next attempt.

### Step 1 — Decide which spec file to add it to

This is about the login screen, so it goes in:
- Android: `src/tests/android/login.spec.ts`
- iOS: `src/tests/ios/login.spec.ts`

### Step 2 — Write the test

Open `src/tests/android/login.spec.ts` and add a new `it` block inside the `describe`:

```typescript
it('should allow login after a failed attempt', async () => {
  // Step 1: attempt with wrong password
  await loginPage.login('bob@example.com', 'wrongpassword');
  expect(await loginPage.isErrorDisplayed()).toBe(true);

  // Step 2: try again with correct password
  await loginPage.login(validUser.email, validUser.password);
  await homePage.waitForPageLoad();

  expect(await homePage.isHomePageDisplayed()).toBe(true);
});
```

> Notice: `beforeEach` restarts the app and navigates to the Login screen automatically.
> The app always opens on the Products screen after `reloadSession()`, so `navigateToLogin()` is called in `beforeEach` to reach the Login screen before every test.

### Step 3 — Run only this test to verify it works

Use `.only` to run just one test (remove it before committing!):

```typescript
it.only('should allow login after a failed attempt', async () => {
  // ...
});
```

```bash
npm run test:android
```

### Step 4 — Remove `.only` and run the full suite

```bash
npm run test:android
```

All 6 tests should pass.

---

## 5. Step-by-step: Add a completely new screen

**Scenario:** You want to test the **Product Detail** screen.

### Step 1 — Create the Page Object file

Create `src/pages/ProductDetailPage.ts`:

```typescript
import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  // Selectors — use Appium Inspector to find these (see docs/SELECTORS_GUIDE.md)
  private readonly productTitle = '~test-Item title';
  private readonly productPrice = '~test-Item price';
  private readonly addToCartButton = '~test-ADD TO CART';
  private readonly backButton = '~test-back button';

  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(this.productTitle);
  }

  async getProductTitle(): Promise<string> {
    return this.getText(this.productTitle);
  }

  async getProductPrice(): Promise<string> {
    return this.getText(this.productPrice);
  }

  async addToCart(): Promise<void> {
    await this.tapElement(this.addToCartButton);
  }

  async goBack(): Promise<void> {
    await this.tapElement(this.backButton);
  }
}
```

### Step 2 — Update the HomePage to navigate to a product

Open `src/pages/HomePage.ts` and add a method to tap the first product:

```typescript
async tapFirstProduct(): Promise<void> {
  const items = await this.waitForElements('~test-Item');
  await items[0].click();
}
```

### Step 3 — Create the test spec file

Create `src/tests/android/productDetail.spec.ts`:

```typescript
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { validUser } from '../../data/testData';

describe('Android - Product Detail', () => {
  let loginPage: LoginPage;
  let homePage: HomePage;
  let productDetailPage: ProductDetailPage;

  before(async () => {
    loginPage = new LoginPage();
    homePage = new HomePage();
    productDetailPage = new ProductDetailPage();
  });

  beforeEach(async () => {
    await driver.reloadSession();
    await homePage.waitForPageLoad();       // app opens on Products
    await loginPage.navigateToLogin();      // open menu → tap Log In
    await loginPage.login(validUser.email, validUser.password);
    await homePage.waitForPageLoad();       // now on Products as logged-in user
  });

  it('should display product details', async () => {
    await homePage.tapFirstProduct();
    await productDetailPage.waitForPageLoad();

    const title = await productDetailPage.getProductTitle();
    expect(title).toBeTruthy();                    // not empty

    const price = await productDetailPage.getProductPrice();
    expect(price).toContain('$');                  // price has dollar sign
  });

  it('should add product to cart', async () => {
    await homePage.tapFirstProduct();
    await productDetailPage.waitForPageLoad();

    await productDetailPage.addToCart();

    // Navigate back and verify cart badge
    await productDetailPage.goBack();
    const badgeCount = await homePage.getCartBadgeCount();
    expect(badgeCount).toBe('1');
  });
});
```

### Step 4 — Verify selectors and run

```bash
npm run test:android
```

If selectors are wrong, see [docs/SELECTORS_GUIDE.md](SELECTORS_GUIDE.md).

---

## 6. Selectors — how to point at elements

A selector is a string that tells WebdriverIO/Appium which element on screen to interact with.

### Selector types (from most preferred to least)

#### Accessibility ID (best — use this first)
```typescript
'~test-LOGIN'
```
The `~` prefix means "find by accessibility ID". In React Native, this comes from the
`testID` prop. On Android it maps to `content-desc`; on iOS it maps to `accessibilityIdentifier`.

Use this whenever the developer has added a `testID` to the element.

#### iOS Predicate String (iOS only)
```typescript
'-ios predicate string:name == "LoginButton"'
'-ios predicate string:type == "XCUIElementTypeButton" AND label == "Login"'
```
Useful when there is no `testID` and you need to combine multiple conditions.

#### Android UISelector (Android only)
```typescript
'android=new UiSelector().resourceId("com.example.app:id/login_btn")'
'android=new UiSelector().text("LOGIN")'
'android=new UiSelector().className("android.widget.Button")'
```
Use `resourceId` when there is a stable `@+id/` in the XML layout.

#### XPath (last resort — slow and fragile)
```typescript
'//android.widget.Button[@text="LOGIN"]'
'//XCUIElementTypeButton[@name="Login"]'
```
Only use XPath when nothing else works. It breaks easily when the UI structure changes.

### How to find the right selector for your element

See the full guide: **[docs/SELECTORS_GUIDE.md](SELECTORS_GUIDE.md)**

---

## 7. Waiting for things — the most important concept

Mobile apps are asynchronous. Screens load, animations play, network requests complete.
If you tap a button before it appears, the test fails. **Always wait before interacting.**

### waitForElement (built into BasePage)

```typescript
// In a Page Object — waits up to 15 seconds, then throws if still not visible
const element = await this.waitForElement('~test-LOGIN');
await element.click();

// With custom timeout (5 seconds)
const element = await this.waitForElement('~test-LOGIN', { timeout: 5000 });
```

### waitForPageLoad (required on every page)

```typescript
// In the test — always call this after navigating to a new screen
await homePage.waitForPageLoad();
```

### Wait for a condition

```typescript
// Wait until the cart badge shows "3"
await browser.waitUntil(
  async () => {
    const text = await $('~test-Cart badge').getText();
    return text === '3';
  },
  { timeout: 10000, timeoutMsg: 'Cart badge never showed 3' }
);
```

### Wait for an element to disappear

```typescript
// Wait for loading spinner to go away
await $('~loading-spinner').waitForDisplayed({ reverse: true, timeout: 15000 });
```

---

## 8. Assertions — how to check a result

This project uses `expect-webdriverio`, which extends the standard `expect` with
mobile-friendly matchers.

### Boolean checks

```typescript
expect(await loginPage.isErrorDisplayed()).toBe(true);
expect(await loginPage.isErrorDisplayed()).toBe(false);
```

### String checks

```typescript
const msg = await loginPage.getErrorMessage();
expect(msg).toBe('Provided credentials do not match any user in this service.');
expect(msg).toContain('credentials');       // partial match
expect(msg).toMatch(/credentials .* match/); // regex match
```

### Number checks

```typescript
const count = await homePage.getProductCount();
expect(count).toBe(6);
expect(count).toBeGreaterThan(0);
expect(count).toBeLessThanOrEqual(10);
```

### Element state (direct element assertions)

```typescript
const button = await $('~test-LOGIN');
await expect(button).toBeDisplayed();
await expect(button).toBeEnabled();
await expect(button).toHaveText('LOGIN');
await expect(button).toHaveAttr('content-desc', 'test-LOGIN');
```

---

## 9. Common patterns and recipes

### Navigate through multiple screens

```typescript
// Login → Home → Product → Cart
await loginPage.login(email, password);
await homePage.waitForPageLoad();
await homePage.tapFirstProduct();
await productDetailPage.waitForPageLoad();
await productDetailPage.addToCart();
```

### Test the same scenario on data-driven inputs

```typescript
const scenarios = [
  { email: '',                password: '10203040',  error: 'Username is required' },
  { email: 'bob@example.com', password: '',          error: 'Password is required' },
  { email: 'x',               password: '10203040',  error: 'credentials do not match' },
];

for (const { email, password, error } of scenarios) {
  it(`should show error for: ${email || '(empty)'} / ${password || '(empty)'}`, async () => {
    await loginPage.login(email, password);
    const msg = await loginPage.getErrorMessage();
    expect(msg).toContain(error);
  });
}
```

### Scroll to an element before tapping

```typescript
// In the Page Object:
async tapTermsLink(): Promise<void> {
  await this.scrollToElement('~test-Terms of Service');
  await this.tapElement('~test-Terms of Service');
}
```

### Swipe to navigate (e.g. onboarding screens)

```typescript
import { Gestures } from '../../helpers/gestures';

it('should complete onboarding by swiping', async () => {
  await Gestures.swipe({ direction: 'left' });  // swipe to next slide
  await Gestures.swipe({ direction: 'left' });
  await Gestures.swipe({ direction: 'left' });
  await $('~test-Get Started').click();
});
```

### Handle a permission dialog (Android)

```typescript
import { AppiumHelper } from '../../helpers/AppiumHelper';

it('should grant camera permission', async () => {
  await someButton.click();           // triggers permission dialog
  await AppiumHelper.acceptAlert();   // taps "Allow"
});
```

### Take a screenshot at a specific point

```typescript
it('should show the correct product image', async () => {
  await homePage.tapFirstProduct();
  await productDetailPage.waitForPageLoad();
  await this.takeScreenshot('product_detail_screen');  // saved to reports/screenshots/
});
```

---

## 10. Checklist before submitting a test

Before pushing your test, go through this checklist:

- [ ] Test has a clear name starting with `should ...`
- [ ] `beforeEach` resets state (usually `driver.reloadSession()`)
- [ ] `waitForPageLoad()` is called after every navigation
- [ ] Selectors are in the Page Object, not in the test file
- [ ] Hardcoded strings (emails, passwords, messages) are in `testData.ts`
- [ ] No `.only` left behind (`.only` makes all other tests skip)
- [ ] No `browser.pause(3000)` — use `waitForElement` instead
- [ ] TypeScript compiles: `npm run type-check`
- [ ] All tests pass: `npm run test:android`
