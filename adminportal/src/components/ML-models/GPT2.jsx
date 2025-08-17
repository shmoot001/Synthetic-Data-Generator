import React, { useState } from 'react';
import { generateText } from '../../api/gpt2Api';
import { IDSInput, IDSButton, IDSTextarea, IDSCard } from '@inera/ids-react';

const GPT2 = () => {
    const [prompt, setPrompt] = useState("");
    const [generatedText, setGeneratedText] = useState("");
    const handleGenerate = async () => {
        try {
            const response = await generateText(prompt);
            setGeneratedText(response);
        } catch (error) {
            console.error("Error generating text:", error);
        }
    }

    return (
        <div>
            <h2 className="ids-heading-m">GPT-2 Model</h2>
            <h3 className="ids-heading-s">
                Upload your dataset to train the GPT-2 model, then generate synthetic text.
            </h3>
            <IDSTextarea
                autoSize
                label="100% width, no resize, set height via prop rows"
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="100% width"
                rows={4}
                value={prompt}
                />
            <IDSButton onClick={handleGenerate}>Generate Text</IDSButton>
            <IDSInput
                label="Generated Text"
                placeholder="Generated text will appear here"
                id="generated-text"
                type="text"
                style={{ width: "100%", marginTop: "1rem" }}
                value={generatedText}
                readOnly
            />
        </div>
    );
};
export default GPT2;