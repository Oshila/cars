// src/app/layout.tsx
import './globals.css';
import { PlanProvider } from '@/context/PlanContext';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'Car Dealer Site',
  description: 'A car dealership platform built with Next.js and Firebase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PlanProvider>
            {children}
          </PlanProvider>
        </AuthProvider>
      </body>
    </html>
  );
}