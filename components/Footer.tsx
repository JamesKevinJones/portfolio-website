export function Footer() {
  return (
    <footer className="border-t border-wire/30">
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-wire">
            kevin@chennai:~$ <span className="text-signal">exit</span>
          </p>
          <div className="flex gap-5 font-mono text-xs">
            <a
              href="https://github.com/JamesKevinJones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mist underline decoration-wire/40 underline-offset-4 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              github
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
