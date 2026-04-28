import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goatofmaths.app',
  appName: 'GOAT of Maths',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
