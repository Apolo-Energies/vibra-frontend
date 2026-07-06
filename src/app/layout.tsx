import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProviderClient } from "@/components/providers/ThemeProviderClient";
import { Provider } from "@/components/providers/Provider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Alert } from "@/components/ui/Alert";
import { auth } from "@/auth.config";


const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "VIBRA ENERGIES",
  description: "Portal de colaboradores",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <Provider session={session}>
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
