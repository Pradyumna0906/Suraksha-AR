import { Capacitor, registerPlugin } from '@capacitor/core';

const NativeSurakshaAr = registerPlugin('SurakshaAr');

export const isNativeArAvailable = () => Capacitor.getPlatform() === 'android';

export const SurakshaArBridge = Object.freeze({
  getCapabilities: () => NativeSurakshaAr.getCapabilities(),
  startAR: (options = {}) => NativeSurakshaAr.startAR(options),
  stopAR: () => NativeSurakshaAr.stopAR(),
  pauseAR: () => NativeSurakshaAr.pauseAR(),
  resumeAR: () => NativeSurakshaAr.resumeAR(),
  addListener: (listener) => NativeSurakshaAr.addListener('arEvent', listener)
});
