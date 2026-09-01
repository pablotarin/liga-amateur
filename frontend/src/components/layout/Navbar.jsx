import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiUser, FiLogOut } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) => `navbar__link ${isActive ? "navbar__link--active" : ""}`;

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={() => setMenuOpen(false)}>
          🏆 Liga Amateur
        </NavLink>

        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <nav className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}>
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
            Clasificacion
          </NavLink>
          <NavLink to="/equipos" className={linkClass} onClick={() => setMenuOpen(false)}>
            Equipos
          </NavLink>
          <NavLink to="/jugadores" className={linkClass} onClick={() => setMenuOpen(false)}>
            Jugadores
          </NavLink>
          <NavLink to="/calendario" className={linkClass} onClick={() => setMenuOpen(false)}>
            Calendario
          </NavLink>

          {isAuthenticated && (user.role === "admin" || user.role === "manager") && (
            <NavLink to="/panel" className={linkClass} onClick={() => setMenuOpen(false)}>
              Panel de gestion
            </NavLink>
          )}

          <div className="navbar__divider" />

          {isAuthenticated ? (
            <div className="navbar__user">
              <NavLink to="/perfil" className="navbar__profile" onClick={() => setMenuOpen(false)}>
                <FiUser size={16} />
                {user?.name?.split(" ")[0]}
              </NavLink>
              <button className="navbar__logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar__cta" onClick={() => setMenuOpen(false)}>
              Iniciar sesion
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
