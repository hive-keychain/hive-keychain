import { setAccounts } from '@popup/actions/account.actions';
import { navigateTo } from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { BackgroundMessage } from 'src/background/background-message.interface';
import ButtonComponent from 'src/common-ui/button/button.component';
import { BackgroundCommand } from 'src/reference-data/background-message-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import './add-account-main.component.scss';

const AddAccountMain = ({
  mk,
  navigateTo,
  accounts,
  setAccounts,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [importWindow, setImportWindow] = useState<number>();

  const handleAddByKeys = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_KEYS);
  };
  const handleAddByAuth = (): void => {
    navigateTo(Screen.ACCOUNT_PAGE_ADD_BY_AUTH);
  };
  const handleImportKeys = (): void => {
    chrome.windows.getCurrent(async (currentWindow) => {
      const win: chrome.windows.CreateData = {
        url: chrome.runtime.getURL('import-accounts.html'),
        type: 'popup',
        height: 566,
        width: 350,
        left: currentWindow.width! - 350 + currentWindow.left!,
        top: currentWindow.top,
      };
      // Except on Firefox
      //@ts-ignore
      if (typeof InstallTrigger === undefined) win.focused = true;
      const window = await chrome.windows.create(win);
      // setImportWindow(window.id);
      chrome.runtime.onMessage.addListener(onSentBackAccountsListener);
    });
  };

  const onSentBackAccountsListener = (message: BackgroundMessage) => {
    if (message.command === BackgroundCommand.SEND_BACK_IMPORTED_ACCOUNTS) {
      if (!(typeof message.value === 'string') && message.value?.length) {
        setAccounts(message.value);
        // chrome.windows.remove(importWindow!);
      }
      chrome.runtime.onMessage.removeListener(onSentBackAccountsListener);
    }
  };

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_setup',
      isBackButtonEnabled: true,
      isCloseButtonDisabled: !accounts || !accounts.length,
    });
  });

  return (
    <div className="add-account-page" aria-label="addaccount-page">
      <div
        className="caption"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_chose_add_method'),
        }}></div>

      <div className="button-container">
        <ButtonComponent
          label={'popup_html_add_by_keys'}
          onClick={handleAddByKeys}
        />
        {accounts.length > 0 && (
          <ButtonComponent
            label={'popup_html_add_by_auth'}
            onClick={handleAddByAuth}
          />
        )}
        <ButtonComponent
          label={'popup_html_import_keys'}
          onClick={handleImportKeys}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return { accounts: state.accounts, mk: state.mk };
};

const connector = connect(mapStateToProps, {
  navigateTo,
  setAccounts,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AddAccountMainComponent = connector(AddAccountMain);
