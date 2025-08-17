import React from "react";
import { IDSAlert } from "@inera/ids-react";

const TrainingAlert = ({ alertType, alertMessage, taskId, taskState }) => {
  if (!alertType) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <IDSAlert dismissible ribbon type={alertType}>
        {alertMessage}
      </IDSAlert>
      {taskId && (
        <p className="ids-body" style={{ marginTop: "0.5rem" }}>
          Task: <code>{taskId}</code>
          {taskState ? ` • Status: ${taskState}` : ""}
        </p>
      )}
    </div>
  );
};

export default TrainingAlert;