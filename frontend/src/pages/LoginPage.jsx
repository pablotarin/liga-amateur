import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import "./AuthPages.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (formData) => {
    setServerError(null);
    try {
      await login(formData);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-container">
        <div className="auth-card">
          <h1>Iniciar sesion</h1>
          <p>Accede para gestionar tu equipo o administrar la liga.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                placeholder="••••••••"
                {...register("password", { required: "La contraseña es obligatoria" })}
              />
            </FormField>

            {serverError && <p className="auth-error">{serverError}</p>}

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="auth-switch">
            ¿Aun no tienes cuenta? <Link to="/registro">Registrate aqui</Link>
          </p>

          <div className="auth-demo">
            <strong>Cuentas de prueba:</strong>
            <span>admin@ligaamateur.com / Admin123!</span>
            <span>Managers: ver database/csv/users.csv (contraseña Manager123!)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
