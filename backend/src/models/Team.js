import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    // teamId "legible" del Excel (T001...), se conserva para trazabilidad de la semilla
    externalId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true },
    foundedYear: { type: Number },
    stadium: { type: String },
    colorPrimary: { type: String, default: "#1E3A8A" },
    colorSecondary: { type: String, default: "#FFFFFF" },
    coachName: { type: String },
    logo: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    // Referencia inversa al usuario manager que administra este equipo (opcional)
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Virtual: jugadores del equipo (relacion 1-N, no se guarda en el documento)
teamSchema.virtual("players", {
  ref: "Player",
  localField: "_id",
  foreignField: "team",
});

teamSchema.set("toJSON", { virtuals: true });
teamSchema.set("toObject", { virtuals: true });

export default mongoose.model("Team", teamSchema);
