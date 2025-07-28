// src/pages/DashboardPage.jsx
import React from "react";
import Header from "../components/Header";
import Footer  from "../components/Footer"; // Assuming you have a Footer component
import {
  IDSRow,
  IDSColumn,    
} from "@inera/ids-react";
import "@inera/ids-design/themes/1177-pro/1177-pro.css";

const DashboardPage = () => {
  return (
    <div>
      <Header />
        <IDSRow>
        <IDSColumn>
            <h3 className="ids-heading-s">
            Without ids-content
            </h3>
            <p className="ids-preamble">
            Lorem ipsum dolor sit amet
            </p>
            <h4 className="ids-heading-xs">
            Lorem ipsum dolor sit amet
            </h4>
            <p className="ids-body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <p className="ids-body">
            <React.Fragment key=".0">
                Lorem with{' '}
                <a
                className="ids-anchor"
                href=""
                >
                ids-anchor
                </a>
                {' '}consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </React.Fragment>
            </p>
            <h4 className="ids-heading-xs">
            Jack lad schooner scallywag
            </h4>
            <p className="ids-body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
        </IDSColumn>
        <IDSColumn
            className="ids-content"
            offset="1"
        >
            <h3 className="ids-heading-s">
            With ids-content
            </h3>
            <p className="ids-preamble">
            Lorem ipsum dolor sit amet
            </p>
            <h4 className="ids-heading-xs">
            Lorem ipsum dolor sit amet
            </h4>
            <p className="ids-body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
            <p className="ids-body">
            <React.Fragment key=".0">
                Lorem with{' '}
                <a
                className="ids-anchor"
                href=""
                >
                ids-anchor
                </a>
                {' '}consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </React.Fragment>
            </p>
            <h4 className="ids-heading-xs">
            Jack lad schooner scallywag
            </h4>
            <p className="ids-body">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.
            </p>
        </IDSColumn>
        </IDSRow>
        <Footer />
    </div>
  );
};

export default DashboardPage;
