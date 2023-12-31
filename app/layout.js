import { Inter } from "next/font/google";
import { Spectral } from "next/font/google";
import "./globals.css";
import Nav from "./nav";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "./SessionProvider";

const inter = Inter({ subsets: ["latin"] });
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "My Hero List",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={spectral.className}>
        <SessionProvider>
          <div className="mx-6 md:max-w-7xl md:mx-auto md:px-6">
            <Nav />
            <Toaster />
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
