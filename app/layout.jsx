import './globals.css';
import { Newsreader, Instrument_Serif, Instrument_Sans } from 'next/font/google';
import Nav from '../components/Nav.jsx';
import Footer from '../components/Footer.jsx';
import Background from '../components/Background.jsx';
const newsreader = Newsreader({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--f-body', display: 'swap' });
const iserif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--f-disp', display: 'swap' });
const isans = Instrument_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-ui', display: 'swap' });
export const metadata = { title: 'Emmaus', description: 'The whole Bible, opened as one story.' };
export default function RootLayout({ children }) {
  return <html lang="en" className={`${newsreader.variable} ${iserif.variable} ${isans.variable}`}>
    <body><Background /><Nav /><div id="app">{children}</div><Footer /></body>
  </html>;
}
