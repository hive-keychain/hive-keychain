import LedgerModule from '@background/ledger.module';
import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import {
  KeychainKeyTypesLC,
  RequestId,
  RequestVscCDeposit,
} from '@interfaces/keychain.interface';
import { PrivateKeyType } from '@interfaces/keys.interface';
import { VscHistoryType, VscStatus } from '@interfaces/vsc.interface';
import TransferUtils from '@popup/hive/utils/transfer.utils';
import { VscUtils } from '@popup/hive/utils/vsc.utils';
import Config from 'src/config';
import { KeychainError } from 'src/keychain-error';
import { HiveTxUtils } from 'src/popup/hive/utils/hive-tx.utils';
import { KeysUtils } from 'src/popup/hive/utils/keys.utils';
import Logger from 'src/utils/logger.utils';

export const vscDeposit = async (
  requestHandler: RequestsHandler,
  data: RequestVscCDeposit & RequestId,
) => {
  let key = requestHandler.data.key;
  if (!key) {
    [key] = requestHandler.getUserKeyPair(
      data.username!,
      KeychainKeyTypesLC.active,
    ) as [string, string];
  }
  let result, vscResult, err, err_message;

  try {
    const keyType = KeysUtils.getKeyType(key!);
    switch (keyType) {
      case PrivateKeyType.LEDGER: {
        const tx = await TransferUtils.getTransferTransaction(
          data.username!,
          Config.vsc.ACCOUNT,
          data.amount + ' ' + data.currency,
          `to=${data.address}`,
          false,
          0,
          0,
        );

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
        result = await TransferUtils.sendTransfer(
          data.username!,
          Config.vsc.ACCOUNT,
          data.amount + ' ' + data.currency,
          `to=${data.address}`,
          false,
          0,
          0,
          key!,
        );
        break;
      }
    }
    vscResult = {
      ...result,
      vscConfirmed: result
        ? await VscUtils.waitForStatus(result?.tx_id, VscHistoryType.TRANSFER)
        : VscStatus.UNCONFIRMED,
    };
  } catch (e) {
    Logger.error(e);
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      vscResult,
      data,
      vscResult?.vscConfirmed === VscStatus.INCLUDED
        ? await chrome.i18n.getMessage('bgd_ops_vsc_included')
        : vscResult?.vscConfirmed === VscStatus.CONFIRMED
        ? await chrome.i18n.getMessage('bgd_ops_vsc_confirmed')
        : await chrome.i18n.getMessage('bgd_ops_vsc_not_included'),
      err_message,
    );

    return message;
  }
};
