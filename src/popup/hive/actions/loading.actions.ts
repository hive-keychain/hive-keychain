import { PrivateKeyType } from '@interfaces/keys.interface';
import { ActionType } from 'src/popup/hive/actions/action-type.enum';

export const addToLoadingList = (
  operation: string,
  privateKeyType?: PrivateKeyType,
  operationParams?: string[],
  hideDots?: boolean,
) => {
  return {
    type: ActionType.ADD_TO_LOADING_LIST,
    payload: {
      operation: operation,
      operationParams: operationParams,
      privateKeyType: privateKeyType,
      hideDots: hideDots,
    },
  };
};

export const removeFromLoadingList = (operation: string) => {
  return {
    type: ActionType.REMOVE_FROM_LOADING_LIST,
    payload: { operation: operation },
  };
};

export const addCaptionToLoading = (caption: string) => {
  return {
    type: ActionType.ADD_CAPTION_TO_LOADING_PAGE,
    payload: { caption: caption },
  };
};
