/**
 * One place to import GSAP from. Registers every plugin once and the custom eases from
 * animation-constants, so components never re-register or hardcode curves.
 */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { BEZIER } from "./animation-constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, Flip, ScrollTrigger, SplitText, TextPlugin, useGSAP);
  gsap.config({ force3D: true });

  for (const [name, [x1, y1, x2, y2]] of Object.entries(BEZIER)) {
    CustomEase.create(name, `M0,0 C${x1},${y1} ${x2},${y2} 1,1`);
  }
}

export { gsap, CustomEase, Flip, ScrollTrigger, SplitText, TextPlugin, useGSAP };
