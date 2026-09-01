import "./Button.css";

/**
 * Boton reutilizable con variantes semanticas. Todo boton de la app deberia
 * pasar por aqui en lugar de estilarse suelto, para mantener consistencia visual.
 */
export default function Button({
  children,
  variant = "primary", // primary | secondary | danger | ghost
  size = "md", // sm | md | lg
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
  ...rest
}) {
  const classNames = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classNames} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
