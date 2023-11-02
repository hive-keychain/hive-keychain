import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import { SwapConfig } from '@interfaces/swap-token.interface';
import { Token } from '@interfaces/tokens.interface';
import {
  addToLoadingList,
  removeFromLoadingList,
} from '@popup/hive/actions/loading.actions';
import {
  setErrorMessage,
  setSuccessMessage,
  setWarningMessage,
} from '@popup/hive/actions/message.actions';
import {
  goBackToThenNavigate,
  navigateTo,
  navigateToWithParams,
} from '@popup/hive/actions/navigation.actions';
import { setTitleContainerProperties } from '@popup/hive/actions/title-container.actions';
import { loadTokensMarket } from '@popup/hive/actions/token.actions';
import { RootState } from '@popup/hive/store';
import { BaseCurrencies } from '@popup/hive/utils/currency.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import { Screen } from '@reference-data/screen.enum';
import { IStep } from 'hive-keychain-commons';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import 'react-tabs/style/react-tabs.scss';
import { OperationButtonComponent } from 'src/common-ui/button/operation-button.component';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { CustomTooltip } from 'src/common-ui/custom-tooltip/custom-tooltip.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import Icon from 'src/common-ui/icon/icon.component';
import { NewIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SelectOption } from 'src/common-ui/select/custom-select.component';
import ServiceUnavailablePage from 'src/common-ui/service-unavailable-page/service-unavailable-page.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import FormatUtils from 'src/utils/format.utils';
import Logger from 'src/utils/logger.utils';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

