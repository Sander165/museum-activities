"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useParam(
  key: string,
  value: string,
): [boolean, (active: boolean) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParam = useCallback(
    (active: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (active) {
        if (params.get(key) !== value) params.set(key, value);
      } else {
        if (params.get(key) === value) params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [key, value, searchParams, router, pathname],
  );

  return [searchParams.get(key) === value, setParam];
}
