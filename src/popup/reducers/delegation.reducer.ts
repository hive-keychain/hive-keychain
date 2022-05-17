import { ActionType } from '@popup/actions/action-type.enum';
import { ActionPayload } from '@popup/actions/interfaces';
import { Delegations } from 'src/interfaces/delegations.interface';

const DelegationsReducer = (
  state: Delegations = {
    incoming: [],
    outgoing: [],
    pendingOutgoingUndelegation: [],
  },
  { type, payload }: ActionPayload<Delegations>,
) => {
  switch (type) {
    case ActionType.FETCH_DELEGATEES:
      return { ...state, outgoing: payload!.outgoing };
    case ActionType.FETCH_DELEGATORS:
      return { ...state, incoming: payload!.incoming };
    case ActionType.FETCH_PENDING_OUTGOING_UNDELEGATION:
      return {
        ...state,
        pendingOutgoingUndelegation: payload!.pendingOutgoingUndelegation,
      };
    default:
      return state;
  }
};

export default DelegationsReducer;
