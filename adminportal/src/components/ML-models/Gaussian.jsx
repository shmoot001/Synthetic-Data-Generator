import React, { useState } from "react";
import FileDropzone from "../main-components/FileDropzone";
import { trainModelFromFile, generateData, exportData } from "../../api/gaussianApi";
import { IDSInput, IDSButton, IDSAlert, IDSCard } from '@inera/ids-react';
import GeneratedDataTable from "../main-components/GeneratedDataTable";

const Gaussian = () => {
  const [trainingStatus, setTrainingStatus] = useState("");
  const [generatedData, setGeneratedData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Träningsparametrar
  const [batchSize, setBatchSize] = useState("");
  const [epochs, setEpochs] = useState(10);
  const [modelPath, setModelPath] = useState("model.pkl");
  const [sampleRows, setSampleRows] = useState("");

  // För generering
  const [numRows, setNumRows] = useState(10);
  const [canGenerate, setCanGenerate] = useState(false);

  const [alertType, setAlertType] = useState(null); // "success", "error", "info", "attention"
  const [alertMessage, setAlertMessage] = useState("");


  const handleFileUpload = (acceptedFiles) => {
    setUploadedFile(acceptedFiles[0]);
  };

  const handleExport = async (format) => {
    try {
      const res = await exportData(format, parseInt(numRows), "gaussian");
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `synthetic_data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export ${format}`, error);
      setAlertType("error");
      setAlertMessage(`Failed to export ${format.toUpperCase()} ❌`);
    }
  };

  const handleTrain = async () => {
    if (!uploadedFile || !modelPath) {
      setAlertType("attention");
      setAlertMessage("File and model path are required.");
      return;
    }

    try {
      setAlertType("info");
      setAlertMessage("Training in progress...");

      const trainResponse = await trainModelFromFile(
        uploadedFile,
        "gaussian",
        {
          batch_size: batchSize ? parseInt(batchSize) : undefined,
          epochs: parseInt(epochs),
          model_path: modelPath,
          sample_rows: sampleRows ? parseInt(sampleRows) : undefined,
        }
      );

      console.log("Training response:", trainResponse);

      setAlertType("success");
      setAlertMessage("Training done ✅");
      setCanGenerate(true);
    } catch (error) {
      console.error("Error during training:", error);
      setAlertType("error");
      setAlertMessage("Error during training ❌");
    }
  };


  const handleGenerate = async () => {
    try {
      const synthetic = await generateData(parseInt(numRows), "gaussian");
      setGeneratedData(synthetic);
    } catch (error) {
      console.error("Error during generation:", error);
      alert("Error during data generation");
    }
  };

  return (
    <div>
      <>
      <IDSCard borderTop={2}>
        <h2 className="ids-heading-m">
            Gaussian Model
        </h2>
        <h3 className="ids-heading-s">
            Upload your dataset to train the Gaussian model, then generate synthetic data.
        </h3>
        <FileDropzone onFilesSelected={handleFileUpload} />
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>
          <IDSInput
            label="Batch size"
            placeholder="e.g. 1000"
            id="batch-size"
            type="number"
            style={{ width: "250px" }}
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            errorMsg=""
            hint=""
            icon=""
            oldIcon={null}
            tooltip={null}
          />

          <IDSInput
            label="Epochs"
            placeholder="e.g. 10"
            id="epochs"
            type="number"
            style={{ width: "250px" }}
            value={epochs}
            onChange={(e) => setEpochs(e.target.value)}
            errorMsg=""
            hint=""
            icon=""
            oldIcon={null}
            tooltip={null}
          />

          <IDSInput
            label="Model path *"
            placeholder="e.g. model.pkl"
            id="model-path"
            type="text"
            value={modelPath}
            onChange={(e) => setModelPath(e.target.value)}
            errorMsg=""
            hint=""
            icon=""
            oldIcon={null}
            tooltip={null}
          />

          <IDSInput
            label="Sample rows"
            placeholder="e.g. 5000"
            id="sample-rows"
            type="number"
            value={sampleRows}
            onChange={(e) => setSampleRows(e.target.value)}
            errorMsg=""
            hint=""
            icon=""
            oldIcon={null}
            tooltip={null}
          />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <IDSButton
            icon={null}
            oldIcon={null}
            onClick={handleTrain}
            size="m"
            type="primary"
            disabled={!uploadedFile}
          >
            Train Model
          </IDSButton>
        {alertType && (
          <div style={{ marginTop: "1rem" }}>
            <IDSAlert
              dismissible
              ribbon
              srIconTitle={`${alertType} icon`}
              type={alertType}
            >
              {alertMessage}
            </IDSAlert>
          </div>
        )}
        </div>


      </IDSCard>
    </>


      {canGenerate && (
        <div style={{ marginTop: "1rem" }}>
        <IDSCard borderTop={2}>

          <h3 className="ids-heading-s">
              {`Upload your dataset to train the Gaussian model, then generate synthetic data.`}
          </h3>
          <IDSInput
            label="Number rows"
            placeholder="e.g. 1000"
            id="numRows"
            type="number"
            value={numRows}
            onChange={(e) => setNumRows(e.target.value)}
            errorMsg=""
            hint=""
            icon=""
            oldIcon={null}
            tooltip={null}
          />
          <br />
          <IDSButton
            icon={null}
            oldIcon={null}
            onClick={handleGenerate}
            size="m"
            type="primary"
            disabled={!uploadedFile}
          >
            Generate Data
        </IDSButton>
        {generatedData.length > 0 && (
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <IDSButton
              icon={null}
              oldIcon={null}
              onClick={() => handleExport("json")}
              size="m"
              type="primary"
            >
              Export to JSON
            </IDSButton>
            <IDSButton
              icon={null}
              oldIcon={null}
              onClick={() => handleExport("csv")}
              size="m"
              type="primary"
            >
              Export to CSV
            </IDSButton>
          </div>
        )}
        </IDSCard>
        </div>
      )}

      <GeneratedDataTable generatedData={generatedData} />

    </div>
  );
};

export default Gaussian;
