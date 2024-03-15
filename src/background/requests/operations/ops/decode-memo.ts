import { createMessage } from '@background/requests/operations/operations.utils';
import { RequestsHandler } from '@background/requests/request-handler';
import { decode } from '@hiveio/hive-js/lib/auth/memo';
import { RequestDecode, RequestId } from '@interfaces/keychain.interface';
export const decodeMessage = async (
  requestHandler: RequestsHandler,
  data: RequestDecode & RequestId,
) => {
  let decoded = null;
  let error = null;
  const key = requestHandler.data.key;
  try {
    decoded = await decode(key, data.message);
  } catch (err) {
    error = err;
  } finally {
    return await createMessage(
      error,
      decoded,
      data,
      await chrome.i18n.getMessage('bgd_ops_decode'),
      await chrome.i18n.getMessage('bgd_ops_decode_err'),
    );
  }
};
