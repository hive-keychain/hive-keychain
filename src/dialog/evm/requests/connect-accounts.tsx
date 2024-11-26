import { EvmRequestMethod } from '@background/evm/evm-methods/evm-methods.list';
import { EvmRequestPermission } from '@background/evm/evm-methods/evm-permission.list';
import { EvmRequest } from '@interfaces/evm-provider.interface';
import { EvmAccount } from '@popup/evm/interfaces/wallet.interface';
import { EvmWalletUtils } from '@popup/evm/utils/wallet.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { DappStatusEnum } from 'src/common-ui/evm/dapp-status/dapp-status.component';
import { EvmAccountDisplayComponent } from 'src/common-ui/evm/evm-account-display/evm-account-display.component';
import { EvmOperation } from 'src/dialog/evm/evm-operation/evm-operation';
import { EvmRequestMessage } from 'src/dialog/multichain/request/request-confirmation';

interface Props {
  request: EvmRequest;
  accounts: EvmAccount[];
  data: EvmRequestMessage;
}

export const ConnectAccounts = (props: Props) => {
  const { accounts, data, request } = props;
  const [accountsToConnect, setAccountsToConnect] = useState<any>({});
  const [connectedAccounts, setConnectedAccounts] = useState<any>();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const connected = await EvmWalletUtils.getConnectedWallets(
      data.dappInfo.domain,
    );
    setConnectedAccounts(connected);

    const accs: any = {};
    for (const account of accounts) {
      accs[account.wallet.address] = connected.includes(account.wallet.address);
    }
    setAccountsToConnect(accs);
  };

  const toggleAccount = (address: string) => {
    const oldState = { ...accountsToConnect };
    oldState[address] = !oldState[address];
    setAccountsToConnect(oldState);
  };

  const saveInStorage = async () => {
    const addresses: string[] = [];
    for (const address of Object.keys(accountsToConnect)) {
      if (accountsToConnect[address]) addresses.push(address);
    }
    await EvmWalletUtils.connectMultipleWallet(addresses, data.dappInfo.domain);

    let result;

    if (request.method === EvmRequestMethod.REQUEST_ACCOUNTS) {
      result = addresses.map((add) => add.toLowerCase());
    } else if (request.method === EvmRequestMethod.WALLET_REQUEST_PERMISSIONS) {
      result = [{ parentCapability: EvmRequestPermission.ETH_ACCOUNTS }];
    }

    chrome.runtime.sendMessage({
      command: BackgroundCommand.SEND_EVM_RESPONSE_TO_SW,
      value: {
        requestId: request.request_id,
        result: result,
      },
    });
  };

  const getStatus = (account: EvmAccount): DappStatusEnum => {
    if (connectedAccounts[0] === account.wallet.address)
      return DappStatusEnum.SELECTED;
    else if (connectedAccounts.includes(account.wallet.address))
      return DappStatusEnum.CONNECTED;
    else return DappStatusEnum.DISCONNECTED;
  };

  return (
    <EvmOperation
      request={request}
      domain={data.dappInfo.domain}
      tab={0}
      title={chrome.i18n.getMessage('evm_connect_wallet')}
      onConfirm={saveInStorage}
      caption={chrome.i18n.getMessage('dialog_evm_dapp_status_caption', [
        data.dappInfo.domain,
      ])}
      bottomPanel={
        connectedAccounts &&
        accounts &&
        accountsToConnect &&
        accounts.map((account) => (
          <CheckboxPanelComponent
            key={`account-${account.id}`}
            onChange={() => toggleAccount(account.wallet.address)}
            checked={accountsToConnect[account.wallet.address]}>
            <EvmAccountDisplayComponent
              account={
                {
                  id: account.id,
                  wallet: { address: account.wallet.address },
                } as EvmAccount
              }
              status={getStatus(account)}
            />
          </CheckboxPanelComponent>
        ))
      }></EvmOperation>
  );
};
