import axiosClient from "./axiosClient";

export const fetchPlayers = (params = {}) =>
  axiosClient.get("/players", { params }).then((res) => res.data);

export const fetchPlayerById = (id) => axiosClient.get(`/players/${id}`).then((res) => res.data);

export const createPlayerRequest = (data) =>
  axiosClient.post("/players", data).then((res) => res.data);

export const updatePlayerRequest = (id, data) =>
  axiosClient.put(`/players/${id}`, data).then((res) => res.data);

export const deletePlayerRequest = (id) =>
  axiosClient.delete(`/players/${id}`).then((res) => res.data);

export const uploadPlayerPhotoRequest = (id, file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return axiosClient
    .post(`/players/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
