import LedgerModule from '@background/hive/modules/ledger.module';
import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage } from '@background/hive/requests/operations/operations.utils';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestSwap,
} from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { HiveTxUtils } from '@popup/hive/utils/hive-tx.utils';
import { KeysUtils } from '@popup/hive/utils/keys.utils';
import TokensUtils from '@popup/hive/utils/tokens.utils';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import { KeychainError } from 'src/keychain-error';
import { SwapTokenUtils } from 'src/utils/swap-token.utils';

export const broadcastSwap = async (
  requestHandler: HiveRequestsHandler,
  data: RequestSwap & RequestId & { swapAccount?: string },
) => {
  let result,
    err: any,
    err_message = null;
  try {
    const {
      username,
      slippage,
      startToken,
      endToken,
      steps,
      amount,
      swapAccount,
    } = data;

    const key = requestHandler.getUserPrivateKey(
      username!,
      KeychainKeyTypesLC.active,
    );
    if (!swapAccount)
      throw new Error(chrome.i18n.getMessage('swap_server_unavailable'));
    const swapId = await SwapTokenUtils.saveEstimate(
      steps,
      slippage,
      startToken,
      endToken,
      amount,
      username!,
    );
    const keyType = KeysUtils.getKeyType(key!);
    switch (keyType) {
      case PrivateKeyType.LEDGER: {
        let tx;
        if (['HIVE', 'HBD'].includes(startToken)) {
          tx = await TransferUtils.getTransferTransaction(
            data.username!,
            swapAccount,
            data.amount + ' ' + data.startToken,
            swapId,
            false,
            0,
            0,
          );
        } else {
          tx = await TokensUtils.getSendTokenTransaction(
            data.startToken,
            swapAccount,
            data.amount + '',
            swapId,
            data.username!,
          );
        }
        LedgerModule.signTransactionFromLedger({
          transaction: tx,
          key: key!,
        });
        const signature = await LedgerModule.getSignatureFromLedger();
        result = await HiveTxUtils.broadcastAndConfirmTransactionWithSignature(
          tx,
          signature,
        );
        break;
      }
      default: {
        if (['HIVE', 'HBD'].includes(startToken)) {
          result = await TransferUtils.sendTransfer(
            data.username!,
            swapAccount,
            data.amount.toFixed(3) + ' ' + data.startToken,
            swapId,
            false,
            0,
            0,
            key!,
          );
        } else {
          result = await TokensUtils.sendToken(
            data.startToken,
            swapAccount,
            data.amount + '',
            swapId,
            key!,
            data.username!,
          );
        }
        break;
      }
    }
  } catch (e: any) {
    if (typeof e === 'string') {
      const message = createMessage(
        true,
        null,
        data,
        null,
        await chrome.i18n.getMessage('bgd_ops_encode_err'),
      );
      return message;
    } else {
      err = (e as KeychainError).trace || e;
      err_message = await chrome.i18n.getMessage(
        (e as KeychainError).message,
        (e as KeychainError).messageParams,
      );
    }
  } finally {
    const message = createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_swap_start_success', [
        data.amount + '',
        data.startToken,
        data.endToken,
        data.username!,
      ]),
      err_message,
    );
    return message;
  }
};
