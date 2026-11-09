/// <reference types="@capacitor/splash-screen" />

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.linguo',
  appName: 'Linguo',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 200,
      backgroundColor: '#e9eeff',
    },
  },
};

export default config;
