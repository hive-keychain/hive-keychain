import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/actions/interfaces';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';

export const loadGlobalProperties = (): AppThunk => async (dispatch) => {
  try {
    const [globals, price, rewardFund] = await Promise.all([
      HiveUtils.getClient().database.getDynamicGlobalProperties(),
      HiveUtils.getClient().database.getCurrentMedianHistoryPrice(),
      HiveUtils.getClient().database.call('get_reward_fund', ['post']),
    ]);
    const props = { globals, price, rewardFund };
    console.log(props);
    const action: ActionPayload<GlobalProperties> = {
      type: ActionType.LOAD_GLOBAL_PROPS,
      payload: props,
    };
    dispatch(action);
  } catch (err) {
    Logger.error(err);
  }
};
