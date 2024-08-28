import { HiveRequestsHandler } from '@background/hive/requests/hive-request-handler';
import { createMessage } from '@background/hive/requests/operations/operations.utils';
import { RequestId, RequestVote } from '@interfaces/keychain.interface';
import { KeychainError } from 'src/keychain-error';
import { BloggingUtils } from 'src/popup/hive/utils/blogging.utils';

export const broadcastVote = async (
  requestHandler: HiveRequestsHandler,
  data: RequestVote & RequestId,
) => {
  const key = requestHandler.data.key;
  let err, result, err_message;
  try {
    // TODO : When Ledger ready for full usage with posting key, add compatibility with Ledger
    result = await BloggingUtils.vote(
      data.username,
      data.author,
      data.permlink,
      +data.weight,
      key!,
    );
  } catch (e: any) {
    err = (e as KeychainError).trace || e;
    err_message = await chrome.i18n.getMessage(
      (e as KeychainError).message,
      (e as KeychainError).messageParams,
    );
  } finally {
    const message = await createMessage(
      err,
      result,
      data,
      await chrome.i18n.getMessage('bgd_ops_vote', [
        data.author,
        data.permlink,
        +data.weight / 100 + '',
      ]),
      err_message,
    );
    return message;
  }
};
