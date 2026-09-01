import express from "express";
import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  uploadPlayerPhoto,
} from "../controllers/playerController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getPlayers);
router.get("/:id", getPlayerById);

router.post("/", protect, authorize("admin", "manager"), createPlayer);
router.put("/:id", protect, authorize("admin", "manager"), updatePlayer);
router.delete("/:id", protect, authorize("admin", "manager"), deletePlayer);

router.post(
  "/:id/photo",
  protect,
  authorize("admin", "manager"),
  upload.single("photo"),
  uploadPlayerPhoto
);

export default router;