const TokenSwaps = ({
  activeAccount,
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  goBackToThenNavigate,
  addToLoadingList,
  removeFromLoadingList,
  setTitleContainerProperties,
  loadTokensMarket,
  setWarningMessage,
  price,
  tokenMarket,
}: PropsFromRedux) => {
  const [layerTwoDelayed, setLayerTwoDelayed] = useState(false);
  const [swapConfig, setSwapConfig] = useState({} as SwapConfig);
  const [underMaintenance, setUnderMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [slippage, setSlippage] = useState(5);
  const [amount, setAmount] = useState<string>('');

  const [startToken, setStartToken] = useState<OptionItem>();
  const [endToken, setEndToken] = useState<OptionItem>();
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    OptionItem[]
  >([]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<OptionItem[]>(
    [],
  );
  const [estimate, setEstimate] = useState<IStep[]>();
  const [estimateValue, setEstimateValue] = useState<string | undefined>();

  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<
    number | null
  >(null);

  const [isAdvancedParametersOpen, setIsAdvancedParametersOpen] =
    useState(false);

  const [serviceUnavailable, setServiceUnavailable] = useState(false);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (newAmount, newEndToken, newStartToken, swapConfig) => {
        if (parseFloat(newAmount) > 0 && newEndToken && newStartToken) {
          calculateEstimate(newAmount, newStartToken, newEndToken, swapConfig);
          setAutoRefreshCountdown(Config.swaps.autoRefreshPeriodSec);
        }
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  useEffect(() => {
    throttledRefresh(amount, endToken, startToken, swapConfig);
  }, [amount, endToken, startToken, swapConfig]);

  useEffect(() => {
    init();
    setTitleContainerProperties({
      title: 'popup_html_token_swaps',
      isBackButtonEnabled: true,
    });
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const init = async () => {
    let tokenInitialization;
    try {
      if (!tokenMarket.length) loadTokensMarket();
      setLoading(true);
      tokenInitialization = initTokenSelectOptions();
      const [serverStatus, config] = await Promise.all([
        SwapTokenUtils.getServerStatus(),
        SwapTokenUtils.getConfig(),
      ]);

      setUnderMaintenance(serverStatus.isMaintenanceOn);
      setSwapConfig(config);
      if (
        serverStatus.layerTwoDelayed &&
        (!['HIVE', 'HBD'].includes(endToken?.value.symbol) ||
          !['HIVE', 'HBD'].includes(startToken?.value.symbol))
      ) {
        setLayerTwoDelayed(true);
        setWarningMessage('swap_layer_two_delayed');
      }
      setSlippage(config.slippage.default);
    } catch (err: any) {
      Logger.error(err);
      setServiceUnavailable(true);
      setErrorMessage(err.reason?.template, err.reason?.params);
    } finally {
      await tokenInitialization;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRefreshCountdown === null) {
      return;
    }

    if (autoRefreshCountdown === 0 && startToken && endToken) {
      calculateEstimate(amount, startToken, endToken, swapConfig);
      setAutoRefreshCountdown(Config.swaps.autoRefreshPeriodSec);
      return;
    }

    const a = setTimeout(() => {
      setAutoRefreshCountdown(autoRefreshCountdown! - 1);
    }, 1000);

    return () => {
      clearTimeout(a);
    };
  }, [autoRefreshCountdown]);

  const initTokenSelectOptions = async () => {
    const [startList, allTokens] = await Promise.all([
      SwapTokenUtils.getSwapTokenStartList(activeAccount.account),
      TokensUtils.getAllTokens(),
    ]);
    let list = startList.map((token) => {
      const tokenInfo = allTokens.find((t) => t.symbol === token.symbol);
      let img = '';
      let imgBackup = '';
      if (tokenInfo) {
        img =
          tokenInfo.metadata.icon && tokenInfo.metadata.icon.length > 0
            ? tokenInfo.metadata.icon
            : '/assets/images/wallet/hive-engine.svg';
        imgBackup = '/assets/images/wallet/hive-engine.svg';
      } else {
        img =
          token.symbol === BaseCurrencies.HIVE.toUpperCase()
            ? `/assets/images/wallet/${NewIcons.HIVE}-logo.svg`
            : `/assets/images/wallet/${NewIcons.HBD}-logo.svg`;
      }
      return {
        value: token,
        label: token.symbol,
        img: img,
        imgBackup,
      };
    });
    let endList: SelectOption[] = [
      {
        value: { symbol: BaseCurrencies.HIVE.toUpperCase(), precision: 3 },
        label: BaseCurrencies.HIVE.toUpperCase(),
        img: `/assets/images/wallet/${NewIcons.HIVE}-logo.svg`,
      },
      {
        value: { symbol: BaseCurrencies.HBD.toUpperCase(), precision: 3 },
        label: BaseCurrencies.HBD.toUpperCase(),
        img: `/assets/images/wallet/${NewIcons.HBD}-logo.svg`,
      },
      ...allTokens
        .filter((token: Token) => token.precision !== 0) // Remove token that doesn't allow decimals
        .map((token: Token) => {
          let img = '';
          img = token.metadata.icon ?? '/assets/images/wallet/hive-engine.svg';
          return {
            value: token,
            label: token.symbol,
            img: img,
            imgBackup: '/assets/images/wallet/hive-engine.svg',
          };
        }),
    ];

    const lastUsed = await SwapTokenUtils.getLastUsed();
    setStartToken(
      lastUsed.from
        ? list.find((t) => t.value.symbol === lastUsed.from.symbol) || list[0]
        : list[0],
    );
    setStartTokenListOptions(list);
    const endTokenToSet = lastUsed.to
      ? endList.find((t) => t.value.symbol === lastUsed.to.symbol)
      : endList[1];
    setEndToken(endTokenToSet);
    setEndTokenListOptions(endList);
  };

  const calculateEstimate = async (
    amount: string,
    startToken: SelectOption,
    endToken: SelectOption,
    swapConfig: SwapConfig,
  ) => {
    if (startToken === endToken) {
      setErrorMessage('swap_start_end_token_should_be_different');
      return;
    }

    try {
      setLoadingEstimate(true);
      setEstimate(undefined);
      setEstimateValue(undefined);
      const result: IStep[] = await SwapTokenUtils.getEstimate(
        startToken?.value.symbol,
        endToken?.value.symbol,
        amount,
        () => {
          setAutoRefreshCountdown(null);
        },
      );

      if (result.length) {
        const precision = await TokensUtils.getTokenPrecision(
          result[result.length - 1].endToken,
        );
        const value = Number(result[result.length - 1].estimate);
        const fee =
          (Number(result[result.length - 1].estimate) * swapConfig.fee.amount) /
          100;
        const finalValue = Number(value - fee).toFixed(precision);
        setEstimate(result);
        setEstimateValue(finalValue);
      } else {
        setEstimateValue(undefined);
      }
    } catch (err: any) {
      setEstimate(undefined);
      setErrorMessage(err.reason.template, err.reason.params);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const processSwap = async () => {
    if (!estimate) {
      setErrorMessage('swap_no_estimate_error');
      return;
    }
    if (slippage < swapConfig.slippage.min) {
      setErrorMessage('swap_min_slippage_error', [
        swapConfig.slippage.min.toString(),
      ]);
      return;
    }
    if (startToken?.value.symbol === endToken?.value.symbol) {
      setErrorMessage('swap_start_end_token_should_be_different');
      return;
    }
    if (!amount || amount.length === 0) {
      setErrorMessage('popup_html_need_positive_amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(startToken?.value.balance)) {
      setErrorMessage('hive_engine_overdraw_balance_error', [
        startToken?.label!,
      ]);
      return;
    }
    let estimateId: string;
    try {
      estimateId = await SwapTokenUtils.saveEstimate(
        estimate!,
        slippage,
        startToken?.value.symbol,
        endToken?.value.symbol,
        parseFloat(amount),
        activeAccount.name!,
      );
    } catch (err: any) {
      setErrorMessage(err.reason.template, err.reason.params);
      return;
    }

    const startTokenPrecision = await TokensUtils.getTokenPrecision(
      startToken?.value.symbol,
    );
    const endTokenPrecision = await TokensUtils.getTokenPrecision(
      endToken?.value.symbol,
    );

    const fields = [
      { label: 'html_popup_swap_swap_id', value: estimateId },
      {
        label: 'html_popup_swap_swap_amount',
        value: `${FormatUtils.withCommas(
          Number(amount).toFixed(startTokenPrecision),
        )} ${startToken?.value.symbol} => ${FormatUtils.withCommas(
          estimateValue!.toString(),
        )} ${endToken?.value.symbol}`,
      },
      {
        label: 'html_popup_swap_swap_slipperage',
        value: `${slippage}% (for each step)`,
      },
    ];

    navigateToWithParams(Screen.CONFIRMATION_PAGE, {
      message: chrome.i18n.getMessage('html_popup_swap_token_confirm_message'),
      fields: fields,
      title: 'html_popup_swap_token_confirm_title',
      formParams: getFormParams(),
      afterConfirmAction: async () => {
        addToLoadingList(
          'html_popup_swap_sending_token_to_swap_account',
          KeysUtils.getKeyType(
            activeAccount.keys.active!,
            activeAccount.keys.activePubkey!,
          ),
          [startToken?.value.symbol, swapConfig.account],
        );
        try {
          let success;

          success = await SwapTokenUtils.processSwap(
            estimateId,
            startToken?.value.symbol,
            parseFloat(amount),
            activeAccount,
            swapConfig.account,
          );

          removeFromLoadingList(
            'html_popup_swap_sending_token_to_swap_account',
          );

          if (success) {
            await SwapTokenUtils.saveLastUsed(
              startToken?.value,
              endToken?.value,
            );
            await SwapTokenUtils.setAsInitiated(estimateId);
            setSuccessMessage('html_popup_swap_sending_token_successful');
            goBackToThenNavigate(Screen.TOKENS_SWAP_HISTORY);
          } else {
            setErrorMessage('html_popup_swap_error_sending_token', [
              swapConfig.account,
            ]);
          }
        } catch (err: any) {
          setErrorMessage(err.message);
        } finally {
          removeFromLoadingList('html_popup_delegate_rc_operation');
        }
      },
      afterCancelAction: async () => {
        await SwapTokenUtils.cancelSwap(estimateId);
      },
    });
  };

  const getFormParams = () => {
    return {
      startToken: startToken,
      endToken: endToken,
      amount: amount,
      slipperage: slippage,
    };
  };

  const swapStartAndEnd = () => {
    const option = startTokenListOptions.find(
      (option) => option.value.symbol === endToken?.value.symbol,
    );
    if (option) {
      const tmp = startToken;
      setStartToken(option);
      setEndToken(tmp);
    } else {
      setErrorMessage('swap_cannot_switch_tokens', endToken?.value.symbol);
    }
  };

  const getTokenUSDPrice = (
    estimateValue: string | undefined,
    symbol: string,
  ) => {
    if (!estimateValue) return '';
    else {
      let tokenPrice;
      if (symbol === BaseCurrencies.HIVE.toUpperCase()) {
        tokenPrice = price.hive.usd!;
      } else if (symbol === BaseCurrencies.HBD.toUpperCase()) {
        tokenPrice = price.hive_dollar.usd!;
      } else {
        tokenPrice =
          TokensUtils.getHiveEngineTokenPrice(
            {
              symbol,
            },
            tokenMarket,
          ) * price.hive.usd!;
      }
      return `≈ $${FormatUtils.withCommas(
        Number.parseFloat(estimateValue) * tokenPrice + '',
        2,
      )}`;
    }
  };

  if (loading)
    return (
      <div className="rotating-logo-wrapper">
        <RotatingLogoComponent />
      </div>
    );
  else if (!startTokenListOptions.length) {
    return (
      <div className="token-swaps" aria-label="token-swaps">
        <div>
          <div className="caption">
            {' '}
            {chrome.i18n.getMessage('swap_no_token')}
          </div>
        </div>
      </div>
    );
  } else
    return (
      <div className="token-swaps" aria-label="token-swaps">
        {!loading && !underMaintenance && !serviceUnavailable && (
          <>
            <div className="caption">
              {chrome.i18n.getMessage('swap_caption')}
            </div>

            <div className="top-row">
              <div className="fee">
                {chrome.i18n.getMessage('swap_fee')}: {swapConfig.fee?.amount}%
              </div>
              <SVGIcon
                className="swap-history-button"
                icon={NewIcons.SWAPS_HISTORY}
                onClick={() => navigateTo(Screen.TOKENS_SWAP_HISTORY)}
              />
            </div>
            <FormContainer>
              <div className="form-fields">
                <div className="start-token">
                  <div className="inputs">
                    {startTokenListOptions.length > 0 && startToken && (
                      <ComplexeCustomSelect
                        selectedItem={startToken}
                        options={startTokenListOptions}
                        setSelectedItem={setStartToken}
                        label="token"
                        filterable
                      />
                    )}
                    <InputComponent
                      type={InputType.NUMBER}
                      value={amount}
                      onChange={setAmount}
                      label="popup_html_transfer_amount"
                      placeholder="popup_html_transfer_amount"
                      min={0}
                      rightActionClicked={() =>
                        setAmount(startToken?.value.balance)
                      }
                      rightActionIcon={NewIcons.INPUT_MAX}
                    />
                  </div>
                  <span className="available">
                    {chrome.i18n.getMessage('popup_html_available')} :{' '}
                    {startToken?.value.balance
                      ? FormatUtils.withCommas(startToken?.value.balance)
                      : ''}
                  </span>
                </div>
                <SVGIcon
                  icon={NewIcons.SWAPS_SWITCH}
                  onClick={swapStartAndEnd}
                  className="swap-icon"
                />
                <div className="end-token">
                  <div className="inputs">
                    {endTokenListOptions.length > 0 && endToken && (
                      <ComplexeCustomSelect
                        selectedItem={endToken}
                        options={endTokenListOptions}
                        setSelectedItem={setEndToken}
                        label="token"
                        filterable
                      />
                    )}
                    <CustomTooltip
                      message={getTokenUSDPrice(
                        estimateValue,
                        endToken?.value.symbol,
                      )}
                      position={'top'}
                      skipTranslation>
                      <InputComponent
                        type={InputType.TEXT}
                        value={
                          estimateValue
                            ? FormatUtils.withCommas(estimateValue!)
                            : ''
                        }
                        disabled
                        onChange={() => {}}
                        placeholder="popup_html_transfer_amount"
                        // rightIcon={
                        //   autoRefreshCountdown ? (
                        //     <Icon
                        //       name={Icons.REFRESH}
                        //       type={IconType.OUTLINED}
                        //       onClick={() => {
                        //         calculateEstimate(
                        //           amount,
                        //           startToken!,
                        //           endToken!,
                        //           swapConfig!,
                        //         );
                        //         setAutoRefreshCountdown(
                        //           Config.swaps.autoRefreshPeriodSec,
                        //         );
                        //       }}
                        //       rotate={loadingEstimate}
                        //       additionalClassName="right"
                        //     />
                        //   ) : undefined
                        // } // TODO fix
                      />
                    </CustomTooltip>
                  </div>
                  <div className="countdown">
                    {!!autoRefreshCountdown && (
                      <>
                        {
                          <span>
                            {chrome.i18n.getMessage(
                              'swap_autorefresh',
                              autoRefreshCountdown + '',
                            )}
                          </span>
                        }
                      </>
                    )}
                  </div>
                </div>
                <div className="advanced-parameters">
                  <div
                    className="title-panel"
                    onClick={() =>
                      setIsAdvancedParametersOpen(!isAdvancedParametersOpen)
                    }>
                    <div className="title">
                      {chrome.i18n.getMessage('swap_advanced_parameters')}
                    </div>
                    <Icon
                      name={NewIcons.SELECT_ARROW_DOWN}
                      onClick={() =>
                        setIsAdvancedParametersOpen(!isAdvancedParametersOpen)
                      }
                    />
                  </div>
                  {isAdvancedParametersOpen && (
                    <div className="advanced-parameters-container">
                      <InputComponent
                        type={InputType.NUMBER}
                        min={5}
                        step={1}
                        value={slippage}
                        onChange={setSlippage}
                        label="html_popup_swaps_slipperage"
                        placeholder="html_popup_swaps_slipperage"
                        // tooltip="html_popup_swaps_slippage_definition"
                      />
                    </div>
                  )}
                </div>
              </div>
              <OperationButtonComponent
                requiredKey={KeychainKeyTypesLC.active}
                onClick={processSwap}
                label={'html_popup_swaps_process_swap'}
              />
            </FormContainer>
          </>
        )}

        {underMaintenance && (
          <div className="maintenance-mode">
            <SVGIcon icon={NewIcons.MESSAGE_ERROR} />
            <div className="text">
              {chrome.i18n.getMessage('swap_under_maintenance')}
            </div>
          </div>
        )}
        {serviceUnavailable && <ServiceUnavailablePage />}
      </div>
    );
};

const mapStateToProps = (state: RootState) => {
  return {
    activeAccount: state.activeAccount,
    price: state.currencyPrices,
    tokenMarket: state.tokenMarket,
  };
};

const connector = connect(mapStateToProps, {
  setErrorMessage,
  setSuccessMessage,
  navigateToWithParams,
  navigateTo,
  addToLoadingList,
  removeFromLoadingList,
  goBackToThenNavigate,
  setTitleContainerProperties,
  loadTokensMarket,
  setWarningMessage,
});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const TokenSwapsComponent = connector(TokenSwaps);
