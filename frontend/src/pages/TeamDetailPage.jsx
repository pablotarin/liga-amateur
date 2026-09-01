import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { fetchTeamById } from "../api/teams.api";
import Loader from "../components/common/Loader";
import PlayerCard from "../components/players/PlayerCard";
import "./TeamDetailPage.css";

export default function TeamDetailPage() {
  const { id } = useParams();
  const { data: team, loading, error } = useFetch(() => fetchTeamById(id), [id]);

  if (loading) return <div className="page container"><Loader label="Cargando equipo..." /></div>;
  if (error) return <div className="page container"><p className="home-error">{error}</p></div>;
  if (!team) return null;

  return (
    <div className="page">
      <div className="container">
        <div
          className="team-hero"
          style={{ background: `linear-gradient(135deg, ${team.colorPrimary}, ${team.colorPrimary}cc)` }}
        >
          <div className="team-hero__crest">
            {team.logo?.url ? (
              <img src={team.logo.url} alt={`Escudo de ${team.name}`} />
            ) : (
              <span>{team.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1>{team.name}</h1>
            <p>{team.city} · Fundado en {team.foundedYear}</p>
            <p>{team.stadium}</p>
            {team.coachName && <p>Entrenador: {team.coachName}</p>}
          </div>
        </div>

        <h2 className="team-roster-title">Plantilla ({team.players?.length ?? 0})</h2>
        <div className="list-grid">
          {team.players?.map((player) => (
            <PlayerCard key={player._id} player={{ ...player, team }} />
          ))}
        </div>
      </div>
    </div>
  );
}
