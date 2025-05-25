import { init, track } from '@amplitude/analytics-browser';

export function initAmplitude() {
  console.log('✅ Amplitude initialized');
  init('07e293203333317e59f148fca737d8ba', {
    defaultTracking: true,
  });
}

export function trackEvent(eventName: string, eventProperties?: Record<string, any>) {
  track(eventName, eventProperties);
}

export function getEventContext() {
  return {
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
  };
}
