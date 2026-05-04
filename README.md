# Mobile Test Automation — WebdriverIO + Appium

A production-ready mobile test automation framework for **Android** and **iOS** using
[WebdriverIO v8](https://webdriver.io/) and [Appium 2](https://appium.io/).

Currently wired to the **Sauce Labs My Demo App** (the app files in `apps/`).

---

## Table of Contents

1. [What is this project?](#1-what-is-this-project)
2. [How it works — the big picture](#2-how-it-works--the-big-picture)
3. [Prerequisites](#3-prerequisites)
4. [Installation](#4-installation)
   - [Step 1 — Install Node.js](#step-1--install-nodejs)
   - [Step 2 — Install Java (Android only)](#step-2--install-java-android-only)
   - [Step 3 — Install Android Studio (Android only)](#step-3--install-android-studio-android-only)
   - [Step 4 — Install Xcode (iOS only — Mac only)](#step-4--install-xcode-ios-only--mac-only)
   - [Step 5 — Install Appium 2](#step-5--install-appium-2)
   - [Step 6 — Install Appium Drivers](#step-6--install-appium-drivers)
   - [Step 7 — Install project dependencies](#step-7--install-project-dependencies)
   - [Step 8 — Configure environment variables](#step-8--configure-environment-variables)
5. [Project Structure](#5-project-structure)
6. [Running Tests](#6-running-tests)
   - [Start an Android Emulator](#start-an-android-emulator)
   - [Run Android tests](#run-android-tests)
   - [Run iOS tests (Mac only)](#run-ios-tests-mac-only)
7. [Viewing Reports](#7-viewing-reports)
8. [Writing New Tests](#8-writing-new-tests)
9. [Configuration Reference](#9-configuration-reference)
10. [Further Reading](#10-further-reading)

---

## 1. What is this project?

This project lets you write automated tests that control a real Android or iOS app —
clicking buttons, typing text, reading values — exactly the way a real user would, but
automatically and repeatedly.

**Why automate?**
- Run 50 test cases in 5 minutes instead of testing manually for hours
- Catch regressions before they reach users
- Run the same tests on every code change (CI/CD)

---

## 2. How it works — the big picture

```
Your test file
    │
    ▼
WebdriverIO (test runner + browser/driver API)
    │  sends JSON commands over HTTP
    ▼
Appium Server (running locally on port 4723)
    │  translates commands to native calls
    ▼
UiAutomator2 (Android) or XCUITest (iOS)
    │  controls the actual app
    ▼
Android Emulator / iOS Simulator / Real Device
```

1. **WebdriverIO** is the JavaScript test framework. You write `$('~button').click()`.
2. **Appium** is the server that receives those commands and drives the real device/emulator.
3. **UiAutomator2** (Android) and **XCUITest** (iOS) are the native automation engines built into the OS.

---

## 3. Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 18 | [nodejs.org](https://nodejs.org) |
| npm | 9 | Comes with Node |
| Java JDK | 11 | Android only |
| Android Studio | Latest | Android emulator + SDK tools |
| Xcode | 15 | iOS only — macOS required |
| Appium | 2.x | Installed globally via npm |

> **Windows users:** iOS testing requires a Mac. Android testing works on Windows.

---

## 4. Installation

### Step 1 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org) and download the **LTS** version
2. Run the installer and follow the prompts
3. Verify it worked:

```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
```

> These commands work the same on Windows (PowerShell), macOS, and Linux.

---

### Step 2 — Install Java (Android only)

Appium's Android driver requires Java.

1. Download **JDK 17** from [adoptium.net](https://adoptium.net)
2. Install it with default settings
3. Set the `JAVA_HOME` environment variable:

**Windows (PowerShell — run as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable(
  "JAVA_HOME",
  "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot",
  "Machine"
)
# Restart PowerShell after running this
```

**macOS (add to `~/.zshrc` or `~/.bash_profile`):**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```
Then reload your shell:
```bash
source ~/.zshrc
```

4. Verify:
```bash
java --version   # should print openjdk 17.x.x or similar
```

---

### Step 3 — Install Android Studio (Android only)

Android Studio provides the Android SDK (tools to build and run Android apps) and the Emulator.

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. During installation, make sure these are checked:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)
3. After installation, open Android Studio → **More Actions** → **SDK Manager**
4. Under **SDK Platforms**, install the API level that matches your emulator (e.g. **Android 16.0 API 36** for a Pixel 7 AVD)
5. Under **SDK Tools**, make sure these are checked:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

6. Set environment variables:

**Windows (add to PowerShell profile or System Environment Variables):**
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:PATH;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

**macOS (add to `~/.zshrc` or `~/.bash_profile`):**
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
```
Then reload:
```bash
source ~/.zshrc
```

7. Verify:
```bash
adb --version   # should print Android Debug Bridge version
```

**Create an Android Virtual Device (emulator):**

1. In Android Studio → **More Actions** → **Virtual Device Manager**
2. Click **Create Device**
3. Choose **Pixel 7** → Next
4. Download **API 36** (Android 16) system image → Next → Finish

---

### Step 4 — Install Xcode (iOS only — Mac only)

1. Open **App Store** on your Mac
2. Search for **Xcode** and install it (large download ~15 GB)
3. After install, run:

```bash
sudo xcode-select --install
sudo xcodebuild -license accept
```

4. Open Xcode → Preferences → **Components** → download a simulator, e.g. **iPhone 15 iOS 17.0**

5. Verify:
```bash
xcrun simctl list devices   # lists all available simulators
```

---

### Step 5 — Install Appium 2

Appium is the server that bridges WebdriverIO and your device. Install it globally:

```bash
npm install -g appium
```

Verify:
```bash
appium --version   # should print 2.x.x
```

> Works the same on Windows, macOS, and Linux.

---

### Step 6 — Install Appium Drivers

Appium 2 uses a plugin system. You must install the driver for each platform you want to test.

**Android:**
```bash
appium driver install uiautomator2
```

**iOS (Mac only):**
```bash
appium driver install xcuitest
```

Verify installed drivers:
```powershell
appium driver list
```

Expected output:
```
✔ Listing available drivers
- uiautomator2@3.x.x [installed]
- xcuitest@7.x.x    [installed]
```

---

### Step 7 — Install project dependencies

Navigate to the project folder and install Node packages:

**Windows:**
```powershell
cd d:\work\mobile\webdriverio_automation
npm install
```

**macOS / Linux:**
```bash
cd ~/work/mobile/webdriverio_automation
npm install
```

This installs everything listed in `package.json` into the `node_modules/` folder.

---

### Step 8 — Configure environment variables

The project uses a `.env` file to store device and app configuration.
Your `.env` is already filled in. Here is what each value means:

```ini
# Where Appium server will run
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723

# Path to your .apk file (relative to project root)
ANDROID_APP_PATH=./apps/android/mda-2.2.0-25.apk

# The name shown in "adb devices" when your emulator is running
ANDROID_DEVICE_NAME=emulator-5554

# Android OS version of the emulator
ANDROID_PLATFORM_VERSION=16.0

# App's package name (like a Java namespace, unique per app)
ANDROID_APP_PACKAGE=com.saucelabs.mydemoapp.android

# The first Activity (screen) Android launches when the app starts
ANDROID_APP_ACTIVITY=com.saucelabs.mydemoapp.android.view.activities.SplashActivity

# Path to your .ipa or .app file
IOS_APP_PATH=./apps/ios/SauceLabs-Demo-App.ipa

# Name of the simulator exactly as shown in Xcode
IOS_DEVICE_NAME=iPhone 15

# iOS version on the simulator
IOS_PLATFORM_VERSION=17.0

# App's bundle identifier (like an Apple namespace, unique per app)
IOS_BUNDLE_ID=com.saucelabs.mydemoapp.rn
```

---

## 5. Project Structure

```
webdriverio_automation/
│
├── .env                        ← your local config (never commit this)
├── .env.example                ← template showing all available settings
├── wdio.shared.conf.ts         ← settings shared between Android and iOS
├── wdio.android.conf.ts        ← Android-specific config + capabilities
├── wdio.ios.conf.ts            ← iOS-specific config + capabilities
│
├── src/
│   ├── pages/                  ← Page Object Model (one class per screen)
│   │   ├── BasePage.ts         ← shared methods every page inherits
│   │   ├── LoginPage.ts        ← login screen interactions
│   │   ├── HomePage.ts         ← home/product screen interactions
│   │   ├── android/            ← Android-specific overrides (if needed)
│   │   └── ios/                ← iOS-specific overrides (if needed)
│   │
│   ├── tests/                  ← test specs (what actually runs)
│   │   ├── android/
│   │   │   └── login.spec.ts
│   │   └── ios/
│   │       └── login.spec.ts
│   │
│   ├── helpers/                ← reusable utility functions
│   │   ├── gestures.ts         ← swipe, longPress, pinch
│   │   ├── AppiumHelper.ts     ← alerts, clipboard, app lifecycle
│   │   └── utils.ts            ← retry, screenshot, random data
│   │
│   ├── data/
│   │   └── testData.ts         ← test credentials and expected strings
│   │
│   └── types/
│       └── index.ts            ← TypeScript type definitions
│
├── apps/
│   ├── android/                ← place your .apk files here
│   └── ios/                    ← place your .ipa/.app files here
│
├── reports/
│   ├── allure-results/         ← raw test results (auto-generated)
│   └── allure-report/          ← HTML report (generated by npm run report)
│
├── scripts/
│   └── generate-test-cases.mjs ← generates docs/test-cases.xlsx from spec files
│
└── docs/                       ← documentation
    ├── test-cases.xlsx         ← test case spreadsheet (generated)
    ├── WRITING_TESTS.md
    ├── SELECTORS_GUIDE.md
    └── TROUBLESHOOTING.md
```

### Key concept: Page Object Model (POM)

Instead of writing selectors directly in tests, each screen of the app gets its own
"page" class. Tests call the page's methods, not raw selectors.

```
❌ Without POM (fragile):
   await $('~test-LOGIN').click();

✅ With POM (maintainable):
   await loginPage.login(email, password);
```

If the app changes the login button's ID, you only fix it in one file (`LoginPage.ts`),
not in every test that taps the button.

---

## 6. Running Tests

### Start an Android Emulator

Before running tests, an emulator must be running.

**Option A — Android Studio:**
1. Open Android Studio
2. Click the phone icon in the top-right toolbar (**Device Manager**)
3. Click the Play (▶) button next to your AVD

**Option B — Command line:**

Windows:
```powershell
# List available AVDs
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -list-avds

# Start one (replace "Pixel_7_API_36" with your AVD name)
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_7_API_36
```

macOS:
```bash
# List available AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start one
$ANDROID_HOME/emulator/emulator -avd Pixel_7_API_36
```

Wait until the emulator fully boots (home screen is visible), then verify:
```bash
adb devices
# Output: emulator-5554   device
```

---

### Run Android tests

```bash
npm run test:android
```

WebdriverIO will:
1. Start the Appium server automatically
2. Install the app on the emulator
3. Launch each test, controlling the app
4. Print results in the terminal
5. Save detailed results to `reports/allure-results/`

**Expected terminal output:**
```
[0-0] RUNNING in Android - /src/tests/android/login.spec.ts
[0-0] Android - Login
[0-0]    ✓ should login with valid credentials and navigate to products
[0-0]    ✓ should display products after login
[0-0]    ✓ should show username error when username is empty
[0-0]    ✓ should show password error when password is empty
[0-0]    ✓ should logout successfully and show login option in menu again

[0-0] 5 passing (1m 30s)
```

---

### Run iOS tests (Mac only)

**Start a simulator first:**
```bash
# List available simulators
xcrun simctl list devices | grep "iPhone 15"

# Boot it
xcrun simctl boot "iPhone 15"

# Open Simulator app so you can see it
open -a Simulator
```

Then run:
```bash
npm run test:ios
```

---

## 7. Viewing Reports

After running tests, generate and open the HTML report:

```bash
npm run report
```

This opens a browser with a detailed Allure report showing:
- Pass/fail status per test
- Screenshots of failures
- Step-by-step execution timeline
- Test duration

To clean old reports before a new run:
```bash
npm run report:clean
```

> All `npm run` commands work the same on Windows, macOS, and Linux.

### Generate the test case spreadsheet

A pre-built spreadsheet (`docs/test-cases.xlsx`) documents every test case with steps, expected results, priority, and automation reference. Regenerate it after adding new specs:

```bash
node scripts/generate-test-cases.mjs
```

---

## 8. Writing New Tests

See **[docs/WRITING_TESTS.md](docs/WRITING_TESTS.md)** for a complete beginner-friendly
step-by-step guide on adding new test cases and page objects.

---

## 9. Configuration Reference

### npm scripts

| Command | What it does |
|---|---|
| `npm run test:android` | Run all Android tests |
| `npm run test:ios` | Run all iOS tests |
| `npm run report` | Generate and open Allure HTML report |
| `npm run report:clean` | Delete old report files |
| `npm run lint` | Check code for style errors |
| `npm run lint:fix` | Auto-fix style errors |
| `npm run type-check` | Verify TypeScript types without running tests |

### Environment variables (.env)

| Variable | Description |
|---|---|
| `APPIUM_HOST` | Appium server hostname (usually `127.0.0.1`) |
| `APPIUM_PORT` | Appium server port (usually `4723`) |
| `ANDROID_APP_PATH` | Relative path to your `.apk` |
| `ANDROID_DEVICE_NAME` | Device name from `adb devices` |
| `ANDROID_PLATFORM_VERSION` | Android OS version (e.g. `16.0`) |
| `ANDROID_APP_PACKAGE` | App's package name |
| `ANDROID_APP_ACTIVITY` | Launcher activity class name |
| `IOS_APP_PATH` | Relative path to your `.ipa` or `.app` |
| `IOS_DEVICE_NAME` | Simulator name (e.g. `iPhone 15`) |
| `IOS_PLATFORM_VERSION` | iOS version (e.g. `17.0`) |
| `IOS_BUNDLE_ID` | App's bundle identifier |
| `IOS_UDID` | Real device UDID (leave blank for simulator) |
| `EXPLICIT_TIMEOUT` | How long (ms) to wait for elements (default `15000`) |
| `MAX_INSTANCES` | Number of parallel test sessions (default `1`) |

---

## 10. Further Reading

- [WebdriverIO Docs](https://webdriver.io/docs/gettingstarted)
- [Appium Docs](https://appium.io/docs/en/latest/)
- [UiAutomator2 Driver](https://github.com/appium/appium-uiautomator2-driver)
- [XCUITest Driver](https://appium.github.io/appium-xcuitest-driver/latest/)
- [Appium Inspector](https://github.com/appium/appium-inspector) — GUI tool to find element selectors
- [docs/WRITING_TESTS.md](docs/WRITING_TESTS.md) — how to add tests to this project
- [docs/SELECTORS_GUIDE.md](docs/SELECTORS_GUIDE.md) — how to find element selectors
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — common errors and fixes
