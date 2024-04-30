import { SwapCryptosEstimationDisplay } from '@interfaces/swap-cryptos.interface';
import {
  SimpleSwapProvider,
  StealthexProvider,
  SwapCryptosMerger,
} from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos.utils';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { ThrottleSettings, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import {
  ComplexeCustomSelect,
  OptionItem,
} from 'src/common-ui/custom-select/custom-select.component';
import { FormContainer } from 'src/common-ui/form-container/form-container.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import RotatingLogoComponent from 'src/common-ui/rotating-logo/rotating-logo.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import Config from 'src/config';
import { useCountdown } from 'src/dialog/hooks/countdown.hook';
import FormatUtils from 'src/utils/format.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import Logger from 'src/utils/logger.utils';

const HIVE_OPTION_ITEM = {
  label: 'HIVE',
  subLabel: 'HIVE',
  value: 'HIVE',
  img: `/assets/images/wallet/hive-logo.svg`,
} as OptionItem;

const SwapCryptos = ({ price }: PropsFromRedux) => {
  const [swapCryptos, setSetswapCryptos] = useState<SwapCryptosMerger>();
  const [loadingMinMaxAccepted, setLoadingMinMaxAccepted] = useState(false);
  const [
    pairedCurrencyOptionsInitialList,
    setPairedCurrencyOptionsInitialList,
  ] = useState<OptionItem[]>([]);
  const [amount, setAmount] = useState('');
  const [startToken, setStartToken] = useState<OptionItem>();
  const [exchangeRangeAmount, setExchangeRangeAmount] = useState({
    min: 0,
    max: 0,
  });
  const [endToken, setEndToken] = useState<OptionItem>();
  const [startTokenListOptions, setStartTokenListOptions] = useState<
    OptionItem[]
  >([]);
  const [endTokenListOptions, setEndTokenListOptions] = useState<OptionItem[]>(
    [],
  );
  const [estimations, setEstimations] = useState<
    SwapCryptosEstimationDisplay[]
  >([]);
  const [loadingEstimation, setLoadingEstimation] = useState(false);
  const { countdown, refreshCountdown, nullifyCountdown } = useCountdown(
    Config.swapCryptos.autoRefreshPeriodSec,
    () => {
      if (
        parseFloat(amount) > 0 &&
        Number(amount) >= exchangeRangeAmount.min &&
        !loadingMinMaxAccepted &&
        startToken &&
        endToken &&
        swapCryptos
      ) {
        setLoadingEstimation(true);
        getExchangeEstimate(
          amount,
          startToken,
          endToken,
          loadingMinMaxAccepted,
          exchangeRangeAmount,
          swapCryptos,
        );
      }
    },
  );
  useEffect(() => {
    init();
    return () => {
      throttledRefresh.cancel();
    };
  }, []);

  const throttledRefresh = useMemo(() => {
    return throttle(
      (
        newAmount,
        newStartToken,
        newEndToken,
        newLoadingMinMaxAccepted,
        newExchangeRangeAmount,
        newSwapCryptos,
      ) => {
        getExchangeEstimate(
          newAmount,
          newStartToken,
          newEndToken,
          newLoadingMinMaxAccepted,
          newExchangeRangeAmount,
          newSwapCryptos,
        );
      },
      1000,
      { leading: false } as ThrottleSettings,
    );
  }, []);

  useEffect(() => {
    throttledRefresh(
      amount,
      startToken,
      endToken,
      loadingMinMaxAccepted,
      exchangeRangeAmount,
      swapCryptos,
    );
  }, [
    amount,
    startToken,
    endToken,
    loadingMinMaxAccepted,
    exchangeRangeAmount,
  ]);

  useEffect(() => {
    if (startToken && endToken) {
      setLoadingMinMaxAccepted(true);
      getMinAndMax(startToken, endToken);
    }
  }, [startToken, endToken]);

  const init = async () => {
    try {
      const newSwapCryptos = new SwapCryptosMerger([
        new StealthexProvider(false),
        new SimpleSwapProvider(true),
      ]);
      setSetswapCryptos(newSwapCryptos);
      newSwapCryptos.getCurrencyOptions('HIVE').then((currencyOptions) => {
        setPairedCurrencyOptionsInitialList(currencyOptions);
      });
    } catch (error) {
      Logger.log({ error });
    }
  };

  useEffect(() => {
    if (pairedCurrencyOptionsInitialList.length) {
      initializeFromStorage(pairedCurrencyOptionsInitialList);
    }
  }, [pairedCurrencyOptionsInitialList]);

  const initializeFromStorage = async (
    pairedCurrencyOptionsList: OptionItem[],
  ) => {
    const lastCryptoEstimation =
      await LocalStorageUtils.getValueFromLocalStorage(
        LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
      );
    let tempStartTokenOptionItem = HIVE_OPTION_ITEM;
    let tempStartTokenOptionItemList = [HIVE_OPTION_ITEM];
    let tempEndtTokenOptionItem = pairedCurrencyOptionsList[0];
    let tempEndTokenOptionItemList = pairedCurrencyOptionsList;
    if (lastCryptoEstimation) {
      tempStartTokenOptionItem =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.from,
            )!;
      tempStartTokenOptionItemList =
        lastCryptoEstimation.from === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
      tempEndtTokenOptionItem =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? HIVE_OPTION_ITEM
          : pairedCurrencyOptionsList.find(
              (i) => i.subLabel! === lastCryptoEstimation.to,
            )!;
      tempEndTokenOptionItemList =
        lastCryptoEstimation.to === HIVE_OPTION_ITEM.subLabel!
          ? [HIVE_OPTION_ITEM]
          : pairedCurrencyOptionsList;
    }
    setStartToken(tempStartTokenOptionItem);
    setStartTokenListOptions(tempStartTokenOptionItemList);
    setEndToken(tempEndtTokenOptionItem);
    setEndTokenListOptions(tempEndTokenOptionItemList);
  };

  const getMinAndMax = async (
    startTokenOption: OptionItem,
    endTokenOption: OptionItem,
  ) => {
    try {
      await swapCryptos
        ?.getMinMaxAccepted(startTokenOption, endTokenOption)
        .then((res) => {
          if (res) {
            if (res.length === 1) {
              setExchangeRangeAmount({ min: res[0].amount, max: 0 });
            } else if (res.length > 1) {
              const minValue = res.sort((a, b) => a.amount - b.amount)[0]
                .amount;
              setExchangeRangeAmount({
                min: minValue,
                max: 0,
              });
            }
          }
        });
      setLoadingMinMaxAccepted(false);
    } catch (error) {
      Logger.log({ error });
    }
  };

  const getExchangeEstimate = async (
    newAmount: string,
    newStartToken: OptionItem,
    newEndToken: OptionItem,
    newLoadingMinMaxAccepted: boolean,
    newExchangeRangeAmount: { min: number; max: number },
    newSwapCryptos: SwapCryptosMerger,
  ) => {
    if (
      parseFloat(newAmount) > 0 &&
      parseFloat(newAmount) >= newExchangeRangeAmount.min &&
      !newLoadingMinMaxAccepted &&
      newStartToken &&
      newEndToken &&
      newSwapCryptos
    ) {
      try {
        setLoadingEstimation(true);
        newSwapCryptos
          .getExchangeEstimation(
            newAmount,
            newStartToken.subLabel!,
            newEndToken.subLabel!,
          )
          .then((res) => {
            setEstimations(
              res.map(({ estimation }) => {
                return { ...estimation };
              }),
            );
            LocalStorageUtils.saveValueInLocalStorage(
              LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
              {
                from: newStartToken.subLabel!,
                to: newEndToken.subLabel!,
              },
            );
          });
        setLoadingEstimation(false);
        refreshCountdown();
      } catch (error) {
        Logger.log({ error });
      }
    } else if (parseFloat(newAmount) === 0 || !newAmount.trim().length) {
      setEstimations([]);
      nullifyCountdown();
    }
  };

  const swapStartAndEnd = () => {
    const tempStarTokentListOptions = [...startTokenListOptions];
    const tempEndTokenListOptions = [...endTokenListOptions];
    const tempStartToken = { ...startToken! };
    const tempEndToken = { ...endToken! };
    setEndToken(tempStartToken);
    setStartToken(tempEndToken);
    setStartTokenListOptions(tempEndTokenListOptions);
    setEndTokenListOptions(tempStarTokentListOptions);
    setEstimations([]);
    setAmount('');
  };

  return (
    <div className="swap-cryptos">
      {startTokenListOptions.length !== 0 &&
      startToken &&
      endTokenListOptions.length !== 0 &&
      endToken ? (
        <FormContainer>
          <div className="form-fields">
            <div className="start-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  //@ts-ignore
                  selectedItem={startToken}
                  options={startTokenListOptions}
                  setSelectedItem={setStartToken}
                  label="token"
                  filterable={startTokenListOptions.length > 1}
                />
                <InputComponent
                  type={InputType.NUMBER}
                  value={amount}
                  onChange={setAmount}
                  label="popup_html_transfer_amount"
                  placeholder="popup_html_transfer_amount"
                  min={0}
                />
              </div>
            </div>
            {exchangeRangeAmount.min > 0 && (
              <div className="min-amount">
                {chrome.i18n.getMessage(
                  'html_popup_swap_crypto_min_accepted_label',
                )}{' '}
                {FormatUtils.formatCurrencyValue(exchangeRangeAmount.min)}
              </div>
            )}
            <SVGIcon
              icon={SVGIcons.SWAPS_SWITCH}
              className="swap-icon"
              onClick={swapStartAndEnd}
            />
            <div className="end-token">
              <div className="inputs">
                <ComplexeCustomSelect
                  selectedItem={endToken}
                  options={endTokenListOptions}
                  setSelectedItem={setEndToken}
                  label="token"
                  filterable={endTokenListOptions.length > 1}
                />
              </div>
            </div>
            <div className="estimations">
              <div className="quote-label-wrapper">
                {estimations.length !== 0 && (
                  <span className="quote-label">
                    {chrome.i18n.getMessage('quotes')}
                  </span>
                )}
                {!!countdown && estimations.length !== 0 && (
                  <span className="countdown">
                    {chrome.i18n.getMessage('swap_autorefresh', countdown + '')}
                  </span>
                )}
              </div>
              <div className="quotes">
                {loadingEstimation && (
                  <div className="rotating-logo-container">
                    <RotatingLogoComponent />
                  </div>
                )}
                {!loadingEstimation &&
                  estimations.map((estimation) => {
                    const key =
                      estimation.name +
                      estimation.from +
                      estimation.to +
                      estimation.amount;
                    return (
                      <div
                        className="quote"
                        key={key}
                        onClick={() => {
                          window.open(estimation.link, '__blank');
                        }}>
                        <SVGIcon icon={`buy/${estimation.logo}` as SVGIcons} />
                        <div className="receive">
                          <div className="icon-label">
                            <PreloadedImage
                              className="left-image"
                              src={
                                estimation.to === 'HIVE'
                                  ? HIVE_OPTION_ITEM.img!
                                  : pairedCurrencyOptionsInitialList.find(
                                      (i) => i.subLabel === estimation.to,
                                    )?.img!
                              }
                              alt={`side-icon-${estimation.to}`}
                            />
                            <span>{estimation.to}</span>
                          </div>
                          <span className="amount">
                            {FormatUtils.formatCurrencyValue(
                              estimation.estimation,
                            )}
                          </span>
                        </div>
                        <span className="chevron">
                          <SVGIcon icon={SVGIcons.SELECT_ARROW_RIGHT} />
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </FormContainer>
      ) : (
        <div className="rotating-logo-container">
          <RotatingLogoComponent />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    price: state.hive.currencyPrices,
  };
};

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

export const SwapCryptosComponent = connector(SwapCryptos);
function buildUrl(arg0: string): string {
  throw new Error('Function not implemented.');
}
