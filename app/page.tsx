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
      <VelocityMarquee items={PROJECTS.map((p) => p.refuses.headline)} className="my-16 md:my-24" />
      <Work />
      <Approach />
      <About />
    </>
  );
}
