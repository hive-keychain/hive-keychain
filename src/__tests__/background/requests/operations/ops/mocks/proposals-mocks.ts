import LedgerModule from '@background/ledger.module';
import { RequestsHandler } from '@background/requests/request-handler';
import { TransactionConfirmation } from '@hiveio/dhive';
import { HiveTxConfirmationResult } from '@interfaces/hive-tx.interface';
import {
  KeychainRequestData,
  KeychainRequestTypes,
  RequestCreateProposal,
  RequestId,
  RequestRemoveProposal,
  RequestUpdateProposalVote,
} from '@interfaces/keychain.interface';
import { HiveTxUtils } from 'src/utils/hive-tx.utils';
import Logger from 'src/utils/logger.utils';
import messages from 'src/__tests__/background/requests/operations/ops/mocks/messages';
import { transactionConfirmationSuccess } from 'src/__tests__/utils-for-testing/data/confirmations';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';

const requestHandler = new RequestsHandler();

const data = {
  create: {
    domain: 'domain',
    type: KeychainRequestTypes.createProposal,
    username: mk.user.one,
    receiver: 'keychain',
    subject: 'Create a keychain coin',
    permlink: 'http://hive-keychain.com/coin',
    start: '21/12/2022',
    end: '21/12/2024',
    daily_pay: '300 HBD',
    extensions: '',
    request_id: 1,
  } as RequestCreateProposal & RequestId,
  update: {
    domain: 'domain',
    type: KeychainRequestTypes.updateProposalVote,
    username: mk.user.one,
    proposal_ids: [1],
    approve: true,
    extensions: '',
    request_id: 1,
  } as RequestUpdateProposalVote & RequestId,
  remove: {
    domain: 'domain',
    username: mk.user.one,
    type: KeychainRequestTypes.removeProposal,
    proposal_ids: '',
    extensions: '',
    request_id: 1,
  } as RequestRemoveProposal & RequestId,
};

const confirmed = {
  id: '1',
  trx_num: 112234,
  block_num: 1223,
  expired: false,
} as TransactionConfirmation;

const mocks = {
  getUILanguage: () =>
    (chrome.i18n.getUILanguage = jest.fn().mockReturnValue('en-US')),
  i18n: () =>
    (chrome.i18n.getMessage = jest
      .fn()
      .mockImplementation(mocksImplementation.i18nGetMessageCustom)),
  broadcastAndConfirmTransactionWithSignature: (
    result: HiveTxConfirmationResult,
  ) =>
    jest
      .spyOn(HiveTxUtils, 'broadcastAndConfirmTransactionWithSignature')
      .mockResolvedValue(result),
  LedgerModule: {
    getSignatureFromLedger: (signature: string) =>
      jest
        .spyOn(LedgerModule, 'getSignatureFromLedger')
        .mockResolvedValue(signature),
  },
  HiveTxUtils: {
    sendOperation: (result: HiveTxConfirmationResult) =>
      jest.spyOn(HiveTxUtils, 'sendOperation').mockResolvedValue(result),
  },
};

const methods = {
  afterEach: afterEach(() => {
    jest.clearAllMocks();
  }),
  beforeEach: beforeEach(() => {
    mocks.getUILanguage();
    mocks.i18n();
  }),
  assert: {
    error: (
      result: any,
      error: TypeError | SyntaxError,
      data: KeychainRequestData & RequestId,
      errorMessage: string,
    ) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.error.answerError(
          error,
          datas,
          request_id,
          errorMessage,
          undefined,
        ),
      );
    },
    success: (result: any, data: any, keyMessage: string, ids: string) => {
      const { request_id, ...datas } = data;
      expect(result).toEqual(
        messages.success.answerSucess(
          transactionConfirmationSuccess,
          datas,
          request_id,
          chrome.i18n.getMessage(keyMessage, [ids]),
          undefined,
        ),
      );
    },
  },
};

const spies = {
  logger: {
    error: jest.spyOn(Logger, 'error'),
  },
};

const constants = {
  data,
  requestHandler,
  confirmed,
  spies,
};

export default {
  methods,
  constants,
  mocks,
};
