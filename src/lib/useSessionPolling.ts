"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "./types";

interface UseSessionPollingOptions {
  code: string;
  intervalMs?: number;
  enabled?: boolean;
}

export function useSessionPolling({
  code,
  intervalMs = 2000,
  enabled = true,
}: UseSessionPollingOptions) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSession = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch(`/api/session/${code}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Session not found");
        return;
      }
      const data = await res.json();
      setSession(data.session);
      setError(null);
    } catch {
      setError("Failed to fetch session");
    }
  }, [code]);

  useEffect(() => {
    if (!enabled || !code) return;

    fetchSession();
    intervalRef.current = setInterval(fetchSession, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code, intervalMs, enabled, fetchSession]);

  return { session, error, refetch: fetchSession };
}
