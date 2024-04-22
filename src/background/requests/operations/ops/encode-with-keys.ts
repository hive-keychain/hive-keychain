import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { encode } from '@hiveio/hive-js/lib/auth/memo';
import {
  RequestEncodeWithKeys,
  RequestId,
} from '@interfaces/keychain.interface';
export const encodeWithKeys = async (
  requestHandler: RequestsHandler,
  data: RequestEncodeWithKeys & RequestId,
) => {
  let encoded: { [a: string]: string } = {};
  let error = null;
  try {
    const key = requestHandler.data.key;

    for (const receiverPublicKey of data.publicKeys) {
      encoded[receiverPublicKey.toString()] = encode(
        key,
        receiverPublicKey,
        data.message,
      );
    }
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
