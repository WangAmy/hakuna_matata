// lib/amplitude.ts
import { init } from '@amplitude/analytics-browser';

export function initAmplitude() {
  init('07e293203333317e59f148fca737d8ba', {
    defaultTracking: true,
  });
}
