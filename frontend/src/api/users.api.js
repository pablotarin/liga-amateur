import axiosClient from "./axiosClient";

export const fetchUsers = () => axiosClient.get("/users").then((res) => res.data);

export const updateUserRoleRequest = (id, data) =>
  axiosClient.put(`/users/${id}/role`, data).then((res) => res.data);

export const deleteUserRequest = (id) => axiosClient.delete(`/users/${id}`).then((res) => res.data);

export const updateMyProfileRequest = (data) =>
  axiosClient.put("/users/me", data).then((res) => res.data);

export const uploadMyAvatarRequest = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return axiosClient
    .post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
