import axios from "axios";

const BASE_URL = "/api/gpt2"; 

export const generateText = async (prompt, modelType = "gpt2") => {
    const token = localStorage.getItem("token");
    
    const res = await axios.post(`${BASE_URL}/generate`, {
        prompt: prompt,
    }, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
    
    return res.data;
}
