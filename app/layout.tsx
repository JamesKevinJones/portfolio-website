import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/lenis-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL, PROFILE } from "@/lib/site";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

const DESCRIPTION =
  "Kevin Jones builds governed AI, retrieval and automation systems — and documents what each one refuses to do. Full-stack developer and third-year CS engineering student in Chennai.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kevin Jones — systems that know when to stop",
    template: "%s · Kevin Jones",
  },
  description: DESCRIPTION,
  keywords: [
    "Kevin Jones",
    "full-stack developer",
    "governed AI",
    "retrieval augmented generation",
    "guardrails",
    "Next.js",
    "Python",
  ],
  authors: [{ name: PROFILE.fullName, url: PROFILE.github }],
  creator: PROFILE.fullName,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Kevin Jones",
    title: "Kevin Jones — systems that know when to stop",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kevin Jones — systems that know when to stop",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.fullName,
  alternateName: PROFILE.name,
  url: SITE_URL,
  jobTitle: PROFILE.role,
  description: DESCRIPTION,
  sameAs: [PROFILE.github, PROFILE.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Chennai", addressCountry: "IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${space.variable} ${jetbrains.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="label sr-only rounded-full bg-neon px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        {/* Grain sits above everything but takes no input. 7% overlay is felt, not seen. */}
        <div
          aria-hidden="true"
          className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay"
        />
        <LenisProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </LenisProvider>
      </body>
    </html>
  );
}
