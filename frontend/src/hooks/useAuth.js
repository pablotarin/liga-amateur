import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Atajo para consumir el AuthContext desde cualquier componente.
 * Lanza un error explicito si se usa fuera de <AuthProvider>, para detectar
 * el fallo en desarrollo en vez de recibir un `undefined` silencioso.
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
}
