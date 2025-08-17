import axios from "axios";

const BASE_URL = "/api/gaussian"; 

// Tränar modellen med filuppladdning
export const trainModelFromFile = async (file, modelType = "gaussian", params = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");

  const res = await axios.post(`/api/${modelType}/train-file`, formData, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// Genererar syntetisk data efter träning
export const generateData = async (numRows = 10, modelType = "gaussian") => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${BASE_URL}/generate`, {
    num_rows: numRows,
  }, {
    params: {
      model_type: modelType
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const exportData = async (format, numRows, modelType = "gaussian") => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`/api/${modelType}/export`, {
    num_rows: numRows,
    format: format,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob", 
  });

  return res;
};
