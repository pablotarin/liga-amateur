import express from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getStandings,
} from "../controllers/matchController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// IMPORTANTE: la ruta estatica "/standings/table" debe ir antes de "/:id"
// para que Express no la confunda con un id de partido.
router.get("/standings/table", getStandings);

router.get("/", getMatches);
router.get("/:id", getMatchById);

router.post("/", protect, authorize("admin"), createMatch);
router.put("/:id", protect, authorize("admin"), updateMatch);
router.delete("/:id", protect, authorize("admin"), deleteMatch);

export default router;
