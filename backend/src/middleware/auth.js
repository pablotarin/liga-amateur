import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * Comprueba que la peticion trae un JWT valido en el header Authorization: Bearer <token>.
 * Si es valido, cuelga el usuario (sin password) en req.user para los siguientes middlewares.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("No autorizado: falta el token de acceso");
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error("No autorizado: el usuario ya no existe");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("No autorizado: token invalido o caducado");
  }
});

/**
 * Middleware de autorizacion por rol. Uso: authorize("admin"), authorize("admin", "manager")
 * Debe ejecutarse siempre despues de `protect`.
 */
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Accion no permitida para el rol '${req.user?.role || "invitado"}'`
      );
    }
    next();
  };
