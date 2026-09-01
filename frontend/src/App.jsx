import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/routes/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import MatchesPage from "./pages/MatchesPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>
        <Routes>
          {/* Rutas publicas: cualquier visitante puede ver la liga sin loguearse */}
          <Route path="/" element={<HomePage />} />
          <Route path="/equipos" element={<TeamsPage />} />
          <Route path="/equipos/:id" element={<TeamDetailPage />} />
          <Route path="/jugadores" element={<PlayersPage />} />
          <Route path="/jugadores/:id" element={<PlayerDetailPage />} />
          <Route path="/calendario" element={<MatchesPage />} />

          {/* Autenticacion */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Rutas privadas */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel"
            element={
              <ProtectedRoute roles={["admin", "manager"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
