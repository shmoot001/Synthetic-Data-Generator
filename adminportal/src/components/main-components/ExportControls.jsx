import React from "react";
import { IDSButton } from "@inera/ids-react";

const ExportControls = ({ handleExport, handleSaveToDb, numRows }) => {
  return (
    <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <IDSButton onClick={() => handleExport("json")} size="m" type="primary">
        Export to JSON
      </IDSButton>
      <IDSButton onClick={() => handleExport("csv")} size="m" type="primary">
        Export to CSV
      </IDSButton>
      <IDSButton
        onClick={handleSaveToDb}
        size="m"
        type="secondary"
        disabled={!numRows || parseInt(numRows, 10) <= 0}
      >
        Save to MongoDB
      </IDSButton>
    </div>
  );
};

export default ExportControls;