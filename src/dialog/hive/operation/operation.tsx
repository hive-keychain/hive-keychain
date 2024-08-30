import {
  KeychainKeyTypesLC,
  KeychainRequest,
  KeychainRequestTypes,
} from '@interfaces/keychain.interface';
import AccountUtils from '@popup/hive/utils/account.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';
import RequestUsername from 'src/dialog/components/request-username/request-username';
import { getRequiredWifType } from 'src/utils/requests.utils';

type Props = {
  title: string;
  children: JSX.Element[];
  onConfirm?: () => void;
  data: KeychainRequest;
  domain: string;
  tab: number;
  canWhitelist?: boolean;
  header?: string;
  checkboxLabelOverride?: string;
  accounts?: string[];
  username?: string;
  setUsername?: (username: string) => void;
  redHeader?: boolean;
};

const Operation = ({
  title,
  children,
  onConfirm,
  domain,
  tab,
  data,
  header,
  checkboxLabelOverride,
  canWhitelist = false,
  accounts,
  username,
  redHeader,
  setUsername,
}: Props) => {
  const [keep, setKeep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useMultisig, setUseMultisig] = useState(false);

  useEffect(() => {
    if (data && (username || data.username)) checkForMultsig();
  }, [data, username]);

  const checkForMultsig = async () => {
    let useMultisig = false;
    const name = (username || data.username)!;

    if (
      [
        KeychainRequestTypes.signBuffer,
        KeychainRequestTypes.signTx,
        KeychainRequestTypes.encode,
        KeychainRequestTypes.decode,
        KeychainRequestTypes.addAccount,
      ].includes(data.type)
    ) {
      setUseMultisig(false);
      return;
    }
    const method = getRequiredWifType(data).toLowerCase();
    const initiatorAccount = await AccountUtils.getExtendedAccount(name);
    const localAccount = await AccountUtils.getAccountFromLocalStorage(name);

    switch (method) {
      case KeychainKeyTypesLC.active: {
        if (data.key || localAccount?.keys.active) {
          useMultisig = KeysUtils.isUsingMultisig(
            localAccount?.keys.active!,
            initiatorAccount,
            initiatorAccount,
            method,
          );
          setUseMultisig(useMultisig);
        }
        break;
      }
      case KeychainKeyTypesLC.posting: {
        if (data.key || localAccount?.keys.posting) {
          useMultisig = KeysUtils.isUsingMultisig(
            localAccount?.keys.posting!,
            initiatorAccount,
            initiatorAccount,
            method,
          );
          setUseMultisig(useMultisig);
        }
        break;
      }
      default:
        setUseMultisig(false);
    }
  };

  const genericOnConfirm = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.ACCEPT_TRANSACTION,
      value: {
        data: data,
        tab: tab,
        domain: domain,
        keep,
      },
    });
  };

  return (
    <div className="operation">
      <div
        className="scrollable"
        style={{
          height: canWhitelist ? '70%' : '85%',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <div>
          <DialogHeader title={title} />
          {header && (
            <div
              className={`operation-header ${
                redHeader ? 'operation-red' : ''
              }`}>
              {header}
            </div>
          )}

          {useMultisig && (
            <div
              data-testid="use-multisig-message"
              className="multisig-message">
              <img src="/assets/images/multisig/logo.png" className="logo" />
              <div className="message">
                {chrome.i18n.getMessage('multisig_disclaimer_message')}
              </div>
            </div>
          )}

          {accounts && (
            <RequestUsername
              accounts={accounts}
              username={username!}
              setUsername={setUsername!}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flex: 1,
            flexDirection: 'column',
          }}>
          <div className="operation-body">
            <div className="fields">{...children}</div>
          </div>
        </div>
      </div>
      {canWhitelist && (
        <CheckboxPanelComponent
          onChange={setKeep}
          checked={keep}
          skipTranslation
          title={
            checkboxLabelOverride ||
            chrome.i18n.getMessage('dialog_no_prompt', [
              data.type,
              data.username!,
              domain,
            ])
          }
        />
      )}

      {!loading && (
        <div className={`operation-buttons `}>
          <ButtonComponent
            label="dialog_cancel"
            type={ButtonType.ALTERNATIVE}
            onClick={() => {
              window.close();
            }}
            height="small"
          />
          <ButtonComponent
            type={ButtonType.IMPORTANT}
            label="dialog_confirm"
            onClick={onConfirm || genericOnConfirm}
            height="small"
          />
        </div>
      )}

      <LoadingComponent
        hide={!loading}
        caption={useMultisig ? 'multisig_transmitting_to_multisig' : undefined}
      />
    </div>
  );
};

export default Operation;
