import { Metadata } from "next"
import "./globals.css"
import "swiper/swiper-bundle.css"
import "simplebar-react/dist/simplebar.min.css"
import { SidebarProvider } from "@/context/SidebarContext"
import { ThemeProvider } from "@/context/ThemeContext"

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
      <body className="font-outfit dark:bg-gray-900">
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
