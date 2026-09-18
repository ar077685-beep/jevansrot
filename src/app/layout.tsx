import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://jevansrot.com'), // Placeholder domain
  title: {
    default: '100% Plant Based Natural Health Supplements India - Jevansrot Sciences',
    template: '%s | Jevansrot Sciences',
  },
  description: 'Get 100% plant based natural wellness & healthcare supplements in India at Jevansrot. India\'s 1st Nano formulated nutraceutical brand.',
  keywords: ['Plant Based Supplements', 'Nano formulated', 'Ayurveda', 'Healthcare India', 'Jevansrot'],
  openGraph: {
    title: 'Jevansrot Sciences - Natural Health Supplements',
    description: 'Get 100% plant based natural wellness & healthcare supplements in India.',
    url: 'https://jevansrot.com',
    siteName: 'Jevansrot Sciences',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jevansrot Sciences',
    description: '100% plant based natural wellness & healthcare supplements.',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
