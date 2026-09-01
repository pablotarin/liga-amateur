import { Link } from "react-router-dom";
import Card from "../common/Card";
import "./TeamCard.css";

export default function TeamCard({ team }) {
  return (
    <Link to={`/equipos/${team._id}`} className="team-card-link">
      <Card hoverable className="team-card">
        <div
          className="team-card__crest"
          style={{ backgroundColor: team.colorPrimary || "var(--color-primary)" }}
        >
          {team.logo?.url ? (
            <img src={team.logo.url} alt={`Escudo de ${team.name}`} />
          ) : (
            <span>{team.name?.charAt(0)}</span>
          )}
        </div>
        <div className="team-card__info">
          <h3>{team.name}</h3>
          <p>{team.city}</p>
          {team.coachName && <span className="team-card__coach">Entrenador: {team.coachName}</span>}
        </div>
      </Card>
    </Link>
  );
}
