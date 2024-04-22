import { MultichainActionType } from '@popup/multichain/actions/action-type.enum';
import { ActionPayload, AppThunk } from '@popup/multichain/actions/interfaces';
import { MessageType } from '@reference-data/message-type.enum';
import {
  OperationsHiveEngine,
  PendingUnstaking,
  Token,
  TokenBalance,
  TokenMarket,
  TokenTransaction,
} from 'src/interfaces/tokens.interface';
import { HiveActionType } from 'src/popup/hive/actions/action-type.enum';
import { HiveEngineUtils } from 'src/popup/hive/utils/hive-engine.utils';
import TokensUtils from 'src/popup/hive/utils/tokens.utils';
import Logger from 'src/utils/logger.utils';

export const loadTokens = (): AppThunk => async (dispatch) => {
  let tokens;
  try {
    tokens = await TokensUtils.getAllTokens();
  } catch (err: any) {
    if (err.message.includes('timeout')) {
      dispatch({
        type: MultichainActionType.SET_MESSAGE,
        payload: { key: 'html_popup_tokens_timeout', type: MessageType.ERROR },
      });
    }
    throw err;
  }

  const action: ActionPayload<Token[]> = {
    type: HiveActionType.LOAD_TOKENS,
    payload: tokens,
  };
  dispatch(action);
};

export const loadTokensMarket = (): AppThunk => async (dispatch) => {
  const tokensMarket = await TokensUtils.getTokensMarket({}, 1000, 0, []);
  const action: ActionPayload<TokenMarket[]> = {
    type: HiveActionType.LOAD_TOKENS_MARKET,
    payload: tokensMarket,
  };
  dispatch(action);
};

export const loadPendingUnstaking =
  (account: string): AppThunk =>
  async (dispatch) => {
    const pendingUnstaking = await TokensUtils.getPendingUnstakes(account);
    const action: ActionPayload<PendingUnstaking[]> = {
      type: HiveActionType.LOAD_PENDING_UNSTAKING,
      payload: pendingUnstaking,
    };
    dispatch(action);
  };

export const loadUserTokens =
  (account: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch({
        type: HiveActionType.CLEAR_USER_TOKENS,
      });
      let tokensBalance: TokenBalance[] = await TokensUtils.getUserBalance(
        account,
      );
      tokensBalance = tokensBalance.sort(
        (a, b) => parseFloat(b.balance) - parseFloat(a.balance),
      );
      const action: ActionPayload<TokenBalance[]> = {
        type: HiveActionType.LOAD_USER_TOKENS,
        payload: tokensBalance,
      };
      dispatch(action);
    } catch (e) {
      Logger.error(e);
    }
  };

export const loadTokenHistory =
  (account: string, currency: string): AppThunk =>
  async (dispatch) => {
    let tokenHistory: TokenTransaction[] = [];

    let start = 0;
    let previousTokenHistoryLength = 0;
    const limit = 500;
    do {
      previousTokenHistoryLength = tokenHistory.length;
      let result: TokenTransaction[] = await HiveEngineUtils.getHistory(
        account,
        currency,
        start,
      );

      start += limit;
      tokenHistory = [...tokenHistory, ...result];
    } while (previousTokenHistoryLength !== tokenHistory.length);

    //------- this is for debug -----//
    // let tokenOperationTypes = tokenHistory.map((e: any) => e.operation);
    // tokenOperationTypes = [...new Set(tokenOperationTypes)];
    // console.log(tokenOperationTypes);

    // for (const type of tokenOperationTypes) {
    //   console.log(tokenHistory.find((e: any) => e.operation === type));
    // }
    //-------------------------------//

    tokenHistory = tokenHistory.map((t: any) => {
      t.amount = `${t.quantity} ${t.symbol}`;
      switch (t.operation) {
        case OperationsHiveEngine.COMMENT_CURATION_REWARD:
        case OperationsHiveEngine.COMMENT_AUTHOR_REWARD:
          return {
            ...(t as TokenTransaction),
            authorPerm: t.authorperm,
          };
        case OperationsHiveEngine.MINING_LOTTERY:
          return { ...(t as TokenTransaction), poolId: t.poolId };
        case OperationsHiveEngine.TOKENS_TRANSFER:
          return {
            ...(t as TokenTransaction),
            from: t.from,
            to: t.to,
            memo: t.memo,
          };
        case OperationsHiveEngine.TOKEN_STAKE:
          return {
            ...(t as TokenTransaction),
            from: t.from,
            to: t.to,
          };
        case OperationsHiveEngine.TOKENS_DELEGATE:
          return {
            ...(t as TokenTransaction),
            delegator: t.from,
            delegatee: t.to,
          };
        case OperationsHiveEngine.TOKEN_UNDELEGATE_START:
        case OperationsHiveEngine.TOKEN_UNDELEGATE_DONE:
          return {
            ...(t as TokenTransaction),
            delegator: t.to,
            delegatee: t.from,
          };
        default:
          return t as TokenTransaction;
      }
    });

    const action: ActionPayload<TokenTransaction[]> = {
      type: HiveActionType.LOAD_TOKEN_HISTORY,
      payload: tokenHistory,
    };
    dispatch(action);
  };
