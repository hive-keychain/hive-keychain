import { FavoriteUserItems } from '@interfaces/favorite-user.interface';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
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
import { fetchPhishingAccounts } from '@popup/actions/phishing.actions';
import { setTitleContainerProperties } from '@popup/actions/title-container.actions';
import { Icons } from '@popup/icons.enum';
import { AvailableCurrentPanelComponent } from '@popup/pages/app-container/home/power-up-down/available-current-panel/available-current-panel.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import AccountUtils from 'src/utils/account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import BlockchainTransactionUtils from 'src/utils/tokens.utils';
import TransferUtils from 'src/utils/transfer.utils';
import './tokens-transfer.component.scss';

const TokensTransfer = ({
  activeAccount,
  tokenBalance,
  phishing,
  formParams,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [receiverUsername, setReceiverUsername] = useState(
    formParams.receiverUsername ? formParams.receiverUsername : '',
  );
  const [amount, setAmount] = useState(
    formParams.amount ? formParams.amount : '',
  );

  const balance = formParams.balance
    ? formParams.balance
    : tokenBalance.balance;
  const symbol = formParams.symbol ? formParams.symbol : tokenBalance.symbol;

  const [memo, setMemo] = useState(formParams.memo ? formParams.memo : '');
  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState<string[]>([]);

  useEffect(() => {
    setTitleContainerProperties({
      title: 'popup_html_transfer_tokens',
      isBackButtonEnabled: true,
    });
    fetchPhishingAccounts();
    loadAutocompleteTransferUsernames();
  }, []);

  const loadAutocompleteTransferUsernames = async () => {
    const transferTo: FavoriteUserItems =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.FAVORITE_USERS,
      );
    setAutocompleteTransferUsernames(
      transferTo ? transferTo[activeAccount.name!] : [],
    );
  };

  const setAmountToMaxValue = () => {
    setAmount(balance.toString());
  };

  const getFormParams = () => {
    return {
      receiverUsername: receiverUsername,
      amount: amount,
      symbol: symbol,
      balance: balance,
      memo: memo,
    };
  };

  const handleClickOnSend = async () => {
    if (
      String(receiverUsername).trim().length === 0 ||
      amount.toString().trim().length === 0
    ) {
      setErrorMessage('popup_accounts_fill');
      return;
    }

    if (parseFloat(amount.toString()) < 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount.toString()) > parseFloat(balance.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (!(await AccountUtils.doesAccountExist(receiverUsername))) {
      setErrorMessage('popup_no_such_account');
      return;
    }

    const formattedAmount = `${parseFloat(amount.toString()).toFixed(
      3,
    )} ${symbol}`;

    let memoField = memo;
    if (memo.length) {
      if (memo.startsWith('#')) {
        memoField = `${memo} (${chrome.i18n.getMessage('popup_encrypted')})`;
        if (!activeAccount.keys.memo) {
          setErrorMessage('popup_html_memo_key_missing');
          return;
        }
      }
    } else {
      memoField = chrome.i18n.getMessage('popup_empty');
    }

    const fields = [
      { label: 'popup_html_transfer_from', value: `@${activeAccount.name}` },
      { label: 'popup_html_transfer_to', value: `@${receiverUsername}` },
      { label: 'popup_html_transfer_amount', value: formattedAmount },
      { label: 'popup_html_transfer_memo', value: memoField },
    ];

    let warningMessage = await TransferUtils.getExchangeValidationWarning(
      receiverUsername,
      symbol,
      memo.length > 0,
    );

    if (phishing.includes(receiverUsername)) {
      warningMessage = chrome.i18n.getMessage('popup_warning_phishing', [
        receiverUsername,
      ]);
    }

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_token_confirm_text'),
      fields: fields,
      warningMessage: warningMessage,
      title: 'popup_html_transfer_tokens',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        let memoParam = memo;
        if (memo.length) {
          if (memo.startsWith('#')) {
            if (!activeAccount.keys.memo) {
              setErrorMessage('popup_html_memo_key_missing');
              return;
            } else {
              memoParam = HiveUtils.encodeMemo(
                memo,
                activeAccount.keys.memo.toString(),
                await AccountUtils.getPublicMemo(receiverUsername),
              );
            }
          }
        }

        const json = {
          contractName: 'tokens',
          contractAction: 'transfer',
          contractPayload: {
            symbol: symbol,
            to: receiverUsername,
            quantity: amount,
            memo: memo,
          },
        };

        addToLoadingList('html_popup_transfer_token_operation');
        let sendTokenResult: any = await HiveUtils.sendCustomJson(
          json,
          activeAccount,
        );
        if (!!sendTokenResult) {
          addToLoadingList('html_popup_confirm_transaction_operation');
          removeFromLoadingList('html_popup_transfer_token_operation');
          let confirmationResult: any =
            await BlockchainTransactionUtils.tryConfirmTransaction(
              sendTokenResult,
            );
          removeFromLoadingList('html_popup_confirm_transaction_operation');
          if (confirmationResult.confirmed) {
            navigateTo(Screen.HOME_PAGE, true);
            await TransferUtils.saveFavoriteUser(
              receiverUsername,
              activeAccount,
            );

            setSuccessMessage('popup_html_transfer_successful', [
              `@${receiverUsername}`,
              formattedAmount,
            ]);
          } else {
            setErrorMessage('popup_token_timeout');
          }
        } else {
          removeFromLoadingList('html_popup_transfer_token_operation');
          setErrorMessage('popup_html_transfer_failed');
        }
      },
    });
  };

  return (
    <div aria-label="transfer-tokens-page" className="transfer-tokens-page">
      <AvailableCurrentPanelComponent
        available={balance}
        availableCurrency={symbol}
        availableLabel={'popup_html_balance'}></AvailableCurrentPanelComponent>

      <div className="disclaimer">
        {chrome.i18n.getMessage('popup_html_tokens_send_text')}
      </div>
      <InputComponent
        ariaLabel="input-username"
        type={InputType.TEXT}
        logo={Icons.AT}
        placeholder="popup_html_username"
        value={receiverUsername}
        onChange={setReceiverUsername}
        autocompleteValues={autocompleteTransferUsernames}
      />
      <div className="value-panel">
        <div className="value-input-panel">
          <InputComponent
            ariaLabel="amount-input"
            type={InputType.NUMBER}
            placeholder="0.000"
            skipPlaceholderTranslation={true}
            value={amount}
            onChange={setAmount}
            onSetToMaxClicked={setAmountToMaxValue}
          />
        </div>
        <div className="symbol">{symbol}</div>
      </div>

      <InputComponent
        ariaLabel="input-memo-optional"
        type={InputType.TEXT}
        placeholder="popup_html_memo_optional"
        value={memo}
        onChange={setMemo}
      />
      <OperationButtonComponent
        ariaLabel="button-send-tokens-transfer"
        requiredKey={KeychainKeyTypesLC.active}
        label={'popup_html_send_transfer'}
        onClick={handleClickOnSend}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    tokenBalance: state.navigation.stack[0].params
      ?.tokenBalance as TokenBalance,
    formParams: state.navigation.stack[0].previousParams?.formParams
      ? state.navigation.stack[0].previousParams?.formParams
      : {},
    phishing: state.phishing,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  fetchPhishingAccounts,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokensTransferComponent = connector(TokensTransfer);
