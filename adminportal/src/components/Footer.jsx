import React from "react";
import { IDSFooter1177Pro } from "@inera/ids-react";
//optional
import { IDSLink, IDSMobileMenu, IDSMobileMenuItem } from "@inera/ids-react";

const Footer = () => {
    return (
        <IDSFooter1177Pro
            bottomFooterHeadline="Kunskapsstöd för dig inom vården"
            bottomFooterText={<p>Kunskapsstöd riktar sig till vårdpersonal. Kunskapsstöden ägs av Sveriges regioner och är en del av Nationellt system för kunskapsstyrning hälso- och sjukvård</p>}
        />
    );
};

export default Footer;
