export function BackgroundField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
    >
      <div className="bg-grid-pattern absolute inset-0 opacity-[0.05]" />
      <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-signal/10 blur-[130px]" />
      <div className="absolute top-1/3 -right-32 h-[380px] w-[380px] rounded-full bg-alert/8 blur-[140px]" />
    </div>
  );
}
