'use client';

import { ReactNode } from 'react';
import RequirePWA from './RequirePWA';

interface RequirePWAWrapperProps {
  children: ReactNode;
}

export default function RequirePWAWrapper({ children }: RequirePWAWrapperProps) {
  return <RequirePWA>{children}</RequirePWA>;
}
