import { DM_Sans } from 'next/font/google'
import { GlobalStateProvider } from '@/context/GolobalStateProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '@/styles/scss/style.scss';

// Font Family
const dm_sans = DM_Sans({
  weight: ["400", "500", "700"],
  display: "swap",
  subsets: ["latin"],
  variable: '--font-jampack'
})

// metadata
export const metadata = {
  title: 'GovernAI | Plataforma de Inteligência Artificial para o Setor Público',
  description: 'Plataforma de automação e inteligência artificial para governos e instituições públicas',
  keywords: ['IA', 'Inteligência Artificial', 'Governo', 'Automação', 'CRM', 'Gestão Pública', 'Agentes IA', 'RAG'],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
  },
}


export default function RootLayout({ children }) {

  return (
    <html lang="en" className={`${dm_sans.variable}`}>
      <body>
        <GlobalStateProvider>
          <AuthProvider>{children}</AuthProvider>
        </GlobalStateProvider>
      </body>
    </html>
  )
}
