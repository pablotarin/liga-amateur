import { v2 as cloudinary } from "cloudinary";

// La subida de imagenes (escudos de equipo, fotos de jugador/avatar) es OPCIONAL.
// Si no se configuran las variables de entorno de Cloudinary, las rutas de subida
// devolveran un error controlado en lugar de romper el arranque del servidor.
const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary, isCloudinaryConfigured };
