import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flywithaarav.app',
  appName: 'FlyWithAarav',
  webDir: 'www',
  backgroundColor: '#07111f',
  ios: { contentInset: 'automatic' },
  android: { allowMixedContent: false }
};

export default config;
