// src/components/FileDropzone.jsx
import React from "react";
import { useDropzone } from "react-dropzone";

const FileDropzone = ({ onFilesSelected }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesSelected,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #ccc",
        borderRadius: "8px",
        padding: "40px",
        textAlign: "center",
        backgroundColor: "#ffffff",
        color: "#396291",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Click or Drag a csv or json to this area to upload</p>
      )}
    </div>
  );
};

export default FileDropzone;
