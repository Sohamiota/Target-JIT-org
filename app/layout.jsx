import "./globals.css"

export const metadata = {
  title: "TARGET JIT - Inventory Management",
  description: "Intelligent Inventory Management System",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
