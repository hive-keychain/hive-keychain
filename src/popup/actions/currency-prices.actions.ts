import { ActionType } from '@popup/actions/action-type.enum';
import { AppThunk } from '@popup/actions/interfaces';
import { AppStatus } from '@popup/reducers/app-status.reducer';
import CurrencyPricesUtils from 'src/utils/currency-prices.utils';
import Logger from 'src/utils/logger.utils';

export const loadCurrencyPrices = (): AppThunk => async (dispatch) => {
  try {
    const prices = await CurrencyPricesUtils.getPrices();
    dispatch({
      type: ActionType.LOAD_CURRENCY_PRICES,
      payload: prices,
    });
    dispatch({
      type: ActionType.SET_APP_STATUS,
      payload: { priceLoaded: true } as AppStatus,
    });
  } catch (e) {
    Logger.error('currency price error', (e as any).toString());
  }
};
