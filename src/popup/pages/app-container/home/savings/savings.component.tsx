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
import { Icons } from '@popup/icons.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { PowerType } from '@popup/pages/app-container/home/power-up-down/power-type.enum';
import { SavingOperationType } from '@popup/pages/app-container/home/savings/savings-operation-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import Select, {
  SelectItemRenderer,
  SelectRenderer,
} from 'react-dropdown-select';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { CurrencyListItem } from 'src/interfaces/list-item.interface';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils, { CurrencyLabels } from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import './savings.component.scss';

const SavingsPage = ({
  currencyLabels,
  paramsSelectedCurrency,
  activeAccount,
  globalProperties,
  formParams,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [username, setUsername] = useState(
    formParams.username ? formParams.username : activeAccount.name!,
  );
  const [text, setText] = useState('');
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : 0,
  );
  const [savings, setSavings] = useState<string | number>('...');
  const [liquid, setLiquid] = useState<string | number>('...');

  const [selectedSavingOperationType, setSelectedSavingOperationType] =
    useState<string>(
      formParams.selectedSavingOperationType
        ? formParams.selectedSavingOperationType
        : SavingOperationType.WITHDRAW,
    );
  const [selectedCurrency, setSelectedCurrency] = useState<
    keyof CurrencyLabels
  >(
    formParams.selectedCurrency
      ? formParams.selectedCurrency
      : paramsSelectedCurrency,
  );
  const currency = currencyLabels[selectedCurrency];

  const currencyOptions = [
    { label: currencyLabels.hive, value: 'hive' as keyof CurrencyLabels },
    { label: currencyLabels.hbd, value: 'hbd' as keyof CurrencyLabels },
  ];
  const savingOperationTypeOptions = [
    {
      label: chrome.i18n.getMessage(SavingOperationType.WITHDRAW),
      value: SavingOperationType.WITHDRAW as string,
    },
    {
      label: chrome.i18n.getMessage(SavingOperationType.DEPOSIT),
      value: SavingOperationType.DEPOSIT as string,
    },
  ];

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_savings',
      isBackButtonEnabled: true,
      titleParams: [currency],
    });
  }, [currency]);

  useEffect(() => {
    const hbdSavings = FormatUtils.toNumber(
      activeAccount.account.savings_hbd_balance,
    );
    const hiveSavings = FormatUtils.toNumber(
      activeAccount.account.savings_balance,
    );
    const hbd = FormatUtils.toNumber(activeAccount.account.hbd_balance);
    const hive = FormatUtils.toNumber(activeAccount.account.balance);

    setLiquid(selectedCurrency === 'hive' ? hive : hbd);
    setSavings(selectedCurrency === 'hive' ? hiveSavings : hbdSavings);
  }, [selectedCurrency]);

  useEffect(() => {
    let text = '';
    if (selectedSavingOperationType === SavingOperationType.DEPOSIT) {
      if (selectedCurrency === 'hbd') {
        text = chrome.i18n.getMessage('popup_html_deposit_hbd_text', [
          Number(globalProperties.globals?.hbd_interest_rate) / 100 + '',
        ]);
      }
    } else {
      text = chrome.i18n.getMessage('popup_html_withdraw_text');
    }
    setText(text);
  }, [selectedCurrency, selectedSavingOperationType]);

  const handleButtonClick = () => {
    if (
      (selectedSavingOperationType === SavingOperationType.DEPOSIT &&
        parseFloat(value.toString()) > parseFloat(liquid.toString())) ||
      (selectedSavingOperationType === SavingOperationType.WITHDRAW &&
        parseFloat(value.toString()) > parseFloat(savings.toString()))
    ) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }
    let operationString = chrome.i18n.getMessage(
      selectedSavingOperationType === SavingOperationType.WITHDRAW
        ? 'popup_html_withdraw_param'
        : 'popup_html_deposit_param',
      [currency],
    );

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${currency}`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        selectedSavingOperationType === SavingOperationType.WITHDRAW
          ? 'popup_html_confirm_savings_withdraw'
          : 'popup_html_confirm_savings_deposit',
        [currency],
      ),
      title: operationString,
      skipTitleTranslation: true,
      fields: [
        { label: 'popup_html_value', value: valueS },
        { label: 'popup_html_username', value: `@${username}` },
      ],
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        let success = false;
        switch (selectedSavingOperationType) {
          case SavingOperationType.DEPOSIT:
            addToLoadingList('html_popup_deposit_to_savings_operation');
            success = await HiveUtils.deposit(activeAccount, valueS, username);
            removeFromLoadingList('html_popup_deposit_to_savings_operation');
            break;
          case SavingOperationType.WITHDRAW:
            addToLoadingList('html_popup_withdraw_from_savings_operation');
            success = await HiveUtils.withdraw(activeAccount, valueS);
            removeFromLoadingList('html_popup_withdraw_from_savings_operation');
            break;
        }

        navigateTo(Screen.HOME_PAGE, true);
        if (success) {
          setSuccessMessage(
            selectedSavingOperationType === SavingOperationType.DEPOSIT
              ? 'popup_html_deposit_success'
              : 'popup_html_withdraw_success',
            [`${value} ${selectedCurrency.toUpperCase()}`],
          );
        } else {
          setErrorMessage(
            selectedSavingOperationType === SavingOperationType.DEPOSIT
              ? 'popup_html_deposit_fail'
              : 'popup_html_withdraw_fail',
            [selectedCurrency.toUpperCase()],
          );
        }
      },
    });
  };

  const getFormParams = () => {
    return {
      username: username,
      value: value,
      selectedSavingOperationType: selectedSavingOperationType,
      selectedCurrency: selectedCurrency,
    };
  };

  const setToMax = () => {
    if (selectedSavingOperationType === SavingOperationType.WITHDRAW) {
      setValue(savings);
    } else {
      setValue(liquid);
    }
  };

  const customCurrencyLabelRender = (
    selectProps: SelectRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {currencyLabels[selectedCurrency]}
      </div>
    );
  };
  const customOperationTypeLabelRender = (selectProps: SelectRenderer<any>) => {
    return (
      <div
        className="selected-value"
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {chrome.i18n.getMessage(selectedSavingOperationType)}
      </div>
    );
  };
  const customSavingOperationTimeItemRender = (
    selectProps: SelectItemRenderer<any>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          selectedSavingOperationType === selectProps.item.value
            ? 'selected'
            : ''
        }`}
        onClick={() => {
          setSelectedSavingOperationType(selectProps.item.value as string);
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };
  const customCurrencyItemRender = (
    selectProps: SelectItemRenderer<CurrencyListItem>,
  ) => {
    return (
      <div
        className={`select-account-item ${
          selectedCurrency === selectProps.item.value ? 'selected' : ''
        }`}
        onClick={() => {
          setSelectedCurrency(selectProps.item.value);
          selectProps.methods.dropDown('close');
        }}>
        <div className="currency">{selectProps.item.label}</div>
      </div>
    );
  };

  return (
    <div className="savings-page">
      <AvailableCurrentPanelComponent
        available={liquid}
        availableCurrency={currency}
        availableLabel={'popup_html_savings_available'}
        current={savings}
        currentCurrency={currency}
        currentLabel={'popup_html_savings_current'}
      />

      <Select
        values={[]}
        options={savingOperationTypeOptions}
        onChange={() => undefined}
        contentRenderer={customOperationTypeLabelRender}
        itemRenderer={customSavingOperationTimeItemRender}
        className="select-operation-type select-dropdown"
      />

      {text.length > 0 && <div className="text">{text}</div>}

      {selectedSavingOperationType === SavingOperationType.DEPOSIT && (
        <InputComponent
          type={InputType.TEXT}
          logo={Icons.AT}
          placeholder="popup_html_username"
          value={username}
          onChange={setUsername}
        />
      )}
      <div className="amount-panel">
        <div className="amount-input-panel">
          <InputComponent
            type={InputType.NUMBER}
            placeholder="0.000"
            skipPlaceholderTranslation={true}
            value={value}
            onChange={setValue}
            onSetToMaxClicked={setToMax}
          />
        </div>
        <Select
          values={[]}
          options={currencyOptions}
          onChange={() => undefined}
          contentRenderer={customCurrencyLabelRender}
          itemRenderer={customCurrencyItemRender}
          className="select-currency select-dropdown"
        />
      </div>

      <OperationButtonComponent
        requiredKey={KeychainKeyTypesLC.active}
        label={
          selectedSavingOperationType === SavingOperationType.WITHDRAW
            ? 'popup_html_withdraw_param'
            : 'popup_html_deposit_param'
        }
        labelParams={[currency]}
        onClick={() => handleButtonClick()}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    powerType: state.navigation.stack[0].params.powerType as PowerType,
    globalProperties: state.globalProperties,
    paramsSelectedCurrency: state.navigation.stack[0].params
      .selectedCurrency as keyof CurrencyLabels,
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

export const SavingsPageComponent = connector(SavingsPage);
