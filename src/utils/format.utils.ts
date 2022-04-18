import { Asset, DynamicGlobalProperties } from '@hiveio/dhive';

const withCommas = (nb: string, decimals = 3) => {
  const currency = nb.split(' ')[1];

  const value = parseFloat(nb).toFixed(decimals);
  var parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let finalNumber = parts.join('.');
  if (currency) {
    finalNumber = finalNumber + ' ' + currency;
  }
  return finalNumber;
};

const toHP = (vests: string, props?: DynamicGlobalProperties) =>
  props
    ? (parseFloat(vests) * parseFloat(props.total_vesting_fund_hive + '')) /
      parseFloat(props.total_vesting_shares + '')
    : 0;

const fromHP = (hp: string, props: DynamicGlobalProperties) =>
  (parseFloat(hp) / parseFloat(props.total_vesting_fund_hive + '')) *
  parseFloat(props.total_vesting_shares + '');

const formatCurrencyValue = (value: string | Asset | number, digits = 3) => {
  if (value === undefined || value === null) {
    return '...';
  }
  return withCommas(
    value.toString().replace('HBD', '').replace('HIVE', '').trim(),
    digits,
  );
};

const nFormatter = (num: number, digits: number) => {
  var si = [
    {
      value: 1,
      symbol: '',
    },
    {
      value: 1e3,
      symbol: 'k',
    },
    {
      value: 1e6,
      symbol: 'M',
    },
    {
      value: 1e9,
      symbol: 'G',
    },
    {
      value: 1e12,
      symbol: 'T',
    },
    {
      value: 1e15,
      symbol: 'P',
    },
    {
      value: 1e18,
      symbol: 'E',
    },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

const hasMoreThanXDecimal = (number: number, decimal: number) => {
  const splitedNumber = number.toString().split('.');
  return splitedNumber.length > 1 ? splitedNumber[1].length > decimal : false;
};

const toNumber = (value: string | Asset) => {
  return parseFloat(value.toString().split(' ')[0].trim());
};

const getSymbol = (nai: string) => {
  if (nai === '@@000000013') return 'HBD';
  if (nai === '@@000000021') return 'HIVE';
  if (nai === '@@000000037') return 'HP';
};

const FormatUtils = {
  withCommas,
  toHP,
  fromHP,
  formatCurrencyValue,
  nFormatter,
  hasMoreThanXDecimal,
  toNumber,
  getSymbol,
};

export default FormatUtils;
