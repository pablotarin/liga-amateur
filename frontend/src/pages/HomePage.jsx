import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useFetch from "../hooks/useFetch";
import { fetchStandings, fetchMatches } from "../api/matches.api";
import Loader from "../components/common/Loader";
import MatchCard from "../components/matches/MatchCard";
import "./HomePage.css";

export default function HomePage() {
  const { data: standings, loading: loadingStandings, error: standingsError } = useFetch(
    fetchStandings,
    []
  );
  const { data: matches, loading: loadingMatches } = useFetch(
    () => fetchMatches({ status: "programado" }),
    []
  );

  const upcoming = matches?.slice(0, 3) ?? [];

  return (
    <div className="page">
      <section className="container hero">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Liga Amateur 2026</h1>
          <p className="hero__subtitle">
            Clasificacion, calendario y estadisticas de las 12 escuadras que compiten esta
            temporada. Organizadores, entrenadores y aficionados, todo en un mismo sitio.
          </p>
        </motion.div>
      </section>

      <section className="container home-section">
        <div className="home-section__header">
          <h2>Clasificacion</h2>
          <Link to="/equipos" className="home-section__link">
            Ver todos los equipos →
          </Link>
        </div>

        {loadingStandings && <Loader label="Calculando clasificacion..." />}
        {standingsError && <p className="home-error">{standingsError}</p>}

        {standings && (
          <div className="standings-table-wrapper">
            <table className="standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Equipo</th>
                  <th>PJ</th>
                  <th>G</th>
                  <th>E</th>
                  <th>P</th>
                  <th>GF</th>
                  <th>GC</th>
                  <th>DG</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, index) => (
                  <tr key={row.team._id} className={index < 3 ? "standings-table__top" : ""}>
                    <td>{index + 1}</td>
                    <td>
                      <Link to={`/equipos/${row.team._id}`} className="standings-table__team">
                        {row.team.name}
                      </Link>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td>{row.goalDiff}</td>
                    <td className="standings-table__points">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="container home-section">
        <div className="home-section__header">
          <h2>Proximos partidos</h2>
          <Link to="/calendario" className="home-section__link">
            Ver calendario completo →
          </Link>
        </div>

        {loadingMatches && <Loader label="Cargando partidos..." />}

        <div className="home-matches-grid">
          {upcoming.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
          {!loadingMatches && upcoming.length === 0 && (
            <p>No hay partidos programados por el momento.</p>
          )}
        </div>
      </section>
    </div>
  );
}
