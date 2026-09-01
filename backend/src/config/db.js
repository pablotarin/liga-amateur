import mongoose from "mongoose";

/**
 * Abre la conexion con MongoDB usando la URI definida en las variables de entorno.
 * Se llama una unica vez desde server.js al arrancar la aplicacion.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado -> ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
