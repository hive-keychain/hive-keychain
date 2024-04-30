import { BackgroundMessage } from '@background/background-message.interface';
import { ActionButton } from '@interfaces/action-button.interface';
import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { EvmAppComponent } from '@popup/evm/evm-app.component';
import { setIsLedgerSupported } from '@popup/hive/actions/app-status.actions';
import { HiveAppComponent } from '@popup/hive/hive-app.component';
import MkUtils from '@popup/hive/utils/mk.utils';
import { setHasFinishedSignup } from '@popup/multichain/actions/has-finished-signup.actions';
import { resetMessage } from '@popup/multichain/actions/message.actions';
import { setMk } from '@popup/multichain/actions/mk.actions';
import {
  Chain,
  ChainType,
} from '@popup/multichain/interfaces/chains.interface';
import { ChainSelectorPageComponent } from '@popup/multichain/pages/chain-selector/chain-selector.component';
import { SignInRouterComponent } from '@popup/multichain/pages/sign-in/sign-in-router.component';
import { SignUpComponent } from '@popup/multichain/pages/sign-up/sign-up.component';
import { SignUpScreen } from '@popup/multichain/sign-up.context';
import { RootState } from '@popup/multichain/store';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { MessageContainerComponent } from 'src/common-ui/message-container/message-container.component';
import { SplashscreenComponent } from 'src/common-ui/splashscreen/splashscreen.component';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import PopupUtils from 'src/utils/popup.utils';

type Props = { screen: SignUpScreen };

const ChainRouter = ({
  screen,
  message,
  mk,
  setMk,
  setIsLedgerSupported,
  hasFinishedSignup,
  setHasFinishedSignup,
  currentPage,
  resetMessage,
  chain,
}: Props & PropsFromRedux) => {
  useEffect(() => {
    PopupUtils.fixPopupOnMacOs();
    initAutoLock();
    checkIfHasFinishedSignup();
    initMk();
    LedgerUtils.isLedgerSupported().then((res) => {
      setIsLedgerSupported(res);
      LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.IS_LEDGER_SUPPORTED,
        res,
      );
    });
  }, []);

  const initMk = async () => {
    const mkFromStorage = await MkUtils.getMkFromLocalStorage();
    if (mkFromStorage) {
      setMk(mkFromStorage, false);
    }
  };
  const checkIfHasFinishedSignup = async () => {
    let hasFinishedSignup: boolean =
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HAS_FINISHED_SIGNUP,
      )) || false;
    setTimeout(() => {
      setHasFinishedSignup(hasFinishedSignup);
    }, 500);
  };

  const initAutoLock = async () => {
    let autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    if (
      autolock &&
      [AutoLockType.DEVICE_LOCK, AutoLockType.IDLE_LOCK].includes(autolock.type)
    ) {
      chrome.runtime.onMessage.addListener(onReceivedAutolockCmd);
    }
  };

  const onReceivedAutolockCmd = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.LOCK_APP) {
      setMk('', false);
      chrome.runtime.onMessage.removeListener(onReceivedAutolockCmd);
    }
  };

  const renderChain = () => {
    if (!mk || mk.length === 0) {
      if (!hasFinishedSignup) {
        return <SignUpComponent />;
      } else {
        return <SignInRouterComponent />;
      }
    } else {
      switch (chain?.type) {
        case ChainType.HIVE:
          return <HiveAppComponent />;
        case ChainType.EVM:
          return <EvmAppComponent />;
        default:
          return <ChainSelectorPageComponent />;
      }
    }
  };

  return (
    <>
      {renderChain()}
      {message?.key && (
        <MessageContainerComponent
          message={message}
          onResetMessage={resetMessage}
        />
      )}
      {hasFinishedSignup === null && !currentPage && <SplashscreenComponent />}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    message: state.message,
    mk: state.mk,
    hasFinishedSignup: state.hasFinishedSignup,
    currentPage: state.navigation.stack[0],
    chain: state.chain as Chain,
  };
};

const connector = connect(mapStateToProps, {
  setIsLedgerSupported,
  setMk,
  setHasFinishedSignup,
  resetMessage,
});
//TODO : setIsLedgerSupported : move out of appStatus with other global app statuses
type PropsFromRedux = ConnectedProps<typeof connector> & ActionButton;

export default connector(ChainRouter);
