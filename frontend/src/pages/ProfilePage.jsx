import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { updateMyProfileRequest, uploadMyAvatarRequest } from "../api/users.api";
import Button from "../components/common/Button";
import FormField from "../components/common/FormField";
import Badge from "../components/common/Badge";
import "./ProfilePage.css";

const ROLE_LABEL = { admin: "Administrador", manager: "Entrenador", player: "Jugador/Aficionado" };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { name: user.name } });

  const onSubmit = async (formData) => {
    setMessage(null);
    try {
      const updated = await updateMyProfileRequest(formData);
      updateUser(updated);
      setMessage("Perfil actualizado correctamente");
    } catch (err) {
      setMessage(err.message);
    }
  };

  // La subida de avatar es opcional (requiere Cloudinary configurado en el backend);
  // si no lo esta, el backend devuelve un 503 con un mensaje explicativo.
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const updated = await uploadMyAvatarRequest(file);
      updateUser(updated);
    } catch (err) {
      setUploadError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="container profile-container">
        <div className="profile-card">
          <div className="profile-avatar" onClick={() => fileInputRef.current?.click()}>
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} />
            ) : (
              <span>{user.name?.charAt(0)}</span>
            )}
            <span className="profile-avatar__hint">Cambiar foto</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
          {uploadError && <p className="home-error">{uploadError}</p>}

          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <Badge tone="info">{ROLE_LABEL[user.role]}</Badge>

          <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
            <FormField label="Nombre" htmlFor="name">
              <input id="name" {...register("name", { required: true })} />
            </FormField>

            {message && <p className="profile-message">{message}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
