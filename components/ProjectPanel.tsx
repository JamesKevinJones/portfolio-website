type ProjectPanelProps = {
  name: string;
  status: string;
  skim: string;
  deepDive: string;
  stack: string;
  repoHref: string;
  liveHref?: string;
};

export function ProjectPanel({
  name,
  status,
  skim,
  deepDive,
  stack,
  repoHref,
  liveHref,
}: ProjectPanelProps) {
  return (
    <div className="project-panel glass glass-hover overflow-hidden rounded-lg">
      <div className="flex items-center gap-2 border-b border-wire/20 px-4 py-2.5 font-mono text-xs text-wire">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-wire/40" />
        </span>
        <span className="ml-1 text-mist/80">~/{name}</span>
        <span className="ml-auto rounded border border-signal-dim bg-signal/10 px-2 py-0.5 text-signal">
          {status}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <p className="text-[15px] leading-relaxed text-mist/90">{skim}</p>

        <details className="group mt-3">
          <summary className="cursor-pointer select-none font-mono text-xs text-wire underline decoration-wire/40 underline-offset-4 hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal">
            engineer deep-dive
          </summary>
          <div className="mt-3 rounded border border-wire/20 bg-ink/60 p-3 font-mono text-xs leading-relaxed text-wire">
            <p>{deepDive}</p>
            <p className="mt-2 text-wire/60">stack: {stack}</p>
          </div>
        </details>

        <div className="mt-4 flex gap-4 font-mono text-xs">
          <a
            href={repoHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mist underline decoration-wire/40 underline-offset-4 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            view repo →
          </a>
          {liveHref ? (
            <a
              href={liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mist underline decoration-wire/40 underline-offset-4 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              live demo →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
