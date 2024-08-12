import Head from 'next/head';
import ProvidersSession from "../Providers";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { Inter as FontSans } from "next/font/google"
import { MyRuntimeProvider } from '@/components/ui/assistant-ui/MyRuntimeProvider';
import { AI } from './action';
import { ThemeProvider } from "@/components/theme-provider"


import { cn } from "@/lib/utils"


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "ResiRed",
  description: "Administracion de consorcio",
  icon: "/favicon"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon" />
      </Head>
      <body lassName={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}

      >
        <Toaster />
        <AI>
          <MyRuntimeProvider
          >
            <ProvidersSession>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >{children}
              </ThemeProvider></ProvidersSession></MyRuntimeProvider></AI></body>
    </html>
  );
}
