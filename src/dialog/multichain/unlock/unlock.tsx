import { EvmRequest } from '@interfaces/evm-provider.interface';
import { KeychainRequest } from '@interfaces/keychain.interface';
import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { DialogCommand } from '@reference-data/dialog-message-key.enum';
import React, { useEffect, useState } from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LoadingComponent } from 'src/common-ui/loading/loading.component';
import { DialogCaption } from 'src/dialog/components/dialog-caption/dialog-caption.component';
import { DialogHeader } from 'src/dialog/components/dialog-header/dialog-header.component';

type Props = {
  data: UnlockMessage;
  wrongMk?: boolean;
  index?: number;
};

type UnlockMessage = {
  command: DialogCommand;
  msg: {
    success: false;
    error: 'locked';
    result: null;
    data: KeychainRequest | EvmRequest;
    message: string;
    display_msg: string;
    wrongMk?: boolean;
  };
  tab: number;
  domain: string;
};
export default ({ data, index }: Props) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [wrongMk, setWrongMk] = useState(false);

  useEffect(() => {
    setWrongMk(data.msg.wrongMk!);
    if (data.msg.wrongMk && password.length > 0) {
      setLoading(false);
    } else if (password.length === 0) {
      setLoading(false);
    }
  }, [data]);

  const login = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      command: BackgroundCommand.UNLOCK_FROM_DIALOG,
      value: {
        data,
        tab: data.tab,
        mk: password,
        domain: data.domain,
        request_id: data.msg.data.request_id,
      },
    });
  };

  return (
    <div className="unlock-page">
      <DialogHeader title={chrome.i18n.getMessage('dialog_header_unlock')} />
      <DialogCaption text={chrome.i18n.getMessage('bgd_auth_locked_desc')} />
      <InputComponent
        value={password}
        onChange={setPassword}
        logo=""
        placeholder="popup_html_password"
        type={InputType.PASSWORD}
        onEnterPress={login}
      />
      {wrongMk && (
        <div className="error">
          {chrome.i18n.getMessage('dialog_header_wrong_pwd')}
        </div>
      )}
      <div className="fill-space"></div>
      <div className="button-panel">
        <ButtonComponent
          label={'dialog_cancel'}
          type={ButtonType.ALTERNATIVE}
          onClick={() => {
            window.close();
          }}
        />
        <ButtonComponent
          label={'dialog_unlock'}
          onClick={login}
          type={ButtonType.IMPORTANT}
        />
      </div>
      <LoadingComponent hide={!loading} />
    </div>
  );
};
