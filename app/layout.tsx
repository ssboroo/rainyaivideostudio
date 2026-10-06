import type { Metadata,Viewport } from "next";import "./globals.css";
export const metadata:Metadata={title:{default:"RAVS — Rainy AI Video Studio",template:"%s · RAVS"},description:"Монгол хэл дээрх Higgsfield-powered AI Video & Image Creative Studio",applicationName:"RAVS"};
export const viewport:Viewport={themeColor:"#070708",colorScheme:"dark"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="mn"><body>{children}</body></html>}
