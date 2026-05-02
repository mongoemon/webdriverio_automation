import type { TestUser } from '../types';

// Credentials shown in the app's login screen
export const validUser: TestUser = {
  email: 'bod@example.com',
  password: '10203040',
};

// This app accepts any non-empty credentials — error cases use empty fields
export const errorMessages = {
  usernameRequired: 'Username is required',
  passwordRequired: 'Enter Password',
};

export const timeouts = {
  short: 5000,
  medium: 15000,
  long: 30000,
};
