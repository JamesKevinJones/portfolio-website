"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const read = () => format.format(Date.now());

/** Ticks every 15s; the string only changes once a minute, so React re-renders once a minute. */
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
};

/**
 * Kevin's local time. useSyncExternalStore renders the server snapshot during hydration
 * and swaps to the real clock right after, so there is no hydration mismatch and no
 * setState inside an effect.
 */
export function LocalTime() {
  const time = useSyncExternalStore(subscribe, read, () => "--:--");
  return (
    <span data-testid="local-time" className="tabular-nums">
      {time} IST
    </span>
  );
}
