export const metadata = { title: "GPT-Lab's Sandbox", description: "EU-ready GPT-Lab's sandbox" };
import './globals.css';
import { ReactNode } from 'react';
import { Shell } from '@/lib/ui/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

async function getUser() {
  // Return null for server-side rendering - authentication will be handled client-side
  return null;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <LanguageProvider>
          <AuthProvider>
            <Shell>{children}</Shell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}