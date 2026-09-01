import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="page not-found">
      <div className="container not-found__content">
        <span className="not-found__code">404</span>
        <h1>Esta jugada no existe</h1>
        <p>La pagina que buscas no esta en el calendario. Vuelve a la clasificacion.</p>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
