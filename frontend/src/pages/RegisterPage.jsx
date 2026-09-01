import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import "./AuthPages.css";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (formData) => {
    setServerError(null);
    try {
      await registerUser(formData);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <h1>Crear cuenta</h1>
          <p>Registrate como aficionado para seguir a tu equipo favorito.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormField label="Nombre completo" htmlFor="name" error={errors.name?.message}>
              <input
                id="name"
                placeholder="Nombre y apellidos"
                {...register("name", { required: "El nombre es obligatorio" })}
              />
            </FormField>

            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email", { required: "El email es obligatorio" })}
              />
            </FormField>

            <FormField label="Contraseña" htmlFor="password" error={errors.password?.message}>
              <input
                id="password"
                type="password"
                placeholder="Minimo 6 caracteres"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 6, message: "Minimo 6 caracteres" },
                })}
              />
            </FormField>

            <FormField
              label="Confirmar contraseña"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                {...register("confirmPassword", {
                  required: "Confirma la contraseña",
                  validate: (value) => value === password || "Las contraseñas no coinciden",
                })}
              />
            </FormField>

            {serverError && <p className="auth-error">{serverError}</p>}

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
