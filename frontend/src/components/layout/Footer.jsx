import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>© {new Date().getFullYear()} Liga Amateur — Proyecto academico FullStack</span>
        <span className="footer__muted">React · Node.js · Express · MongoDB</span>
      </div>
    </footer>
  );
}
