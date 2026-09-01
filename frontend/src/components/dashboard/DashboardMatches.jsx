import { useState } from "react";
import { useForm } from "react-hook-form";
import useFetch from "../../hooks/useFetch";
import { fetchTeams } from "../../api/teams.api";
import {
  fetchMatches,
  createMatchRequest,
  updateMatchRequest,
  deleteMatchRequest,
} from "../../api/matches.api";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import Badge from "../common/Badge";
import "../../pages/DashboardPage.css";

const STATUS_TONE = { jugado: "success", programado: "info", cancelado: "danger" };

export default function DashboardMatches() {
  const { data: teams } = useFetch(fetchTeams, []);
  const { data: matches, loading, error, refetch } = useFetch(fetchMatches, []);

  const [editingMatch, setEditingMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm();
  const status = watch("status");

  const toDateInputValue = (isoDate) => (isoDate ? new Date(isoDate).toISOString().slice(0, 10) : "");

  const openCreate = () => {
    setEditingMatch(null);
    reset({
      jornada: "",
      date: "",
      homeTeam: "",
      awayTeam: "",
      venue: "",
      status: "programado",
      homeScore: "",
      awayScore: "",
    });
    setShowModal(true);
  };

  const openEdit = (match) => {
    setEditingMatch(match);
    reset({
      jornada: match.jornada,
      date: toDateInputValue(match.date),
      homeTeam: match.homeTeam?._id,
      awayTeam: match.awayTeam?._id,
      venue: match.venue,
      status: match.status,
      homeScore: match.homeScore ?? "",
      awayScore: match.awayScore ?? "",
    });
    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    setActionError(null);

    if (formData.homeTeam === formData.awayTeam) {
      setActionError("Un equipo no puede jugar contra si mismo");
      return;
    }

    const payload = {
      jornada: Number(formData.jornada),
      date: formData.date,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      venue: formData.venue,
      status: formData.status,
      homeScore: formData.status === "jugado" ? Number(formData.homeScore) : null,
      awayScore: formData.status === "jugado" ? Number(formData.awayScore) : null,
    };

    try {
      if (editingMatch) {
        await updateMatchRequest(editingMatch._id, payload);
      } else {
        await createMatchRequest(payload);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este partido?")) return;
    try {
      await deleteMatchRequest(id);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <Loader label="Cargando partidos..." />;
  if (error) return <p className="home-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-toolbar">
        <span>{matches?.length ?? 0} partido(s)</span>
        <Button onClick={openCreate}>+ Nuevo partido</Button>
      </div>

      {actionError && <p className="home-error">{actionError}</p>}

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Jornada</th>
              <th>Fecha</th>
              <th>Local</th>
              <th>Visitante</th>
              <th>Resultado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {matches?.map((match) => (
              <tr key={match._id}>
                <td>{match.jornada}</td>
                <td>{new Date(match.date).toLocaleDateString("es-ES")}</td>
                <td>{match.homeTeam?.name}</td>
                <td>{match.awayTeam?.name}</td>
                <td>
                  {match.status === "jugado" ? `${match.homeScore} - ${match.awayScore}` : "—"}
                </td>
                <td>
                  <Badge tone={STATUS_TONE[match.status]}>{match.status}</Badge>
                </td>
                <td>
                  <div className="dashboard-row-actions">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(match)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(match._id)}>
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
        title={editingMatch ? "Editar partido" : "Nuevo partido"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Jornada" htmlFor="jornada">
            <input id="jornada" type="number" min="1" {...register("jornada", { required: true })} />
          </FormField>

          <FormField label="Fecha" htmlFor="date">
            <input id="date" type="date" {...register("date", { required: true })} />
          </FormField>

          <FormField label="Equipo local" htmlFor="homeTeam">
            <select id="homeTeam" {...register("homeTeam", { required: true })}>
              <option value="">Selecciona un equipo</option>
              {teams?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Equipo visitante" htmlFor="awayTeam">
            <select id="awayTeam" {...register("awayTeam", { required: true })}>
              <option value="">Selecciona un equipo</option>
              {teams?.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Estadio / lugar" htmlFor="venue">
            <input id="venue" {...register("venue")} />
          </FormField>

          <FormField label="Estado" htmlFor="status">
            <select id="status" {...register("status")}>
              <option value="programado">Programado</option>
              <option value="jugado">Jugado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </FormField>

          {status === "jugado" && (
            <>
              <FormField label="Goles local" htmlFor="homeScore">
                <input id="homeScore" type="number" min="0" {...register("homeScore", { required: true })} />
              </FormField>
              <FormField label="Goles visitante" htmlFor="awayScore">
                <input id="awayScore" type="number" min="0" {...register("awayScore", { required: true })} />
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
