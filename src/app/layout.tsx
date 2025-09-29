import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProviderClient } from "@/components/providers/ThemeProviderClient";
import { Provider } from "@/components/providers/Provider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Alert } from "@/components/ui/Alert";


const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "APOLO ENERGIES",
  description: "Portal de colaboradores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Provider>
          <ThemeProviderClient>
            {children}
            <Alert />
            <LoadingOverlay />
          </ThemeProviderClient>
        </Provider>
      </body>
    </html>
  );
}
