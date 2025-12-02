import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zemi.ride',
  appName: 'ZeMi',
  webDir: 'dist',
  server: {
    url: 'https://4ff1f291-846d-4511-9307-725301fbb9df.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
