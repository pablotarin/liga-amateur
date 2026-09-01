import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    // admin  -> control total de la liga (equipos, jugadores, partidos, usuarios)
    // manager-> gestiona unicamente su propio equipo y sus jugadores
    // player -> solo lectura de su perfil, su equipo y el calendario
    role: {
      type: String,
      enum: ["admin", "manager", "player"],
      default: "player",
    },
    // Un manager o un player pertenecen a un equipo. Los admin no.
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // id de Cloudinary, util para poder borrarla
    },
  },
  { timestamps: true }
);

// Hashea la contraseña automaticamente antes de guardar, solo si ha cambiado
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo de instancia para comparar la contraseña introducida en el login
userSchema.methods.matchPassword = async function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Nunca exponer el hash de la contraseña en las respuestas JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
