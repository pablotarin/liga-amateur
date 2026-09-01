import { useState } from "react";
import { useForm } from "react-hook-form";
import useFetch from "../../hooks/useFetch";
import { fetchTeams } from "../../api/teams.api";
import {
  fetchPlayers,
  createPlayerRequest,
  updatePlayerRequest,
  deletePlayerRequest,
} from "../../api/players.api";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import "../../pages/DashboardPage.css";

const POSITIONS = ["Portero", "Defensa", "Centrocampista", "Delantero"];

export default function DashboardPlayers({ isAdmin, user }) {
  const teamFilter = isAdmin ? undefined : String(user.team);
  const { data: teams } = useFetch(fetchTeams, []);
  const {
    data: players,
    loading,
    error,
    refetch,
  } = useFetch(() => fetchPlayers({ team: teamFilter }), [teamFilter]);

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const openCreate = () => {
    setEditingPlayer(null);
    reset({
      name: "",
      team: isAdmin ? "" : String(user.team),
      position: "Delantero",
      dorsal: "",
      nationality: "",
    });
    setShowModal(true);
  };

  const openEdit = (player) => {
    setEditingPlayer(player);
    reset({
      name: player.name,
      team: player.team?._id,
      position: player.position,
      dorsal: player.dorsal,
      nationality: player.nationality,
      goals: player.stats?.goals,
      assists: player.stats?.assists,
      yellowCards: player.stats?.yellowCards,
      redCards: player.stats?.redCards,
    });
    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    setActionError(null);
    const payload = {
      name: formData.name,
      team: formData.team,
      position: formData.position,
      dorsal: Number(formData.dorsal),
      nationality: formData.nationality,
      stats: {
        goals: Number(formData.goals) || 0,
        assists: Number(formData.assists) || 0,
        yellowCards: Number(formData.yellowCards) || 0,
        redCards: Number(formData.redCards) || 0,
      },
    };
    try {
      if (editingPlayer) {
        await updatePlayerRequest(editingPlayer._id, payload);
      } else {
        await createPlayerRequest(payload);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este jugador?")) return;
    try {
      await deletePlayerRequest(id);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <Loader label="Cargando jugadores..." />;
  if (error) return <p className="home-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-toolbar">
        <span>{players?.length ?? 0} jugador(es)</span>
        <Button onClick={openCreate}>+ Nuevo jugador</Button>
      </div>

      {actionError && <p className="home-error">{actionError}</p>}

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Equipo</th>
              <th>Posicion</th>
              <th>Dorsal</th>
              <th>Goles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players?.map((player) => (
              <tr key={player._id}>
                <td>{player.name}</td>
                <td>{player.team?.name}</td>
                <td>{player.position}</td>
                <td>{player.dorsal}</td>
                <td>{player.stats?.goals ?? 0}</td>
                <td>
                  <div className="dashboard-row-actions">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(player)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(player._id)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPlayer ? "Editar jugador" : "Nuevo jugador"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Nombre" htmlFor="name">
            <input id="name" {...register("name", { required: true })} />
          </FormField>

          <FormField label="Equipo" htmlFor="team">
            <select id="team" disabled={!isAdmin} {...register("team", { required: true })}>
              <option value="">Selecciona un equipo</option>
              {teams?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Posicion" htmlFor="position">
            <select id="position" {...register("position", { required: true })}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Dorsal" htmlFor="dorsal">
            <input id="dorsal" type="number" min="1" max="99" {...register("dorsal", { required: true })} />
          </FormField>

          <FormField label="Nacionalidad" htmlFor="nationality">
            <input id="nationality" {...register("nationality")} />
          </FormField>

          {editingPlayer && (
            <>
              <FormField label="Goles" htmlFor="goals">
                <input id="goals" type="number" min="0" {...register("goals")} />
              </FormField>
              <FormField label="Asistencias" htmlFor="assists">
                <input id="assists" type="number" min="0" {...register("assists")} />
              </FormField>
              <FormField label="Tarjetas amarillas" htmlFor="yellowCards">
                <input id="yellowCards" type="number" min="0" {...register("yellowCards")} />
              </FormField>
              <FormField label="Tarjetas rojas" htmlFor="redCards">
                <input id="redCards" type="number" min="0" {...register("redCards")} />
              </FormField>
            </>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
