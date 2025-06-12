import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/ProtectedLayout'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-plus-jakarta',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Network Navigator",
  description: "Find the right person for your query through human networks",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If the user is authenticated and not on an auth page, use the protected layout
  const isAuthPage = children.props?.childProp?.segment === 'auth'
  const shouldUseProtectedLayout = session && !isAuthPage

  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {shouldUseProtectedLayout ? (
          <ProtectedLayout>{children}</ProtectedLayout>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
