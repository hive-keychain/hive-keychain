import KeychainApi from '@api/keychain';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import { HiveEngineConfigUtils } from 'src/utils/hive-engine-config.utils';
import HiveEngineUtils from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import RpcUtils from 'src/utils/rpc.utils';
import TransactionUtils from 'src/utils/transaction.utils';
import withFixedValues from 'src/__tests__/utils-for-testing/defaults/fixed';
import mocksDefault from 'src/__tests__/utils-for-testing/defaults/mocks';
import initialMocks from 'src/__tests__/utils-for-testing/defaults/noImplentationNeeded';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { MocksToUse } from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const setOrDefault = (toUse: MocksToUse) => {
  const {
    app,
    home,
    topBar,
    powerUp,
    walletHistory,
    tokens,
    proposal,
    chromeRunTime,
    keyChainApiGet,
  } = toUse;
  const {
    _app,
    _home,
    _walletHistory,
    _powerUp,
    _proposal,
    _tokens,
    _topBar,
    _chromeRunTime,
  } = mocksDefault._defaults;
  LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockImplementation(
      (app && app.getValueFromLocalStorage) ?? _app.getValueFromLocalStorage,
    );
  RpcUtils.getCurrentRpc = jest
    .fn()
    .mockResolvedValue((app && app.getCurrentRpc) ?? _app.getCurrentRpc);
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getActiveAccountNameFromLocalStorage) ??
        _app.getActiveAccountNameFromLocalStorage,
    );
  HiveUtils.getClient().rc.getRCMana = jest
    .fn()
    .mockResolvedValue((app && app.getRCMana) ?? _app.getRCMana);
  HiveUtils.getClient().database.getAccounts = jest
    .fn()
    .mockResolvedValue((app && app.getAccounts) ?? _app.getAccounts);
  RpcUtils.checkRpcStatus = jest
    .fn()
    .mockResolvedValue((app && app.checkRpcStatus) ?? _app.checkRpcStatus);
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(
      (app && app.hasStoredAccounts) ?? _app.hasStoredAccounts,
    );
  MkUtils.getMkFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getMkFromLocalStorage) ?? _app.getMkFromLocalStorage,
    );
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      (app && app.getAccountsFromLocalStorage) ??
        _app.getAccountsFromLocalStorage,
    );
  ProxyUtils.findUserProxy = jest
    .fn()
    .mockResolvedValue((app && app.findUserProxy) ?? _app.findUserProxy);
  HiveUtils.getVP = jest.fn().mockReturnValue((app && app.getVP) ?? _app.getVP);
  HiveUtils.getVotingDollarsPerAccount = jest
    .fn()
    .mockReturnValue(
      (app && app.getVotingDollarsPerAccount) ??
        _app.getVotingDollarsPerAccount,
    );

  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue((home && home.getAccountValue) ?? _home.getAccountValue);

  chrome.runtime.getManifest = jest
    .fn()
    .mockReturnValue(
      (chromeRunTime && chromeRunTime.getManifest) ??
        _chromeRunTime.getManifest,
    );
  chrome.runtime.sendMessage =
    (chromeRunTime && chromeRunTime.sendMessage) ?? _chromeRunTime.sendMessage;

  KeychainApi.get = jest
    .fn()
    .mockImplementation((...args: any[]) =>
      mocksImplementation.keychainApiGet(args[0], keyChainApiGet?.customData),
    );

  ActiveAccountUtils.hasReward = jest
    .fn()
    .mockReturnValue((topBar && topBar.hasReward) ?? _topBar.hasReward);
  HiveUtils.getClient().database.getVestingDelegations = jest
    .fn()
    .mockResolvedValue(
      (powerUp && powerUp.getVestingDelegations) ??
        _powerUp.getVestingDelegations,
    );

  TransactionUtils.getAccountTransactions = jest
    .fn()
    .mockResolvedValue(
      (walletHistory && walletHistory.getAccountTransactions) ??
        _walletHistory.getAccountTransactions,
    );
  HiveEngineConfigUtils.getApi().find = jest
    .fn()
    .mockResolvedValue((tokens && tokens.getTokens) ?? _tokens.getTokens);
  HiveEngineUtils.getUserBalance = jest
    .fn()
    .mockResolvedValue(
      (tokens && tokens.getUserBalance) ?? _tokens.getUserBalance,
    );
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.hasVotedForProposal) ??
        _proposal.hasVotedForProposal,
    );
  ProposalUtils.voteForKeychainProposal = jest
    .fn()
    .mockResolvedValue(
      (proposal && proposal.voteForKeychainProposal) ??
        _proposal.voteForKeychainProposal,
    );
  initialMocks.noImplentationNeeded();
  withFixedValues();
};

export default { setOrDefault };
