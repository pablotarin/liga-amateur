import express from "express";
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  uploadTeamLogo,
} from "../controllers/teamController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getTeams);
router.get("/:id", getTeamById);

router.post("/", protect, authorize("admin"), createTeam);
router.put("/:id", protect, authorize("admin", "manager"), updateTeam);
router.delete("/:id", protect, authorize("admin"), deleteTeam);

router.post(
  "/:id/logo",
  protect,
  authorize("admin", "manager"),
  upload.single("logo"),
  uploadTeamLogo
);

export default router;
