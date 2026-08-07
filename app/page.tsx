import { StatusBar } from "@/components/StatusBar";
import { Hero } from "@/components/Hero";
import { EvalGate } from "@/components/EvalGate";
import { Projects } from "@/components/Projects";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <StatusBar />
      <Hero />
      <EvalGate />
      <Projects />
      <About />
      <Footer />
    </main>
  );
}
