import { refreshActiveAccount } from '@popup/actions/active-account.actions';
import { loadCurrencyPrices } from '@popup/actions/currency-prices.actions';
import { resetTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ActionsSectionComponent } from '@popup/pages/app-container/home/actions-section/actions-section.component';
import { EstimatedAccountValueSectionComponent } from '@popup/pages/app-container/home/estimated-account-value-section/estimated-account-value-section.component';
import { GovernanceRenewalComponent } from '@popup/pages/app-container/home/governance-renewal/governance-renewal.component';
import { ResourcesSectionComponent } from '@popup/pages/app-container/home/resources-section/resources-section.component';
import { SelectAccountSectionComponent } from '@popup/pages/app-container/home/select-account-section/select-account-section.component';
import { TopBarComponent } from '@popup/pages/app-container/home/top-bar/top-bar.component';
import { WalletInfoSectionComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section.component';
import { SurveyComponent } from '@popup/pages/app-container/survey/survey.component';
import { Survey } from '@popup/pages/app-container/survey/survey.interface';
import { WhatsNewComponent } from '@popup/pages/app-container/whats-new/whats-new.component';
import { WhatsNewContent } from '@popup/pages/app-container/whats-new/whats-new.interface';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { LocalAccount } from 'src/interfaces/local-account.interface';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import { SurveyUtils } from 'src/utils/survey.utils';
import { VersionLogUtils } from 'src/utils/version-log.utils';
import { WhatsNewUtils } from 'src/utils/whats-new.utils';
import './home.component.scss';

const Home = ({
  activeAccount,
  accounts,
  activeRpc,
  refreshActiveAccount,
  resetTitleContainerProperties,
}: PropsFromRedux) => {
  const [displayWhatsNew, setDisplayWhatsNew] = useState(false);
  const [governanceAccountsToExpire, setGovernanceAccountsToExpire] = useState<
    string[]
  >([]);
  const [whatsNewContent, setWhatsNewContent] = useState<WhatsNewContent>();
  const [surveyToDisplay, setSurveyToDisplay] = useState<Survey>();

  useEffect(() => {
    resetTitleContainerProperties();

    if (!ActiveAccountUtils.isEmpty(activeAccount)) {
      refreshActiveAccount();
    }
    initWhatsNew();
    initSurvey();
  }, []);

  useEffect(() => {
    if (activeRpc && activeRpc.uri !== 'NULL')
      initGovernanceExpirationReminder(
        accounts
          .filter((localAccount: LocalAccount) => localAccount.keys.active)
          .map((localAccount: LocalAccount) => localAccount.name),
      );
  }, [activeRpc]);

  const initGovernanceExpirationReminder = async (accountNames: string[]) => {
    const accountsToRemind = await GovernanceUtils.getGovernanceReminderList(
      accountNames,
    );
    setGovernanceAccountsToExpire(accountsToRemind);
  };

  const initSurvey = async () => {
    setSurveyToDisplay(await SurveyUtils.getSurvey());
  };

  const initWhatsNew = async () => {
    const lastVersionSeen = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.LAST_VERSION_UPDATE,
    );

    if (!lastVersionSeen) {
      WhatsNewUtils.saveLastSeen();
      return;
    }

    const versionLog = await VersionLogUtils.getLastVersion();
    const extensionVersion = chrome.runtime
      .getManifest()
      .version.split('.')
      .splice(0, 2)
      .join('.');
    if (
      extensionVersion !== lastVersionSeen &&
      versionLog.version === extensionVersion
    ) {
      setWhatsNewContent(versionLog);
      setDisplayWhatsNew(true);
    }
  };

  const renderPopup = (
    displayWhatsNew: boolean,
    governanceAccountsToExpire: string[],
    surveyToDisplay: Survey | undefined,
  ) => {
    if (displayWhatsNew) {
      return (
        <WhatsNewComponent
          onOverlayClick={() => setDisplayWhatsNew(false)}
          content={whatsNewContent!}
        />
      );
    } else if (governanceAccountsToExpire.length > 0) {
      return (
        <GovernanceRenewalComponent accountNames={governanceAccountsToExpire} />
      );
    } else if (surveyToDisplay) {
      return <SurveyComponent survey={surveyToDisplay} />;
    }
  };

  return (
    <div className="home-page">
      {activeRpc && activeRpc.uri !== 'NULL' && (
        <div aria-label="home-page-component">
          <TopBarComponent />
          <SelectAccountSectionComponent />
          <ResourcesSectionComponent />
          <EstimatedAccountValueSectionComponent />
          <WalletInfoSectionComponent />
          <ActionsSectionComponent />
        </div>
      )}

      {renderPopup(
        displayWhatsNew,
        governanceAccountsToExpire,
        surveyToDisplay,
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    accounts: state.accounts,
    activeRpc: state.activeRpc,
    globalProperties: state.globalProperties,
    isAppReady:
      Object.keys(state.globalProperties).length > 0 &&
      !ActiveAccountUtils.isEmpty(state.activeAccount),
  };
};

const connector = connect(mapStateToProps, {
  loadCurrencyPrices,
  refreshActiveAccount,
  resetTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const HomeComponent = connector(Home);
