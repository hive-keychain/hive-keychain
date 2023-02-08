import { broadcastRemoveKeyAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  KeychainKeyTypes,
  RequestId,
  RequestRemoveKeyAuthority,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
describe('authority tests:\n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, confirmed } = constants;
  const data = constants.data.removeKeyAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveKeyAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      mocks.client.database.getAccounts([cloneAccountExtended]);
      mocks.client.broadcast.updateAccount(confirmed);
    });
    it('Must return error if no key on handler', async () => {
      const resultOperation = (await broadcastRemoveKeyAuthority(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error, ...datas } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('private key');
    });
    it('Must return error if missing authority', async () => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      cloneAccountExtended.active = {
        weight_threshold: 1,
        account_auths: [],
        key_auths: [],
      };
      mocks.client.database.getAccounts([cloneAccountExtended]);
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const cloneData = objects.clone(data) as RequestRemoveKeyAuthority &
        RequestId;
      cloneData.role = KeychainKeyTypes.active;
      const resultOperation = (await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      )) as ResultOperation;
      const { success, result, error, ...datas } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('Missing authority');
    });
    it('Must remove posting key', async () => {
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const cloneData = objects.clone(data) as RequestRemoveKeyAuthority &
        RequestId;
      cloneData.role = KeychainKeyTypes.posting;
      const result = await broadcastRemoveKeyAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.success.removedKey(confirmed, datas, request_id),
      );
    });
  });
});
