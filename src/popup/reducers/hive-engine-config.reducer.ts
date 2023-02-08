import { HiveEngineConfig } from '@interfaces/hive-engine-rpc.interface';
import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import Config from 'src/config';

const HiveEngineConfigReducer = (
  state: HiveEngineConfig = {
    rpc: Config.hiveEngine.rpc,
    mainnet: Config.hiveEngine.mainnet,
    accountHistoryApi: Config.hiveEngine.accountHistoryApi,
  },
  { type, payload }: ActionPayload<Partial<HiveEngineConfig>>,
): HiveEngineConfig => {
  switch (type) {
    case ActionType.HE_SET_ACTIVE_ACCOUNT_HISTORY_API:
      return { ...state, accountHistoryApi: payload?.accountHistoryApi! };
    case ActionType.HE_SET_ACTIVE_RPC:
      return { ...state, rpc: payload?.rpc! };
    case ActionType.HE_LOAD_CONFIG:
      return {
        ...state,
        rpc: payload?.rpc!,
        accountHistoryApi: payload?.accountHistoryApi!,
      };
    default:
      return state;
  }
};

export default HiveEngineConfigReducer;
