import React from "react";
import { IDSCard } from "@inera/ids-react";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <div
      className="ids-container"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <IDSCard borderTop={2} style={{ width: "110%" }}>
        <h2 className="ids-heading-s">Login</h2>
        <LoginForm />
      </IDSCard>
    </div>
  );
};

export default LoginPage;
