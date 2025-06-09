import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./dashboard/ConvexProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Security Admin Dashboard",
  description: "Admin dashboard for security management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ConvexClientProvider>
        <body className={inter.className}>{children}</body>
      </ConvexClientProvider>
    </html>
  );
}
