import { Screen } from '@interfaces/screen.interface';
import { AddWalletMainComponent } from '@popup/evm/pages/add-wallets/add-wallets-main.component';
import { CreateNewWalletVerificationComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet-verification.component';
import { CreateNewWalletComponent } from '@popup/evm/pages/add-wallets/create-new-wallet/create-new-wallet.component';
import { ImportWalletConfirmationComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-confirmation.component';
import { ImportWalletFromSeedComponent } from '@popup/evm/pages/add-wallets/import-wallet-from-seed/import-wallet-from-seed.component';
import { EvmHomeComponent } from '@popup/evm/pages/home/evm-home.component';
import { EvmSettingPage } from '@popup/evm/pages/home/settings/evm-settings.component';
import { EvmTransferComponent } from '@popup/evm/pages/home/transfer/evm-transfer.component';
import { EvmScreen } from '@popup/evm/reference-data/evm-screen.enum';
import { globalRouter } from '@popup/multichain/global-router';
import { MultichainScreen } from '@popup/multichain/reference-data/multichain-screen.enum';
import { RootState } from '@popup/multichain/store';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { HiveConfirmationPageComponent } from 'src/common-ui/confirmation-page/hive-confirmation-page.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';

const EvmAppRouter = ({
  currentPage,
  titleProperties,
  hasTitle,
}: PropsFromRedux) => {
  const renderPage = (page: Screen) => {
    switch (page) {
      case EvmScreen.EVM_ADD_WALLET_MAIN:
        return <AddWalletMainComponent />;
      case EvmScreen.IMPORT_EVM_WALLET:
        return <ImportWalletFromSeedComponent />;
      case EvmScreen.IMPORT_EVM_WALLET_CONFIRMATION:
        return <ImportWalletConfirmationComponent />;
      case EvmScreen.CREATE_EVM_WALLET:
        return <CreateNewWalletComponent />;
      case EvmScreen.CREATE_EVM_WALLET_VERIFICATION:
        return <CreateNewWalletVerificationComponent />;
      case EvmScreen.EVM_HOME:
        return <EvmHomeComponent />;
      case MultichainScreen.BUY_COINS_PAGE:
        return <>EVM on ramp</>;
      case MultichainScreen.TRANSFER_FUND_PAGE:
        return <EvmTransferComponent />;
      case MultichainScreen.CONFIRMATION_PAGE:
        return <HiveConfirmationPageComponent />;
      case MultichainScreen.TOKEN_SWAP_PAGE:
        return <>Evm Swap</>;
      case MultichainScreen.TOKENS_SWAP_HISTORY:
        return <>Swap history</>;

      // Settings
      case EvmScreen.EVM_SETTINGS: {
        return <EvmSettingPage />;
      }
      default:
        return globalRouter(page);
    }
  };

  return (
    <div
      className="app-router"
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: hasTitle ? '80px 1fr' : '1fr',
      }}>
      {hasTitle && (
        <PageTitleComponent {...titleProperties}></PageTitleComponent>
      )}
      <div
        className="page-content"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {renderPage(currentPage!)}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    currentPage: state.navigation.stack[0]
      ? state.navigation.stack[0].currentPage
      : Screen.UNDEFINED,
    hasTitle: state.titleContainer?.title.length > 0,
    titleProperties: state.titleContainer,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const EvmRouterComponent = connector(EvmAppRouter);
