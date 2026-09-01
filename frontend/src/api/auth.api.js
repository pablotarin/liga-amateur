import axiosClient from "./axiosClient";

export const loginRequest = (credentials) =>
  axiosClient.post("/auth/login", credentials).then((res) => res.data);

export const registerRequest = (data) =>
  axiosClient.post("/auth/register", data).then((res) => res.data);

export const getMeRequest = () => axiosClient.get("/auth/me").then((res) => res.data);
