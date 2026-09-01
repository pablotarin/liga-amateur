import Card from "../common/Card";
import Badge from "../common/Badge";
import "./MatchCard.css";

const statusTone = {
  jugado: "success",
  programado: "info",
  cancelado: "danger",
};

export default function MatchCard({ match }) {
  const isPlayed = match.status === "jugado";

  return (
    <Card className="match-card">
      <div className="match-card__meta">
        <span>Jornada {match.jornada}</span>
        <Badge tone={statusTone[match.status]}>{match.status}</Badge>
      </div>

      <div className="match-card__teams">
        <div className="match-card__team">
          <span className="match-card__team-name">{match.homeTeam?.name}</span>
        </div>

        <div className="match-card__score">
          {isPlayed ? (
            <span>
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="match-card__vs">VS</span>
          )}
        </div>

        <div className="match-card__team match-card__team--away">
          <span className="match-card__team-name">{match.awayTeam?.name}</span>
        </div>
      </div>

      <div className="match-card__footer">
        <span>{new Date(match.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
        {match.venue && <span>{match.venue}</span>}
      </div>
    </Card>
  );
}
