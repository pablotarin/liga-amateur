import { useState, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import { fetchMatches } from "../api/matches.api";
import MatchCard from "../components/matches/MatchCard";
import Loader from "../components/common/Loader";
import "./ListPages.css";

export default function MatchesPage() {
  const [jornada, setJornada] = useState("");
  const { data: matches, loading, error } = useFetch(fetchMatches, []);

  const jornadas = useMemo(() => {
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.jornada))].sort((a, b) => a - b);
  }, [matches]);

  const filtered = useMemo(() => {
    if (!matches) return [];
    if (!jornada) return matches;
    return matches.filter((m) => m.jornada === Number(jornada));
  }, [matches, jornada]);

  return (
    <div className="page">
      <div className="container">
        <div className="list-header">
          <h1>Calendario</h1>
        </div>

        <div className="list-filters">
          <select value={jornada} onChange={(e) => setJornada(e.target.value)}>
            <option value="">Todas las jornadas</option>
            {jornadas.map((j) => (
              <option key={j} value={j}>
                Jornada {j}
              </option>
            ))}
          </select>
        </div>

        {loading && <Loader label="Cargando calendario..." />}
        {error && <p className="home-error">{error}</p>}

        <div className="list-grid">
          {filtered.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
