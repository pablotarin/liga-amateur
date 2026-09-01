import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook generico para ejecutar una funcion asincrona (normalmente una llamada a la API)
 * y exponer su estado de carga/datos/error de forma declarativa.
 *
 * @param {Function} fetcher  Funcion que devuelve una promesa (ej: () => fetchTeams())
 * @param {Array}    deps     Dependencias que, al cambiar, relanzan la peticion
 * @param {Object}   options  { skip: boolean } para no ejecutar la peticion condicionalmente
 */
export default function useFetch(fetcher, deps = [], options = {}) {
  const { skip = false } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  // Evita actualizar el estado si el componente se desmonta antes de que
  // termine una peticion en curso (condicion de carrera clasica en React).
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) setData(result);
    } catch (err) {
      if (isMounted.current) setError(err.message || "Error al cargar los datos");
    } finally {
      if (isMounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run, setData };
}
