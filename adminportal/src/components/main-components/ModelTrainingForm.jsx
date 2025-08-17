import React from "react";
import { IDSInput, IDSButton } from "@inera/ids-react";

const ModelTrainingForm = ({
  batchSize,
  setBatchSize,
  epochs,
  setEpochs,
  modelName,
  setModelName,
  sampleRows,
  setSampleRows,
  uploadedFile,
  handleTrain,
  handleTrainWithCelery,
}) => {
  return (
    <>
      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
        }}
      >
        <IDSInput
          label="Batch size"
          placeholder="e.g. 1000"
          id="batch-size"
          type="number"
          style={{ width: "250px" }}
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
        />

        <IDSInput
          label="Epochs"
          placeholder="e.g. 10"
          id="epochs"
          type="number"
          style={{ width: "250px" }}
          value={epochs}
          onChange={(e) => setEpochs(e.target.value)}
        />

        <IDSInput
          label="Model name *"
          placeholder="e.g. ctgan"
          id="model-name"
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />

        <IDSInput
          label="Sample rows"
          placeholder="e.g. 5000"
          id="sample-rows"
          type="number"
          value={sampleRows}
          onChange={(e) => setSampleRows(e.target.value)}
        />
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <IDSButton
          onClick={handleTrain}
          size="m"
          type="primary"
          disabled={!uploadedFile || !modelName}
        >
          Train Model (sync)
        </IDSButton>

        <IDSButton
          onClick={handleTrainWithCelery}
          size="m"
          type="primary"
          disabled={!uploadedFile || !modelName}
        >
          Train with Celery (async)
        </IDSButton>
      </div>
    </>
  );
};

export default ModelTrainingForm;