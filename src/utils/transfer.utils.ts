import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { LocalStorageKeyEnum } from 'src/reference-data/local-storage-key.enum';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getExchangeValidationWarning = async (
  account: string,
  currency: string,
  hasMemo: any,
) => {
  const exchanges = [
    { account: 'bittrex', tokens: ['HIVE', 'HBD'] },
    { account: 'deepcrypto8', tokens: ['HIVE'] },
    { account: 'binance-hot', tokens: [] },
    { account: 'ionomy', tokens: ['HIVE', 'HBD'] },
    { account: 'huobi-pro', tokens: ['HIVE'] },
    { account: 'huobi-withdrawal', tokens: [] },
    { account: 'blocktrades', tokens: ['HIVE', 'HBD'] },
    { account: 'mxchive', tokens: ['HIVE'] },
    { account: 'hot.dunamu', tokens: [] },
    { account: 'probithive', tokens: ['HIVE'] },
    { account: 'probitred', tokens: [] },
    { account: 'upbitsteem', tokens: [] },
  ];

  const exchange = exchanges.find((exchange) => exchange.account === account);
  if (!exchange) return null;
  if (!exchange.tokens.includes(currency)) {
    return chrome.i18n.getMessage('popup_warning_exchange_deposit', [currency]);
  }
  if (!hasMemo) return chrome.i18n.getMessage('popup_warning_exchange_memo');
  if (exchange.account === 'bittrex') {
    const info = await CurrencyPricesUtils.getBittrexCurrency(currency);
    if (info && !info.IsActive) {
      return chrome.i18n.getMessage('popup_warning_exchange_wallet');
    }
  }
  return null;
};

const saveFavoriteUser = async (
  username: string,
  activeAccount: ActiveAccount,
) => {
  let transferTo = await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
  );
  if (!transferTo) {
    transferTo = { [activeAccount.name!]: [] };
  }
  if (!transferTo[activeAccount.name!]) {
    transferTo[activeAccount.name!] = [];
  }

  if (!transferTo[activeAccount.name!].includes(username)) {
    transferTo[activeAccount.name!].push(username);
  }
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.FAVORITE_USERS,
    transferTo,
  );
};

const TransferUtils = {
  getExchangeValidationWarning,
  saveTransferRecipient: saveFavoriteUser,
};

export default TransferUtils;
