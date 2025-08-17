// src/api/ctganApi.js
import axios from "axios";

const BASE_URL = "/api/ctgan";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const trainModelFromFile = async (file, modelName, config = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  const params = {
    model_name: modelName,
    epochs: Number.isFinite(config.epochs) ? parseInt(config.epochs, 10) : undefined,
    batch_size: Number.isFinite(config.batch_size) ? parseInt(config.batch_size, 10) : undefined,
    sample_rows: Number.isFinite(config.sample_rows) ? parseInt(config.sample_rows, 10) : undefined,
  };

  return axios.post(`${BASE_URL}/train-file`, formData, {
    params,
    headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
  });
};

export const trainModelWithCelery = async (file, modelName, config = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  const params = {
    model_name: modelName,
    epochs: Number.isFinite(config.epochs) ? parseInt(config.epochs, 10) : undefined,
    batch_size: Number.isFinite(config.batch_size) ? parseInt(config.batch_size, 10) : undefined,
    sample_rows: Number.isFinite(config.sample_rows) ? parseInt(config.sample_rows, 10) : undefined,
    verbose: config.verbose ?? true,
  };

  return axios.post(`${BASE_URL}/train-file-celery`, formData, {
    params,
    headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
  });
};

export const generateData = async (numRows = 10) => {
  const res = await axios.post(
    `${BASE_URL}/generate`,
    { num_rows: parseInt(numRows, 10) },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
  return res.data;
};

export const exportData = async (format, numRows) => {
  return axios.post(
    `${BASE_URL}/export`,
    { num_rows: parseInt(numRows, 10), format },
    {
      headers: { "Content-Type": "application/json", ...authHeaders() },
      responseType: "blob",
    }
  );
};

export const downloadTrainedModel = async (modelName) => {
  return axios.get(`${BASE_URL}/download-model`, {
    params: { model_name: modelName },
    responseType: "blob",
    headers: { ...authHeaders() },
    validateStatus: (status) => status >= 200 && status < 500,
  });
};

export const listAvailableModels = async () => {
  return axios.get(`${BASE_URL}/download-models`, { headers: { ...authHeaders() } });
};

export const loadModelFromFile = async (filePath) => {
  return axios.post(
    `${BASE_URL}/load-model`,
    { path: filePath },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
};

export const fetchDbData = async () => {
  const res = await axios.get(`${BASE_URL}/db-data`, { headers: { ...authHeaders() } });
  return res.data;
};

export const saveGeneratedToDb = async (numRows) => {
  return axios.post(
    `${BASE_URL}/save-to-db`,
    { num_rows: parseInt(numRows, 10) },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
};

export const getTaskStatus = async (taskId) => {
  return axios.get(`${BASE_URL}/task-status/${taskId}`, { headers: { ...authHeaders() } });
};

export const saveModelToFile = async (path) => {
  return axios.post(
    "/api/ctgan/save-model",
    { path },
    { headers: { "Content-Type": "application/json", ...authHeaders() } }
  );
};