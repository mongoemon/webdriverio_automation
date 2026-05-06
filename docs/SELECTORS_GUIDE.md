# Selectors Guide — Finding Element Locators

A **selector** (also called a **locator**) is how you tell Appium which button, text
field, or label you want to interact with. Getting selectors right is the most important
practical skill in mobile test automation.

---

## Table of Contents

1. [What is a selector?](#1-what-is-a-selector)
2. [Selector types ranked by reliability](#2-selector-types-ranked-by-reliability)
3. [Tool: Appium Inspector (recommended)](#3-tool-appium-inspector-recommended)
4. [Tool: adb + uiautomatorviewer (Android, no install)](#4-tool-adb--uiautomatorviewer-android-no-install)
5. [Tool: Xcode Accessibility Inspector (iOS)](#5-tool-xcode-accessibility-inspector-ios)
6. [Reading the element tree](#6-reading-the-element-tree)
7. [How to write each selector type in code](#7-how-to-write-each-selector-type-in-code)
8. [Selector decision flowchart](#8-selector-decision-flowchart)
9. [Dealing with dynamic elements](#9-dealing-with-dynamic-elements)
10. [React Native specifics (this project)](#10-react-native-specifics-this-project)

---

## 1. What is a selector?

Every element visible on screen (a button, a text input, an image) has properties
that uniquely identify it. A selector uses one of those properties to say
"I mean THIS element".

Think of it like addressing a letter:
- A vague address: "the blue house" → unreliable
- A precise address: "42 Oak Street, Apt 3" → reliable

In testing:
```typescript
// Vague (relies on position — breaks when screen reorders):
await $$('android.widget.Button')[2].click();

// Precise (relies on a stable identifier):
await $('~test-LOGIN').click();
```

---

## 2. Selector types ranked by reliability

| Rank | Type | Syntax example | Works on |
|---|---|---|---|
| 1 | Accessibility ID | `~test-LOGIN` | Android + iOS |
| 2 | iOS Predicate String | `-ios predicate string:name == "Login"` | iOS only |
| 3 | Android UISelector (resourceId) | `android=new UiSelector().resourceId("app:id/btn_login")` | Android only |
| 4 | Android UISelector (text) | `android=new UiSelector().text("Login")` | Android only |
| 5 | Class Chain | `-ios class chain:**/XCUIElementTypeButton[\`label == "Login"\`]` | iOS only |
| 6 | XPath | `//android.widget.Button[@text="Login"]` | Android + iOS |

**Rule of thumb:** Always try accessibility ID first. Only move down the list if it
doesn't exist.

---

## 3. Tool: Appium Inspector (recommended)

Appium Inspector is a free GUI app that connects to a running Appium session and lets
you visually browse every element on screen and copy its selectors.

### Install

Download from: [github.com/appium/appium-inspector/releases](https://github.com/appium/appium-inspector/releases)

Choose:
- `Appium-Inspector-2024.x.x-win32-x64.exe` (Windows)
- `Appium-Inspector-2024.x.x-mac.dmg` (macOS)

### Usage — step by step

**Step 1 — Start your emulator/simulator**

Android — Windows:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_7_API_36
```

Android — macOS:
```bash
$ANDROID_HOME/emulator/emulator -avd Pixel_7_API_36
```

iOS:
```bash
xcrun simctl boot "iPhone 15"
open -a Simulator
```

**Step 2 — Start the Appium server manually**
```powershell
appium --relaxed-security
```
Leave this terminal open. Appium is now listening on port 4723.

**Step 3 — Open Appium Inspector**

Launch the app you downloaded.

**Step 4 — Fill in the connection fields**

In the "Remote Path" section:
- Remote Host: `127.0.0.1`
- Remote Port: `4723`
- Remote Path: `/`

**Step 5 — Enter Desired Capabilities**

Click the JSON edit icon and paste the appropriate capabilities:

**Android:**
```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "emulator-5554",
  "appium:platformVersion": "16.0",
  "appium:app": "C:\\work\\mobile\\webdriverio_automation\\apps\\android\\mda-2.2.0-25.apk",  // Windows
  // "appium:app": "/Users/yourname/work/mobile/webdriverio_automation/apps/android/mda-2.2.0-25.apk",  // macOS
  "appium:appPackage": "com.saucelabs.mydemoapp.android",
  "appium:appActivity": "com.saucelabs.mydemoapp.android.view.activities.SplashActivity",
  "appium:noReset": true
}
```

> Use `noReset: true` so the app doesn't reinstall every time you inspect.

**iOS:**
```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15",
  "appium:platformVersion": "17.0",
  "appium:app": "/path/to/apps/ios/SauceLabs-Demo-App.app",
  "appium:bundleId": "com.saucelabs.mydemoapp.rn",
  "appium:noReset": true
}
```

**Step 6 — Click Start Session**

The Inspector will:
1. Connect to Appium
2. Launch (or attach to) the app
3. Show a screenshot of the current screen on the left
4. Show the element tree on the right

**Step 7 — Click on any element**

Click a button or text field in the screenshot. The right panel shows:

```
Selected Element
  type:            android.widget.EditText
  content-desc:    test-Username          ← this becomes ~test-Username
  resource-id:     com.saucelabs:id/input_username
  text:            (empty)
  class:           android.widget.EditText
```

**Step 8 — Copy the selector**

In the "Find By" section at the bottom, Inspector shows you the recommended selector.
For `content-desc: test-Username`, the selector is:

```
Accessibility ID   →   test-Username
```

In your code, this becomes `~test-Username`.

---

## 4. Tool: adb + UI dump (Android, no extra install)

If you don't want to install Appium Inspector, you can dump the UI to XML using adb.

**Step 1 — Start emulator and app, navigate to the screen you want to inspect**

**Step 2 — Dump the UI hierarchy**

**Windows (PowerShell):**
```powershell
adb shell uiautomator dump /sdcard/dump.xml
adb pull /sdcard/dump.xml dump.xml
# Open dump.xml in a text editor and search for your element's text or resource-id
```

**macOS / Linux:**
```bash
adb exec-out uiautomator dump /dev/tty
```

This prints a large XML string to the terminal. Search for your element by the text it shows on screen.

Example output (simplified):
```xml
<node index="0" text="" resource-id="" class="android.widget.FrameLayout" ...>
  <node index="0" text="" resource-id="" class="android.view.ViewGroup" ...>
    <node index="0" text=""
          resource-id="com.saucelabs.mydemoapp.android:id/username"
          class="android.widget.EditText"
          content-desc="test-Username"          ← your accessibility ID
          enabled="true" />
```

**What each attribute means:**

| Attribute | Selector type | Code |
|---|---|---|
| `content-desc="test-Username"` | Accessibility ID | `~test-Username` |
| `resource-id="app:id/username"` | UISelector resourceId | `android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/username")` |
| `text="LOGIN"` | UISelector text | `android=new UiSelector().text("LOGIN")` |

---

## 5. Tool: Xcode Accessibility Inspector (iOS)

On macOS, Xcode includes a built-in inspector.

1. Open your iOS Simulator
2. In the menu bar: **Xcode** → **Open Developer Tool** → **Accessibility Inspector**
3. In the Inspector, choose your Simulator from the device picker
4. Click the crosshair icon, then click any element in the Simulator
5. The Inspector shows all attributes including `accessibilityIdentifier` — that is your `~` selector

---

## 6. Reading the element tree

When you look at the Inspector, you'll see a tree like this:

```
XCUIElementTypeApplication "My Demo App"
  └── XCUIElementTypeWindow
        └── XCUIElementTypeOther
              ├── XCUIElementTypeTextField (accessibilityIdentifier: "test-Username")
              ├── XCUIElementTypeSecureTextField (accessibilityIdentifier: "test-Password")
              └── XCUIElementTypeButton (accessibilityIdentifier: "test-LOGIN")
                    └── XCUIElementTypeStaticText "LOGIN"
```

**Rules of thumb:**
- An element is "findable" if it has a non-empty `accessibilityIdentifier` (iOS) or
  `content-desc` (Android)
- If the button you want doesn't have one, try its parent or child elements
- Ask the developer to add `testID` to important elements — it's a 30-second change
  that saves hours of selector hunting

---

## 7. How to write each selector type in code

### Accessibility ID
```typescript
// Android: matches content-desc attribute
// iOS: matches accessibilityIdentifier attribute
'~test-LOGIN'
'~test-Username'
```

### Android UISelector — by resource ID
```typescript
// Use the full "package:id/name" format
'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/btn_login")'
```

### Android UISelector — by visible text
```typescript
'android=new UiSelector().text("LOGIN")'
'android=new UiSelector().textContains("LOG")'
```

### Android UISelector — by class name
```typescript
'android=new UiSelector().className("android.widget.EditText").instance(0)'
// instance(0) = first field, instance(1) = second field, etc.
```

### iOS Predicate String
```typescript
'-ios predicate string:name == "test-LOGIN"'
'-ios predicate string:type == "XCUIElementTypeButton" AND label == "LOGIN"'
```

### iOS Class Chain
```typescript
// More precise than predicate — specifies the hierarchy
'-ios class chain:**/XCUIElementTypeButton[`name == "test-LOGIN"`]'
```

### XPath (use sparingly)
```typescript
// Android
'//android.widget.Button[@content-desc="test-LOGIN"]'

// iOS
'//XCUIElementTypeButton[@name="test-LOGIN"]'
```

---

## 8. Selector decision flowchart

```
Does the element have a testID / accessibilityIdentifier / content-desc?
│
├── YES → Use Accessibility ID:  ~test-elementName
│
└── NO
    │
    ├── Android?
    │   ├── Does it have a resource-id?
    │   │   ├── YES → android=new UiSelector().resourceId("...")
    │   │   └── NO  → android=new UiSelector().text("visible text")
    │
    └── iOS?
        ├── Can you identify it by label or type?
        │   ├── YES → -ios predicate string:label == "..."
        │   └── NO  → -ios class chain:**/XCUIElementTypeXxx[...]
        │
        └── Still nothing? → XPath (last resort)
```

---

## 9. Dealing with dynamic elements

Some elements have IDs that change every render (e.g. auto-generated keys). Strategies:

### Use parent + index
```typescript
// "The 3rd item in the product list"
const items = await $$('~test-Item');
await items[2].click();
```

### Find by text content
```typescript
const button = await $('android=new UiSelector().text("Add to Cart")');
await button.click();
```

### Find a child inside a known parent
```typescript
// Get the container, then find a button inside it
const container = await $('~test-product-card');
const addButton = await container.$('~test-ADD TO CART');
await addButton.click();
```

---

## 10. This project's app — native Android (not React Native)

The Android build tested here (`mda-2.2.0-25.apk`, package `com.saucelabs.mydemoapp.android`)
is a **native Android app**, not React Native. This has important implications for selectors.

### 1. Accessibility IDs come from content-desc, not testID

Native Android views use `android:contentDescription` in the XML layout.
These map directly to the `~` (accessibility ID) selector:

```
content-desc="View menu"   →   '~View menu'
content-desc="Login Menu Item"  →  '~Login Menu Item'
```

There are no React Native `testID` props — find these with Appium Inspector or `adb`.

### 2. Most interactive elements use resourceId

Input fields, error labels, and other form elements in native Android apps typically
have a `resource-id` but no `content-desc`. Use the `UiSelector` approach:

```typescript
// Confirmed selectors for mda-2.2.0-25.apk:
'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameET")'
'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/passwordET")'
'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/nameErrorTV")'
'android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/passwordErrorTV")'
```

### 3. Native confirmation dialogs

When the app shows a native `AlertDialog` (e.g. a logout confirmation), target its
buttons by their visible text using `UiSelector().text()`:

```typescript
// "Log Out" dialog — tap the positive button
await $('android=new UiSelector().text("LOGOUT")').click();
```

> If the button text is rendered in all-caps via `textAllCaps` but the underlying attribute
> uses mixed case, use `textMatches` with a case-insensitive regex:
> `android=new UiSelector().textMatches("(?i)logout")`

### 4. iOS version of the app is React Native

The iOS build (`com.saucelabs.mydemoapp.rn`) is a separate React Native app and uses
`accessibilityIdentifier` values set via React Native's `testID` prop. Selectors for
the iOS suite will differ from Android.
