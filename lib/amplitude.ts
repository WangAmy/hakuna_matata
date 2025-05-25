import { init } from '@amplitude/analytics-browser';

export function initAmplitude() {
  console.log('✅ Amplitude initialized'); // 你可以在 DevTools 看這個訊號
  init('07e293203333317e59f148fca737d8ba', {
    defaultTracking: true,
  });
}
