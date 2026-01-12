'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const RequirePWA = dynamic(() => import('./RequirePWA'), { ssr: false });

interface RequirePWAWrapperProps {
  children: ReactNode;
}

export default function RequirePWAWrapper({ children }: RequirePWAWrapperProps) {
  return <RequirePWA>{children}</RequirePWA>;
}
