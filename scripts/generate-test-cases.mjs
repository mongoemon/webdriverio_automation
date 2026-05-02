import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'docs', 'test-cases.xlsx');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'WebdriverIO Automation';
workbook.created = new Date();

// ── colour palette ─────────────────────────────────────────────────────────
const COLOR = {
  headerBg:   'FF1E3A5F',   // dark navy
  headerFg:   'FFFFFFFF',
  passGreen:  'FFD6F5E3',
  failRed:    'FFFFD6D6',
  moduleBg:   'FFE8F0FE',   // light blue row
  alt:        'FFF7F9FF',
  border:     'FFB0BEC5',
};

// ── test case data ─────────────────────────────────────────────────────────
const testCases = [
  // ── Android Login ─────────────────────────────────────────────────────────
  {
    id:       'TC-AND-001',
    module:   'Login',
    platform: 'Android',
    title:    'Login with valid credentials',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Tap the hamburger menu (☰).',
      '3. Tap "Login Menu Item".',
      '4. Enter email: bod@example.com',
      '5. Enter password: 10203040',
      '6. Tap "Tap to login with given credentials" button.',
    ].join('\n'),
    expected: 'Products catalog screen is displayed. Home page indicator is visible.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'android/login.spec.ts — "should login with valid credentials and navigate to products"',
    status: 'Pass',
  },
  {
    id:       'TC-AND-002',
    module:   'Login',
    platform: 'Android',
    title:    'Products list is shown after login',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Enter valid credentials (bod@example.com / 10203040).',
      '4. Tap the login button.',
      '5. Wait for the Products screen.',
      '6. Count visible product items.',
    ].join('\n'),
    expected: 'Product count is greater than 0. At least one product title is visible.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'android/login.spec.ts — "should display products after login"',
    status: 'Pass',
  },
  {
    id:       'TC-AND-003',
    module:   'Login',
    platform: 'Android',
    title:    'Username field shows error when left empty',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Leave the username field blank.',
      '4. Enter password: 10203040',
      '5. Tap the login button.',
    ].join('\n'),
    expected: 'Username error message "Username is required" is displayed below the username field.',
    testData: 'email: (empty)\npassword: 10203040',
    priority: 'Medium',
    automationRef: 'android/login.spec.ts — "should show username error when username is empty"',
    status: 'Pass',
  },
  {
    id:       'TC-AND-004',
    module:   'Login',
    platform: 'Android',
    title:    'Password field shows error when left empty',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Enter email: bod@example.com',
      '4. Leave the password field blank.',
      '5. Tap the login button.',
    ].join('\n'),
    expected: 'Password error message "Enter Password" is displayed below the password field.',
    testData: 'email: bod@example.com\npassword: (empty)',
    priority: 'Medium',
    automationRef: 'android/login.spec.ts — "should show password error when password is empty"',
    status: 'Pass',
  },
  {
    id:       'TC-AND-005',
    module:   'Login',
    platform: 'Android',
    title:    'Logout returns Login option to menu',
    preconditions: 'User is logged in and on the Products screen.',
    steps: [
      '1. Log in with valid credentials.',
      '2. Wait for the Products screen.',
      '3. Tap the hamburger menu (☰).',
      '4. Tap "Logout Menu Item".',
      '5. Tap "LOGOUT" in the confirmation dialog.',
      '6. Wait for the Products screen.',
      '7. Tap the hamburger menu (☰) again.',
      '8. Verify "Login Menu Item" is visible.',
    ].join('\n'),
    expected: '"Login Menu Item" is visible in the navigation drawer, confirming the user is logged out.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'android/login.spec.ts — "should logout successfully and show login option in menu again"',
    status: 'Pass',
  },

  // ── iOS Login ─────────────────────────────────────────────────────────────
  {
    id:       'TC-IOS-001',
    module:   'Login',
    platform: 'iOS',
    title:    'Login with valid credentials',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Tap the hamburger menu (☰).',
      '3. Tap "Login Menu Item".',
      '4. Enter email: bod@example.com',
      '5. Enter password: 10203040',
      '6. Tap the login button.',
    ].join('\n'),
    expected: 'Products catalog screen is displayed. Home page indicator is visible.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'ios/login.spec.ts — "should login with valid credentials and navigate to products"',
    status: 'Pass',
  },
  {
    id:       'TC-IOS-002',
    module:   'Login',
    platform: 'iOS',
    title:    'Products list is shown after login',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Enter valid credentials.',
      '4. Tap the login button.',
      '5. Count visible product items.',
    ].join('\n'),
    expected: 'Product count is greater than 0.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'ios/login.spec.ts — "should display products after login"',
    status: 'Pass',
  },
  {
    id:       'TC-IOS-003',
    module:   'Login',
    platform: 'iOS',
    title:    'Username field shows error when left empty',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Leave the username field blank.',
      '4. Enter password: 10203040',
      '5. Tap the login button.',
    ].join('\n'),
    expected: '"Username is required" error is shown below the username field.',
    testData: 'email: (empty)\npassword: 10203040',
    priority: 'Medium',
    automationRef: 'ios/login.spec.ts — "should show username error when username is empty"',
    status: 'Pass',
  },
  {
    id:       'TC-IOS-004',
    module:   'Login',
    platform: 'iOS',
    title:    'Password field shows error when left empty',
    preconditions: 'App is installed and running. User is on the Login screen.',
    steps: [
      '1. Launch the app.',
      '2. Navigate to Login screen via hamburger menu.',
      '3. Enter email: bod@example.com',
      '4. Leave the password field blank.',
      '5. Tap the login button.',
    ].join('\n'),
    expected: '"Enter Password" error is shown below the password field.',
    testData: 'email: bod@example.com\npassword: (empty)',
    priority: 'Medium',
    automationRef: 'ios/login.spec.ts — "should show password error when password is empty"',
    status: 'Pass',
  },
  {
    id:       'TC-IOS-005',
    module:   'Login',
    platform: 'iOS',
    title:    'Logout returns Login option to menu',
    preconditions: 'User is logged in and on the Products screen.',
    steps: [
      '1. Log in with valid credentials.',
      '2. Wait for the Products screen.',
      '3. Tap the hamburger menu (☰).',
      '4. Tap "Logout Menu Item".',
      '5. Confirm the logout dialog.',
      '6. Tap the hamburger menu (☰) again.',
      '7. Verify "Login Menu Item" is visible.',
    ].join('\n'),
    expected: '"Login Menu Item" is visible in the navigation drawer.',
    testData: 'email: bod@example.com\npassword: 10203040',
    priority: 'High',
    automationRef: 'ios/login.spec.ts — "should logout successfully and show login option in menu again"',
    status: 'Pass',
  },
];

