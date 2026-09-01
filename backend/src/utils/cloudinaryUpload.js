import { cloudinary } from "../config/cloudinary.js";

/**
 * Sube un buffer de imagen (el que deja multer.memoryStorage en req.file.buffer)
 * a Cloudinary usando un stream, sin pasar por disco. Devuelve la URL segura y
 * el publicId, listos para guardar en el documento de Mongo correspondiente.
 */
const uploadBufferToCloudinary = (buffer, folder = "liga-amateur") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 600, height: 600, crop: "limit" }] },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });

export default uploadBufferToCloudinary;
