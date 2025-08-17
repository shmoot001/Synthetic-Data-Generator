import React, { useState } from "react";
import { IDSButton, IDSCard } from '@inera/ids-react';

const GeneratedDataTable = ({ generatedData }) => {
  const [visibleRows, setVisibleRows] = useState(10);

  if (!generatedData || generatedData.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
        <IDSCard borderTop={2}>

        <h3 style={{ marginBottom: "1rem", color: "#264a7d" }}>Generated Data Preview</h3>

        <div style={{
            overflowX: "auto",
            border: "1px solid #dcdcdc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}>
            <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.95rem",
            color: "#333",
            }}>
            <thead style={{
                backgroundColor: "#e9eef4",
                color: "#264a7d",
            }}>
                <tr>
                {Object.keys(generatedData[0]).map((key) => (
                    <th
                    key={key}
                    style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        borderBottom: "1px solid #ccc",
                        textTransform: "capitalize",
                    }}
                    >
                    {key}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {generatedData.slice(0, visibleRows).map((row, idx) => (
                <tr
                    key={idx}
                    style={{
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f2f6fa",
                    transition: "background 0.2s",
                    }}
                >
                    {Object.values(row).map((val, i) => (
                    <td
                        key={i}
                        style={{
                        padding: "10px 16px",
                        borderBottom: "1px solid #eee",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        }}
                    >
                        {val}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {generatedData.length > visibleRows && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <IDSButton
                icon={null}
                oldIcon={null}
                onClick={() => setVisibleRows((prev) => prev + 10)}
                size="m"
                type="primary"
            >
                Visa fler rader
            </IDSButton>
            </div>
        )}
        </IDSCard>
    
    </div>
  );
};

export default GeneratedDataTable;
