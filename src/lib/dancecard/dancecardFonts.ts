import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

/** Display serif for dancecard headlines — warmer and more editorial than site-wide Playfair. */
export const dancecardDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dc-display',
  weight: ['400', '500', '600'],
})

/** UI sans for in-app dancecard shells and public event landings. */
export const dancecardSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dc-sans',
  weight: ['400', '500', '600', '700'],
})

export const dancecardFontClassName = `${dancecardSans.variable} ${dancecardDisplay.variable}`
