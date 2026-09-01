import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import { fetchTeams } from "../../api/teams.api";
import { fetchUsers, updateUserRoleRequest, deleteUserRequest } from "../../api/users.api";
import Loader from "../common/Loader";
import Badge from "../common/Badge";
import Button from "../common/Button";
import "../../pages/DashboardPage.css";

const ROLE_TONE = { admin: "danger", manager: "info", player: "neutral" };

export default function DashboardUsers() {
  const { data: teams } = useFetch(fetchTeams, []);
  const { data: users, loading, error, refetch } = useFetch(fetchUsers, []);
  const [actionError, setActionError] = useState(null);

  const handleRoleChange = async (userId, role) => {
    setActionError(null);
    try {
      await updateUserRoleRequest(userId, { role });
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleTeamChange = async (userId, team) => {
    setActionError(null);
    try {
      await updateUserRoleRequest(userId, { team: team || null });
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await deleteUserRequest(userId);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <Loader label="Cargando usuarios..." />;
  if (error) return <p className="home-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-toolbar">
        <span>{users?.length ?? 0} usuario(s)</span>
      </div>

      {actionError && <p className="home-error">{actionError}</p>}

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Equipo asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                    <option value="player">player</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                  </select>{" "}
                  <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                </td>
                <td>
                  <select
                    value={u.team?._id || ""}
                    onChange={(e) => handleTeamChange(u._id, e.target.value)}
                    disabled={u.role === "admin"}
                  >
                    <option value="">Sin equipo</option>
                    {teams?.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(u._id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
