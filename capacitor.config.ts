import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hopinexpress.commandos',
  appName: 'Hop In Express Command OS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'localhost',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
