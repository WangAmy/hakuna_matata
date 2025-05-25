'use client';

import { useEffect } from 'react';
import { initAmplitude } from '@/lib/amplitude';

export function AmplitudeProvider() {
  useEffect(() => {
    console.log('👀 calling initAmplitude in AmplitudeProvider');
    initAmplitude();
  }, []);

  return null;
}
