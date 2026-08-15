"use client";

import { Moon, Sun } from "lucide-react";
import { GithubMark } from "@/components/brand-icons";
import { PROFILE } from "@/lib/site";

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#about", label: "About" },
];

export function SiteHeader() {
  /**
   * The theme lives in the DOM, not in React state.
   *
   * An inline script in the document applies it before first paint, so there
   * is no flash of the wrong theme. Mirroring it into state here would only
   * reintroduce that flash — state starts wrong and corrects after hydration —
   * and force a setState inside an effect. The button toggles the attributes
   * directly and CSS swaps the icon.
   */
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme !== "dark";
    root.dataset.theme = next ? "dark" : "light";
    root.classList.toggle("dark", next);
    localStorage.setItem("kj-theme", next ? "dark" : "light");
  };

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

        {/* Icons swap via CSS on the root’s data-theme, so no state is needed.
            The label stays fixed so it doesn’t change under a screen reader. */}
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle light and dark theme"
          className="brut-sm brut-press ml-auto p-2 md:ml-0"
        >
          <Moon size={18} aria-hidden className="theme-icon-moon" />
          <Sun size={18} aria-hidden className="theme-icon-sun" />
        </button>

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
