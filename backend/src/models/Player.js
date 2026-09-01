import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    externalId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    position: {
      type: String,
      enum: ["Portero", "Defensa", "Centrocampista", "Delantero"],
      required: true,
    },
    dorsal: { type: Number, required: true, min: 1, max: 99 },
    birthdate: { type: Date },
    nationality: { type: String },
    photo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    stats: {
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
    },
    // Si el jugador tiene tambien cuenta de acceso (rol "player")
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Un dorsal no puede repetirse dentro del mismo equipo
playerSchema.index({ team: 1, dorsal: 1 }, { unique: true });

export default mongoose.model("Player", playerSchema);
