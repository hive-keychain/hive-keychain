import { EvmRequestHandler } from '@background/evm/requests/evm-request-handler';
import { EvmUnrestrictedMethods } from '@background/evm/requests/evm-unrestricted-methods.list';
import { evmRequestWithConfirmation } from '@background/evm/requests/logic/evm-request-with-confirmation.logic';
import { evmRequestWithoutConfirmation } from '@background/evm/requests/logic/evm-request-without-confirmation.logic';
import MkModule from '@background/hive/modules/mk.module';
import {
  initializeWallet,
  unlockWallet,
} from '@background/hive/requests/logic';
import {
  EvmRequest,
  EvmRequestMethod,
} from '@interfaces/evm-provider.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

export const initEvmRequestHandler = async (
  request: EvmRequest,
  tab: number | undefined,
  domain: string,
  requestHandler: EvmRequestHandler,
) => {
  const mk = await MkModule.getMk();
  Logger.info('Initializing EVM request logic');
  const accounts = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.EVM_ACCOUNTS,
  );

  if (mk) {
    const rebuiltAccounts =
      await EvmWalletUtils.rebuildAccountsFromLocalStorage(mk);
    requestHandler.accounts = rebuiltAccounts;
    requestHandler.saveInLocalStorage();
  }

  if (!accounts) {
    initializeWallet(requestHandler, tab!, request);
  } else if (!mk) {
    unlockWallet(
      requestHandler,
      tab!,
      request,
      domain,
      DialogCommand.UNLOCK_EVM,
    );
  } else if (EvmUnrestrictedMethods.includes(request.method)) {
    //TODO: implement features that do not need confirmation

    if (request.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
      const connectedWallets = await EvmWalletUtils.getConnectedWallets(domain);
      if (connectedWallets.length === 0) {
        evmRequestWithConfirmation(requestHandler, tab!, request, domain);
      } else {
        evmRequestWithoutConfirmation(requestHandler, tab!, request, domain);
      }
    } else {
      evmRequestWithoutConfirmation(requestHandler, tab!, request, domain);
    }
  } else {
    evmRequestWithConfirmation(requestHandler, tab!, request, domain);
  }

  requestHandler.saveInLocalStorage();
};
