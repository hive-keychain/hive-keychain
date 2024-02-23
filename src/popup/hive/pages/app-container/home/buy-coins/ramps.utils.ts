import { BaseApi } from '@api/base';
import {
  BaseProviderInterface,
  RampConfig,
  RampEstimation,
  RampEstimationDisplay,
  RampFiatCurrency,
  RampType,
  Ramps,
} from '@interfaces/ramps.interface';
import CountriesUtils from '@popup/hive/utils/countries.utils';
import Config from 'src/config';

const APP_CUSTOMIZATION = {
  name: 'Keychain',
  logo: {
    dark: encodeURIComponent(
      'https://files.peakd.com/file/peakd-hive/stoodkev/23wqq23h2SeH2CpQVWfDgnVb5Hed5eSGcgSbA8Nnw1dvTgc7s2NbFoiH43qfov1ffkdX4.png',
    ),
    light: encodeURIComponent(
      'https://files.peakd.com/file/peakd-hive/stoodkev/23vhVyjc1ZwPtNAusEY23XchLyMJPQ8L8k6DETxA5LMGCcRd6bxwTDEtAzod1b5Byqxwm.png',
    ),
  },
};
//TODO : Customize and apply in links
class BaseProvider {
  baseUrl: string;
  apiKey: string;
  fiatCurrencyOptions: RampFiatCurrency[] = [];
  constructor(rampConfig: RampConfig) {
    this.baseUrl = rampConfig.baseUrl;
    this.apiKey = rampConfig.apiKey;
  }
}

export class TransakProvider
  extends BaseProvider
  implements BaseProviderInterface
{
  constructor() {
    super(Config.ramps.transak);
    this.name = 'Transak';
    this.logo = 'logoTransak';
    //TODO : Update
  }
  name: string;
  logo: string;
  getEstimation = async (
    rampType: RampType,
    amount: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    network: string,
  ) => {
    if (rampType === RampType.SELL) return [];
    const fiat = this.fiatCurrencyOptions.find(
      (e) => e.symbol === fiatCurrency,
    );
    if (!fiat) return [];
    const paymentOptions = fiat.paymentMethods
      .filter((e) => e.isActive)
      .map((e) => e.id);

    return (
      await Promise.all(
        paymentOptions!.map((po) => {
          return BaseApi.get(
            BaseApi.buildUrl(this.baseUrl, 'api/v1/pricing/public/quotes'),
            {
              partnerApiKey: this.apiKey,
              fiatCurrency: fiatCurrency,
              cryptoCurrency,
              isBuyOrSell: rampType.toString(),
              network: 'mainnet', //TODO: remove hardcoded
              paymentMethod: po,
              [rampType === RampType.BUY ? 'fiatAmount' : 'cryptoAmount']:
                amount.toString(),
            },
          );
        }),
      )
    ).map(
      (e) =>
        ({
          ramp: Ramps.TRANSAK,
          type: rampType,
          amount,
          estimation:
            rampType === RampType.BUY
              ? e.response.cryptoAmount
              : e.response.fiatAmount,
          crypto: e.response.cryptoCurrency,
          fiat: e.response.fiatCurrency,
          network: e.response.network,
          quote: e.response.quoteId,
          paymentMethod: e.response.paymentMethod,
        } as RampEstimation),
    );
  };

  getFiatCurrencyOptions = async (): Promise<RampFiatCurrency[]> => {
    const currencyList = await BaseApi.get(
      BaseApi.buildUrl(this.baseUrl, 'api/v2/currencies/fiat-currencies'),
    );
    this.fiatCurrencyOptions = currencyList.response
      .filter((e: any) => e.isAllowed)
      .map((e: any) => {
        return {
          icon: e.icon,
          name: e.name,
          symbol: e.symbol,
          paymentMethods: e.paymentOptions,
        };
      });
    return this.fiatCurrencyOptions;
  };
  getLink = (estimation: RampEstimation, name: string) => {
    return `https://global.transak.com/?apiKey=${this.apiKey}&cryptoCurrencyCode=${estimation.crypto}&fiatAmount=${estimation.amount}&fiatCurrency=${estimation.fiat}&paymentMethod=${estimation.paymentMethod}&productsAvailed=${estimation.type}&walletAddress=${name}&partnerOrderId=null&network=${estimation.network}&exchangeScreenTitle=Buy%20${estimation.crypto}&isFeeCalculationHidden=true&quoteId=${estimation.quote}&hideExchangeScreen=true&disableWalletAddressForm=true&productsAvailed=BUY`;
  };
}

