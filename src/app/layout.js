import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "../context/wallet";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Picasso Palette",
  description: "Welcome to the NFT Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <WalletContextProvider>
      <body className={inter.className}>{children}</body>
      </WalletContextProvider>
    </html>
  );
}
