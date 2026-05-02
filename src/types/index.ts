export type Platform = 'android' | 'ios';

export interface Coordinate {
  x: number;
  y: number;
}

export interface SwipeOptions {
  direction: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  percentage?: number;
}

export interface ElementOptions {
  timeout?: number;
  interval?: number;
}

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export interface AppConfig {
  platform: Platform;
  packageOrBundle: string;
  appPath: string;
}
