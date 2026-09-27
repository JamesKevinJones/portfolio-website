import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Approach } from "@/components/approach";
import { About } from "@/components/about";
import { VelocityMarquee } from "@/components/ui/velocity-marquee";
import { PROJECTS } from "@/lib/projects";

export default function Home() {
  return (
    <>
      <Hero />
      {/* The six refusal headlines, verbatim, as a teaser for the walkthrough. */}
      <div className="my-16 md:my-24">
        <hr className="rule-fade" />
        <VelocityMarquee items={PROJECTS.map((p) => p.refuses.headline)} />
        <hr className="rule-fade" />
      </div>
      <Work />
      <hr className="rule-fade" />
      <Approach />
      <hr className="rule-fade" />
      <About />
    </>
  );
}
