import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'SmartPrice — AI-Powered Price Comparison Engine',
  description:
    'Compare prices across Amazon, Flipkart, and more in real time. Drop a product link and let our AI find you the best deal instantly.',
  keywords: ['price comparison', 'Amazon', 'Flipkart', 'deal finder', 'AI shopping'],
  openGraph: {
    title: 'SmartPrice — AI-Powered Price Comparison Engine',
    description: 'Real-time cross-platform price intelligence, powered by AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}