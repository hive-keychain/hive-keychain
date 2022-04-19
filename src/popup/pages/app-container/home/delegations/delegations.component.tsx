import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import {
  loadDelegatees,
  loadDelegators,
} from '@popup/actions/delegations.actions';
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
import { DelegationType } from '@popup/pages/app-container/home/delegations/delegation-type.enum';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import Icon, { IconType } from 'src/common-ui/icon/icon.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { Conversion as Delegations } from 'src/interfaces/conversion.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import { Screen } from 'src/reference-data/screen.enum';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import TransferUtils from 'src/utils/transfer.utils';
import './delegations.component.scss';

const Delegations = ({
  currencyLabels,
  activeAccount,
  delegations,
  globalProperties,
  formParams,
  navigateToWithParams,
  navigateTo,
  setSuccessMessage,
  setErrorMessage,
  loadDelegators,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
}: PropsFromRedux) => {
  const [username, setUsername] = useState<string>(
    formParams.username ? formParams.username : '',
  );
  const [value, setValue] = useState<string | number>(
    formParams.value ? formParams.value : '',
  );
  const [available, setAvailable] = useState<string | number>('...');

  const [totalIncoming, setTotalIncoming] = useState<string | number>('...');
  const [totalOutgoing, setTotalOutgoing] = useState<string | number>('...');

  const [autocompleteTransferUsernames, setAutocompleteTransferUsernames] =
    useState([]);

  const [incomingError, setIncomingError] = useState<string | null>(null);

  const loadAutocompleteTransferUsernames = async () => {
    const transferTo = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.FAVORITE_USERS,
    );
    setAutocompleteTransferUsernames(
      transferTo ? transferTo[activeAccount.name!] : [],
    );
  };

  useEffect(() => {
    loadDelegators(activeAccount.name!);
    loadDelegatees(activeAccount.name!);
    setAvailable(0);
    loadAutocompleteTransferUsernames();
    setTitleContainerProperties({
      title: 'popup_html_delegations',
      isBackButtonEnabled: true,
    });
  }, []);

  useEffect(() => {
    if (delegations.incoming) {
      const totalIncomingVests = delegations.incoming.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);
      setTotalIncoming(
        FormatUtils.toHP(totalIncomingVests.toString(), globalProperties),
      );
    } else {
      setIncomingError('popup_html_error_retrieving_incoming_delegations');
    }
    if (delegations.outgoing) {
      const totalOutgoingVests = delegations.outgoing.reduce((prev, cur) => {
        return (
          prev + Number(cur.vesting_shares.toString().replace(' VESTS', ''))
        );
      }, 0);

      setTotalOutgoing(
        FormatUtils.toHP(totalOutgoingVests.toString(), globalProperties),
      );
    }

    const totalHp = FormatUtils.toHP(
      activeAccount.account.vesting_shares as string,
      globalProperties,
    );

    setAvailable(Math.max(totalHp - Number(totalOutgoing) - 5, 0));
  }, [delegations]);

  const setToMax = () => {
    setValue(Number(available).toFixed(3));
  };

  const goToIncomings = () => {
    if (!incomingError)
      navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
        delegationType: DelegationType.INCOMING,
      });
  };
  const goToOutgoing = () => {
    navigateToWithParams(Screen.INCOMING_OUTGOING_PAGE, {
      delegationType: DelegationType.OUTGOING,
    });
  };

  const handleButtonClick = () => {
    if (parseFloat(value.toString()) > parseFloat(available.toString())) {
      setErrorMessage('popup_html_power_up_down_error');
      return;
    }

    if (Number(value) <= 0) {
      cancelDelegation();
    }

    const valueS = `${parseFloat(value.toString()).toFixed(3)} ${
      currencyLabels.hp
    }`;

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('popup_html_confirm_delegation', [
        valueS,
        `@${username}`,
      ]),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${username}` },
        { label: 'popup_html_value', value: valueS },
      ],
      title: 'popup_html_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_delegation_operation');
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          FormatUtils.fromHP(value.toString(), globalProperties!).toFixed(6) +
            ' VESTS',
        );
        removeFromLoadingList('html_popup_delegation_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(username, activeAccount);
          setSuccessMessage('popup_html_delegation_successful');
        } else {
          setErrorMessage('popup_html_delegation_fail');
        }
      },
    });
  };

  const cancelDelegation = () => {
    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage(
        'popup_html_confirm_cancel_delegation_message',
      ),
      fields: [
        { label: 'popup_html_transfer_from', value: `@${activeAccount.name!}` },
        { label: 'popup_html_transfer_to', value: `@${username}` },
      ],
      title: 'popup_html_cancel_delegation',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList('html_popup_cancel_delegation_operation');
        let success = await HiveUtils.delegateVestingShares(
          activeAccount,
          username,
          '0.000000 VESTS',
        );

        removeFromLoadingList('html_popup_cancel_delegation_operation');

        if (success) {
          navigateTo(Screen.HOME_PAGE, true);
          await TransferUtils.saveTransferRecipient(username, activeAccount);
          setSuccessMessage('popup_html_cancel_delegation_successful');
        } else {
          setErrorMessage('popup_html_cancel_delegation_fail');
        }
      },
    });
  };

  const getFormParams = () => {
    return {
      value: value,
      username: username,
    };
  };

  return (
    <div className="delegations-page">
      <div className="text">
        {chrome.i18n.getMessage('popup_html_delegations_text')}
      </div>

      <div className="delegations-summary">
        <div className="total-incoming" onClick={goToIncomings}>
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_incoming')}
          </div>
          <div
            className="value"
            onClick={() => {
              if (incomingError) setErrorMessage(incomingError);
            }}>
            {incomingError && (
              <Icon
                name={Icons.ERROR}
                type={IconType.OUTLINED}
                tooltipMessage={incomingError}></Icon>
            )}
            <span>
              + {FormatUtils.withCommas(totalIncoming.toString())}{' '}
              {currencyLabels.hp}
            </span>
          </div>
        </div>
        <div className="total-outgoing" onClick={goToOutgoing}>
          <div className="label">
            {chrome.i18n.getMessage('popup_html_total_outgoing')}
          </div>
          <div className="value">
            - {FormatUtils.withCommas(totalOutgoing.toString())}{' '}
            {currencyLabels.hp}
          </div>
        </div>
        <div className="divider"></div>
        <div className="total-available">
          <div className="label">
            {chrome.i18n.getMessage('popup_html_available')}
          </div>
          <div className="value">
            {FormatUtils.withCommas(available.toString())} {currencyLabels.hp}
          </div>
        </div>
      </div>

      <InputComponent
        value={username}
        onChange={setUsername}
        logo={Icons.AT}
        placeholder="popup_html_username"
        type={InputType.TEXT}
        autocompleteValues={autocompleteTransferUsernames}
      />

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
        <div className="currency">{currencyLabels.hp}</div>
      </div>

      <OperationButtonComponent
        label={'popup_html_delegate_to_user'}
        onClick={() => handleButtonClick()}
        requiredKey={KeychainKeyTypesLC.active}
        fixToBottom
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    delegations: state.delegations,
    globalProperties: state.globalProperties.globals,
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
  loadDelegators,
  loadDelegatees,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const DelegationsComponent = connector(Delegations);
