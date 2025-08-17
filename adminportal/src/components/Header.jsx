import React from "react";
import {
  IDSHeader1177Pro,
  IDSHeader1177ProAvatar,
  IDSHeader1177ProNav,
  IDSHeader1177ProNavItem,
  IDSHeader1177ProNavMenuMobile,
  IDSMobileMenu,
  IDSMobileMenuItem,
  IDSHeader1177ProAvatarMobile,
  IDSLink,
} from "@inera/ids-react";
import {getCurrentUser } from "../api/auth";
import { useState, useEffect } from "react";


const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        setUser(null); // ev. hantera fel
      });
  }, []);


  return (
    <IDSHeader1177Pro
      avatar={
        user && (
          <IDSHeader1177ProAvatar
            unit="Admin"
            username={`${user.username} ${user.role}`}
          >
            <>
              <IDSLink block colorPreset={1} large>
                <a href="/help">
                  <span className="ids-icon-question ids-icon--text-start" />
                  Hjälp
                </a>
              </IDSLink>
              <IDSLink block colorPreset={1} large>
                <a href="/settings">
                  <span className="ids-icon-settings ids-icon--text-start" />
                  Inställningar
                </a>
              </IDSLink>
              <hr className="ids-header-1177-pro__link-separator" />
              <IDSLink block colorPreset={1} large>
                <a href="/logout">
                  <span className="ids-icon-user ids-icon--text-start" />
                  Logga ut
                </a>
              </IDSLink>
            </>
          </IDSHeader1177ProAvatar>
        )
      }
      logoHref="https://www.1177.se/"
      skipToContentLink={<a href="">Skip to main content</a>}
    >
      <IDSHeader1177ProNav
        mobileMenu={
          <IDSHeader1177ProNavMenuMobile label="Meny">
            <IDSMobileMenu>
              <>
                <IDSMobileMenuItem headline="Mobile link 1">
                  <IDSMobileMenuItem
                    active
                    link={<a href="">Mobile link 1:1 (active)</a>}
                  >
                    <IDSMobileMenuItem link={<a href="">Mobile link 1:1:1</a>} />
                  </IDSMobileMenuItem>
                </IDSMobileMenuItem>

                <IDSMobileMenuItem headline="Mobile link 2">
                  <IDSMobileMenuItem link={<a href="">Mobile link 2:1</a>} />
                  <IDSMobileMenuItem link={<a href="">Mobile link 2:2</a>} />
                </IDSMobileMenuItem>

                <IDSMobileMenuItem headline="Mobile link 3">
                  <IDSMobileMenuItem link={<a href="">Mobile link 3:1</a>} />
                </IDSMobileMenuItem>
              </>
              <IDSMobileMenuItem link={<a href=""><span className="ids-icon-swap-horizontal-small" />Växla</a>} secondary />
            </IDSMobileMenu>

            <IDSHeader1177ProAvatarMobile unit="Ulricehamn" username="Karl Stenhagen">
              <IDSLink><a href="">Logga ut</a></IDSLink>
            </IDSHeader1177ProAvatarMobile>
          </IDSHeader1177ProNavMenuMobile>
        }
      >
        <IDSHeader1177ProNavItem active>
          <a href="/start">Dashboard</a>
        </IDSHeader1177ProNavItem>

        <IDSHeader1177ProNavItem >
          <a href="/data-generator">Skapa testdata</a>
        </IDSHeader1177ProNavItem>

        <IDSHeader1177ProNavItem>
            <a href="/ml-ai-models">ML/AI-modeller</a>
        </IDSHeader1177ProNavItem>

        <IDSHeader1177ProNavItem
          label="Inställningar"
          col1={[
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Vaccinationer</a></IDSLink>,
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Sold och värme</a></IDSLink>,
          ]}
          col2={[
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Resråd</a></IDSLink>,
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Fysisk aktivitet</a></IDSLink>,
          ]}
          col3={[
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Halsfluss</a></IDSLink>,
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Krupp</a></IDSLink>,
          ]}
          col4={[
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Plåster</a></IDSLink>,
            <IDSLink><a href=""><span className="ids-icon-arrow-right-small ids-icon--text-start" />Blodtryck</a></IDSLink>,
          ]}
        />
      </IDSHeader1177ProNav>
    </IDSHeader1177Pro>
  );
};

export default Header;
