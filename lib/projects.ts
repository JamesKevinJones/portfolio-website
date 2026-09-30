/**
 * The featured projects.
 *
 * Every `refuses` line is taken from the project’s own README or AGENTS.md —
 * a documented design decision, not a marketing claim written after the fact.
 * If a constraint here can’t be pointed at in the source repo, it doesn’t
 * belong on the page.
 */

/** One key per project. Also the key into the scene registry in components/scenes. */
export type SceneKey =
  | "starmatch"
  | "frontier-platform"
  | "job-autopilot"
  | "codeaut0"
  | "job-rag"
  | "memoryvault-ai"
  | "agentshell";

export type Project = {
  slug: SceneKey;
  name: string;
  /** Mono eyebrow. Domain and shipping state — both are facts, not decoration. */
  domain: string;
  status: "Live" | "CLI";
  blurb: string;
  refuses: { headline: string; detail: string };
  /**
   * The Try button: a request for the one thing this system refuses to do. UI copy,
   * not a claim: pressing it only replays the refusal quoted above. 22 characters max
   * so the pill fits beside its status line on a phone.
   */
  attempt: string;
  /** Short measured facts. Numbers only where a real number exists. */
  facts: string[];
  stack: string[];
  live?: string;
  source: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "starmatch",
    name: "StarMatch",
    domain: "Client-side ML",
    status: "Live",
    blurb:
      "Upload a photo and find which public figure you most resemble. Face detection and the 128-dimension embedding both run inside your browser tab.",
    refuses: {
      headline: "It won’t upload your photo.",
      detail:
        "There is no endpoint to upload it to. The privacy claim is architectural rather than a promise on a policy page — adding a server-side inference path would mean deleting the property the project exists to demonstrate.",
    },
    attempt: "Upload my photo",
    // 8/10, not "80%": ten probes put the 95% interval at roughly 49-94%, and
    // the repo's own gate is 60%. Quoting a rounder number would overstate it.
    facts: ["Euclidean, not cosine", "8/10 top-1 on held-out probes", "12 MB weights, lazy-loaded"],
    stack: ["Next.js 16", "TensorFlow.js", "face-api", "visx"],
    live: "https://starmatch-liard.vercel.app",
    source: "https://github.com/JamesKevinJones/starmatch",
  },
  {
    slug: "frontier-platform",
    name: "Frontier Platform",
    domain: "Governed AI",
    status: "Live",
    blurb:
      "Three services — grounded retrieval, a multi-agent workflow, and the guardrail library both of them import — behind an evaluation suite wired into CI.",
    refuses: {
      headline: "It won’t answer when the evidence is weak.",
      detail:
        "Three independent floors gate every answer: IDF term coverage, reranker score, and a composite grounding score. Miss one and the service says which one it missed. On the committed golden set it refuses exactly the three unanswerable questions and none of the thirteen answerable ones.",
    },
    attempt: "Answer anyway",
    facts: ["99 tests passing", "CI fails on a quality drop", "Runs offline, no API key"],
    stack: ["Python 3.12", "React", "TypeScript", "GitHub Actions"],
    live: "https://frontier-platform-lovat.vercel.app",
    source: "https://github.com/JamesKevinJones/frontier-platform",
  },
  {
    slug: "job-autopilot",
    name: "Job Autopilot",
    domain: "Automation",
    status: "CLI",
    blurb:
      "Seven public board APIs in, one ranked approval queue out. Hard gates disqualify and store the reason; survivors get a 0–100 score that carries its own For and Against.",
    refuses: {
      headline: "It won’t submit the application.",
      detail:
        "Unattended form-fill means typing a real address into third-party forms and clicking irreversible controls. It also gets accounts restricted and trips ATS duplicate filters, which costs you the roles you wanted. The pipeline stops at a queue a human reads.",
    },
    attempt: "Submit it for me",
    facts: ["1,341 postings scanned in a day", "6 hard gates", "2 dependencies"],
    stack: ["Python 3.11", "SQLite", "PyYAML"],
    source: "https://github.com/JamesKevinJones/job-autopilot",
  },
  {
    slug: "codeaut0",
    name: "CodeAuto",
    domain: "Visual tooling",
    status: "Live",
    blurb:
      "A drafting sheet for HR processes. You draw the workflow on a ruled grid and a checker marks up what is wrong in the margin before it will run.",
    refuses: {
      headline: "It won’t run a workflow that doesn’t check out.",
      detail:
        "The defining behaviour is the validation, not the canvas. “Must have an End node”, “node is not connected” — every outstanding issue is numbered in the margin, and clicking one selects the offending node. Numbering appears only there, where the count is real.",
    },
    attempt: "Run the workflow",
    facts: ["5 node types", "Click-to-locate issues", "Live structural validation"],
    stack: ["React 19", "React Flow", "Zustand", "MSW"],
    live: "https://codeaut0.vercel.app",
    source: "https://github.com/JamesKevinJones/CodeAut0",
  },
  {
    slug: "job-rag",
    name: "JobMatch RAG",
    domain: "Retrieval",
    status: "Live",
    blurb:
      "Natural-language search over scraped remote listings. A metadata prefilter narrows the field, vector ranking orders what’s left, and results stream back as structured cards.",
    refuses: {
      headline: "It won’t serve a stale listing.",
      detail:
        "Every job carries a lastSeen stamp and anything past 48 hours is pruned from the index on ingest. A job board that returns filled roles is worse than no job board, so the index is allowed to shrink.",
    },
    attempt: "Show every listing",
    facts: ["Hybrid metadata → vector", "48-hour prune", "Portable JSON index"],
    stack: ["Next.js", "Gemini", "Vercel AI SDK", "Cheerio"],
    live: "https://job-rag-drab.vercel.app",
    source: "https://github.com/JamesKevinJones/job-rag",
  },
  {
    slug: "memoryvault-ai",
    name: "MemoryVault AI",
    domain: "Agent memory",
    status: "Live",
    blurb:
      "Durable memory for agents on CockroachDB. Facts, preferences and project context are distilled out of conversations and retrieved into later prompts automatically.",
    refuses: {
      headline: "It won’t call the scrollback buffer memory.",
      detail:
        "Chat history is ephemeral turns you scroll through to remind the model, and it is lost between sessions. Memory is distilled facts that survive across days and projects and are retrieved into every prompt. The vault is the product; chat is one way into it.",
    },
    attempt: "Save the scrollback",
    facts: ["CockroachDB", "Bedrock Titan embeddings", "Cited retrieval"],
    stack: ["Next.js", "Drizzle ORM", "AWS Bedrock", "Auth.js"],
    live: "https://memoryvault-ai-delta.vercel.app",
    source: "https://github.com/JamesKevinJones/Memoryvault-ai",
  },
  {
    slug: "agentshell",
    name: "agentshell",
    domain: "Agent tooling",
    status: "CLI",
    blurb:
      "One prompt, a chain of agent CLIs: Claude Code, Codex, Antigravity, then a local model. Ask with ? and the agent’s proposed command lands in your input buffer, not your shell.",
    refuses: {
      headline: "It won’t run what the agent proposes.",
      detail:
        "Nothing in the codebase executes agent output. A proposal waits in the input buffer for you to press Enter, and the ?, fix and explain commands run each CLI in its own read-only mode, so the agent can’t skip the review by just doing the task.",
    },
    attempt: "Run the proposal",
    // Measured 2026-09-29: `python -m unittest` ran 113 tests, and AGENTS.md records that
    // the suite never spawns an agent CLI. The chain and the one dependency are read from
    // DEFAULT_CHAIN and pyproject.toml, not remembered.
    facts: ["113 tests, no agent CLI spawned", "5-backend failover chain", "1 dependency"],
    stack: ["Python 3.11", "prompt_toolkit", "SQLite", "PowerShell"],
    source: "https://github.com/JamesKevinJones/agentshell",
  },
];

