import asyncHandler from "express-async-handler";
import Player from "../models/Player.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";
import uploadBufferToCloudinary from "../utils/cloudinaryUpload.js";
import pickFields from "../utils/pickFields.js";

const PLAYER_EDITABLE_FIELDS = ["name", "position", "dorsal", "birthdate", "nationality", "stats"];
const PLAYER_ADMIN_FIELDS = [...PLAYER_EDITABLE_FIELDS, "team"];

// @desc    Listar jugadores (admite filtros ?team=&position=&search=)
// @route   GET /api/players
// @access  Publico
export const getPlayers = asyncHandler(async (req, res) => {
  const { team, position, search } = req.query;
  const filter = {};
  if (team) filter.team = team;
  if (position) filter.position = position;
  if (search) filter.name = { $regex: search, $options: "i" };

  const players = await Player.find(filter)
    .populate("team", "name city colorPrimary logo")
    .sort({ name: 1 });
  res.json(players);
});

// @desc    Detalle de un jugador
// @route   GET /api/players/:id
// @access  Publico
export const getPlayerById = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id).populate("team", "name city logo");
  if (!player) {
    res.status(404);
    throw new Error("Jugador no encontrado");
  }
  res.json(player);
});

// @desc    Crear jugador
// @route   POST /api/players
// @access  Privado (admin, manager de ese equipo)
export const createPlayer = asyncHandler(async (req, res) => {
  if (req.user.role === "manager" && String(req.body.team) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes añadir jugadores a tu propio equipo");
  }
  const player = await Player.create(pickFields(req.body, PLAYER_ADMIN_FIELDS));
  res.status(201).json(player);
});

// @desc    Actualizar jugador (datos o estadisticas)
// @route   PUT /api/players/:id
// @access  Privado (admin, manager del equipo del jugador)
export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) {
    res.status(404);
    throw new Error("Jugador no encontrado");
  }

  if (req.user.role === "manager" && String(player.team) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes editar jugadores de tu propio equipo");
  }

  const allowed = req.user.role === "admin" ? PLAYER_ADMIN_FIELDS : PLAYER_EDITABLE_FIELDS;
  Object.assign(player, pickFields(req.body, allowed));
  const updated = await player.save();
  res.json(updated);
});

// @desc    Borrar jugador
// @route   DELETE /api/players/:id
// @access  Privado (admin, manager del equipo del jugador)
export const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) {
    res.status(404);
    throw new Error("Jugador no encontrado");
  }

  if (req.user.role === "manager" && String(player.team) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes eliminar jugadores de tu propio equipo");
  }

  await player.deleteOne();
  res.json({ message: "Jugador eliminado correctamente" });
});

// @desc    Subir/actualizar la foto del jugador
// @route   POST /api/players/:id/photo
// @access  Privado (admin, manager del equipo del jugador)
export const uploadPlayerPhoto = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    res.status(503);
    throw new Error(
      "La subida de imagenes no esta activada: configura las variables de Cloudinary en el servidor"
    );
  }

  const player = await Player.findById(req.params.id);
  if (!player) {
    res.status(404);
    throw new Error("Jugador no encontrado");
  }

  if (req.user.role === "manager" && String(player.team) !== String(req.user.team)) {
    res.status(403);
    throw new Error("Solo puedes actualizar fotos de tu propio equipo");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No se ha recibido ningun archivo de imagen");
  }

  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "liga-amateur/players");
  player.photo = { url, publicId };
  await player.save();
  res.json(player);
});
