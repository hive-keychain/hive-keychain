import { Asset } from '@hiveio/dhive';
import { Conversion } from '@interfaces/conversion.interface';
import { fetchConversionRequests } from '@popup/actions/conversion.actions';
import {
  HBDDropdownMenuItems,
  HiveDropdownMenuItems,
  HpDropdownMenuItems,
} from '@popup/pages/app-container/home/wallet-info-section/wallet-info-dropdown-menus.list';
import { WalletInfoSectionItemComponent } from '@popup/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import { RootState } from '@popup/store';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import CurrencyUtils from 'src/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import './wallet-info-section.component.scss';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
  conversions,
  fetchConversionRequests,
}: PropsFromRedux) => {
  const [delegationAmount, setDelegationAmount] = useState<string | number>(
    '...',
  );

  const [hiveRowInfoContent, setHiveRowInfoContent] = useState<
    string | undefined
  >(undefined);
  const [hbdRowInfoContent, setHbdRowInfoContent] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (activeAccount && !ActiveAccountUtils.isEmpty(activeAccount)) {
      fetchConversionRequests(activeAccount.name!);

      const delegatedVestingShares = parseFloat(
        activeAccount.account.delegated_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const receivedVestingShares = parseFloat(
        activeAccount.account.received_vesting_shares
          .toString()
          .replace(' VESTS', ''),
      );
      const delegationVestingShares = (
        receivedVestingShares - delegatedVestingShares
      ).toFixed(3);

      const delegation = FormatUtils.toHP(
        delegationVestingShares,
        globalProperties.globals,
      );
      setDelegationAmount(delegation);
    }
  }, [activeAccount]);

  useEffect(() => {
    const pendingHbdConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HBD';
    });
    if (pendingHbdConversions.length > 0) {
      setHbdRowInfoContent(
        chrome.i18n.getMessage('popup_html_pending_conversions', [
          pendingHbdConversions.length.toString(),
          'HIVE',
        ]),
      );
    }

    const pendingHiveConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HIVE';
    });

    if (pendingHiveConversions.length > 0) {
      setHiveRowInfoContent(
        chrome.i18n.getMessage('popup_html_pending_conversions', [
          pendingHiveConversions.length.toString(),
          'HIVE',
        ]),
      );
    }
  }, [conversions]);

  return (
    <div className="wallet-info-section">
      <WalletInfoSectionItemComponent
        mainValue={activeAccount.account.balance}
        mainValueLabel={currencyLabels.hive}
        subValue={activeAccount.account.savings_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        menuItems={HiveDropdownMenuItems}
        infoContent={hiveRowInfoContent}
      />
      <WalletInfoSectionItemComponent
        mainValue={activeAccount.account.hbd_balance}
        mainValueLabel={currencyLabels.hbd}
        subValue={activeAccount.account.savings_hbd_balance}
        subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        menuItems={HBDDropdownMenuItems}
        infoContent={hbdRowInfoContent}
      />
      <WalletInfoSectionItemComponent
        mainValue={FormatUtils.toHP(
          activeAccount.account.vesting_shares as string,
          globalProperties.globals,
        )}
        mainValueLabel={currencyLabels.hp}
        subValue={delegationAmount}
        subValueLabel={
          chrome.i18n.getMessage('popup_html_delegations').length <= 5
            ? chrome.i18n.getMessage('popup_html_delegations')
            : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) + '.'
        }
        menuItems={HpDropdownMenuItems}
      />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    currencyLabels: CurrencyUtils.getCurrencyLabels(state.activeRpc?.testnet!),
    globalProperties: state.globalProperties,
    delegations: state.delegations,
    conversions: state.conversions,
  };
};

const connector = connect(mapStateToProps, {
  fetchConversionRequests,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
