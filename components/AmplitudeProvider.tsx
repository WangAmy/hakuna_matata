'use client';

import { useEffect } from 'react';
import { init } from '@amplitude/analytics-browser';

export function AmplitudeProvider() {
  useEffect(() => {
    console.log('✅ Amplitude initialized');
    init('07e293203333317e59f148fca737d8ba', {
      defaultTracking: true,
    });
  }, []);

  return null;
}
