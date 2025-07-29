// app/layout.tsx
import '../styles/globals.css'
import ClientRootLayout from '@/components/ClientRootLayout'
import { PlanProvider } from '@/context/PlanContext'
import { AuthProvider } from '@/lib/auth'  // import AuthProvider

export const metadata = {
  title: 'OshilaFx',
  description: 'Trading platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>   {/* Wrap in AuthProvider first */}
          <PlanProvider>
            <ClientRootLayout>{children}</ClientRootLayout>
          </PlanProvider>
        </AuthProvider>
      </body>
    </html>
  )
}





