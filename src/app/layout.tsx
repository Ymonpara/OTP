import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PlatformProvider } from '@/context/PlatformContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OTPWallet — Virtual Number & SMS Verification Platform',
  description:
    'Instant virtual temporary numbers for WhatsApp, Telegram, OpenAI, Google and 200+ services. Built with wallet ledger, 5-minute hold protection, multi-provider routing and instant OTP delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        <PlatformProvider>{children}</PlatformProvider>
      </body>
    </html>
  );
}
