import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

/**
 * Envuelve las rutas que requieren sesion iniciada, y opcionalmente un rol concreto.
 *
 *   <ProtectedRoute><DashboardPage /></ProtectedRoute>                -> requiere login
 *   <ProtectedRoute roles={["admin"]}><UsersAdminPage /></ProtectedRoute> -> requiere rol admin
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, status } = useAuth();
  const location = useLocation();

  // Mientras se resuelve la sesion guardada en localStorage, no decidimos aun
  if (status === "loading") return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
