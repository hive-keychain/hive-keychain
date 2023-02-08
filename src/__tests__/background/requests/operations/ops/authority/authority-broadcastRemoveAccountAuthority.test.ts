import { broadcastRemoveAccountAuthority } from '@background/requests/operations/ops/authority';
import { ExtendedAccount } from '@hiveio/dhive';
import {
  RequestId,
  RequestRemoveAccountAuthority,
} from '@interfaces/keychain.interface';
import authority from 'src/__tests__/background/requests/operations/ops/mocks/authority';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import { ResultOperation } from 'src/__tests__/utils-for-testing/interfaces/assertions';
describe('authority tests:/n', () => {
  const { methods, constants, mocks } = authority;
  const { requestHandler, confirmed } = constants;
  const data = constants.data.removeAccountAuthority;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastRemoveAccountAuthority cases:\n', () => {
    beforeEach(() => {
      const cloneAccountExtended = objects.clone(
        accounts.extended,
      ) as ExtendedAccount;
      mocks.client.database.getAccounts([cloneAccountExtended]);
      mocks.client.broadcast.updateAccount(confirmed);
    });
    it('Must return error if no key on handler', async () => {
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      const resultOperation = (await broadcastRemoveAccountAuthority(
        requestHandler,
        data,
      )) as ResultOperation;
      const { success, result, error, ...datas } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toContain('private key');
    });

    it('Must return error if user not authorized', async () => {
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'notAddedAccount';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const resultOperation = (await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      )) as ResultOperation;
      const { success, result, error, ...datas } = resultOperation.msg;
      expect(success).toBe(false);
      expect(result).toBeUndefined();
      expect((error as TypeError).message).toBe('Nothing to remove');
    });

    it('Must broadcast update account using active key', async () => {
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.active,
        userData.one.encryptKeys.active,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.success.removedAuth(confirmed, datas, request_id),
      );
    });

    it('Must broadcast update account using posting key', async () => {
      const cloneData = objects.clone(data) as RequestRemoveAccountAuthority &
        RequestId;
      cloneData.authorizedUsername = 'theghost1980';
      requestHandler.setKeys(
        userData.one.nonEncryptKeys.posting,
        userData.one.encryptKeys.posting,
      );
      const result = await broadcastRemoveAccountAuthority(
        requestHandler,
        cloneData,
      );
      const { request_id, ...datas } = cloneData;
      expect(result).toEqual(
        messages.success.removedAuth(confirmed, datas, request_id),
      );
    });
  });
});
