import { Mail } from "lucide-react";
import { GithubMark, LinkedinMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";

const LINKS = [
  { href: PROFILE.github, label: "GitHub", Icon: GithubMark },
  { href: PROFILE.linkedin, label: "LinkedIn", Icon: LinkedinMark },
  { href: `mailto:${PROFILE.email}`, label: "Email", Icon: Mail },
];

export function SiteFooter() {
  return (
    <footer className="border-t-[3px]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-3xl font-black sm:text-5xl">
          Open to internships
          <br />
          and graduate roles.
        </h2>

        <p className="mt-4 max-w-lg text-ink-soft dark:text-paper-dim">
          Third-year, graduating 2027. Chennai or remote. If you want to talk
          about any of the work above, the fastest route is email.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer noopener"
              className="brut-sm brut-press label flex items-center gap-2 px-4 py-2.5"
            >
              <Icon size={15} aria-hidden />
              {label}
            </a>
          ))}
        </div>

        <p className="label mt-10 text-ink-soft dark:text-paper-dim">
          {PROFILE.fullName} · {PROFILE.place} · Built with Next.js and GSAP
        </p>
      </div>
    </footer>
  );
}
