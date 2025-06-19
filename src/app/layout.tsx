import './globals.css'
import { Inter, Montserrat, Poppins } from 'next/font/google'
import type { Metadata } from 'next'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' })
const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
      title: 'KENTA - KENTECH 맞춤형 시간표 설계',
  description: 'KENTECH 학부생을 위한 스마트한 시간표 설계 솔루션',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${montserrat.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-pretendard antialiased">
        <Providers>
          <div className="min-h-screen bg-blue-50">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}