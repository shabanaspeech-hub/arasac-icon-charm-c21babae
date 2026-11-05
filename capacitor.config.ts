import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.speechtherapys.voxafia',
  appName: 'VOXAFIA',
  webDir: 'dist',
  // Hot-reload from the Lovable preview while developing.
  // REMOVE this "server" block before building the Play Store / App Store release.
  server: {
    url: 'https://b873d27f-470e-408e-971b-fa03925d4908.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: { allowMixedContent: false },
};

export default config;
