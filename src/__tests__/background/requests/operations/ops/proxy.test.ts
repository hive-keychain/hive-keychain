import { broadcastProxy } from '@background/requests/operations/ops/proxy';
import { KeychainKeyTypesLC } from '@interfaces/keychain.interface';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import proxyMocks from 'src/__tests__/background/requests/operations/ops/mocks/proxy-mocks';
import userData from 'src/__tests__/utils-for-testing/data/user-data';
describe('proxy tests:\n', () => {
  const { methods, constants, spies } = proxyMocks;
  const { requestHandler, data, confirmed } = constants;
  methods.afterEach;
  methods.beforeEach;
  describe('broadcastProxy cases:\n', () => {
    it('Must call getUserKey', async () => {
      await broadcastProxy(requestHandler, data);
      expect(spies.getUserKey).toBeCalledWith(
        data.username!,
        KeychainKeyTypesLC.active,
      );
    });
    it('Must return error if no key on handler', async () => {
      delete data.username;
      const error = 'private key should be a Buffer';
      const result = await broadcastProxy(requestHandler, data);
      methods.assert.error(result, new TypeError(error), data, error);
    });
    it('Must return success on removing proxy', async () => {
      data.username = userData.one.username;
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastProxy(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          confirmed,
          datas,
          request_id,
          chrome.i18n.getMessage('bgd_ops_unproxy'),
          undefined,
        ),
      );
    });
    it('Must return success on setting proxy', async () => {
      data.username = userData.one.username;
      data.proxy = 'keychain';
      requestHandler.data.key = userData.one.nonEncryptKeys.active;
      const result = await broadcastProxy(requestHandler, data);
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          confirmed,
          datas,
          request_id,
          chrome.i18n.getMessage('popup_success_proxy', [data.proxy]),
          undefined,
        ),
      );
    });
  });
});
