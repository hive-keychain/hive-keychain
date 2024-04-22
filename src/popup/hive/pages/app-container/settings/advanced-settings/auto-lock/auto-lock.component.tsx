import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { setSuccessMessage } from '@popup/multichain/actions/message.actions';
import { goBack } from '@popup/multichain/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/multichain/actions/title-container.actions';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { CheckboxPanelComponent } from 'src/common-ui/checkbox/checkbox-panel/checkbox-panel.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import AutolockUtils from 'src/utils/autolock.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const AutoLock = ({
  setSuccessMessage,
  goBack,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [selectedType, setSelectedType] = useState(AutoLockType.DEFAULT);
  const [interval, setInterval] = useState(10);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_autolock',
      isBackButtonEnabled: true,
    });
    init();
  }, []);

  const init = async () => {
    const autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    setSelectedType(
      autolock && autolock.type ? autolock.type : AutoLockType.DEFAULT,
    );
    setInterval(autolock && autolock.mn ? autolock.mn : 10);
  };

  const save = async () => {
    LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.AUTOLOCK, {
      type: selectedType,
      mn: interval,
    });
    AutolockUtils.initBackgroundAutolock();
    setSuccessMessage('popup_html_save_successful');
    goBack();
  };

  return (
    <div
      data-testid={`${Screen.SETTINGS_AUTO_LOCK}-page`}
      className="auto-lock-page">
      <div className="fields">
        <CheckboxPanelComponent
          dataTestId={`checkbox-auto-lock-${AutoLockType.DEFAULT}`}
          title="popup_html_al_default_title"
          hint="popup_html_al_default_info"
          checked={selectedType === AutoLockType.DEFAULT}
          onChange={() =>
            setSelectedType(AutoLockType.DEFAULT)
          }></CheckboxPanelComponent>
        <CheckboxPanelComponent
          dataTestId={`checkbox-auto-lock-${AutoLockType.DEVICE_LOCK}`}
          title="popup_html_al_locked_title"
          hint="popup_html_al_locked_info"
          checked={selectedType === AutoLockType.DEVICE_LOCK}
          onChange={() =>
            setSelectedType(AutoLockType.DEVICE_LOCK)
          }></CheckboxPanelComponent>
        <CheckboxPanelComponent
          dataTestId={`checkbox-auto-lock-${AutoLockType.IDLE_LOCK}`}
          title="popup_html_al_idle_title"
          hint="popup_html_al_idle_info"
          checked={selectedType === AutoLockType.IDLE_LOCK}
          onChange={() =>
            setSelectedType(AutoLockType.IDLE_LOCK)
          }></CheckboxPanelComponent>

        {selectedType === AutoLockType.IDLE_LOCK && (
          <InputComponent
            dataTestId="amount-input"
            value={interval}
            onChange={setInterval}
            placeholder="10"
            type={InputType.NUMBER}
            onEnterPress={() => save()}
          />
        )}
      </div>

      <ButtonComponent
        dataTestId="button-save"
        label={'popup_html_save'}
        onClick={() => save()}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, {
  setSuccessMessage,
  goBack,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutoLockComponent = connector(AutoLock);
