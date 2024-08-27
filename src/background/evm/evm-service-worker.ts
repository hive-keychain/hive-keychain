import { BackgroundMessage } from '@background/background-message.interface';
import {
  EvmRequestMethod,
  KeychainEvmRequestWrapper,
} from '@background/evm/provider/evm-provider.interface';
import { EvmChainUtils } from '@popup/evm/utils/evm-chain.utils';
import EvmWalletUtils from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import Logger from 'src/utils/logger.utils';

const initializeServiceWorker = async () => {
  Logger.info('Starting EVM service worker');
};

const chromeMessageHandler = async (
  backgroundMessage: BackgroundMessage,
  sender: chrome.runtime.MessageSender,
  sendResp: (response?: any) => void,
) => {
  if (backgroundMessage.command === BackgroundCommand.SEND_EVM_REQUEST) {
    const evmRequestWrapper = backgroundMessage as KeychainEvmRequestWrapper;
    const request = evmRequestWrapper.request;
    const message: BackgroundMessage = {
      command: BackgroundCommand.SEND_EVM_RESPONSE,
      value: {
        requestId: request.request_id,
        result: {},
      },
    };

    switch (request.method) {
      case EvmRequestMethod.GET_CHAIN: {
        const chainId = await EvmChainUtils.getLastEvmChain();
        message.value.result = chainId;
        break;
      }
      case EvmRequestMethod.GET_NETWORK: {
        const chainId = await EvmChainUtils.getLastEvmChain();
        message.value.result = Number(chainId);
        break;
      }
      case EvmRequestMethod.GET_ACCOUNTS:
      case EvmRequestMethod.REQUEST_ACCOUNTS: {
        const connectedWallets = await EvmWalletUtils.getConnectedWallets(
          evmRequestWrapper.domain,
        );
        if (connectedWallets.length > 0) {
          message.value.result = connectedWallets;
        } else {
          // TODO open popup
          message.value.result = [''];
        }

        break;
      }
      default: {
        Logger.info(`${request.method} is not implemented`);
      }
    }
    chrome.tabs.sendMessage(sender.tab?.id!, message);
  }

  if (backgroundMessage.command === BackgroundCommand.SEND_EVM_EVENT) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id)
          chrome.tabs.sendMessage(tab.id, {
            ...backgroundMessage,
            command: BackgroundCommand.SEND_EVM_EVENT_TO_CONTENT_SCRIPT,
          });
      }
    });
  }
};

chrome.runtime.onMessage.addListener(chromeMessageHandler);

export const EvmServiceWorker = { initializeServiceWorker };
