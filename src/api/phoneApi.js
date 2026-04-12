import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// ── Phones ──────────────────────────────────────────────
export const getAllPhones = () => API.get("/phones");
export const getPhoneById = (id) => API.get(`/phones/${id}`);
export const createPhone = (name) => API.post("/phones", { name });
export const deletePhone = (id) => API.delete(`/phones/${id}`);

// ── Models ───────────────────────────────────────────────
export const addModel = (phoneId, modelName, totalAdded) =>
  API.post(`/phones/${phoneId}/models`, { modelName, totalAdded });

export const deleteModel = (phoneId, modelId) =>
  API.delete(`/phones/${phoneId}/models/${modelId}`);

export const updateStock = (phoneId, modelId, action, quantity) =>
  API.patch(`/phones/${phoneId}/models/${modelId}`, { action, quantity });

export const renameModel = (phoneId, modelId, modelName) =>
  API.patch(`/phones/${phoneId}/models/${modelId}/rename`, { modelName });
