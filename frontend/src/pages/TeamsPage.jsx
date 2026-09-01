import { useState, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import { fetchTeams } from "../api/teams.api";
import TeamCard from "../components/teams/TeamCard";
import Loader from "../components/common/Loader";
import "./ListPages.css";

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: teams, loading, error } = useFetch(fetchTeams, []);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    if (!debouncedSearch) return teams;
    const term = debouncedSearch.toLowerCase();
    return teams.filter(
      (t) => t.name.toLowerCase().includes(term) || t.city.toLowerCase().includes(term)
    );
  }, [teams, debouncedSearch]);

  return (
    <div className="page">
      <div className="container">
        <div className="list-header">
          <h1>Equipos</h1>
          <input
            className="list-search"
            placeholder="Buscar por nombre o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <Loader label="Cargando equipos..." />}
        {error && <p className="home-error">{error}</p>}

        <div className="list-grid">
          {filteredTeams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>

        {!loading && filteredTeams.length === 0 && <p>No se encontraron equipos.</p>}
      </div>
    </div>
  );
}
