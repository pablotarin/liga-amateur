/**
 * Captura rutas inexistentes (404) antes de llegar al errorHandler.
 */
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Ruta no encontrada: ${req.originalUrl}`));
};

/**
 * Middleware de error centralizado. Cualquier `throw new Error(...)` dentro de un
 * controlador envuelto en asyncHandler acaba aqui en lugar de tumbar el servidor.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
