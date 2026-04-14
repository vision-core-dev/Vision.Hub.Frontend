import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.vcore.hub',
  appName: 'Vision Core Hub',
  webDir: 'dist',
  server: {
    url: 'https://hub.visioncore.dev',
    cleartext: false,
  },
};

export default config;
