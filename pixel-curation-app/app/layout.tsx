// app/layout.tsx
import { Inter, Caveat } from 'next/font/google';
import './globals.css';

// The strict, editorial font for the UI
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// The "Messy Human" font for user-generated notes and comments
const messyFont = Caveat({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-messy' 
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${messyFont.variable}`}>
      <body className="bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}