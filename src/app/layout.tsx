import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthSessionProvider } from '@/components/providers/session-provider';
import { AchievementProvider } from '@/components/achievements/achievement-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Baseball Strategy Master',
  description: 'Master baseball strategy through interactive scenarios and expert coaching',
  keywords: ['baseball', 'strategy', 'coaching', 'sports', 'training'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthSessionProvider>
          <AchievementProvider>
            {children}
            <Toaster />
          </AchievementProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
