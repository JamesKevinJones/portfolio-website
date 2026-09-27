"use client";

import { GithubMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-[3px] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <a
          href="#main"
          className="flex items-center gap-2 font-display text-lg font-black tracking-tight sm:text-xl"
        >
          <span className="inline-block border-[3px] border-[var(--line)] bg-acid px-2 py-0.5 text-ink">
            KEVIN
          </span>
          <span>JONES</span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="label border-[3px] border-transparent px-3 py-2 transition-colors hover:border-[var(--line)]"
            >
              {item.label}
            </a>
          ))}
        </nav>


        <a
          href={PROFILE.github}
          target="_blank"
          rel="noreferrer noopener"
          className="brut-sm brut-press label hidden items-center gap-2 bg-volt px-4 py-2 text-white sm:flex"
        >
          <GithubMark size={15} />
          GitHub
        </a>
      </div>

      {/* Mobile nav row — the desktop nav collapses rather than hiding. */}
      <nav className="flex overflow-x-auto border-t-[3px] md:hidden">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="label whitespace-nowrap px-4 py-2.5"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
