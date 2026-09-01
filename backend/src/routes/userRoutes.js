import express from "express";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  updateMyProfile,
  uploadMyAvatar,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Rutas del propio perfil (cualquier usuario autenticado)
router.put("/me", protect, updateMyProfile);
router.post("/me/avatar", protect, upload.single("avatar"), uploadMyAvatar);

// Gestion de usuarios (solo admin)
router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/:id", protect, authorize("admin"), deleteUser);

export default router;
