import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import CheckboxComponent from 'src/common-ui/checkbox/checkbox.component';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './keychainify.component.scss';

const Keychainify = ({ setTitleContainerProperties }: PropsFromRedux) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_keychainify',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  useEffect(() => {
    LocalStorageUtils.saveValueInLocalStorage(
      LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      enabled,
    );
  }, [enabled]);

  const init = async () => {
    setEnabled(
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.KEYCHAINIFY_ENABLED,
      ),
    );
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_KEYCHAINIFY}-page`}
      className="keychainify-page">
      <div className="intro">
        {chrome.i18n.getMessage('popup_html_keychainify_text')}
      </div>

      <CheckboxComponent
        dataTestId="checkbox-keychainify"
        title="popup_html_enable_keychainify_title"
        checked={enabled}
        onChange={setEnabled}
        hint="popup_html_enable_keychainify_info"></CheckboxComponent>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setTitleContainerProperties });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const KeychainifyComponent = connector(Keychainify);
