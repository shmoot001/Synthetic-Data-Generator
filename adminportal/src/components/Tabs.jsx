
import React from 'react';
import { IDSTabs, IDSTab, IDSTabPanel, IDSLink } from '@inera/ids-react';

const Tabs = () => {
    return (
        <IDSTabs
        selectLabel="Recepies"
        tabs={[
            <IDSTab key="tab-1" label="CTGAN"/>,
            <IDSTab key="tab-2" label="TVAE"/>,
            <IDSTab key="tab-3" label="Macaroon"/>,
            <IDSTab key="tab-4" label="GTP-2"/>
        ]}
        >
        <IDSTabPanel>
            <h2 className="ids-heading-m">
            Cupcake
            </h2>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.marzipan.
        </IDSTabPanel>
        <IDSTabPanel>
            <h2 className="ids-heading-m">
            Sesame snaps
            </h2>
            <React.Fragment key=".1">
            Lorem with{' '}
            <IDSLink>
                <a href="">
                link
                </a>
            </IDSLink>
            {' '}consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </React.Fragment>
        </IDSTabPanel>
        <IDSTabPanel>
            <h2 className="ids-heading-m">
            Macaroon
            </h2>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </IDSTabPanel>
        </IDSTabs>
    );
};
export default Tabs;