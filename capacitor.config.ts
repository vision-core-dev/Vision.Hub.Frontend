import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.vcore.hub',
  appName: 'Vision Hub',
  webDir: 'dist',
  server: {
    url: 'https://hub.vcore.dev',
    cleartext: false,
  },
};

export default config;