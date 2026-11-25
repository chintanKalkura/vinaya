import { NativeModules } from 'react-native';

// Navigation bar icons dark on the light theme: android/.../SystemBarsModule.kt
export function setLightNavigationBar(light: boolean): void {
  NativeModules.SystemBars?.setLightNavigationBar(light);
}
