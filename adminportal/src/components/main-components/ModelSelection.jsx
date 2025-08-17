import React from "react";
import { IDSButton, IDSSpinner } from "@inera/ids-react";

const ModelSelection = ({
  availableModels,
  modelName,
  setModelName,
  handleDownloadModel,
  handleLoadModel,
  handleSaveModel,        // NEW
  hasSavedModel,          // NEW
  isSavingModel,          // NEW
  isLoadingModels,        // (optional) redan skickad uppifrån
  isDownloading,          // (optional) redan skickad uppifrån
}) => {
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{ maxWidth: "250px" }}>
        <label className="ids-heading-xxs" htmlFor="available-models">
          Or select existing model
        </label>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            id="available-models"
            className="ids-input"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            disabled={isLoadingModels}
          >
            <option value="">-- Select model --</option>
            {availableModels.map((model) => (
              <option key={model} value={model.replace(".pkl", "")}>
                {model.replace(".pkl", "")}
              </option>
            ))}
          </select>
          {isLoadingModels && <IDSSpinner size="s" />}
        </div>
      </div>

      {/* SAVE MODEL */}
      <IDSButton
        onClick={handleSaveModel}
        size="m"
        type="secondary"
        style={{ marginTop: "1rem" }}
        disabled={!modelName || isSavingModel}
      >
        {isSavingModel ? "Saving..." : "Save Model"}
      </IDSButton>

      {/* DOWNLOAD syns först efter save-model-klick */}
      {hasSavedModel && modelName && (
        <IDSButton
          onClick={handleDownloadModel}
          size="m"
          type="secondary"
          style={{ marginTop: "0.5rem" }}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download Model"}
        </IDSButton>
      )}

      {/* LOAD är kvar som innan */}
      <IDSButton
        onClick={handleLoadModel}
        size="m"
        type="secondary"
        style={{ marginTop: "0.5rem" }}
      >
        Load Model
      </IDSButton>
    </div>
  );
};

export default ModelSelection;
