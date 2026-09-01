import "./Loader.css";

export default function Loader({ label = "Cargando..." }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
