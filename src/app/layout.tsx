import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Klimato Vektoriai — AI konsultantas',
  description: 'AI konsultantas padės pasirinkti tinkamą kondicionierių ar šilumos siurblį.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <body>{children}</body>
    </html>
  );
}
