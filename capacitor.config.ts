import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ibadah.planner',
  appName: 'Ibadah Planner',
  webDir: 'out',
  server: {
    url: 'https://app-ibadah-alfakhir.vercel.app/',
    cleartext: true,
    androidScheme: 'https'
  },
  appendUserAgent: 'IbadahPlannerAndroidApp'
};

export default config;
