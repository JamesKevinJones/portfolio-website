import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_URL, PROFILE } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
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
    <html
      lang="en"
      // Required, not incidental: the theme script below writes data-theme and
      // .dark onto <html> before React hydrates, so the client markup
      // deliberately differs from the server's. Scoped to this element only.
      suppressHydrationWarning
      className={`${archivo.variable} ${space.variable} ${plexMono.variable}`}
    >
      <body>
        {/*
          Applies the stored or preferred theme before first paint. Doing this
          in an effect instead would render the wrong theme for one frame on
          every load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('kj-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.classList.toggle('dark',d)}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="brut-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-acid focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
