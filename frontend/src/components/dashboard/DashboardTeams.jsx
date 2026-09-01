import { useState } from "react";
import { useForm } from "react-hook-form";
import useFetch from "../../hooks/useFetch";
import {
  fetchTeams,
  createTeamRequest,
  updateTeamRequest,
  deleteTeamRequest,
} from "../../api/teams.api";
import Loader from "../common/Loader";
import Button from "../common/Button";
import Modal from "../common/Modal";
import FormField from "../common/FormField";
import "../../pages/DashboardPage.css";

export default function DashboardTeams({ isAdmin, user }) {
  const { data: teams, loading, error, refetch } = useFetch(fetchTeams, []);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Un manager solo ve/edita su propio equipo
  const visibleTeams = isAdmin ? teams : teams?.filter((t) => t._id === String(user.team));

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const openCreate = () => {
    setEditingTeam(null);
    reset({ name: "", city: "", foundedYear: "", stadium: "", colorPrimary: "#1E3A8A" });
    setShowModal(true);
  };

  const openEdit = (team) => {
    setEditingTeam(team);
    reset(team);
    setShowModal(true);
  };

  const onSubmit = async (formData) => {
    setActionError(null);
    try {
      if (editingTeam) {
        await updateTeamRequest(editingTeam._id, formData);
      } else {
        await createTeamRequest(formData);
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este equipo? Esta accion no se puede deshacer.")) return;
    try {
      await deleteTeamRequest(id);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) return <Loader label="Cargando equipos..." />;
  if (error) return <p className="home-error">{error}</p>;

  return (
    <div>
      <div className="dashboard-toolbar">
        <span>{visibleTeams?.length ?? 0} equipo(s)</span>
        {isAdmin && <Button onClick={openCreate}>+ Nuevo equipo</Button>}
      </div>

      {actionError && <p className="home-error">{actionError}</p>}

      <div className="dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Fundado</th>
              <th>Entrenador</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleTeams?.map((team) => (
              <tr key={team._id}>
                <td>{team.name}</td>
                <td>{team.city}</td>
                <td>{team.foundedYear}</td>
                <td>{team.coachName || "—"}</td>
                <td>
                  <div className="dashboard-row-actions">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(team)}>
                      Editar
                    </Button>
                    {isAdmin && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(team._id)}>
                        Eliminar
                      </Button>
                    )}
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
        title={editingTeam ? "Editar equipo" : "Nuevo equipo"}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Nombre" htmlFor="name">
            <input id="name" {...register("name", { required: true })} />
          </FormField>
          <FormField label="Ciudad" htmlFor="city">
            <input id="city" {...register("city", { required: true })} />
          </FormField>
          <FormField label="Año de fundacion" htmlFor="foundedYear">
            <input id="foundedYear" type="number" {...register("foundedYear")} />
          </FormField>
          <FormField label="Estadio" htmlFor="stadium">
            <input id="stadium" {...register("stadium")} />
          </FormField>
          <FormField label="Entrenador" htmlFor="coachName">
            <input id="coachName" {...register("coachName")} />
          </FormField>
          <FormField label="Color principal" htmlFor="colorPrimary">
            <input id="colorPrimary" type="color" {...register("colorPrimary")} />
          </FormField>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
