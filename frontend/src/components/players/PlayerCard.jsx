import { Link } from "react-router-dom";
import Card from "../common/Card";
import Badge from "../common/Badge";
import "./PlayerCard.css";

const positionTone = {
  Portero: "warning",
  Defensa: "info",
  Centrocampista: "success",
  Delantero: "danger",
};

export default function PlayerCard({ player }) {
  return (
    <Link to={`/jugadores/${player._id}`} className="player-card-link">
      <Card hoverable className="player-card">
        <div className="player-card__avatar">
          {player.photo?.url ? (
            <img src={player.photo.url} alt={player.name} />
          ) : (
            <span>{player.dorsal}</span>
          )}
        </div>
        <div className="player-card__info">
          <h4>{player.name}</h4>
          <p>{player.team?.name}</p>
          <Badge tone={positionTone[player.position] || "neutral"}>{player.position}</Badge>
        </div>
        <div className="player-card__stats">
          <span title="Goles">⚽ {player.stats?.goals ?? 0}</span>
          <span title="Asistencias">🎯 {player.stats?.assists ?? 0}</span>
        </div>
      </Card>
    </Link>
  );
}
