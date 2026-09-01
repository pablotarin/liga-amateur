import multer from "multer";

// Multer solo recibe el archivo en memoria (como buffer); la subida real a
// Cloudinary la hace src/utils/cloudinaryUpload.js. Antes se usaba el paquete
// `multer-storage-cloudinary`, pero solo soporta cloudinary v1, que tiene una
// vulnerabilidad de seguridad conocida (inyeccion de argumentos). Al subir el
// buffer nosotros mismos podemos usar cloudinary v2 (parcheado) sin depender
// de un paquete intermedio sin mantenimiento.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Formato de imagen no soportado (usa jpg, png o webp)"));
    }
    cb(null, true);
  },
});

export default upload;
