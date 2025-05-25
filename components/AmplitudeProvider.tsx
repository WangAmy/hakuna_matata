'use client';

import { useEffect } from 'react';
import { initAmplitude } from '@/lib/amplitude';

export function AmplitudeProvider() {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
}
