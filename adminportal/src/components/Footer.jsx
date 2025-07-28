import React from "react";
import { IDSFooter1177Pro } from "@inera/ids-react";
//optional
import { IDSLink, IDSMobileMenu, IDSMobileMenuItem } from "@inera/ids-react";

const Footer = () => {
    return (
        <IDSFooter1177Pro
            bottomFooterHeadline="Kunskapsstöd för dig inom vården"
            bottomFooterText={<p>Kunskapsstöd riktar sig till vårdpersonal. Kunskapsstöden ägs av Sveriges regioner och är en del av Nationellt system för kunskapsstyrning hälso- och sjukvård</p>}
            cols={2}
            desktopCol1={[
                <IDSLink key="link1"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Link 1</a></IDSLink>,
                <IDSLink key="link2"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Link 2</a></IDSLink>
            ]}
            desktopCol1Headline="1177 pro"
            desktopCol2={[
                <IDSLink key="om1177"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Om 1177</a></IDSLink>,
                <IDSLink key="kontakt"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Kontakt</a></IDSLink>,
                <IDSLink key="remiss"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Kunskapsstöd på remiss</a></IDSLink>
            ]}
            desktopCol2Headline="Om 1177"
            desktopCol3={[
                <IDSLink key="personuppgifter"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Behandling av personuppgifter</a></IDSLink>,
                <IDSLink key="kakor"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Hantering av kakor</a></IDSLink>,
                <IDSLink key="inställningar"><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Inställningar för kakor</a></IDSLink>
            ]}
            desktopCol3Headline="Digital tillgänglighet"
            mobileMenu={
                <IDSMobileMenu variation={2}>
                    <React.Fragment key=".0">
                        <IDSMobileMenuItem headline="Mobile link 1">
                            <IDSMobileMenuItem active link={<a href="">Mobile link 1:1 (active){' '}</a>}>
                                <IDSMobileMenuItem link={<a href="">Mobile link 1:1:1{' '}</a>} />
                            </IDSMobileMenuItem>
                        </IDSMobileMenuItem>
                        <IDSMobileMenuItem headline="Mobile link 2">
                            <IDSMobileMenuItem link={<a href="">Mobile link 2:1{' '}</a>} />
                            <IDSMobileMenuItem link={<a href="">Mobile link 2:2{' '}</a>} />
                        </IDSMobileMenuItem>
                        <IDSMobileMenuItem headline="Mobile link 3">
                            <IDSMobileMenuItem link={<a href="">Mobile link 3:1{' '}</a>} />
                        </IDSMobileMenuItem>
                    </React.Fragment>
                </IDSMobileMenu>
            }
        />
    );
};

export default Footer;
