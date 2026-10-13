/**
 * Devuelve un objeto nuevo con SOLO las claves permitidas de `source`.
 * Se usa como lista blanca antes de guardar req.body en Mongo, para evitar
 * "mass assignment": que un usuario envie campos que no le corresponden
 * (por ejemplo, un manager mandando `team` para mover un jugador a otro club).
 */
const pickFields = (source = {}, allowedFields = []) =>
  Object.fromEntries(Object.entries(source).filter(([key]) => allowedFields.includes(key)));

export default pickFields;