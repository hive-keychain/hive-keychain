import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import {
  navigateTo,
  navigateToWithParams,
} from '@popup/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { ConversionType } from '@popup/pages/app-container/home/conversion/conversion-type.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Conversion } from 'src/interfaces/conversion.interface';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './conversion.component.scss';

const Conversion = ({
  currencyLabels,
  activeAccount,
  conversionType,
  conversions,
  formParams,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [available, setAvailable] = useState<string | number>('...');

  const currency =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? currencyLabels.hive
      : currencyLabels.hbd;

  useEffect(() => {
    setTitleContainerProperties({ title: title, isBackButtonEnabled: true });
  }, []);

  useEffect(() => {
    const hiveBalance = FormatUtils.toNumber(activeAccount.account.balance);
    const hbdBalance = FormatUtils.toNumber(activeAccount.account.hbd_balance);

    setAvailable(
      conversionType === ConversionType.CONVERT_HIVE_TO_HBD
        ? hiveBalance
        : hbdBalance,
    );
  }, [activeAccount]);

  const title =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? 'popup_html_convert_hive'
      : 'popup_html_convert_hbd';
  const text =
    conversionType === ConversionType.CONVERT_HIVE_TO_HBD
      ? 'popup_html_convert_hive_intro'
      : 'popup_html_convert_hbd_intro';

  const handleButtonClick = () => {
    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        conversionType === ConversionType.CONVERT_HBD_TO_HIVE
          ? 'popup_html_confirm_hbd_to_hive_conversion'
          : 'popup_html_confirm_hive_to_hbd_conversion',
      ),
      fields: [
        { label: 'popup_html_value', value: valueS },
        { label: 'popup_html_username', value: `@${activeAccount.name!}` },
      ],
      title: title,
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_conversion_operation');
        let success = await HiveUtils.convertOperation(
          activeAccount,
          conversions,
          valueS,
          conversionType,
        );
        removeFromLoadingList('html_popup_conversion_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          setSuccessMessage(
            conversionType === ConversionType.CONVERT_HBD_TO_HIVE
              ? 'popup_html_hbd_to_hive_conversion_success'
              : 'popup_html_hive_to_hbd_conversion_success',
          );
        } else {
          setErrorMessage(
            conversionType === ConversionType.CONVERT_HBD_TO_HIVE
              ? 'popup_html_hbd_to_hive_conversion_fail'
              : 'popup_html_hive_to_hbd_conversion_fail',
          );
        }
      },
    });
  };

  const setToMax = () => {
    setValue(available);
  };

  const getFormParams = () => {
    return {
      value: value,
    };
  };

  return (
    <div className="conversion-page">
      <AvailableCurrentPanelComponent
        available={available}
        availableCurrency={currency}
        availableLabel={'popup_html_available'}
      />
      <div className="text">{chrome.i18n.getMessage(text)}</div>

      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipTranslation={true}
            value={value}
            onChange={setValue}
            onSetToMaxClicked={setToMax}
          />
        </div>
        <div className="currency">{currency}</div>
      </div>

      <OperationButtonComponent
        label={title}
        onClick={() => handleButtonClick()}
        requiredKey={KeychainKeyTypesLC.active}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    conversionType: state.navigation.stack[0].params
      .conversionType as ConversionType,
    conversions: state.conversions as Conversion[],
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
  };
};

const connector = connect(mapStateToProps, {
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const ConversionComponent = connector(Conversion);
