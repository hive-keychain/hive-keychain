import { Asset } from '@hiveio/dhive';
import { Conversion } from '@interfaces/conversion.interface';
import { TokenBalance } from '@interfaces/tokens.interface';
import { navigateTo } from '@popup/hive/actions/navigation.actions';
import {
  loadTokens,
  loadTokensMarket,
  loadUserTokens,
} from '@popup/hive/actions/token.actions';
import { WalletInfoSectionItemComponent } from '@popup/hive/pages/app-container/home/wallet-info-section/wallet-info-section-item/wallet-info-section-item.component';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { Screen } from '@reference-data/screen.enum';
import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { fetchConversionRequests } from 'src/popup/hive/actions/conversion.actions';
import { RootState } from 'src/popup/hive/store';
import ActiveAccountUtils from 'src/popup/hive/utils/active-account.utils';
import CurrencyUtils from 'src/popup/hive/utils/currency.utils';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const WalletInfoSection = ({
  activeAccount,
  currencyLabels,
  globalProperties,
  conversions,
  userTokens,
  market,
  allTokens,
  fetchConversionRequests,
  loadTokensMarket,
  navigateTo,
  loadUserTokens,
  loadTokens,
}: PropsFromRedux) => {
  const [delegationAmount, setDelegationAmount] = useState<string | number>(
    '...',
  );

  const [filteredTokenList, setFilteredTokenList] = useState<TokenBalance[]>();
  const [hiddenTokens, setHiddenTokens] = useState<string[]>([]);
  const [tokenFilter, setTokenFilter] = useState('');
  const [showSearchHE, setShowSearchHE] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHiddenTokens = async () => {
    setHiddenTokens(
      (await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.HIDDEN_TOKENS,
      )) ?? [],
    );
  };

  useEffect(() => {
    if (activeAccount && !ActiveAccountUtils.isEmpty(activeAccount)) {
      loadHiddenTokens();
      loadTokens();
      loadTokensMarket();
      loadUserTokens(activeAccount.name!);
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
  }, [activeAccount.name]);

  useEffect(() => {
    if (userTokens.loading) {
      // addToLoadingList('html_popup_loading_tokens_operation');
    } else if (userTokens.list && market.length) {
      // removeFromLoadingList('html_popup_loading_tokens_operation');
      const orderedFiltered = userTokens.list
        .filter((token) => !hiddenTokens.includes(token.symbol))
        .sort(
          (a, b) =>
            TokensUtils.getHiveEngineTokenValue(b, market) -
            TokensUtils.getHiveEngineTokenValue(a, market),
        );
      setFilteredTokenList(orderedFiltered);
    }
  }, [userTokens, market]);

  useEffect(() => {
    const pendingHbdConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HBD';
    });
    if (pendingHbdConversions.length > 0) {
      // setHbdRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHbdConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }

    const pendingHiveConversions = conversions.filter((conv: Conversion) => {
      return Asset.fromString(conv.amount).symbol === 'HIVE';
    });

    if (pendingHiveConversions.length > 0) {
      // setHiveRowInfoContent(
      //   chrome.i18n.getMessage('popup_html_pending_conversions', [
      //     pendingHiveConversions.length.toString(),
      //     'HIVE',
      //   ]),
      // );
    }
  }, [conversions]);

  return (
    <div className="wallet-info-wrapper">
      <div className="wallet-background" />
      <div className="wallet-info-section">
        <WalletInfoSectionItemComponent
          tokenSymbol="HIVE"
          icon={NewIcons.WALLET_HIVE_LOGO}
          mainValue={activeAccount.account.balance}
          mainValueLabel={currencyLabels.hive}
          subValue={activeAccount.account.savings_balance}
          subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        />
        <WalletInfoSectionItemComponent
          tokenSymbol="HBD"
          icon={NewIcons.WALLET_HBD_LOGO}
          mainValue={activeAccount.account.hbd_balance}
          mainValueLabel={currencyLabels.hbd}
          subValue={activeAccount.account.savings_hbd_balance}
          subValueLabel={chrome.i18n.getMessage('popup_html_wallet_savings')}
        />
        <WalletInfoSectionItemComponent
          tokenSymbol="HP"
          icon={NewIcons.WALLET_HP_LOGO}
          mainValue={FormatUtils.toHP(
            activeAccount.account.vesting_shares as string,
            globalProperties.globals,
          )}
          mainValueLabel={currencyLabels.hp}
          subValue={delegationAmount}
          subValueLabel={
            chrome.i18n.getMessage('popup_html_delegations').length <= 5
              ? chrome.i18n.getMessage('popup_html_delegations')
              : chrome.i18n.getMessage('popup_html_delegations').slice(0, 5) +
                '.'
          }
        />
        <div className="hive-engine-separator">
          <span>
            <SVGIcon icon={NewIcons.HIVE_ENGINE} />
            <p className="sub-value">Hive Engine</p>
          </span>
          <div className="line" />

          <InputComponent
            classname={`token-searchbar ${showSearchHE ? '' : 'hide'}`}
            type={InputType.TEXT}
            placeholder="popup_html_search"
            onChange={(e) => {
              setTokenFilter(e);
            }}
            value={tokenFilter}
            rightActionIcon={NewIcons.WALLET_SEARCH}
            rightActionClicked={() => {
              setShowSearchHE(false);
            }}
            ref={inputRef}
          />

          <SVGIcon
            icon={NewIcons.WALLET_SEARCH}
            className={`token-search ${!showSearchHE ? '' : 'hide'}`}
            onClick={() => {
              setShowSearchHE(true);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 200);
            }}
          />

          <SVGIcon
            icon={NewIcons.SETTINGS}
            onClick={() => {
              navigateTo(Screen.TOKENS_FILTER);
            }}
          />
        </div>
        {allTokens?.length > 0 &&
        filteredTokenList &&
        filteredTokenList.length > 0 ? (
          <>
            {/* <Separator type={'horizontal'} /> */}
            <FlatList
              list={filteredTokenList}
              renderItem={(token: TokenBalance) => (
                <WalletInfoSectionItemComponent
                  key={`token-${token.symbol}`}
                  tokenSymbol={token.symbol}
                  tokenBalance={token}
                  tokenInfo={allTokens.find((t) => t.symbol === token.symbol)}
                  tokenMarket={market}
                  icon={NewIcons.HIVE_ENGINE}
                  addBackground
                  mainValue={token.balance}
                  mainValueLabel={token.symbol}
                />
              )}
              renderOnScroll
              searchBy="symbol"
              searchTerm={tokenFilter}
              searchCaseInsensitive
            />
          </>
        ) : (
          <div className="no-token">
            {chrome.i18n.getMessage('html_tokens_none_available')}
          </div>
        )}
      </div>
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
    userTokens: state.userTokens,
    market: state.tokenMarket,
    allTokens: state.tokens,
  };
};

const connector = connect(mapStateToProps, {
  fetchConversionRequests,
  loadTokensMarket,
  loadUserTokens,
  loadTokens,
  navigateTo,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const WalletInfoSectionComponent = connector(WalletInfoSection);