/**
 * Working rules, quoted from the docs they actually live in. These are the
 * receipts for the thesis: each one is a decision that cost something.
 */
export const PRINCIPLES: { rule: string; body: string; source: string }[] = [
  {
    rule: "Rejections are stored, not discarded.",
    body:
      "Filtered jobs stay in the database with the reason they were filtered. That is what makes a threshold tunable against real data instead of a guess — the not-a-tech-role gate exists because the rejection log showed it was needed.",
    source: "job-autopilot / AGENTS.md",
  },
  {
    rule: "A green test that tests the wrong thing is worse than no test.",
    body:
      "A face benchmark reported 57% accuracy. The failures turned out to be a waxwork, a photo of a fan holding a picture of the subject, and a surname collision. Same code, corrected test set: 80%. The number was measuring the benchmark, not the system.",
    source: "starmatch / docs/FRONTEND.md",
  },
  {
    rule: "Measure both sides of an improvement.",
    body:
      "Flip-augmentation is a standard cheap win, so it looked obviously worth adding. Measured: identical accuracy, double the cost, and the naive form pulled impostors closer too. Rejected on the numbers, kept behind a flag so the negative result stays reproducible.",
    source: "starmatch / docs/FRONTEND.md",
  },
  {
    rule: "Deploying is not pushing.",
    body:
      "A CLI-created Vercel project is not necessarily linked to the repo. Three commits sat pushed and undeployed while the feature “wasn’t working”. After shipping, fetch the live URL and confirm the change is in the response.",
    source: "starmatch / docs/FRONTEND.md",
  },
];

/** The stack list in About. Grouped by layer, plain text, no logos. */
export const STACK = [
  ["Languages", "Python · TypeScript · SQL · C++"],
  ["Frontend", "Next.js · React · Tailwind · GSAP · visx"],
  ["Backend", "FastAPI · Node · Drizzle · SQLite · Postgres"],
  ["AI", "RAG · reranking · embeddings · Bedrock · Gemini"],
  ["Infra", "Vercel · Docker · GitHub Actions"],
] as const;
