import React from 'react';
import { IDSRow, IDSColumn } from '@inera/ids-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StartPage = () => {
  return (
    <div className="ids-content p-8 space-y-10">
      <Header />

      {/* Introduction */}
      <IDSRow>
        <IDSColumn>
          <h2 className="ids-heading-s">Welcome to the SDG Admin Portal</h2>
          <p className="ids-body">
            The Synthetic Data Generator (SDG) Admin Portal is built to enable secure, privacy-preserving testing and development of e-health applications.
            By leveraging advanced machine learning models, developers and testers can generate synthetic patient data that resembles real records, without ever exposing sensitive information or violating GDPR.
          </p>
          <p className="ids-body">
            The portal supports multiple models for different types of data generation, and provides tools to configure, train, and evaluate synthetic data pipelines – all in one place.
          </p>
        </IDSColumn>
      </IDSRow>

      {/* Model Descriptions in 2x2 Grid */}
      <IDSRow>
        {/* CTGAN */}
        <IDSColumn className="ids-content" cols="6">
          <h3 className="ids-heading-xs">CTGAN</h3>
          <p className="ids-body">
            CTGAN (Conditional Tabular GAN) is designed to generate synthetic tabular data.
            It models both categorical and numerical variables using a GAN architecture, making it ideal for healthcare datasets.
            <br />
            <a
              className="ids-anchor"
              href="https://docs.sdv.dev/sdv/single-table-data/modeling/synthesizers/ctgan"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read CTGAN docs ↗
            </a>
          </p>
        </IDSColumn>

        {/* TVAE */}
        <IDSColumn className="ids-content" cols="6">
          <h3 className="ids-heading-xs">TVAE</h3>
          <p className="ids-body">
            TVAE (Tabular Variational Autoencoder) uses variational inference to encode and decode tabular data for generation.
            It preserves the relationships between features and is great for datasets with mixed data types.
            <br />
            <a
              className="ids-anchor"
              href="https://docs.sdv.dev/sdv/single-table-data/modeling/synthesizers/tvae"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read TVAE docs ↗
            </a>
          </p>
        </IDSColumn>
      </IDSRow>

      <IDSRow>
        {/* Gaussian Copula */}
        <IDSColumn className="ids-content" cols="6">
          <h3 className="ids-heading-xs">Gaussian Copula</h3>
          <p className="ids-body">
            Gaussian Copula models the dependencies between variables using correlation structures.
            It's a powerful tool for modeling purely numerical datasets and assumes normal distributions.
            <br />
            <a
              className="ids-anchor"
              href="https://docs.sdv.dev/sdv/single-table-data/modeling/synthesizers/gaussiancopula"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read Gaussian Copula docs ↗
            </a>
          </p>
        </IDSColumn>

        {/* GPT-2 */}
        <IDSColumn className="ids-content" cols="6">
          <h3 className="ids-heading-xs">GPT-2</h3>
          <p className="ids-body">
            GPT-2 is a transformer-based model for generating realistic free-text patient notes.
            It's particularly useful for simulating clinical narratives while maintaining privacy.
            <br />
            <a
              className="ids-anchor"
              href="https://huggingface.co/docs/transformers/model_doc/gpt2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read GPT-2 docs ↗
            </a>
          </p>
        </IDSColumn>
      </IDSRow>

      {/* User Guide Section */}
      <IDSRow>
        <IDSColumn>
          <h2 className="ids-heading-s">How to Use the Portal</h2>
          <p className="ids-body">
            The portal is designed to be intuitive and guide users step-by-step through the synthetic data generation process:
          </p>
          <ul className="list-disc pl-5 space-y-2 ids-body">
            <li>Navigate to <strong>"Create Test Data"</strong> in the menu.</li>
            <li>Select the machine learning model you wish to use (CTGAN, TVAE, Gaussian Copula, or GPT-2).</li>
            <li>Upload a <code>.csv</code> or <code>.json</code> file to be used as training data.</li>
            <li>Fill in the following training parameters:
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Batch size</strong> – Number of samples per training batch. Affects memory usage and training speed.</li>
                <li><strong>Epochs</strong> – Number of times the model sees the full dataset. More epochs = better learning, but longer training.</li>
                <li><strong>Model path</strong> – Where to save the trained model inside the container (e.g., <code>/models/ctgan.pkl</code>).</li>
                <li><strong>Sample rows</strong> – How many synthetic rows to generate after training is complete.</li>
              </ul>
            </li>
            <li>Click <strong>"Train"</strong> to start the training process using your uploaded dataset.</li>
            <li>Once training is complete, you can input how many rows of synthetic data to generate.</li>
            <li>The generated data will be displayed in a table. You can then choose to export it as <code>.csv</code> or <code>.json</code>.</li>
          </ul>
        </IDSColumn>
      </IDSRow>

      <Footer />
    </div>
  );
};

export default StartPage;
