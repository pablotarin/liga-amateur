import "./Card.css";

export default function Card({ children, className = "", hoverable = false, as: Tag = "div", ...rest }) {
  return (
    <Tag className={`card ${hoverable ? "card--hoverable" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
