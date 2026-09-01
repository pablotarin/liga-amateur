import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Registrar un nuevo usuario (por defecto rol "player")
// @route   POST /api/auth/register
// @access  Publico
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Nombre, email y contraseña son obligatorios");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("Ya existe una cuenta registrada con ese email");
  }

  // El registro publico siempre crea usuarios "player": los roles admin/manager
  // los asigna un admin desde el panel de gestion de usuarios.
  const user = await User.create({ name, email, password, role: "player" });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Publico
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Email o contraseña incorrectos");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    team: user.team,
    token: generateToken(user._id),
  });
});

// @desc    Perfil del usuario autenticado
// @route   GET /api/auth/me
// @access  Privado
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("team", "name city logo");
  res.json(user);
});
