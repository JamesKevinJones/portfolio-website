const links = [
  { label: "github", href: "https://github.com/JamesKevinJones" },
  { label: "linkedin", href: "https://www.linkedin.com/in/jameskevinjones/" },
  { label: "instagram", href: "https://www.instagram.com/jameskevinjones/" },
  { label: "email", href: "mailto:kj6384647@gmail.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-wire/20">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <p className="font-mono text-xs text-wire">
          <span className="text-signal">$</span> contact --list
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.href.startsWith("mailto:")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="text-mist underline decoration-wire/40 underline-offset-4 transition-colors hover:text-signal hover:decoration-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-xs text-wire">
          kevin<span className="text-signal">@</span>chennai:~${" "}
          <span className="cursor-blink text-signal">_</span>
        </p>
      </div>
    </footer>
  );
}
