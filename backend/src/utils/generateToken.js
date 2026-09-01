import jwt from "jsonwebtoken";

/**
 * Genera un JWT firmado que contiene el id del usuario.
 * El resto de datos (rol, equipo...) se leen de BBDD en cada peticion protegida,
 * asi que si un admin cambia el rol de alguien, el cambio aplica en el siguiente request.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export default generateToken;
