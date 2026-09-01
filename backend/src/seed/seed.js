/**
 * Script de semilla (seed).
 *
 * Lee los ficheros CSV exportados desde el Excel de datos (/database/csv) usando el
 * modulo nativo `fs` de Node.js + `csv-parse`, y publica los documentos en MongoDB
 * respetando las relaciones entre colecciones:
 *
 *   users  -> se crean primero (independientes)
 *   teams  -> se crean y, si el CSV de users trae un manager para ese equipo, se enlazan
 *   players-> cada jugador guarda la referencia (ObjectId) al equipo al que pertenece
 *   matches-> cada partido guarda la referencia (ObjectId) a su equipo local y visitante
 *
 * Uso:
 *   npm run seed            -> puebla la base de datos (upsert por externalId/email)
 *   npm run seed:destroy    -> vacia las 4 colecciones
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "../config/db.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import Match from "../models/Match.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_DIR = path.join(__dirname, "../../../database/csv");

// Lee y parsea un CSV a un array de objetos usando fs.readFileSync (sincrono, sencillo
// de seguir para un script de un solo uso que se ejecuta de principio a fin).
const readCsv = (filename) => {
  const filePath = path.join(CSV_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true });
};

const toNumberOrNull = (value) => (value === "" || value === undefined ? null : Number(value));

const importData = async () => {
  await connectDB();

  console.log("Vaciando colecciones existentes...");
  await Promise.all([
    User.deleteMany(),
    Team.deleteMany(),
    Player.deleteMany(),
    Match.deleteMany(),
  ]);

  // ---------------------------------------------------------------------
  // 1) USUARIOS
  // ---------------------------------------------------------------------
  const usersCsv = readCsv("users.csv");
  console.log(`Leidos ${usersCsv.length} usuarios de users.csv`);

  // Se crean uno a uno (en vez de insertMany) para que el hook pre('save') del modelo
  // hashee cada contraseña correctamente.
  const createdUsers = [];
  for (const row of usersCsv) {
    const user = await User.create({
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
    });
    createdUsers.push({ externalId: row.userId, teamId: row.teamId || null, user });
  }

  // ---------------------------------------------------------------------
  // 2) EQUIPOS
  // ---------------------------------------------------------------------
  const teamsCsv = readCsv("teams.csv");
  console.log(`Leidos ${teamsCsv.length} equipos de teams.csv`);

  const teamIdMap = {}; // externalId (T001...) -> ObjectId de Mongo
  for (const row of teamsCsv) {
    const team = await Team.create({
      externalId: row.teamId,
      name: row.name,
      city: row.city,
      foundedYear: toNumberOrNull(row.foundedYear),
      stadium: row.stadium,
      colorPrimary: row.colorPrimary,
      colorSecondary: row.colorSecondary,
      coachName: row.coachName,
    });
    teamIdMap[row.teamId] = team._id;
  }

  // Enlazar cada manager con su equipo (relacion User <-> Team en ambos sentidos)
  for (const { teamId, user } of createdUsers) {
    if (!teamId) continue;
    const mongoTeamId = teamIdMap[teamId];
    if (!mongoTeamId) continue;
    user.team = mongoTeamId;
    await user.save();
    await Team.findByIdAndUpdate(mongoTeamId, { manager: user._id });
  }

  // ---------------------------------------------------------------------
  // 3) JUGADORES (relacionados con equipos)
  // ---------------------------------------------------------------------
  const playersCsv = readCsv("players.csv");
  console.log(`Leidos ${playersCsv.length} jugadores de players.csv`);

  const playerDocs = playersCsv.map((row) => ({
    externalId: row.playerId,
    name: row.name,
    team: teamIdMap[row.teamId],
    position: row.position,
    dorsal: Number(row.dorsal),
    birthdate: row.birthdate ? new Date(row.birthdate) : null,
    nationality: row.nationality,
    stats: {
      goals: toNumberOrNull(row.goals) || 0,
      assists: toNumberOrNull(row.assists) || 0,
      yellowCards: toNumberOrNull(row.yellowCards) || 0,
      redCards: toNumberOrNull(row.redCards) || 0,
    },
  }));
  await Player.insertMany(playerDocs);

  // ---------------------------------------------------------------------
  // 4) PARTIDOS (relacionados con dos equipos: local y visitante)
  // ---------------------------------------------------------------------
  const matchesCsv = readCsv("matches.csv");
  console.log(`Leidos ${matchesCsv.length} partidos de matches.csv`);

  const matchDocs = matchesCsv.map((row) => ({
    externalId: row.matchId,
    jornada: Number(row.jornada),
    date: new Date(row.date),
    homeTeam: teamIdMap[row.homeTeamId],
    awayTeam: teamIdMap[row.awayTeamId],
    venue: row.venue,
    homeScore: toNumberOrNull(row.homeScore),
    awayScore: toNumberOrNull(row.awayScore),
    status: row.status,
  }));
  await Match.insertMany(matchDocs);

  console.log("\n Semilla completada con exito:");
  console.log(`   ${createdUsers.length} usuarios`);
  console.log(`   ${teamsCsv.length} equipos`);
  console.log(`   ${playerDocs.length} jugadores`);
  console.log(`   ${matchDocs.length} partidos`);

  await mongoose.connection.close();
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Team.deleteMany(),
    Player.deleteMany(),
    Match.deleteMany(),
  ]);
  console.log("Todas las colecciones han sido vaciadas.");
  await mongoose.connection.close();
  process.exit(0);
};

if (process.argv.includes("--destroy")) {
  destroyData();
} else {
  importData();
}
