import { useCallback, useEffect, useState } from "react";

type StoredEnvelope<T> = {
  version: number;
  value: T;
};

export function readStoredValue<T>(
  key: string,
  version: number,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as StoredEnvelope<unknown>;
    if (parsed.version !== version) return fallback;
    if (validate && !validate(parsed.value)) return fallback;
    return parsed.value as T;
  } catch {
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, version: number, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ version, value }));
  } catch {
    // Private browsing and embedded previews may deny storage.
  }
}

export function useVersionedStorage<T>(
  key: string,
  version: number,
  fallback: T,
  validate?: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStoredValue(key, version, fallback, validate));
    setHydrated(true);
  }, [key, version, fallback, validate]);

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (v: T) => T)(current) : next;
        writeStoredValue(key, version, resolved);
        return resolved;
      });
    },
    [key, version],
  );

  return [value, update, hydrated] as const;
}
