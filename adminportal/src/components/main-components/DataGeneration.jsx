import React from "react";
import { IDSInput, IDSButton, IDSCard } from "@inera/ids-react";

const DataGeneration = ({ numRows, setNumRows, handleGenerate, canGenerate, modelName }) => {
  return (
    <IDSCard borderTop={2}>
      <h3 className="ids-heading-s">Generate synthetic data from your trained model.</h3>

      <IDSInput
        label="Number of rows"
        placeholder="e.g. 1000"
        id="numRows"
        type="number"
        value={numRows}
        onChange={(e) => setNumRows(e.target.value)}
      />
      <br />

      <IDSButton
        onClick={handleGenerate}
        size="m"
        type="primary"
        disabled={!canGenerate || !modelName}
      >
        Generate Data
      </IDSButton>
    </IDSCard>
  );
};

export default DataGeneration;