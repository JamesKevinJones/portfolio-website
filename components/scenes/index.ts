import type { JSX } from "react";
import type { SceneKey } from "@/lib/projects";
import type { gsap } from "@/lib/gsap";
import { StarmatchScene, playStarmatch } from "./starmatch";
import { FrontierScene, playFrontier } from "./frontier";
import { JobAutopilotScene, playJobAutopilot } from "./job-autopilot";
import { CodeautoScene, playCodeauto } from "./codeauto";
import { JobRagScene, playJobRag } from "./job-rag";
import { MemoryvaultScene, playMemoryvault } from "./memoryvault";
import { AgentshellScene, playAgentshell } from "./agentshell";

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
  agentshell: { Scene: AgentshellScene, play: playAgentshell },
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

/**
 * Holds a stage in its opening pose until runScene() plays it, so the scene plays
 * forward when it arrives instead of showing the final pose and snapping back. The
 * paused timeline is registered as the stage's running one, so runScene() kills it.
 * Call inside the motion branch of a GSAP context: reverting that context restores the
 * markup's final pose, which is what reduced motion and no-JS visitors see.
 */
export function poseScene(stage: HTMLElement) {
  const key = stage.dataset.scene as SceneKey;
  running.get(stage)?.kill();
  // 1ms in rather than 0: zero-duration set() calls at the start only render once the
  // playhead passes them, and a timeline paused at 0 never has. 1ms of motion is invisible.
  const tl = SCENES[key].play(stage).pause(0.001);
  stage.dataset.state = "ready";
  running.set(stage, tl);
  return tl;
}
