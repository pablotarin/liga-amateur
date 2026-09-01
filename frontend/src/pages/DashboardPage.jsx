import { useState } from "react";
import useAuth from "../hooks/useAuth";
import DashboardTeams from "../components/dashboard/DashboardTeams";
import DashboardPlayers from "../components/dashboard/DashboardPlayers";
import DashboardMatches from "../components/dashboard/DashboardMatches";
import DashboardUsers from "../components/dashboard/DashboardUsers";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  // El admin ve las 4 pestañas; un manager solo gestiona su equipo y sus jugadores.
  const tabs = isAdmin
    ? [
        { key: "teams", label: "Equipos" },
        { key: "players", label: "Jugadores" },
        { key: "matches", label: "Partidos" },
        { key: "users", label: "Usuarios" },
      ]
    : [
        { key: "teams", label: "Mi equipo" },
        { key: "players", label: "Mi plantilla" },
      ];

  const [activeTab, setActiveTab] = useState(tabs[0].key);

  return (
    <div className="page">
      <div className="container">
        <h1>Panel de gestion</h1>
        <p className="dashboard-subtitle">
          {isAdmin
            ? "Como administrador puedes gestionar toda la liga: equipos, jugadores, partidos y usuarios."
            : "Como entrenador puedes gestionar la informacion y la plantilla de tu propio equipo."}
        </p>

        <div className="dashboard-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`dashboard-tab ${activeTab === tab.key ? "dashboard-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="dashboard-content">
          {activeTab === "teams" && <DashboardTeams isAdmin={isAdmin} user={user} />}
          {activeTab === "players" && <DashboardPlayers isAdmin={isAdmin} user={user} />}
          {activeTab === "matches" && isAdmin && <DashboardMatches />}
          {activeTab === "users" && isAdmin && <DashboardUsers />}
        </div>
      </div>
    </div>
  );
}
