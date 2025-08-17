import axios from "axios";

export async function login(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const token = await response.text(); 
  localStorage.setItem("token", token);

  return token;
}


export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};