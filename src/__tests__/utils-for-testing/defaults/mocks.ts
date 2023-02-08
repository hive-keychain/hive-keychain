import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import historyCurrency from 'src/__tests__/utils-for-testing/data/history/transactions/history.currency';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import fake_RC from 'src/__tests__/utils-for-testing/data/rc';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import tokenMarket from 'src/__tests__/utils-for-testing/data/tokens/token-market';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import {
  MocksApp,
  MocksChromeRunTime,
  MocksConvertionRequests,
  MocksGoogleAnalytics,
  MocksGovernance,
  MocksHome,
  MocksPowerUp,
  MocksProposal,
  MocksSurvey,
  MocksTokens,
  MocksTopBar,
  MocksWalletHistory,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';

const manifestFile = {
  chromium: require('../../../../manifests/chromium/manifest.json'),
};

const defaultAccountValue = '100000';

const _defaults = {
  _app: {
    getValueFromLocalStorage: jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.getValuefromLS(args[0]),
      ),
    getCurrentRpc: rpc.defaultRpc,
    getActiveAccountNameFromLocalStorage: mk.user.one,
    getRCMana: fake_RC.rc,
    getAccount: accounts.asArray.extended,
    getExtendedAccount: accounts.extended,
    getExtendedAccounts: [accounts.extended],
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
    getUserBalance: tokensUser.balances,
    getIncomingDelegations: tokensUser.incomingDelegations,
    getOutgoingDelegations: tokensUser.outcomingDelegations,
    getAllTokens: tokensList.alltokens,
    getTokensMarket: tokenMarket.all,
    getTokenHistory: tokenHistory.leoToken,
  } as MocksTokens,
  _proposal: {
    hasVotedForProposal: true,
    voteForKeychainProposal: true,
    isRequestingProposalVotes: false,
  } as MocksProposal,
  _chromeRunTime: {
    getManifest: {
      name: manifestFile.chromium.name,
      version: manifestFile.chromium.version,
    },
    sendMessage: jest.fn(),
  } as MocksChromeRunTime,
  _googleAnalytics: {
    initializeGoogleAnalytics: 'bypass',
  } as MocksGoogleAnalytics,
  _survey: {
    byPassing: true, //as default
  } as MocksSurvey,
  _convertions: {
    getConversionRequests: [], //as default
  } as MocksConvertionRequests,
  _governance: {
    bypass: true,
    accountsToRemind: [], //as default
  } as MocksGovernance,
};

const mocksDefault = {
  _defaults,
  defaultAccountValue,
  manifestFile,
};

export default mocksDefault;
