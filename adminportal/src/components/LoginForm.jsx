import React, { useState } from "react";
import { IDSInput, IDSButton } from "@inera/ids-react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(username, password);
      localStorage.setItem("jwt", token);
      alert("Login successful");

      // Navigera till start
      navigate("/start");
    } catch (error) {
      alert("Login error: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <IDSInput
        label="Username"
        placeholder="Enter Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <IDSInput
        label="Password"
        placeholder="Password"
        required
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <IDSButton submit type="submit">
        Login
      </IDSButton>
    </form>
  );
};

export default LoginForm;
