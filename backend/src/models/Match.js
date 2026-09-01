import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    externalId: { type: String, unique: true, sparse: true },
    jornada: { type: Number, required: true },
    date: { type: Date, required: true },
    // Relacion con dos documentos de Team, igual que "ventas" relacionaba
    // vehiculo + cliente en el ejemplo del concesionario.
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    venue: { type: String },
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
    status: {
      type: String,
      enum: ["programado", "jugado", "cancelado"],
      default: "programado",
    },
  },
  { timestamps: true }
);

matchSchema.index({ homeTeam: 1, awayTeam: 1, jornada: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);
