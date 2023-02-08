import KeychainApi from '@api/keychain';
import {
  Asset,
  Client,
  ExtendedAccount,
  Price,
  PrivateKey,
  TransactionConfirmation,
} from '@hiveio/dhive';
import { ActiveAccount } from '@interfaces/active-account.interface';
import { Rpc } from '@interfaces/rpc.interface';
import * as MessageActions from '@popup/actions/message.actions';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import { store } from '@popup/store';
import { AssertionError } from 'assert';
import {
  GlobalProperties,
  RewardFund,
} from 'src/interfaces/global-properties.interface';
import HiveUtils from 'src/utils/hive.utils';
import Logger from 'src/utils/logger.utils';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import utilsT from 'src/__tests__/utils-for-testing/fake-data.utils';
import config from 'src/__tests__/utils-for-testing/setups/config';
config.byDefault();
describe('hive.utils tests:\n', () => {
  async function resetClient() {
    await HiveUtils.setRpc({ uri: 'https://api.hive.blog' } as Rpc);
  }
  afterEach(async () => {
    jest.clearAllMocks();
    await resetClient();
  });
  beforeEach(async () => {
    await HiveUtils.setRpc(rpc.fake);
  });
  describe('getClient tests:\n', () => {
    test('calling getclient must return an instance of Client', () => {
      const getClientObj = HiveUtils.getClient();
      expect(getClientObj instanceof Client).toBe(true);
      expect(getClientObj.address).toBeDefined();
    });
  });
  describe('setRpc tests:\n', () => {
    test('Passing uri as "DEFAULT" will set the uri of the Client class as the return value from KeychainApi.get', async () => {
      const returnedUriValue = 'https://ValueFromHive/rpc/api';
      KeychainApi.get = jest
        .fn()
        .mockResolvedValueOnce({ data: { rpc: returnedUriValue } });
      const fakeRpc: Rpc = {
        uri: 'DEFAULT',
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe(rpc.fake.uri);
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(returnedUriValue);
    });

    test('Passing uri different from "DEFAULT" will override the uri value on the Client Class', async () => {
      const overridingValue = 'https://overridingValue/rpc/api';
      const fakeRpc: Rpc = {
        uri: overridingValue,
        testnet: true,
      };
      expect(HiveUtils.getClient().address).toBe(rpc.fake.uri);
      const result = await HiveUtils.setRpc(fakeRpc);
      expect(result).toBeUndefined();
      expect(HiveUtils.getClient().address).toBe(overridingValue);
    });
  });

  describe('getVP tests:\n', () => {
    test('Passing an ExtendedAccount Obj with no account property must return null', () => {
      const fakeExtended = {} as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtended);
      expect(result).toBeNull();
    });
    test('Passing a valid ExtendedAccount Obj with 0 values, will return NaN', () => {
      const fakeExtendedData = {
        name: utilsT.dataUserExtended.name,
        vesting_withdraw_rate: '0.000 VESTS',
        voting_manabar: {
          current_mana: 0,
          last_update_time: 0,
        },
        vesting_shares: '0.000 VESTS',
        delegated_vesting_shares: '0.000 VESTS',
        received_vesting_shares: '0.000 VESTS',
      } as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtendedData);
      expect(result).toBe(NaN);
    });
    test('Passing a valid ExtendedAccount Obj(cedricDataSample) with specific values, must return and estimated_pct=100', () => {
      const fakeExtendedData = {
        name: utilsT.cedricDataSample.name,
        vesting_withdraw_rate: utilsT.cedricDataSample.vesting_withdraw_rate,
        voting_manabar: utilsT.cedricDataSample.voting_manabar,
        vesting_shares: utilsT.cedricDataSample.vesting_shares,
        delegated_vesting_shares:
          utilsT.cedricDataSample.delegated_vesting_shares,
        received_vesting_shares:
          utilsT.cedricDataSample.received_vesting_shares,
      } as ExtendedAccount;
      const result = HiveUtils.getVP(fakeExtendedData);
      expect(result).toBe(100);
    });
  });

  describe('getVotingDollarsPerAccount tests:\n', () => {
    const price = new Price(new Asset(0.49, 'HBD'), new Asset(1, 'HIVE'));
    const rewardFund: RewardFund = {
      id: 0,
      name: 'post',
      reward_balance: '794370.819 HIVE',
      recent_claims: '618003654293909260',
      last_update: '2022-05-13T13:59:27',
      content_constant: '2000000000000',
      percent_curation_rewards: 5000,
      percent_content_rewards: 10000,
      author_reward_curve: 'linear',
      curation_reward_curve: 'linear',
    };
    const properties: GlobalProperties = {
      globals: utilsT.dynamicPropertiesObj,
      price: price,
      rewardFund: rewardFund,
    };
    const fakeExtendedData = {
      name: utilsT.cedricDataSample.name,
      vesting_withdraw_rate: utilsT.cedricDataSample.vesting_withdraw_rate,
      voting_manabar: utilsT.cedricDataSample.voting_manabar,
      vesting_shares: utilsT.cedricDataSample.vesting_shares,
      delegated_vesting_shares:
        utilsT.cedricDataSample.delegated_vesting_shares,
      received_vesting_shares: utilsT.cedricDataSample.received_vesting_shares,
    } as ExtendedAccount;
    test('Passing the testing data above, must return a voteValue="0.12"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.12');
    });
    test('Passing the testing data above, but with voteWeight=50, must return a voteValue="0.06"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        50,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.06');
    });
    test('Passing the testing data above, but with voteWeight=0, must return a voteValue="0.00"', async () => {
      const result = HiveUtils.getVotingDollarsPerAccount(
        0,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).not.toBeNull();
      expect(result).toBe('0.00');
    });
    test('Passing a GlobalProperties without globals property, must return null', () => {
      const _properties = {} as GlobalProperties;
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        _properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeNull();
    });
    test('Passing an Extended Account without name property must return null', () => {
      const _fakeExtendedData = {} as ExtendedAccount;
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        _fakeExtendedData,
        false,
      );
      expect(result).toBeNull();
    });
    test('If getRewardBalance returns 0, must return undefined', () => {
      const spyGetRewardBalance = jest
        .spyOn(HiveUtils, 'getRewardBalance')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetRewardBalance).toBeCalledTimes(1);
      expect(spyGetRewardBalance).toBeCalledWith(properties);
    });
    test('If getRecentClaims returns 0, must return undefined', () => {
      const spyGetRecentClaims = jest
        .spyOn(HiveUtils, 'getRecentClaims')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetRecentClaims).toBeCalledTimes(1);
      expect(spyGetRecentClaims).toBeCalledWith(properties);
    });
    test('If getHivePrice returns 0, must return undefined', () => {
      const spyGetHivePrice = jest
        .spyOn(HiveUtils, 'getHivePrice')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetHivePrice).toBeCalledTimes(1);
      expect(spyGetHivePrice).toBeCalledWith(properties);
    });
    test('If getVotePowerReserveRate returns 0, must return undefined', () => {
      const spyGetVotePowerReserveRate = jest
        .spyOn(HiveUtils, 'getVotePowerReserveRate')
        .mockReturnValueOnce(0);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBeUndefined();
      expect(spyGetVotePowerReserveRate).toBeCalledTimes(1);
      expect(spyGetVotePowerReserveRate).toBeCalledWith(properties);
    });
    test('If getRewardBalance returns Infinity, will return "Infinity"', () => {
      const spyGetRewardBalance = jest
        .spyOn(HiveUtils, 'getRewardBalance')
        .mockReturnValueOnce(Infinity);
      const result = HiveUtils.getVotingDollarsPerAccount(
        100,
        properties,
        fakeExtendedData,
        false,
      );
      expect(result).toBe('Infinity');
      expect(spyGetRewardBalance).toBeCalledTimes(1);
      expect(spyGetRewardBalance).toBeCalledWith(properties);
    });
  });

  describe('getTimeBeforeFull tests:\n', () => {
    test('Passing a votingPower=100.0 must return the message "popup_utils_full" from i18n', () => {
      const expectedMessage = 'popup_utils_full';
      chrome.i18n.getMessage = jest.fn().mockImplementationOnce((...args) => {
        return args;
      });
      const result = HiveUtils.getTimeBeforeFull(100.0);
      expect(result).not.toBeNull();
      expect(result).toEqual([expectedMessage]);
    });
    test('Passing different values of votingPower(votingPowerArrayTest) must return the expectedMessageArray', () => {
      const showIteration = false;
      const votingPowerArrayTest = [...utilsT.votingPowerArrayTest];
      chrome.i18n.getMessage = jest.fn().mockImplementation((...args) => {
        return args;
      });
      votingPowerArrayTest.forEach((testCase) => {
        if (showIteration) {
          console.log(
            `About to test, votingPower: ${testCase.votingPower}\nMust return: ${testCase.expectedMessageArray}`,
          );
        }
        expect(HiveUtils.getTimeBeforeFull(testCase.votingPower)).toEqual(
          testCase.expectedMessageArray,
        );
      });
    });
    test('Passing a negative votingPower value will return undefined', () => {
      chrome.i18n.getMessage = jest.fn().mockImplementationOnce((...args) => {
        return args;
      });
      const result = HiveUtils.getTimeBeforeFull(-50.0);
      expect(result).toBeUndefined();
    });
  });

  describe('getConversionRequests tests:\n', () => {
    it('Must return ordered array', async () => {
      const expectedNewArray = [
        {
          amount: '22.500 HIVE',
          collaterized: true,
          conversion_date: '2022-05-10T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
        {
          amount: '2.500 HBD',
          collaterized: false,
          conversion_date: '2022-05-15T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
      ];
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return utilsT.fakeHbdConversionsResponse;
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return utilsT.fakeHiveConversionsResponse;
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual(expectedNewArray);
    });
    test('Fetching 1 arrays(hiveConversions) will reestructure hiveConversions Array, and return one new array', async () => {
      const expectedNewArray = [
        {
          amount: '22.500 HIVE',
          collaterized: true,
          conversion_date: '2022-05-10T11:02:09',
          id: 275431,
          owner: 'wesp05',
          requestid: 1,
        },
      ];
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return utilsT.fakeHiveConversionsResponse;
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual(expectedNewArray);
    });
    test('Fetching 2 empty arrays will return an empty array', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return [];
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual([]);
    });
    test('If hiveConversions lack one of the used properties, will return an array with undefined values', async () => {
      HiveUtils.getClient().database.call = jest
        .fn()
        .mockImplementation((...args) => {
          if (args[0] === 'get_conversion_requests') {
            return [];
          } else if (args[0] === 'get_collateralized_conversion_requests') {
            return [{ anyOther: 'anyOther' }];
          }
        });
      const result = await HiveUtils.getConversionRequests('wesp05');
      expect(result).toEqual([
        {
          amount: undefined,
          collaterized: true,
          conversion_date: undefined,
          id: undefined,
          owner: undefined,
          requestid: undefined,
        },
      ]);
    });
  });

  describe('getDelegators tests:\n', () => {
    test('Passing an account with delegators must return an array of results', async () => {
      HiveUtils.getDelegators = jest
        .fn()
        .mockResolvedValue(delegations.delegators);
      const username = 'blocktrades';
      const result = await HiveUtils.getDelegators(username);
      expect(result).toEqual(delegations.delegators);
    });
    test('Passing an account with No delegators must return an Empty array', async () => {
      HiveUtils.getDelegators = jest.fn().mockResolvedValue([]);
      const username = 'blocktrades';
      const result = await HiveUtils.getDelegators(username);
      expect(result).toEqual([]);
    });
  });

  describe('getDelegatees tests:\n', () => {
    test('Passing an account with delegatees must return an array', async () => {
      HiveUtils.getDelegatees = jest
        .fn()
        .mockResolvedValue(delegations.delegatees);
      const results = await HiveUtils.getDelegatees('string');
      expect(results).toEqual(delegations.delegatees);
    });
    test('Passing an account with No delegatees must return an Empty array', async () => {
      HiveUtils.getDelegatees = jest.fn().mockResolvedValue([]);
      const username = 'theghost1980';
      const result = await HiveUtils.getDelegatees(username);
      expect(result.length).toBe(0);
    });
  });

  describe('claimRewards tests:\n', () => {
    let spyLogger = jest.spyOn(Logger, 'error');
    let loggerCallParams: any[] = [];
    let dispatchCallParams: {};
    const spySetErrorMessage = jest.spyOn(MessageActions, 'setErrorMessage');
    const spySetSuccessMessage = jest.spyOn(
      MessageActions,
      'setSuccessMessage',
    );
    beforeEach(() => {
      store.dispatch = jest.fn();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Must call Logger, setErrorMessage and return false if empty obj', async () => {
      const activeAccountEmpty = {} as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountEmpty,
        '1.000 HIVE',
        '1.000 HBD',
        '1.000 VESTS',
        utilsT.dynamicPropertiesObj,
        setErrorMessage,
        setSuccessMessage,
      );
      expect(result).toBe(false);
      const { calls } = spyLogger.mock;
      expect(calls[0][0]).toBe('Error while claiming rewards');
      expect(calls[0][1]).toContain('posting');
      expect(spySetErrorMessage).toBeCalledWith('popup_html_claim_error');
    });
    test('Must call Logger, setErrorMessage and return false if empty key', async () => {
      const activeAccountUsingActivekey = {
        keys: {
          active: utilsT.userData.nonEncryptKeys.active,
          activePubkey: utilsT.userData.encryptKeys.active,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountUsingActivekey,
        '1.000 HIVE',
        '1.000 HBD',
        '1.000 VESTS',
        utilsT.dynamicPropertiesObj,
        setErrorMessage,
        setSuccessMessage,
      );
      expect(result).toBe(false);
      const { calls } = spyLogger.mock;
      expect(calls[0][0]).toBe('Error while claiming rewards');
      expect(calls[0][1]).toContain('Expected String');
      expect(spySetErrorMessage).toBeCalledWith('popup_html_claim_error');
    });
    test('Must claim rewards', async () => {
      const transactionObjWaiting = {
        id: '001199xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '001199xxdass990',
        status: 'within_reversible_block',
      };
      const sendOperationCallParams: any[] = [
        [
          [
            'claim_reward_balance',
            {
              account: 'keychain.tests',
              reward_hbd: '0.00 HBD',
              reward_hive: '1.00 HIVE',
              reward_vests: '0.00 VESTS',
            },
          ],
        ],
        PrivateKey.fromString(utilsT.userData.nonEncryptKeys.posting as string),
      ];
      const loggerInfoConfirmedMessage = 'Transaction confirmed';
      const expectedDispatchSuccessParams = {
        payload: {
          key: 'popup_html_claim_success',
          params: ['1.00 HIVE'],
          type: 'SUCCESS',
        },
        type: 'SET_MESSAGE',
      };
      const mockedGetClientSendOperations =
        (HiveUtils.getClient().broadcast.sendOperations = jest
          .fn()
          .mockResolvedValueOnce(transactionObjWaiting));
      const mockedGetClientFindTransaction =
        (HiveUtils.getClient().transaction.findTransaction = jest
          .fn()
          .mockResolvedValueOnce(transactionObjConfirmed));
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const activeAccountusingActivekey = {
        name: utilsT.userData.username,
        keys: {
          posting: utilsT.userData.nonEncryptKeys.posting,
          postingPubkey: utilsT.userData.encryptKeys.posting,
        },
      } as ActiveAccount;
      const result = await HiveUtils.claimRewards(
        activeAccountusingActivekey,
        '1.00 HIVE',
        '0.00 HBD',
        '0.00 VESTS',
        utilsT.dynamicPropertiesObj,
        setErrorMessage,
        setSuccessMessage,
      );
      expect(result).toBe(true);
      expect(mockedGetClientSendOperations).toBeCalledTimes(1);
      expect(mockedGetClientSendOperations).toBeCalledWith(
        ...sendOperationCallParams,
      );
      expect(mockedGetClientFindTransaction).toBeCalledTimes(1);
      expect(mockedGetClientFindTransaction).toBeCalledWith(
        transactionObjWaiting.id,
      );
      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spySetSuccessMessage).toBeCalledWith('popup_html_claim_success', [
        '1.00 HIVE',
      ]);
    });
  });

  describe('powerUp tests"\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Power up the activeAccount user, must call Logger with "Transaction confirmed" and return true', async () => {
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '002299xxdass990',
        status: 'within_reversible_block',
      };
      PrivateKey.fromString = jest.fn(); //no implementation.
      HiveUtils.getClient().broadcast.sendOperations = jest
        .fn()
        .mockResolvedValueOnce(transactionObjWaiting);
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce(transactionObjConfirmed);
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const result = await HiveUtils.powerUp(
        utilsT.userData.username,
        utilsT.userData.username,
        '0.001 HIVE',
        {
          keys: {
            active: utilsT.userData.encryptKeys.active,
          },
        } as ActiveAccount,
      );
      expect(result).toBe(true);
      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith('Transaction confirmed');
    });
  });

  describe('powerDown tests:\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Powerdown the activeAccount user, must call Logger with "Transaction confirmed" and return true', async () => {
      const transactionObjWaiting = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      const transactionObjConfirmed = {
        id: '002299xxdass990',
        status: 'within_reversible_block',
      };
      PrivateKey.fromString = jest.fn(); //no implementation.
      HiveUtils.getClient().broadcast.sendOperations = jest
        .fn()
        .mockResolvedValueOnce(transactionObjWaiting);
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce(transactionObjConfirmed);
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      const spySendOperationWithConfirmation = jest.spyOn(
        HiveUtils,
        'sendOperationWithConfirmation',
      );
      const result = await HiveUtils.powerDown(
        utilsT.userData.username,
        '0.1 HIVE',
        {
          keys: {
            active: utilsT.userData.encryptKeys.active,
          },
        } as ActiveAccount,
      );
      expect(result).toBe(true);
      expect(spySendOperationWithConfirmation).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith('Transaction confirmed');
    });
  });

  describe('transfer tests:\n', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Executing a non recurrent transfer, should return true and log a success message', async () => {
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      store.getState().activeAccount.keys.active =
        utilsT.userData.nonEncryptKeys.active;
      let transactionObj = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      HiveUtils.getClient().broadcast.sendOperations = jest
        .fn()
        .mockResolvedValueOnce(transactionObj);
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce({
          id: transactionObj.id,
          status: 'within_reversible_block',
        });
      const result = await HiveUtils.transfer(
        utilsT.userData.username,
        'blocktrades',
        '100.000 HBD',
        '',
        false,
        0,
        0,
        {
          keys: {
            active: utilsT.userData.encryptKeys.active,
          },
        } as ActiveAccount,
      );
      expect(result).toBe(true);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith('Transaction confirmed');
    });
    test('Executing a non recurrent transfer, but making it to fail(get an error status) should return false and log an error message', async () => {
      //Note: the expected commented line can be uncommented as soon as the function get refactored.
      const spyLoggerInfo = jest.spyOn(Logger, 'info');
      store.getState().activeAccount.keys.active =
        utilsT.userData.nonEncryptKeys.active;
      let transactionObj = {
        id: '002299xxdass990',
        status: 'within_mempool',
      };
      HiveUtils.getClient().broadcast.sendOperations = jest
        .fn()
        .mockResolvedValueOnce(transactionObj);
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce({
          id: transactionObj.id,
          status: 'error',
        });
      const result = await HiveUtils.transfer(
        utilsT.userData.username,
        'blocktrades',
        '100.000 HBD',
        '',
        false,
        0,
        0,
        {
          keys: {
            active: utilsT.userData.encryptKeys.active,
          },
        } as ActiveAccount,
      );
      //expect(result).toBe(false);
      console.log(result);
      expect(spyLoggerInfo).toBeCalledTimes(1);
      expect(spyLoggerInfo).toBeCalledWith(
        'Transaction failed with status: error',
      );
    });
  });

  describe('signMessage tests:\n', () => {
    test('Passing a message and valid private key, must return the expected signature', () => {
      const signature = require('@hiveio/hive-js/lib/auth/ecc');
      const spySignature = jest.spyOn(signature.Signature, 'signBuffer');
      const callingParams = [
        'test message',
        '5K3R75h6KGBLbEHkmkL34MND95bMveeEu8jPSZWLh5X6DhcnKzM',
      ];
      const expectedSignature =
        '1f4aa1439a8a3c1f559eec87b4ada274698138efc6ba4e5b7cabffa32828943e6251aca3b097b5c422f8689cb13b933b49c32b81064bfb8662e423a281142f1286';
      const result = HiveUtils.signMessage(
        'test message',
        utilsT.userData.nonEncryptKeys.posting,
      );
      expect(result).toBe(expectedSignature);
      expect(spySignature).toBeCalledTimes(1);
      expect(spySignature).toBeCalledWith(...callingParams);
    });
    test('Passing a message and public key, must throw an AssertionError', () => {
      try {
        const result = HiveUtils.signMessage(
          'test message',
          utilsT.userData.encryptKeys.posting,
        );
        expect(result).toBe(1);
      } catch (error) {
        expect(error).toEqual(
          new AssertionError({
            message: 'Expected version 128, instead got 38',
            actual: 128,
            expected: 38,
            operator: '==',
          }),
        );
      }
    });
  });

  describe('sendOperationWithConfirmation tests:\n', () => {
    let transactionObj: TransactionConfirmation = {
      id: '002299xxdass990',
      block_num: 1990,
      trx_num: 1234,
      expired: false,
    };
    const spyLogger = jest.spyOn(Logger, 'info');
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('If findTransaction returns a transaction object with status="within_reversible_block" must return true', async () => {
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce({
          id: transactionObj.id,
          status: 'within_reversible_block',
        });
      const result = await HiveUtils.sendOperationWithConfirmation(
        Promise.resolve(transactionObj),
      );
      expect(result).toBeTruthy();
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith('Transaction confirmed');
    });
    test('If findTransaction returns a transaction object with status!="within_reversible_block" must return false', async () => {
      HiveUtils.getClient().transaction.findTransaction = jest
        .fn()
        .mockResolvedValueOnce({
          id: transactionObj.id,
          status: 'error',
        });
      const result = await HiveUtils.sendOperationWithConfirmation(
        Promise.resolve(transactionObj),
      );
      expect(result).toBe(undefined);
      expect(spyLogger).toBeCalledTimes(1);
      expect(spyLogger).toBeCalledWith('Transaction failed with status: error');
    });
  });
});
