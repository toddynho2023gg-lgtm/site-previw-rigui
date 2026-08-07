import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import type { CSSProperties } from "react";
import { assets, clinic, seo, theme } from "../src/config/clinic";
import "./globals.css";

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const deploymentHost =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;
const deploymentOrigin = deploymentHost
  ? deploymentHost.startsWith("http")
    ? deploymentHost
    : `https://${deploymentHost}`
  : seo.canonicalUrl;

export const metadata: Metadata = {
  metadataBase: new URL(deploymentOrigin),
  title: seo.title,
  description: seo.description,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: seo.openGraph.title,
    description: seo.openGraph.description,
    type: "website",
    locale: seo.openGraph.locale,
    siteName: clinic.name,
    images: [
      {
        url: assets.ogImage,
        width: assets.dimensions.ogImage.width,
        height: assets.dimensions.ogImage.height,
        alt: `${clinic.name} em ${clinic.city}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: clinic.slogan,
    images: [assets.ogImage],
  },
  icons: {
    icon: assets.favicon,
    shortcut: assets.favicon,
    apple: assets.favicon,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": theme.primaryDark,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: theme.primaryDark,
};

type ThemeStyle = CSSProperties & Record<`--color-${string}`, string>;

const themeStyle: ThemeStyle = {
  "--color-primary": theme.primary,
  "--color-primary-dark": theme.primaryDark,
  "--color-primary-deep": theme.primaryDeep,
  "--color-accent": theme.accent,
  "--color-secondary": theme.secondary,
  "--color-background": theme.background,
  "--color-surface": theme.surface,
  "--color-warm": theme.warm,
  "--color-text": theme.text,
  "--color-muted": theme.muted,
  "--color-whatsapp": theme.whatsapp,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={clinic.locale}
      className={`${sora.variable} ${manrope.variable}`}
      style={themeStyle}
    >
      <body>{children}</body>
    </html>
  );
}
