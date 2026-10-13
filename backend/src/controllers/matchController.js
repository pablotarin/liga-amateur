import asyncHandler from "express-async-handler";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import pickFields from "../utils/pickFields.js";

const MATCH_FIELDS = [
  "jornada",
  "date",
  "homeTeam",
  "awayTeam",
  "venue",
  "homeScore",
  "awayScore",
  "status",
];

// @desc    Listar partidos (admite filtros ?team=&jornada=&status=)
// @route   GET /api/matches
// @access  Publico
export const getMatches = asyncHandler(async (req, res) => {
  const { team, jornada, status } = req.query;
  const filter = {};
  if (team) filter.$or = [{ homeTeam: team }, { awayTeam: team }];
  if (jornada) filter.jornada = Number(jornada);
  if (status) filter.status = status;

  const matches = await Match.find(filter)
    .populate("homeTeam", "name city colorPrimary logo")
    .populate("awayTeam", "name city colorPrimary logo")
    .sort({ jornada: 1, date: 1 });
  res.json(matches);
});

// @desc    Detalle de un partido
// @route   GET /api/matches/:id
// @access  Publico
export const getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id)
    .populate("homeTeam", "name city colorPrimary logo")
    .populate("awayTeam", "name city colorPrimary logo");
  if (!match) {
    res.status(404);
    throw new Error("Partido no encontrado");
  }
  res.json(match);
});

// @desc    Crear partido
// @route   POST /api/matches
// @access  Privado (admin)
export const createMatch = asyncHandler(async (req, res) => {
  const match = await Match.create(pickFields(req.body, MATCH_FIELDS));
  res.status(201).json(match);
});

// @desc    Actualizar partido (fecha, resultado, estado...)
// @route   PUT /api/matches/:id
// @access  Privado (admin)
export const updateMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) {
    res.status(404);
    throw new Error("Partido no encontrado");
  }
  Object.assign(match, pickFields(req.body, MATCH_FIELDS));
  const updated = await match.save();
  res.json(updated);
});

// @desc    Borrar partido
// @route   DELETE /api/matches/:id
// @access  Privado (admin)
export const deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) {
    res.status(404);
    throw new Error("Partido no encontrado");
  }
  await match.deleteOne();
  res.json({ message: "Partido eliminado correctamente" });
});

// @desc    Clasificacion de la liga calculada a partir de los partidos jugados
// @route   GET /api/matches/standings/table
// @access  Publico
export const getStandings = asyncHandler(async (req, res) => {
  const teams = await Team.find();
  const playedMatches = await Match.find({ status: "jugado" });

  const table = teams.map((team) => ({
    team: { _id: team._id, name: team.name, city: team.city, logo: team.logo },
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  }));

  const byId = Object.fromEntries(table.map((row) => [String(row.team._id), row]));

  for (const m of playedMatches) {
    const home = byId[String(m.homeTeam)];
    const away = byId[String(m.awayTeam)];
    if (!home || !away || m.homeScore === null || m.awayScore === null) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const standings = Object.values(byId)
    .map((row) => ({ ...row, goalDiff: row.goalsFor - row.goalsAgainst }))
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);

  res.json(standings);
});
