import './globals.css';
import './artwork.css';
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
    <body><svg width="0" height="0" aria-hidden="true" style={{position:'absolute',pointerEvents:'none'}}><defs>
      <filter id="emmaus-ink" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
        <feColorMatrix type="matrix" values="0 0 0 0 .925  0 0 0 0 .906  0 0 0 0 .863  -.4 -.4 -.4 1 0" />
      </filter>
    </defs></svg><Background /><Nav /><div id="app">{children}</div><Footer /></body>
  </html>;
}
