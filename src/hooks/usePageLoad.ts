"use client";

import { useState, useEffect } from "react";

export function usePageLoad(delay = 700) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(id);
  }, []);
  return isLoaded;
}
