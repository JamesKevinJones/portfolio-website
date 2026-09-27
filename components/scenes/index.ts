import type { JSX } from "react";
import type { SceneKey } from "@/lib/projects";
import type { gsap } from "@/lib/gsap";
import { StarmatchScene, playStarmatch } from "./starmatch";
import { FrontierScene, playFrontier } from "./frontier";
import { JobAutopilotScene, playJobAutopilot } from "./job-autopilot";
import { CodeautoScene, playCodeauto } from "./codeauto";
import { JobRagScene, playJobRag } from "./job-rag";
import { MemoryvaultScene, playMemoryvault } from "./memoryvault";

type SceneDef = {
  Scene: () => JSX.Element;
  play: (root: HTMLElement) => gsap.core.Timeline;
};

export const SCENES: Record<SceneKey, SceneDef> = {
  starmatch: { Scene: StarmatchScene, play: playStarmatch },
  "frontier-platform": { Scene: FrontierScene, play: playFrontier },
  "job-autopilot": { Scene: JobAutopilotScene, play: playJobAutopilot },
  codeaut0: { Scene: CodeautoScene, play: playCodeauto },
  "job-rag": { Scene: JobRagScene, play: playJobRag },
  "memoryvault-ai": { Scene: MemoryvaultScene, play: playMemoryvault },
};

const running = new WeakMap<HTMLElement, gsap.core.Timeline>();

/**
 * Plays a stage's refusal. Any timeline already running on that stage is killed first,
 * so repeated presses restart cleanly instead of stacking. Every play() starts with
 * set()/fromTo() for its initial pose, so a restart from a half-finished pose is safe.
 * Call from inside a GSAP context (useGSAP or contextSafe) so it is reverted on unmount.
 */
export function runScene(stage: HTMLElement) {
  const key = stage.dataset.scene as SceneKey;
  running.get(stage)?.kill();
  stage.dataset.state = "playing";
  const tl = SCENES[key].play(stage);
  tl.eventCallback("onComplete", () => {
    stage.dataset.state = "refused";
  });
  running.set(stage, tl);
  return tl;
}
