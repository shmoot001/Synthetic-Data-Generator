import React, { useState, useEffect, useRef } from "react";
import FileDropzone from "../main-components/FileDropzone";
import {
  trainModelFromFile,
  generateData,
  exportData,
  downloadTrainedModel,
  listAvailableModels,
  loadModelFromFile,
  saveGeneratedToDb,
  trainModelWithCelery,
  getTaskStatus,
  saveModelToFile
} from "../../api/ctganApi";
import { IDSCard } from "@inera/ids-react";
import GeneratedDataTable from "../main-components/GeneratedDataTable";
import ModelTrainingForm from "../main-components/ModelTrainingForm";
import ModelSelection from "../main-components/ModelSelection";
import DataGeneration from "../main-components/DataGeneration";
import ExportControls from "../main-components/ExportControls";
import TrainingAlert from "../main-components/TrainingAlert";
import DbDataViewer from "../main-components/DbDataViewer";


const CTGAN = () => {
  // State declarations
  const [generatedData, setGeneratedData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [batchSize, setBatchSize] = useState("");
  const [epochs, setEpochs] = useState(10);
  const [modelName, setModelName] = useState("ctgan");
  const [sampleRows, setSampleRows] = useState("");
  const [numRows, setNumRows] = useState(10);
  const [canGenerate, setCanGenerate] = useState(false);
  const [alertType, setAlertType] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskState, setTaskState] = useState(null);
  const pollRef = useRef(null);
  const [hasSavedModel, setHasSavedModel] = useState(false);
  const [isSavingModel, setIsSavingModel] = useState(false);
  const [dbRefreshKey, setDbRefreshKey] = useState(0);

  const handleSaveToDb = async () => {
    try {
      setAlertType("info");
      setAlertMessage("Saving to MongoDB...");

      const res = await saveGeneratedToDb(parseInt(numRows, 10));

      setAlertType("success");
      setAlertMessage(res.data?.message || `Saved ${numRows} rows to MongoDB ✅`);

      // NEW: trigga omladdning i DbDataViewer
      setDbRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to save to DB:", error);
      setAlertType("error");
      setAlertMessage(error.response?.data?.detail || "Failed to save to MongoDB");
    }
  };


  // Fetch available models
  const fetchAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await listAvailableModels();
      setAvailableModels(res.data.models || []);
    } catch (error) {
      console.error("Failed to fetch models", error);
      setAlertType("error");
      setAlertMessage("Failed to load available models");
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchAvailableModels();
  }, []);

  // Celery task polling
  useEffect(() => {
    if (!taskId) return;

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await getTaskStatus(taskId);
        const state = res?.data?.state;
        setTaskState(state);

        if (state === "SUCCESS") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setAlertType("success");
          setAlertMessage(`Training completed ✅ (task: ${taskId})`);
          setCanGenerate(true);
          fetchAvailableModels();
        } else if (state === "FAILURE") {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setAlertType("error");
          setAlertMessage(`Training failed ❌ (task: ${taskId})`);
        } else {
          setAlertType("info");
          setAlertMessage(`Training status: ${state} (task: ${taskId})`);
        }
      } catch (err) {
        console.error("Error polling task status:", err);
        clearInterval(pollRef.current);
        pollRef.current = null;
        setAlertType("error");
        setAlertMessage("Error polling task status ❌");
      }
    }, 2000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [taskId]);

  // File upload handler
  const handleFileUpload = (acceptedFiles) => {
    setUploadedFile(acceptedFiles[0]);
  };

  // Export data handler
  const handleExport = async (format) => {
    try {
      const res = await exportData(format, parseInt(numRows, 10), modelName);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `synthetic_data.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setAlertType("success");
      setAlertMessage(`Data exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error(`Failed to export ${format}`, error);
      setAlertType("error");
      setAlertMessage(
        `Failed to export ${format.toUpperCase()}. ` +
        `Server responded with ${error.response?.status || 'no response'}.`
      );
    }
  };

  // Model training handler
  const handleTrain = async () => {
    if (!uploadedFile || !modelName) {
      setAlertType("attention");
      setAlertMessage("File and model name are required.");
      return;
    }
    try {
      setAlertType("info");
      setAlertMessage("Training (sync) in progress...");

      await trainModelFromFile(uploadedFile, modelName, {
        batch_size: batchSize ? parseInt(batchSize, 10) : undefined,
        epochs: parseInt(epochs, 10),
        sample_rows: sampleRows ? parseInt(sampleRows, 10) : undefined,
      });

      setAlertType("success");
      setAlertMessage("Training done ✅");
      setCanGenerate(true);
      await fetchAvailableModels();
    } catch (error) {
      console.error("Error during training:", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.detail || 
        "Error during training. Check console for details."
      );
    }
  };

  // Async training with Celery
  const handleTrainWithCelery = async () => {
    if (!uploadedFile || !modelName) {
      setAlertType("attention");
      setAlertMessage("File and model name are required for async training.");
      return;
    }
    try {
      setAlertType("info");
      setAlertMessage("Submitting training job to Celery...");
      setTaskState("PENDING");
      setTaskId(null);

      const resp = await trainModelWithCelery(uploadedFile, modelName, {
        batch_size: batchSize ? parseInt(batchSize, 10) : undefined,
        epochs: parseInt(epochs, 10),
        sample_rows: sampleRows ? parseInt(sampleRows, 10) : undefined,
        verbose: true,
      });

      const id = resp?.data?.task_id;
      setTaskId(id);
      setAlertType("info");
      setAlertMessage(`Training task submitted. Task ID: ${id}`);
    } catch (error) {
      console.error("Failed to start Celery training:", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.detail || 
        "Failed to submit Celery training task"
      );
    }
  };

  // Data generation handler
  const handleGenerate = async () => {
    try {
      setAlertType("info");
      setAlertMessage("Generating synthetic data...");
      
      const synthetic = await generateData(parseInt(numRows, 10), modelName);
      setGeneratedData(synthetic);
      
      setAlertType("success");
      setAlertMessage(`Successfully generated ${numRows} rows`);
    } catch (error) {
      console.error("Error during generation:", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.detail || 
        "Error during data generation"
      );
    }
  };

  // Model download handler
  const handleDownloadModel = async () => {
    if (!modelName) {
      setAlertType("attention");
      setAlertMessage("Please select a model to download");
      return;
    }
    
    try {
      setIsDownloading(true);
      setAlertType("info");
      setAlertMessage(`Downloading model ${modelName}...`);
      
      const res = await downloadTrainedModel(modelName);
      
      if (res.status === 404) {
        setAlertType("error");
        setAlertMessage(`Model "${modelName}" not found on server`);
        return;
      }
      
      if (res.status === 500) {
        setAlertType("error");
        setAlertMessage(`Server error when downloading model`);
        return;
      }

      const blob = new Blob([res.data], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${modelName}.pkl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setAlertType("success");
      setAlertMessage(`Model "${modelName}" downloaded successfully`);
    } catch (error) {
      console.error("Failed to download model", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.detail || 
        "Failed to download model"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Load model handler
  const handleLoadModel = async () => {
    if (!modelName) {
      setAlertType("attention");
      setAlertMessage("Please select a model name to load.");
      return;
    }
    try {
      setAlertType("info");
      setAlertMessage(`Loading model ${modelName}...`);
      
      const res = await loadModelFromFile(`models/${modelName}.pkl`);
      
      setAlertType("success");
      setAlertMessage(res.data.message || "Model loaded successfully ✅");
      setCanGenerate(true);
    } catch (error) {
      console.error("Error loading model:", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.detail || 
        "Failed to load model"
      );
    }
  };


  const handleSaveModel = async () => {
    if (!modelName) {
      setAlertType("attention");
      setAlertMessage("Please enter/select a model name before saving.");
      return;
    }
    try {
      setIsSavingModel(true);
      setAlertType("info");
      setAlertMessage(`Saving model as models/${modelName}.pkl ...`);

      const res = await saveModelToFile(`models/${modelName}.pkl`);
      setAlertType("success");
      setAlertMessage(res?.data?.message || "Model saved ✅");
      setHasSavedModel(true);

      // uppdatera listan så att modellen syns i dropdown
      await fetchAvailableModels();
    } catch (error) {
      console.error("Failed to save model:", error);
      setAlertType("error");
      setAlertMessage(error?.response?.data?.detail || "Failed to save model");
      setHasSavedModel(false);
    } finally {
      setIsSavingModel(false);
    }
  };

  useEffect(() => {
    setHasSavedModel(false);
  }, [modelName]);


  return (
    <div>
      <IDSCard borderTop={2}>
        <h2 className="ids-heading-m">CTGAN Model</h2>
        <h3 className="ids-heading-s">
          Upload your dataset to train the CTGAN model, then generate synthetic data.
        </h3>

        <FileDropzone onFilesSelected={handleFileUpload} />

        <ModelTrainingForm
          batchSize={batchSize}
          setBatchSize={setBatchSize}
          epochs={epochs}
          setEpochs={setEpochs}
          modelName={modelName}
          setModelName={setModelName}
          sampleRows={sampleRows}
          setSampleRows={setSampleRows}
          uploadedFile={uploadedFile}
          handleTrain={handleTrain}
          handleTrainWithCelery={handleTrainWithCelery}
        />

        <ModelSelection
          availableModels={availableModels}
          isLoadingModels={isLoadingModels}
          modelName={modelName}
          setModelName={setModelName}
          handleDownloadModel={handleDownloadModel}
          isDownloading={isDownloading}
          handleLoadModel={handleLoadModel}
          handleSaveModel={handleSaveModel}      
          hasSavedModel={hasSavedModel}          
          isSavingModel={isSavingModel}          
        />

        <TrainingAlert
          alertType={alertType}
          alertMessage={alertMessage}
          taskId={taskId}
          taskState={taskState}
        />
      </IDSCard>

      {canGenerate && (
        <div style={{ marginTop: "1rem" }}>
          <DataGeneration
            numRows={numRows}
            setNumRows={setNumRows}
            handleGenerate={handleGenerate}
            canGenerate={canGenerate}
            modelName={modelName}
          />

          {generatedData.length > 0 && (
            <>
              <ExportControls
                handleExport={handleExport}
                handleSaveToDb={handleSaveToDb}
                numRows={numRows}
              />
              <GeneratedDataTable generatedData={generatedData} />
            </>
          )}
          <DbDataViewer refreshKey={dbRefreshKey} />
        </div>
      )}
    </div>
  );
};

export default CTGAN;