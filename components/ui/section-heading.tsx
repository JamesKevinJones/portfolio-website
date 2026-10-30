type SectionHeadingProps = { index: string; eyebrow: string; title: string; lede?: string };

/**
 * Section heading. Static on purpose: it used to rise out of masks like every other block,
 * and a heading that is still half-masked when you land on it from the nav is hard to read.
 */
export function SectionHeading({ index, eyebrow, title, lede }: SectionHeadingProps) {
  return (
    // Side-by-side from xl: below 1280 the heading needs the full width to stay within two lines.
    <div className="grid gap-6 xl:grid-cols-[1fr_2fr] xl:gap-10">
      <p className="label flex gap-4 text-mute md:pt-3">
        <span className="text-neon">{index}</span>
        <span>{eyebrow}</span>
      </p>
      <div>
        <h2 className="font-display text-[clamp(1.875rem,5.5vw,5rem)] font-medium leading-[0.92] tracking-[-0.04em]">
          {title}
        </h2>
        {lede && <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/80">{lede}</p>}
      </div>
    </div>
  );
}
