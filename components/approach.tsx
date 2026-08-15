import { PRINCIPLES } from "@/lib/projects";

/**
 * Working rules with their source file attached. The attribution is the
 * structural device here rather than a decorative 01/02/03 — these are a set,
 * not a sequence, and where a rule is written down is the part that makes it
 * checkable.
 */
export function Approach() {
  return (
    <section id="approach" className="border-b-[3px] scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="label text-ink-soft dark:text-paper-dim">How I work</p>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,6vw,3.75rem)] font-black">
          Four rules that cost something to learn.
        </h2>
        <p className="mt-5 max-w-2xl text-ink-soft dark:text-paper-dim">
          Each of these is committed to a docs file in the repo it came out of,
          alongside the failure that produced it.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PRINCIPLES.map(({ rule, body, source }) => (
            <div key={rule} className="brut flex flex-col p-5 sm:p-7">
              <h3 className="font-display text-xl font-extrabold sm:text-2xl">
                {rule}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-paper-dim">
                {body}
              </p>
              <p className="label mt-auto pt-5 text-ink-soft dark:text-paper-dim">
                {source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
