import "./Badge.css";

/**
 * Etiqueta pequeña de color para estados (jugado/programado), posiciones de
 * jugador o roles de usuario.
 */
export default function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