export class RampProvider
  extends BaseProvider
  implements BaseProviderInterface
{
  constructor() {
    super(Config.ramps.ramp);
    this.name = 'Ramp';
    this.logo = 'logoRamp';
  }
  name: string;
  logo: string;
  getFiatCurrencyOptions = async (): Promise<RampFiatCurrency[]> => {
    const currencyList = await BaseApi.get(
      BaseApi.buildUrl(this.baseUrl, 'api/host-api/v3/currencies'),
    );
    this.fiatCurrencyOptions = currencyList.map((e: any) => {
      return { symbol: e.fiatCurrency, name: e.name };
    });
    return this.fiatCurrencyOptions;
  };
  getLink = (estimation: RampEstimation, name: string) => {
    return `https://app.${
      process.env.RAMP_DEV_API_KEY ? 'demo.' : ''
    }ramp.network/?hostAppName=${APP_CUSTOMIZATION.name}&hostLogoUrl=${
      APP_CUSTOMIZATION.logo.light
    }&hostApiKey=${this.apiKey}&fiatValue=${estimation.amount}&fiatCurrency=${
      estimation.fiat
    }&swapAsset=${estimation.crypto}&userAddress=${name}&paymentMethodType=${
      estimation.paymentMethod
    }`;
  };
  getEstimation = async (
    rampType: RampType,
    amount: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    network: string,
  ): Promise<RampEstimation[]> => {
    if (rampType === RampType.SELL) return [];
    else {
      const result = await BaseApi.post(
        BaseApi.buildUrl(
          this.baseUrl,
          `api/host-api/v3/onramp/quote/all\?hostApiKey\=${this.apiKey}`,
        ),
        {
          cryptoAssetSymbol: `${cryptoCurrency}_${network}`,
          fiatCurrency: fiatCurrency,
          fiatValue: amount,
        },
      );
      const options = [];
      for (const paymentMethod in result) {
        options.push({ paymentMethod, ...result[paymentMethod] });
      }
      return options.map((e: any) => ({
        ramp: Ramps.RAMP,
        type: rampType,
        network,
        crypto: cryptoCurrency,
        fiat: fiatCurrency,
        amount: e.fiatValue,
        estimation: +e.cryptoAmount,
        paymentMethod: e.paymentMethod,
      }));
    }
  };
}

export class RampMerger {
  providers: BaseProviderInterface[];
  constructor(providers: BaseProviderInterface[]) {
    this.providers = providers;
  }
  getFiatCurrencyOptions = async () => {
    let fiatCurrencies: RampFiatCurrency[] = [];

    for (const provider of this.providers) {
      const options = await provider.getFiatCurrencyOptions();
      for (const option of options) {
        const i = fiatCurrencies.findIndex((e) => e.symbol === option.symbol);
        if (i >= 0) fiatCurrencies[i] = { ...fiatCurrencies[i], ...option };
        else fiatCurrencies.push(option);
      }
    }
    fiatCurrencies.map(
      (e) =>
        (e.icon = `https://cdn.jsdelivr.net/gh/madebybowtie/FlagKit@2.2/Assets/SVG/${CountriesUtils.getCountryFromCurrency(
          e.symbol,
        )}.svg`),
    );

    // Show current currency first, then EUR and USD, then the rest by alphabetical order
    const current = fiatCurrencies.shift();
    const eur = fiatCurrencies.find((e) => e.symbol === 'EUR');
    const usd = fiatCurrencies.find((e) => e.symbol === 'USD');
    fiatCurrencies = fiatCurrencies.filter(
      (e) => !['EUR', 'USD'].includes(e.symbol),
    );

    return [
      current,
      eur || undefined,
      usd || undefined,
      ...fiatCurrencies.sort((a, b) => {
        return a.symbol < b.symbol ? -1 : 1;
      }),
    ].filter((e) => !!e);
  };

  getEstimations = async (
    rampType: RampType,
    amount: number,
    fiatCurrency: string,
    cryptoCurrency: string,
    network: string,
    name: string,
  ): Promise<RampEstimationDisplay[]> => {
    const estimations = await Promise.all(
      this.providers.map(async (provider) => {
        return (
          await provider.getEstimation(
            rampType,
            amount,
            fiatCurrency,
            cryptoCurrency,
            network,
          )
        ).map(
          (estimation) =>
            ({
              ...estimation,
              link: provider.getLink(estimation, name),
              logo: provider.logo,
              name: provider.name,
            } as RampEstimationDisplay),
        );
      }),
    );
    return estimations.reduce((acc, val) => [...acc, ...val], []);
  };
}
