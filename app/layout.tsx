import { Outfit } from "next/font/google"
import { Metadata } from "next"
import "./globals.css"
import "swiper/swiper-bundle.css"
import "simplebar-react/dist/simplebar.min.css"
import { SidebarProvider } from "@/context/SidebarContext"
import { ThemeProvider } from "@/context/ThemeContext"

const outfit = Outfit({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "RISE Education Management",
    template: "%s | RISE Education Management",
  },
  description: "RISE Education Management dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
