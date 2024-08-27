import { createMessage } from '@background/hive/requests/operations/operations.utils';
import { HiveRequestsHandler } from '@background/hive/requests/request-handler';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  KeychainKeyTypes,
  RequestEncode,
  RequestId,
} from '@interfaces/keychain.interface';
import AccountUtils from 'src/popup/hive/utils/account.utils';
export const encodeMessage = async (
  requestHandler: HiveRequestsHandler,
  data: RequestEncode & RequestId,
) => {
  let encoded = null;
  let error = null;
  try {
    const key = requestHandler.data.key;
    const receiver = await AccountUtils.getExtendedAccount(data.receiver);
    let publicKey;

    if (data.method === KeychainKeyTypes.memo) {
      publicKey = receiver.memo_key;
    } else {
      publicKey = receiver.posting.key_auths[0][0];
    }
    encoded = encode(key, publicKey, data.message);
  } catch (err) {
    error = err;
  } finally {
    return await createMessage(
      error,
      encoded,
      data,
      await chrome.i18n.getMessage('bgd_ops_encode'),
      await chrome.i18n.getMessage('bgd_ops_encode_err'),
    );
  }
};