// ── helper: style a header row ─────────────────────────────────────────────
function styleHeader(row) {
  row.height = 28;
  row.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.headerBg } };
    cell.font   = { bold: true, color: { argb: COLOR.headerFg }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top:    { style: 'thin', color: { argb: COLOR.border } },
      bottom: { style: 'thin', color: { argb: COLOR.border } },
      left:   { style: 'thin', color: { argb: COLOR.border } },
      right:  { style: 'thin', color: { argb: COLOR.border } },
    };
  });
}

function applyBorder(cell) {
  cell.border = {
    top:    { style: 'thin', color: { argb: COLOR.border } },
    bottom: { style: 'thin', color: { argb: COLOR.border } },
    left:   { style: 'thin', color: { argb: COLOR.border } },
    right:  { style: 'thin', color: { argb: COLOR.border } },
  };
}

// ── Sheet 1: Test Cases ────────────────────────────────────────────────────
const sheet = workbook.addWorksheet('Test Cases', {
  views: [{ state: 'frozen', ySplit: 1 }],
  pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
});

const COLS = [
  { header: 'Test ID',         key: 'id',             width: 14 },
  { header: 'Module',          key: 'module',          width: 14 },
  { header: 'Platform',        key: 'platform',        width: 12 },
  { header: 'Title',           key: 'title',           width: 38 },
  { header: 'Preconditions',   key: 'preconditions',   width: 38 },
  { header: 'Test Steps',      key: 'steps',           width: 52 },
  { header: 'Expected Result', key: 'expected',        width: 44 },
  { header: 'Test Data',       key: 'testData',        width: 28 },
  { header: 'Priority',        key: 'priority',        width: 12 },
  { header: 'Automation Ref',  key: 'automationRef',   width: 58 },
  { header: 'Status',          key: 'status',          width: 10 },
];

sheet.columns = COLS;
styleHeader(sheet.getRow(1));

testCases.forEach((tc, i) => {
  const row = sheet.addRow(tc);
  row.height = 80;
  const bgColor = i % 2 === 0 ? 'FFFFFFFF' : COLOR.alt;

  row.eachCell({ includeEmpty: true }, cell => {
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.font      = { size: 10 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    applyBorder(cell);
  });

  // Platform badge colour
  const platformCell = row.getCell('platform');
  platformCell.font = {
    bold: true,
    size: 10,
    color: { argb: tc.platform === 'Android' ? 'FF1B5E20' : 'FF0D47A1' },
  };

  // Priority colour
  const prioCell = row.getCell('priority');
  const prioColor = tc.priority === 'High' ? 'FFFF6F00' : 'FF37474F';
  prioCell.font = { bold: true, size: 10, color: { argb: prioColor } };

  // Status colour
  const statusCell = row.getCell('status');
  statusCell.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: tc.status === 'Pass' ? COLOR.passGreen : COLOR.failRed },
  };
  statusCell.font = {
    bold: true, size: 10,
    color: { argb: tc.status === 'Pass' ? 'FF1B5E20' : 'FFB71C1C' },
  };
  statusCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
});

// Auto-filter on header row
sheet.autoFilter = { from: 'A1', to: `K1` };

// ── Sheet 2: Summary ───────────────────────────────────────────────────────
const summary = workbook.addWorksheet('Summary');

const summaryData = [
  ['Metric', 'Value'],
  ['Total Test Cases', testCases.length],
  ['Android Tests',   testCases.filter(t => t.platform === 'Android').length],
  ['iOS Tests',       testCases.filter(t => t.platform === 'iOS').length],
  ['High Priority',   testCases.filter(t => t.priority === 'High').length],
  ['Medium Priority', testCases.filter(t => t.priority === 'Medium').length],
  ['Pass',            testCases.filter(t => t.status === 'Pass').length],
  ['Fail',            testCases.filter(t => t.status === 'Fail').length],
  ['Covered Module',  'Login'],
  ['Generated',       new Date().toISOString().split('T')[0]],
];

summary.columns = [{ width: 22 }, { width: 22 }];

summaryData.forEach((rowData, i) => {
  const row = summary.addRow(rowData);
  row.height = 22;
  row.eachCell(cell => {
    applyBorder(cell);
    cell.alignment = { vertical: 'middle', horizontal: i === 0 ? 'center' : 'left' };
    cell.font = { size: 11, bold: i === 0 };
  });
  if (i === 0) {
    styleHeader(row);
  } else {
    row.getCell(1).font = { bold: true, size: 11 };
  }
});

// ── save ──────────────────────────────────────────────────────────────────
await workbook.xlsx.writeFile(OUT);
console.log('Generated:', OUT);
