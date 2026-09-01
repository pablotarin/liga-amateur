import axiosClient from "./axiosClient";

export const fetchMatches = (params = {}) =>
  axiosClient.get("/matches", { params }).then((res) => res.data);

export const fetchMatchById = (id) => axiosClient.get(`/matches/${id}`).then((res) => res.data);

export const fetchStandings = () =>
  axiosClient.get("/matches/standings/table").then((res) => res.data);

export const createMatchRequest = (data) =>
  axiosClient.post("/matches", data).then((res) => res.data);

export const updateMatchRequest = (id, data) =>
  axiosClient.put(`/matches/${id}`, data).then((res) => res.data);

export const deleteMatchRequest = (id) =>
  axiosClient.delete(`/matches/${id}`).then((res) => res.data);
