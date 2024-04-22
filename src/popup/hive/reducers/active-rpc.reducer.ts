import { ActionPayload } from '@popup/multichain/actions/interfaces';
import { Rpc } from 'src/interfaces/rpc.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';

export const ActiveRpcReducer = (
  state: Rpc = { uri: 'NULL', testnet: false },
  { type, payload }: ActionPayload<Rpc>,
) => {
  switch (type) {
    case HiveActionType.SET_ACTIVE_RPC:
      return payload;
    default:
      return state;
  }
};
