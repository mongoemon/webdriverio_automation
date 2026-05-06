# Troubleshooting

Common errors you'll encounter, what they mean, and how to fix them.

---

## Table of Contents

1. [Appium server errors](#1-appium-server-errors)
2. [Device / emulator errors](#2-device--emulator-errors)
3. [Element not found errors](#3-element-not-found-errors)
4. [App installation errors](#4-app-installation-errors)
5. [Timeout errors](#5-timeout-errors)
6. [TypeScript / compilation errors](#6-typescript--compilation-errors)
7. [iOS-specific errors](#7-ios-specific-errors)
8. [How to read a test failure](#8-how-to-read-a-test-failure)

---

## 1. Appium server errors

### `Error: connect ECONNREFUSED 127.0.0.1:4723`

**What it means:** WebdriverIO tried to connect to Appium but Appium wasn't running.

**Fix:** The project starts Appium automatically via the `@wdio/appium-service`. If you
see this error, it usually means Appium is not installed globally.

```bash
# Check if appium is installed (works on Windows PowerShell, macOS, and Linux):
appium --version

# If not found:
npm install -g appium
appium driver install uiautomator2   # Android
appium driver install xcuitest       # iOS
```

---

### `WARN: Request failed with status 404 — A session is either terminated or not started`

You'll see these lines immediately after a test failure:

```
WARN webdriver: Request failed with status 404 due to A session is either terminated or not started
ERROR webdriver: Request failed with status 404 due to invalid session id: ...
```

**What it means:** After a test fails, the `afterTest` hook tries to take a screenshot for
the Allure report. If the failure was severe enough to kill the session (e.g. a timeout that
disconnected the driver), the screenshot command hits a dead session.

**These warnings are harmless** — the `afterTest` hook wraps the screenshot in a try/catch
so the error is silently swallowed and the test run continues normally.

---

### `Error: 'uiautomator2' driver is not installed`

**Fix:**
```bash
appium driver install uiautomator2
```

---

### `Port 4723 is already in use`

Another Appium process is running.

**Windows:**
```powershell
# Find the PID using port 4723:
netstat -ano | findstr :4723
# Kill it (replace <PID> with the number from the last column):
taskkill /PID <PID> /F
```

**macOS / Linux:**
```bash
# Find the PID:
lsof -ti :4723
# Kill it:
kill -9 $(lsof -ti :4723)
```

---

## 2. Device / emulator errors

### `No device found` or `adb devices` shows nothing

**Checklist:**
1. Is the emulator visible on screen and fully booted (home screen showing)?
2. Run `adb devices` — does it show `emulator-5554   device`?
3. If it shows `offline`, restart the emulator

```bash
adb kill-server
adb start-server
adb devices
```

---

### `ANDROID_HOME is not set`

**Windows (PowerShell, run once):**
```powershell
[System.Environment]::SetEnvironmentVariable(
  "ANDROID_HOME",
  "$env:LOCALAPPDATA\Android\Sdk",
  "User"
)
# Restart PowerShell after this
```

**macOS (add to `~/.zshrc` or `~/.bash_profile`, then `source` it):**
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```

---

### `The emulator is slow / freezes`

- Enable **Hardware Acceleration** in your BIOS (Intel VT-x or AMD-V)
- In Android Studio → AVD Manager → edit the AVD → enable **GPU acceleration** (Hardware - GLES 2.0)
- Give the emulator more RAM (2048 MB minimum)

---

### `INSTALL_FAILED_UPDATE_INCOMPATIBLE`

The app is already installed but with a different signature (e.g. a different build).

```bash
adb uninstall com.saucelabs.mydemoapp.android
```

Then run the tests again — Appium will reinstall it.

---

## 3. Element not found errors

### `Error: element ("~test-LOGIN") still not displayed after 15000ms`

**What it means:** The element with accessibility ID `test-LOGIN` wasn't found on screen
within 15 seconds.

**Debugging steps:**

**Step 1 — Confirm you're on the right screen**

Add a screenshot before the failing line:
```typescript
await browser.saveScreenshot('./reports/debug.png');
```
Open `reports/debug.png` — is the expected screen visible?

**Step 2 — Check the selector**

Open Appium Inspector and connect to a live session. Click the element and check
whether `content-desc` (Android) or `accessibilityIdentifier` (iOS) matches exactly.

Common issues:
- Typo: `~test-Login` (capital L) vs `~test-LOGIN` (uppercase)
- Trailing space: `~test-LOGIN ` (invisible)
- Element is nested inside a scroll view and needs scrolling first

**Step 3 — Is the element off-screen?**

```typescript
// Try scrolling to it first:
await this.scrollToElement('~test-LOGIN');
await this.tapElement('~test-LOGIN');
```

**Step 4 — Increase timeout for slow networks/devices**

```typescript
const element = await this.waitForElement('~test-LOGIN', { timeout: 30000 });
```

---

### `element is not interactable`

The element was found but couldn't be tapped (covered by another element, disabled, or not fully visible).

**Windows (PowerShell):**
```powershell
# Dump the UI tree to a file, then open it and search for enabled="false"
adb shell uiautomator dump /sdcard/dump.xml
adb pull /sdcard/dump.xml dump.xml
# Open dump.xml in a text editor and search for enabled="false"
```

**macOS / Linux:**
```bash
adb exec-out uiautomator dump /dev/tty | grep -i 'enabled="false"'
```

Or use `scrollIntoView()` before tapping:
```typescript
const el = await $('~test-LOGIN');
await el.scrollIntoView();
await el.click();
```

---

### `element ("~Displays all products of catalog") still not displayed after 15000ms` — after logout

**What it means:** The `logout()` method tapped the Logout menu item, but a native
confirmation dialog appeared. If the dialog's confirmation button isn't tapped, the dialog
blocks navigation and `waitForPageLoad()` times out.

**How to confirm:** Add a screenshot just before the wait:
```typescript
await browser.saveScreenshot('./reports/debug_after_logout.png');
```

**Fix:** The `HomePage.logout()` method must tap the dialog's positive button:
```typescript
async logout(): Promise<void> {
  await this.tapElement(SEL.menuButton);
  await this.tapElement(SEL.logoutItem);
  await this.tapElement('android=new UiSelector().text("LOGOUT")');  // confirm dialog
  await this.waitForElement(SEL.menuButton);
}
```

If the button text is different in your app, dump the live UI to confirm:

**Windows (PowerShell):**
```powershell
adb shell uiautomator dump /sdcard/dump.xml
adb pull /sdcard/dump.xml dump.xml
# Open dump.xml and search for class="android.widget.Button"
```

**macOS / Linux:**
```bash
adb exec-out uiautomator dump /dev/tty
# Search the output for <node ... class="android.widget.Button" ...>
```

---

### `stale element reference`

The element was found, but the DOM updated before you interacted with it (e.g. a loading
animation replaced it).

**Fix:** Re-query the element instead of caching it:
```typescript
// ❌ Bad — element reference may go stale
const btn = await $('~test-LOGIN');
await browser.pause(2000);   // DOM updates during this pause
await btn.click();           // stale!

// ✅ Good — query fresh each time
await this.tapElement('~test-LOGIN');  // waitForElement + click in one call
```

---

## 4. App installation errors

### `Could not find a connected Android device`

```bash
adb devices   # must show "device" not "offline" or "unauthorized"
# Works the same on Windows (PowerShell/cmd) and macOS
```

If it shows `unauthorized`:
1. Look at the emulator screen — there should be an "Allow USB Debugging" dialog
2. Click **Allow**

---

### `INSTALL_FAILED_INSUFFICIENT_STORAGE`

The emulator doesn't have enough space.

**Fix:**
```bash
# Clear app data (works on Windows PowerShell/cmd and macOS):
adb shell pm clear com.saucelabs.mydemoapp.android

# Or wipe and reset the emulator from Android Studio → AVD Manager → Wipe Data
```

---

### `The application at ... does not exist or is not accessible`

The path in `.env` is wrong or the file doesn't exist.

**Windows:**
```powershell
Test-Path "d:\work\mobile\webdriverio_automation\apps\android\mda-2.2.0-25.apk"
# Should print: True
```

**macOS / Linux:**
```bash
ls -lh apps/android/mda-2.2.0-25.apk
# Should print the file size — if it says "No such file", the APK is missing
```

Check your `.env`:
```ini
ANDROID_APP_PATH=./apps/android/mda-2.2.0-25.apk
```
The path is relative to the project root. Make sure the filename and extension match exactly.

---

## 5. Timeout errors

### `Timeout: Waited 15000ms for condition`

A `waitUntil` or `waitForDisplayed` call didn't succeed in time.

**Causes:**
- The app is slow (emulator without hardware acceleration)
- The element appears only after a network call
- Wrong selector — the element never appears at all

**Quick fix for slow emulators:**
```ini
# In .env — increase timeouts:
EXPLICIT_TIMEOUT=30000
```

**Find the root cause:**
```typescript
// Add before the failing line to see what's on screen:
await browser.saveScreenshot('./reports/debug_timeout.png');
console.log(await browser.getPageSource()); // prints full XML
```

---

### `newCommandTimeout exceeded`

Appium kills the session if it receives no command for too long.

**Fix:** The capabilities already set `newCommandTimeout: 240`. If tests are very slow,
increase it in `wdio.android.conf.ts`:
```typescript
'appium:newCommandTimeout': 600,   // 10 minutes
```

---

## 6. TypeScript / compilation errors

### `Cannot find name 'browser'` or `Cannot find name '$'`

The WebdriverIO global types aren't loaded.

**Fix:** Check `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "types": ["node", "@wdio/globals/types", "expect-webdriverio", "mocha"]
  }
}
```

Then run:
```bash
npm run type-check
```

---

### `Module not found: ...`

A package isn't installed.

```bash
npm install
```

If still failing, delete `node_modules` and reinstall:

**Windows:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**macOS / Linux:**
```bash
rm -rf node_modules
npm install
```

---

## 7. iOS-specific errors

### `Could not find a simulator with name 'iPhone 15'`

The simulator name in `.env` must match exactly what Xcode shows.

```bash
# List all simulators:
xcrun simctl list devices | grep -i iphone
```

Update `IOS_DEVICE_NAME` in `.env` to match exactly (including spaces and capitalisation).

---

### `WebDriverAgentRunner failed to launch`

WebDriverAgent (WDA) is the iOS component Appium uses. It occasionally fails to build.

**Fix:**
```bash
# 1. Kill any existing WDA processes:
killall -9 WebDriverAgent

# 2. Reset derived data (where Xcode stores build artifacts):
rm -rf ~/Library/Developer/Xcode/DerivedData

# 3. Rerun tests — WDA will rebuild
npm run test:ios
```

---

### `xcodebuild: error: SDK "iphonesimulator" cannot be located`

Xcode command-line tools aren't pointed at the right Xcode installation.

```bash
sudo xcode-select --switch /Applications/Xcode.app
sudo xcode-select --install
```

---

### `.ipa files cannot be installed on simulators`

`.ipa` is for real devices. Simulators need a `.app` bundle.

Check your `apps/ios/` folder:
- `SauceLabs-Demo-App.app` → Simulator ✅
- `SauceLabs-Demo-App.ipa` → Real device only ✅
- For simulator, set: `IOS_APP_PATH=./apps/ios/SauceLabs-Demo-App.app`

---

## 8. How to read a test failure

When a test fails, WebdriverIO prints something like this:

```
1 failing

1) Android - Login should show error for invalid credentials
   AssertionError: expect(received).toBe(expected)

   Expected: true
   Received: false

   at Context.<anonymous> (src/tests/android/login.spec.ts:37:5)
```

**Reading it:**

| Part | Meaning |
|---|---|
| `Android - Login` | The `describe` block name |
| `should show error for invalid credentials` | The `it` block name |
| `AssertionError` | An `expect()` check failed |
| `Expected: true, Received: false` | `isErrorDisplayed()` returned `false` instead of `true` |
| `login.spec.ts:37` | Line 37 of the spec file — click to jump to it |

**Debugging approach:**

1. Open `reports/allure-results/` or run `npm run report` to see the screenshot taken at failure
2. Look at the screenshot — is the error message visible? If not, the selector is wrong
3. Add `await browser.saveScreenshot('./reports/debug.png')` just before the failing assertion
4. Use Appium Inspector to inspect the live screen and compare selectors
