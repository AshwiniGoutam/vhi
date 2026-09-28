import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/components/analytics/analytics";
import { appUrl } from "@/lib/utils";
import "@/styles/globals.css";

/** One modern sans for everything; weight and spacing create the hierarchy. */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "VHI · Luxury Homestays in Vrindavan", template: "%s · VHI Vrindavan" },
  description: "Private luxury homestays, sattvik food and guided Darshan journeys in Vrindavan — by VHI, Vrindavan Holiday Inn.",
  applicationName: "VHI Luxury Homestays",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={jakarta.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
