// src/components/ClientRootLayout.tsx
'use client';

import { ReactNode } from 'react';

interface ClientRootLayoutProps {
  children: ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}