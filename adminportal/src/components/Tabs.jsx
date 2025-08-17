
import React from 'react';
import { IDSTabs, IDSTab, IDSTabPanel, IDSLink } from '@inera/ids-react';
import CTGAN from './ML-models/CTGAN';
import TVAE from './ML-models/TVAE';
import Gaussian from './ML-models/Gaussian';
import GPT2 from './ML-models/GPT2';

const Tabs = () => {
    return (
        <IDSTabs
        selectLabel="Recepies"
        tabs={[
            <IDSTab key="tab-1" label="CTGAN"/>,
            <IDSTab key="tab-2" label="TVAE"/>,
            <IDSTab key="tab-3" label="Gaussian"/>,
            <IDSTab key="tab-4" label="GTP-2"/>
        ]}
        >
        
        <IDSTabPanel>
            <CTGAN />
        </IDSTabPanel>
        <IDSTabPanel>
            <TVAE />
        </IDSTabPanel>
        <IDSTabPanel>
            <Gaussian />
        </IDSTabPanel>
        <IDSTabPanel>
            <GPT2 />
        </IDSTabPanel>
        </IDSTabs>
    );
};
export default Tabs;