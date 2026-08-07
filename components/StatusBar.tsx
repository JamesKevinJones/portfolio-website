export function StatusBar() {
  return (
    <div className="glass-thin sticky top-0 z-20 border-b border-wire/20">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-2.5 font-mono text-xs text-wire sm:px-8">
        <span>
          kevin<span className="text-signal">@</span>chennai:~$ whoami
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
          Chennai · 3rd-yr CSE
        </span>
      </div>
    </div>
  );
}
