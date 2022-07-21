import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import historyCurrency from 'src/__tests__/utils-for-testing/data/history/transactions/history.currency';
import manabar from 'src/__tests__/utils-for-testing/data/manabar';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MocksApp,
  MocksChromeRunTime,
  MocksHome,
  MocksPowerUp,
  MocksProposal,
  MocksTokens,
  MocksTopBar,
  MocksWalletHistory,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
//TODO remove comments when all works
const manifestFile = {
  chromium: require('../../../../manifests/chromium/manifest.json'),
};

const defaultAccountValue = '100000';

const _defaults = {
  _app: {
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args),
      ),
    getCurrentRpc: rpc.defaultRpc,
    getActiveAccountNameFromLocalStorage: mk.user.one,
    getRCMana: manabar,
    getAccounts: accounts.asArray.extended,
    checkRpcStatus: true,
    hasStoredAccounts: true,
    getMkFromLocalStorage: mk.user.one,
    getAccountsFromLocalStorage: accounts.twoAccounts,
    findUserProxy: '',
    getVP: 1,
    getVotingDollarsPerAccount: 1,
  } as MocksApp,
  _home: {
    getAccountValue: defaultAccountValue,
  } as MocksHome,
  _topBar: {
    hasReward: true,
  } as MocksTopBar,
  _powerUp: {
    getVestingDelegations: delegations.delegatees,
  } as MocksPowerUp,
  _walletHistory: {
    getAccountTransactions: [historyCurrency.transfers, 1000],
  } as MocksWalletHistory,
  _tokens: {
    getTokens: tokensList.alltokens,
    getUserBalance: tokensUser.balances,
  } as MocksTokens,
  _proposal: {
    hasVotedForProposal: true,
    voteForKeychainProposal: true,
  } as MocksProposal,
  _chromeRunTime: {
    getManifest: {
      name: manifestFile.chromium.name,
      version: manifestFile.chromium.version,
    },
    sendMessage: jest.fn(),
  } as MocksChromeRunTime,
};

const mocksDefault = {
  _defaults,
  defaultAccountValue,
  manifestFile,
};

export default mocksDefault;
