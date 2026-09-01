import axiosClient from "./axiosClient";

export const fetchTeams = () => axiosClient.get("/teams").then((res) => res.data);

export const fetchTeamById = (id) => axiosClient.get(`/teams/${id}`).then((res) => res.data);

export const createTeamRequest = (data) =>
  axiosClient.post("/teams", data).then((res) => res.data);

export const updateTeamRequest = (id, data) =>
  axiosClient.put(`/teams/${id}`, data).then((res) => res.data);

export const deleteTeamRequest = (id) => axiosClient.delete(`/teams/${id}`).then((res) => res.data);

export const uploadTeamLogoRequest = (id, file) => {
  const formData = new FormData();
  formData.append("logo", file);
  return axiosClient
    .post(`/teams/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
