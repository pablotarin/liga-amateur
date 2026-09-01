import "./FormField.css";

/**
 * Envoltorio de campo de formulario: label + input/select/textarea (pasado como children)
 * + mensaje de error. Se usa junto con react-hook-form's `register`.
 */
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
