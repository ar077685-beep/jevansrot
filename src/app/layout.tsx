import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';

export const metadata: Metadata = {
  title: '100% Plant Based Natural Health Supplements India - Jevansrot Sciences',
  description: 'Get 100% plant based natural wellness & healthcare supplements in India at Jevansrot. India\'s 1st Nano formulated nutraceutical brand.',
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
