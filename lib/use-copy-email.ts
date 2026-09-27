"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE } from "@/lib/site";

/**
 * Copy PROFILE.email to the clipboard; `copied` stays true for 2.2s so labels can roll to
 * "Copied". Shared by the footer's copy pill and the floating contact chip so both
 * behave the same. Falls back to the mail client when the clipboard is blocked.
 */
export function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked (insecure context or permissions): hand off to the mail client.
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  return { copied, copy };
}
