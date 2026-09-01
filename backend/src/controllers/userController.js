import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import uploadBufferToCloudinary from "../utils/cloudinaryUpload.js";

// @desc    Listar usuarios
// @route   GET /api/users
// @access  Privado (admin)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate("team", "name city").sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Cambiar el rol / equipo asignado de un usuario
// @route   PUT /api/users/:id/role
// @access  Privado (admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role, team } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("Usuario no encontrado");
  }

  if (role) user.role = role;
  if (team !== undefined) user.team = team || null;

  const updated = await user.save();
  res.json(updated);
});

// @desc    Borrar un usuario
// @route   DELETE /api/users/:id
// @access  Privado (admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("Usuario no encontrado");
  }
  await user.deleteOne();
  res.json({ message: "Usuario eliminado correctamente" });
});

// @desc    Actualizar los datos del propio perfil (nombre) o su avatar
// @route   PUT /api/users/me
// @access  Privado (cualquier usuario autenticado)
export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.name) user.name = req.body.name;
  const updated = await user.save();
  res.json(updated);
});

// @desc    Subir avatar del propio usuario
// @route   POST /api/users/me/avatar
// @access  Privado
export const uploadMyAvatar = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error(
      "La subida de imagenes no esta activada: configura las variables de Cloudinary en el servidor"
    );
  }
  if (!req.file) {
    res.status(400);
    throw new Error("No se ha recibido ningun archivo de imagen");
  }

  const user = await User.findById(req.user._id);
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "liga-amateur/avatars");
  user.avatar = { url, publicId };
  await user.save();
  res.json(user);
});
