import { useState } from "react";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import { fetchPlayers } from "../api/players.api";
import { fetchTeams } from "../api/teams.api";
import PlayerCard from "../components/players/PlayerCard";
import Loader from "../components/common/Loader";
import "./ListPages.css";

const POSITIONS = ["Portero", "Defensa", "Centrocampista", "Delantero"];

export default function PlayersPage() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: teams } = useFetch(fetchTeams, []);

  const { data: players, loading, error } = useFetch(
    () => fetchPlayers({ search: debouncedSearch || undefined, team: team || undefined, position: position || undefined }),
    [debouncedSearch, team, position]
  );

  return (
    <div className="page">
      <div className="container">
        <div className="list-header">
          <h1>Jugadores</h1>
          <input
            className="list-search"
            placeholder="Buscar jugador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="list-filters">
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Todos los equipos</option>
            {teams?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <select value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="">Todas las posiciones</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {loading && <Loader label="Cargando jugadores..." />}
        {error && <p className="home-error">{error}</p>}

        <div className="list-grid">
          {players?.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>

        {!loading && players?.length === 0 && <p>No se encontraron jugadores.</p>}
      </div>
    </div>
  );
}
