import Image from "next/image";
import { PROFILE } from "@/lib/site";
import { STACK } from "@/lib/projects";


export function About() {
  return (
    <section id="about" className="border-b-[3px] scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="label text-ink-soft dark:text-paper-dim">About</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,6vw,3.75rem)] font-black">
              I build the boring parts on purpose.
            </h2>

            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-soft dark:text-paper-dim">
              <p>
                I’m Kevin — a third-year computer science engineering student at
                SRM Institute of Science and Technology, Ramapuram, working out
                of Chennai.
              </p>
              <p>
                Most of what I build is retrieval, evaluation and automation:
                the machinery that decides whether an answer is good enough to
                show someone. That machinery is where the failures live, so
                it’s where I spend the time — writing the gate, the benchmark
                and the rejection log before the interface that sits on top.
              </p>
              <p>
                I write the reasoning down as I go. Every project here carries a
                decisions file explaining why it works the way it does, which is
                the only reason the rules in the section above are quotable.
              </p>
            </div>

            <dl className="brut-sm mt-9 divide-y-[3px] divide-[var(--line)]">
              {STACK.map(([term, value]) => (
                <div
                  key={term}
                  className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-6"
                >
                  <dt className="label shrink-0 sm:w-24">{term}</dt>
                  <dd className="font-mono text-xs leading-relaxed">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Two frames, offset, so the column has the same hard-edged rhythm
              as the cards rather than sitting as one floating portrait. */}
          <div className="flex flex-col gap-6">
            <div className="brut overflow-hidden">
              <Image
                src="/images/kevin-headshot-formal.jpg"
                alt={`${PROFILE.fullName}, portrait`}
                width={800}
                height={1000}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
            <div className="brut ml-auto w-2/3 overflow-hidden">
              <Image
                src="/images/kevin-expo-candid.jpg"
                alt={`${PROFILE.fullName} presenting a project at an expo`}
                width={600}
                height={450}
                className="h-full w-full object-cover"
                sizes="(min-width: 1024px) 26vw, 66vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
