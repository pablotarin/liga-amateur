import { useState, useEffect } from "react";

/**
 * Devuelve una version "retardada" del valor recibido: solo se actualiza cuando
 * el usuario deja de escribir durante `delay` ms. Se usa en los buscadores
 * (equipos, jugadores) para no lanzar una peticion HTTP en cada pulsacion de tecla.
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
