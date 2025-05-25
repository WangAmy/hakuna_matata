// lib/amplitude.ts

let isBrowser = typeof window !== 'undefined';

export function initAmplitude() {
  if (!isBrowser) return;

  console.log('✅ Amplitude initialized');
  // browser only
  const { init } = require('@amplitude/analytics-browser');
  init('07e293203333317e59f148fca737d8ba', {
    defaultTracking: true,
  });
}

export function trackEvent(name: string, data?: Record<string, any>) {
  if (isBrowser) {
    const { track } = require('@amplitude/analytics-browser');
    track(name, data);
  } else {
    // ✅ Server-side fallback: just log it for now
    console.log('🧠 [Server] Track Event:', name, data);
    // 或未來可串接 Amplitude HTTP API (需要 API Key 與 Fetch)
  }
}

export function getEventContext() {
  return {
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    origin: isBrowser ? window.location.origin : 'server',
  };
}
