import asyncHandler from "express-async-handler";
import Team from "../models/Team.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import uploadBufferToCloudinary from "../utils/cloudinaryUpload.js";

// @desc    Listar todos los equipos
// @route   GET /api/teams
// @access  Publico
export const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find().sort({ name: 1 });
  res.json(teams);
});

// @desc    Detalle de un equipo + su plantilla
// @route   GET /api/teams/:id
// @access  Publico
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate({
    path: "players",
    options: { sort: { dorsal: 1 } },
  });

  if (!team) {
    res.status(404);
    throw new Error("Equipo no encontrado");
  }
  res.json(team);
});

// @desc    Crear un equipo
// @route   POST /api/teams
// @access  Privado (admin)
export const createTeam = asyncHandler(async (req, res) => {
  const team = await Team.create(req.body);
  res.status(201).json(team);
});

// @desc    Actualizar un equipo
// @route   PUT /api/teams/:id
// @access  Privado (admin, o manager solo de SU equipo)
export const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error("Equipo no encontrado");
  }

  // Un manager solo puede editar su propio equipo
  if (req.user.role === "manager" && String(team._id) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes editar la informacion de tu propio equipo");
  }

  Object.assign(team, req.body);
  const updated = await team.save();
  res.json(updated);
});

// @desc    Borrar un equipo
// @route   DELETE /api/teams/:id
// @access  Privado (admin)
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error("Equipo no encontrado");
  }
  await team.deleteOne();
  res.json({ message: "Equipo eliminado correctamente" });
});

// @desc    Subir/actualizar el escudo del equipo
// @route   POST /api/teams/:id/logo
// @access  Privado (admin, o manager de ese equipo)
export const uploadTeamLogo = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error(
      "La subida de imagenes no esta activada: configura las variables de Cloudinary en el servidor"
    );
  }

  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(404);
    throw new Error("Equipo no encontrado");
  }

  if (req.user.role === "manager" && String(team._id) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes actualizar el escudo de tu propio equipo");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No se ha recibido ningun archivo de imagen");
  }

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "liga-amateur/teams");
  team.logo = { url, publicId };
  await team.save();
  res.json(team);
});
