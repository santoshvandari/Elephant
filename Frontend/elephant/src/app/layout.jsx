import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./dashboard/ConvexProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mechi Mavericks - Elephant Admin",
  description: "Elephant Monitoring & Detection System",
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ConvexClientProvider>
        <body className={inter.className}>{children}</body>
      </ConvexClientProvider>
    </html>
  );
}
