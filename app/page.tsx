import { Hero } from "@/components/hero";
import { Work } from "@/components/work";
import { Approach } from "@/components/approach";
import { About } from "@/components/about";

export default function Home() {
  return (
    <>
      <Hero />
      <hr className="rule-fade my-16 md:my-24" />
      <Work />
      <hr className="rule-fade" />
      <Approach />
      <hr className="rule-fade" />
      <About />
    </>
  );
}
