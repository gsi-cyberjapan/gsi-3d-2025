import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(value: T, ms: number) => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value);
    }, ms);

    return () => {
      window.clearTimeout(id);
    };
  }, [value, ms]);

  return debounced;
};
