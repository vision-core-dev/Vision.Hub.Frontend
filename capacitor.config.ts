import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.visioncore.hub',
  appName: 'Vision Core Hub',
  webDir: 'dist',
  server: {
    url: 'https://hub.visioncore.dev',
    cleartext: false,
  },
};

export default config;
