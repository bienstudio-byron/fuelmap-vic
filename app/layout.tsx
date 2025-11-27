import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FuelMap VIC | Cheapest Fuel in Victoria",
  description: "Find the cheapest petrol, diesel, and U98 fuel near you in Victoria. Live prices, rewards calculator, and map search.",
  openGraph: {
    title: "FuelMap VIC",
    description: "Save money on fuel today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-full w-full overflow-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
