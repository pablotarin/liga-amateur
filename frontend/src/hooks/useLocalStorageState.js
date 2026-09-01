import { useState, useEffect } from "react";

/**
 * useState que ademas persiste su valor en localStorage. Se usa, por ejemplo,
 * para recordar la preferencia de vista (tarjetas/tabla) del usuario entre sesiones.
 */
export default function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
