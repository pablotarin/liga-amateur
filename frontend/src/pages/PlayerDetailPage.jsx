import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { fetchPlayerById } from "../api/players.api";
import Loader from "../components/common/Loader";
import Badge from "../components/common/Badge";
import "./PlayerDetailPage.css";

export default function PlayerDetailPage() {
  const { id } = useParams();
  const { data: player, loading, error } = useFetch(() => fetchPlayerById(id), [id]);

  if (loading) return <div className="page container"><Loader label="Cargando jugador..." /></div>;
  if (error) return <div className="page container"><p className="home-error">{error}</p></div>;
  if (!player) return null;

  const age = player.birthdate
    ? Math.floor((Date.now() - new Date(player.birthdate)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div className="page">
      <div className="container player-detail">
        <div className="player-detail__header">
          <div className="player-detail__avatar">
            {player.photo?.url ? (
              <img src={player.photo.url} alt={player.name} />
            ) : (
              <span>{player.dorsal}</span>
            )}
          </div>
          <div>
            <h1>{player.name}</h1>
            <p>
              <Link to={`/equipos/${player.team?._id}`}>{player.team?.name}</Link> · Dorsal #{player.dorsal}
            </p>
            <Badge tone="info">{player.position}</Badge>
          </div>
        </div>

        <div className="player-detail__grid">
          <div className="player-stat-card">
            <span className="player-stat-card__value">{player.stats?.goals ?? 0}</span>
            <span className="player-stat-card__label">Goles</span>
          </div>
          <div className="player-stat-card">
            <span className="player-stat-card__value">{player.stats?.assists ?? 0}</span>
            <span className="player-stat-card__label">Asistencias</span>
          </div>
          <div className="player-stat-card">
            <span className="player-stat-card__value">{player.stats?.yellowCards ?? 0}</span>
            <span className="player-stat-card__label">T. Amarillas</span>
          </div>
          <div className="player-stat-card">
            <span className="player-stat-card__value">{player.stats?.redCards ?? 0}</span>
            <span className="player-stat-card__label">T. Rojas</span>
          </div>
        </div>

        <div className="player-detail__info">
          {age && <p><strong>Edad:</strong> {age} años</p>}
          {player.nationality && <p><strong>Nacionalidad:</strong> {player.nationality}</p>}
        </div>
      </div>
    </div>
  );
}
