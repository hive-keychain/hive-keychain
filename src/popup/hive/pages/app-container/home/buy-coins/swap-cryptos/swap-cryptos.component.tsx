import { SwapCryptosEstimationDisplay } from '@interfaces/swap-cryptos.interface';
import { SwapCryptosUtils } from '@popup/hive/pages/app-container/home/buy-coins/swap-cryptos/swap-cryptos.utils';
import { RootState } from '@popup/multichain/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    init();
  }, []);

  //TODO important
  //    - Implement in classes.
  const init = async () => {
    try {
      const pairedCurrencyOptionsList =
        await SwapCryptosUtils.getPairedCurrencyOptionItemList('HIVE');
      console.log({ pairedCurrencyOptionsList }); //TODO remove line
      setPairedCurrencyOptionsInitialList(pairedCurrencyOptionsList);

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
    } catch (error) {
      Logger.log({ error });
    }
  };

  const getMinAndMax = async (
    startTokenSymbol: string,
    endTokenSymbol: string,
  ) => {
    try {
      const response =
        await SwapCryptosUtils.getMinAndMaxAmountAcceptedCustomFee(
          startTokenSymbol,
          endTokenSymbol,
        );
      if (response) {
        setExchangeRangeAmount({ min: response.min_amount, max: 0 });
      }
      setLoadingMinMaxAccepted(false);
    } catch (error) {
      Logger.log({ error });
    }
  };

  useEffect(() => {
    if (startToken && endToken) {
      setLoadingMinMaxAccepted(true);
      getMinAndMax(startToken.subLabel!, endToken.subLabel!);
    }
  }, [startToken, endToken]);

  useEffect(() => {
    if (
      parseFloat(amount) > 0 &&
      Number(amount) >= exchangeRangeAmount.min &&
      !loadingMinMaxAccepted &&
      startToken &&
      endToken
    ) {
      setLoadingEstimation(true);
      getExchangeEstimate(amount, startToken, endToken);
    }
  }, [amount, endToken, loadingMinMaxAccepted]);

  const getExchangeEstimate = async (
    amount: string,
    startToken: OptionItem,
    endToken: OptionItem,
  ) => {
    try {
      const estimation = await SwapCryptosUtils.getExchangeEstimationCustomFee(
        amount,
        startToken.subLabel!,
        endToken.subLabel!,
      );
      setEstimations([estimation]);
      await LocalStorageUtils.saveValueInLocalStorage(
        LocalStorageKeyEnum.LAST_CRYPTO_ESTIMATION,
        {
          from: startToken.subLabel!,
          to: endToken.subLabel!,
        },
      );
      setLoadingEstimation(false);
    } catch (error) {
      Logger.log({ error });
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
                Min Accepted:{' '}
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
                {/* {!!countdown && (
                  <span className="countdown">
                    {chrome.i18n.getMessage('swap_autorefresh', countdown + '')}
                  </span>
                )} */}
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
