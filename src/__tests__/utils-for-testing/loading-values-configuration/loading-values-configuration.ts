import { KeychainApi } from '@api/keychain';
import {
  DynamicGlobalProperties,
  ExtendedAccount,
  Price,
  VestingDelegation,
} from '@hiveio/dhive';
import { RC } from '@interfaces/active-account.interface';
import { Conversion } from '@interfaces/conversion.interface';
import { RewardFund } from '@interfaces/global-properties.interface';
import { LocalAccount } from '@interfaces/local-account.interface';
import { Proposal } from '@interfaces/proposal.interface';
import { RcDelegation } from '@interfaces/rc-delegation.interface';
import { Rpc } from '@interfaces/rpc.interface';
import { TokenDelegation } from '@interfaces/token-delegation.interface';
import {
  TokenBalance,
  TokenMarket,
  TokenTransaction,
} from '@interfaces/tokens.interface';
import { Transaction } from '@interfaces/transaction.interface';
import accounts from 'src/__tests__/utils-for-testing/data/accounts';
import delegations from 'src/__tests__/utils-for-testing/data/delegations';
import dynamic from 'src/__tests__/utils-for-testing/data/dynamic.hive';
import tokenHistory from 'src/__tests__/utils-for-testing/data/history/transactions/tokens/token-history';
import mk from 'src/__tests__/utils-for-testing/data/mk';
import fake_RC from 'src/__tests__/utils-for-testing/data/rc';
import rpc from 'src/__tests__/utils-for-testing/data/rpc';
import tokenMarket from 'src/__tests__/utils-for-testing/data/tokens/token-market';
import tokensList from 'src/__tests__/utils-for-testing/data/tokens/tokens-list';
import tokensUser from 'src/__tests__/utils-for-testing/data/tokens/tokens-user';
import mocksImplementation from 'src/__tests__/utils-for-testing/implementations/implementations';
import { KeyChainApiGetCustomData } from 'src/__tests__/utils-for-testing/interfaces/implementations';
import {
  CustomDataFromLocalStorage,
  GetManifest,
} from 'src/__tests__/utils-for-testing/interfaces/mocks.interface';
import { AnalyticsUtils } from 'src/analytics/analytics.utils';
import AccountUtils from 'src/utils/account.utils';
import ActiveAccountUtils from 'src/utils/active-account.utils';
import { ConversionUtils } from 'src/utils/conversion.utils';
import { DelegationUtils } from 'src/utils/delegation.utils';
import { DynamicGlobalPropertiesUtils } from 'src/utils/dynamic-global-properties.utils';
import { GovernanceUtils } from 'src/utils/governance.utils';
import { HiveEngineUtils } from 'src/utils/hive-engine.utils';
import HiveUtils from 'src/utils/hive.utils';
import { LedgerUtils } from 'src/utils/ledger.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import MkUtils from 'src/utils/mk.utils';
import PopupUtils from 'src/utils/popup.utils';
import ProposalUtils from 'src/utils/proposal.utils';
import ProxyUtils from 'src/utils/proxy.utils';
import { RcDelegationsUtils } from 'src/utils/rc-delegations.utils';
import { RewardsUtils } from 'src/utils/rewards.utils';
import RpcUtils from 'src/utils/rpc.utils';
import { SurveyUtils } from 'src/utils/survey.utils';
import TokensUtils from 'src/utils/tokens.utils';
import TransactionUtils from 'src/utils/transaction.utils';

const manifestFile = {
  chromium: require('../../../../manifests/chromium/manifest.json'),
};

export interface TestsConfigureModules {
  jestTimeOut?: number;
}

export interface TestsAppLoadingValues {
  chrome?: {
    i18n?: {
      getMessageImplementation?: (
        message: string,
        options?: string[] | undefined,
      ) => string;
    };
    runtime?: { sendMessage?: jest.Mock };
    tabs?: {
      create?: jest.Mock;
    };
    storage?: {
      local?: {
        clear?: jest.Mock;
      };
    };
  };
  operativeSystem?: {
    fixPopupOnMacOs?: jest.Mock | (() => void);
  };
  globalData?: {
    globalProperties?: DynamicGlobalProperties;
    medianHistoryPrice?: Price;
    rewardFund?: RewardFund;
  };
  rpc?: {
    getCurrentRpc?: Rpc;
    checkRpcStatus?: boolean;
  };
  accountsRelated?: {
    ActiveAccountUtils?: { getActiveAccountNameFromLocalStorage?: string };
    AccountUtils?: {
      getAccount?: ExtendedAccount[];
      getRCMana?: RC;
      getExtendedAccount?: ExtendedAccount;
      getExtendedAccounts?: ExtendedAccount[];
      hasStoredAccounts?: boolean;
      getAccountsFromLocalStorage?: LocalAccount[];
      getAccountValue?: string | 0;
      getPowerDown?: string[];
    };
    MkUtils?: { getMkFromLocalStorage?: string };
    HiveUtils?: {
      getAccountPrice?: number;
      getVP?: number;
      getVotingDollarsPerAccount?: number;
    };
    RewardsUtils?: { hasReward?: boolean };
    /**
     * Note: As default will mock raw data into getTransactions.
     * If used by default, you must declare getLastTransaction = data.length
     */
    TransactionUtils?: {
      getAccountTransactions?: [Transaction[], number];
      getLastTransaction?: number | Transaction;
      getTransactions?: any[];
    };
    TokensUtils?: {
      getUserBalance?: TokenBalance[];
      getIncomingDelegations?: TokenDelegation[];
      getOutgoingDelegations?: TokenDelegation[];
      getAllTokens?: any[];
      getTokensMarket?: TokenMarket[];
    };
    HiveEngineUtils?: { getTokenHistory?: TokenTransaction[] };
    DelegationUtils?: {
      getDelegatees?: VestingDelegation[];
      getPendingOutgoingUndelegation?: [];
    };
    RcDelegationsUtils?: { getAllOutgoingDelegations?: RcDelegation[] };
    ConversionUtils?: { getConversionRequests?: Conversion[] };
    ProxyUtils?: { findUserProxy?: string };
  };
  proposal?: {
    ProposalUtils?: {
      hasVotedForProposal?: boolean;
      voteForKeychainProposal?: boolean;
      isRequestingProposalVotes?: boolean;
      getProposalList?: Proposal[];
    };
  };
  googleAnalytics?: {
    AnalyticsUtils?: {
      initializeSettings?: jest.Mock;
      initializeGoogleAnalytics?: jest.Mock;
      acceptAll?: jest.Mock;
      rejectAll?: jest.Mock;
    };
    window?: { gtag?: jest.Mock };
  };
  popupsRelated?: {
    SurveyUtils?: {
      getSurvey?: jest.Mock;
      setCurrentAsSeen?: jest.Mock;
    };
    GovernanceUtils?: {
      addToIgnoreRenewal?: jest.Mock;
      getGovernanceReminderList?: string[];
      getGovernanceRenewalIgnored?: [];
      removeFromIgnoreRenewal?: jest.Mock;
      renewUsersGovernance?: jest.Mock;
    };
    whatsnew?: {
      chrome?: {
        runtime?: {
          getManifest?: GetManifest;
        };
      };
    };
  };
  apiRelated?: {
    KeychainApi?: {
      get?: jest.Mock;
      customData?: KeyChainApiGetCustomData;
    };
  };
  localStorageRelated?: {
    implementations?: {
      getValueFromLocalStorage?: jest.Mock;
    };
    customData?: CustomDataFromLocalStorage;
    LocalStorageUtils?: {
      getMultipleValueFromLocalStorage?: any;
    };
  };
  ledgerRelated?: {
    LedgerUtils?: {
      isLedgerSupported?: boolean;
    };
  };
}

/**
 * It will load all necessary values before the app loads. Includes: Mocking/Constants.
 * if not used, default will be loaded before app gets rendered for testing.
 * app: Here you can add/change/update all that affects initial states of the app.
 */
const set = (params?: {
  modules?: TestsConfigureModules;
  app?: TestsAppLoadingValues;
}) => {
  //////////////
  //Jest/Global Modules configuration used prior loading the app.

  jest.setTimeout(params?.modules?.jestTimeOut ?? 10000);
  //////////////

  /////////
  //chrome related
  chrome.i18n.getMessage = jest
    .fn()
    .mockImplementation(
      params?.app?.chrome?.i18n?.getMessageImplementation ??
        mocksImplementation.i18nGetMessageCustom,
    );
  chrome.runtime.sendMessage =
    params?.app?.chrome?.runtime?.sendMessage ?? jest.fn();
  chrome.tabs.create = params?.app?.chrome?.tabs?.create ?? jest.fn();
  chrome.storage.local.clear =
    params?.app?.chrome?.storage?.local?.clear ?? jest.fn();
  /////////

  ////////
  //LocalStorate related
  LocalStorageUtils.getValueFromLocalStorage = jest
    .fn()
    .mockImplementation(
      params?.app?.localStorageRelated?.implementations
        ?.getValueFromLocalStorage ??
        jest
          .fn()
          .mockImplementation((...args: any[]) =>
            mocksImplementation.getValuefromLS(
              args[0],
              params?.app?.localStorageRelated?.customData,
            ),
          ),
    );
  LocalStorageUtils.saveValueInLocalStorage = jest.fn();
  LocalStorageUtils.removeFromLocalStorage = jest.fn();
  LocalStorageUtils.getMultipleValueFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      params?.app?.localStorageRelated?.LocalStorageUtils
        ?.getMultipleValueFromLocalStorage ?? undefined,
    );
  ////////

  ///////
  //Specific Operative Systems related
  PopupUtils.fixPopupOnMacOs =
    params?.app?.operativeSystem?.fixPopupOnMacOs ?? jest.fn();
  ///////

  ///////
  //Global app data related
  DynamicGlobalPropertiesUtils.getDynamicGlobalProperties = jest
    .fn()
    .mockResolvedValue(
      params?.app?.globalData?.globalProperties ?? dynamic.globalProperties,
    );
  HiveUtils.getCurrentMedianHistoryPrice = jest
    .fn()
    .mockResolvedValue(
      params?.app?.globalData?.medianHistoryPrice ?? dynamic.medianHistoryPrice,
    );
  HiveUtils.getRewardFund = jest
    .fn()
    .mockResolvedValue(
      params?.app?.globalData?.rewardFund ?? dynamic.rewardFund,
    );
  //////////

  //////////
  //RPC related.
  RpcUtils.getCurrentRpc = jest
    .fn()
    .mockResolvedValue(params?.app?.rpc?.getCurrentRpc ?? rpc.defaultRpc);
  RpcUtils.checkRpcStatus = jest
    .fn()
    .mockResolvedValue(params?.app?.rpc?.checkRpcStatus ?? true);
  /////////

  ////////////
  //Accounts + ActiveAccounts + mk related
  //(including rewards, transactions, tokens. Delegations, Rc delegations, Convertions, Proxy)
  ActiveAccountUtils.getActiveAccountNameFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.ActiveAccountUtils
        ?.getActiveAccountNameFromLocalStorage ?? mk.user.one,
    );
  AccountUtils.getAccount = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.getAccount ??
        accounts.asArray.extended,
    );
  AccountUtils.getRCMana = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.getRCMana ?? fake_RC.rc,
    );
  AccountUtils.getExtendedAccount = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.getExtendedAccount ??
        accounts.extended,
    );
  AccountUtils.getExtendedAccounts = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.getExtendedAccounts ?? [
        accounts.extended,
      ],
    );
  AccountUtils.hasStoredAccounts = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.hasStoredAccounts ?? true,
    );
  AccountUtils.getAccountsFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.AccountUtils?.getAccountsFromLocalStorage ??
        accounts.twoAccounts,
    );
  AccountUtils.getAccountValue = jest
    .fn()
    .mockReturnValue(
      params?.app?.accountsRelated?.AccountUtils?.getAccountValue ?? '100000',
    );
  AccountUtils.getPowerDown = jest
    .fn()
    .mockReturnValue(
      params?.app?.accountsRelated?.AccountUtils?.getPowerDown ?? [],
    );
  MkUtils.getMkFromLocalStorage = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.MkUtils?.getMkFromLocalStorage ??
        mk.user.one,
    );
  HiveUtils.getAccountPrice = jest
    .fn()
    .mockReturnValue(
      params?.app?.accountsRelated?.HiveUtils?.getAccountPrice ?? 1,
    );
  HiveUtils.getVP = jest
    .fn()
    .mockReturnValue(params?.app?.accountsRelated?.HiveUtils?.getVP ?? 1);
  HiveUtils.getVotingDollarsPerAccount = jest
    .fn()
    .mockReturnValue(
      params?.app?.accountsRelated?.HiveUtils?.getVotingDollarsPerAccount ?? 1,
    );
  RewardsUtils.hasReward = jest
    .fn()
    .mockReturnValue(
      params?.app?.accountsRelated?.RewardsUtils?.hasReward ?? false,
    );
  TransactionUtils.getTransactions = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TransactionUtils?.getTransactions ?? [],
    );
  TransactionUtils.getLastTransaction = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TransactionUtils?.getLastTransaction ?? 1,
    );
  TokensUtils.getUserBalance = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TokensUtils?.getUserBalance ??
        tokensUser.balances,
    );
  TokensUtils.getIncomingDelegations = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TokensUtils?.getIncomingDelegations ??
        tokensUser.incomingDelegations,
    );
  TokensUtils.getOutgoingDelegations = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TokensUtils?.getOutgoingDelegations ??
        tokensUser.outcomingDelegations,
    );
  TokensUtils.getAllTokens = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TokensUtils?.getAllTokens ??
        tokensList.alltokens,
    );
  TokensUtils.getTokensMarket = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.TokensUtils?.getTokensMarket ??
        tokenMarket.all,
    );
  HiveEngineUtils.getHistory = jest
    .fn()
    .mockResolvedValueOnce(
      params?.app?.accountsRelated?.HiveEngineUtils?.getTokenHistory ??
        tokenHistory.leoToken,
    )
    .mockResolvedValueOnce([]);
  DelegationUtils.getDelegatees = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.DelegationUtils?.getDelegatees ??
        delegations.delegatees,
    );
  DelegationUtils.getPendingOutgoingUndelegation = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.DelegationUtils
        ?.getPendingOutgoingUndelegation ?? [],
    );
  RcDelegationsUtils.getAllOutgoingDelegations = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.RcDelegationsUtils
        ?.getAllOutgoingDelegations ?? [],
    );
  ConversionUtils.getConversionRequests = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.ConversionUtils?.getConversionRequests ??
        [],
    );
  ProxyUtils.findUserProxy = jest
    .fn()
    .mockResolvedValue(
      params?.app?.accountsRelated?.ProxyUtils?.findUserProxy ?? null,
    );
  /////////////

  /////////
  //Proposals related
  ProposalUtils.hasVotedForProposal = jest
    .fn()
    .mockResolvedValue(
      params?.app?.proposal?.ProposalUtils?.hasVotedForProposal ?? true,
    );
  ProposalUtils.voteForKeychainProposal = jest
    .fn()
    .mockResolvedValue(
      params?.app?.proposal?.ProposalUtils?.voteForKeychainProposal ?? true,
    );
  ProposalUtils.isRequestingProposalVotes = jest
    .fn()
    .mockResolvedValue(
      params?.app?.proposal?.ProposalUtils?.isRequestingProposalVotes ?? false,
    );
  ProposalUtils.getProposalList = jest
    .fn()
    .mockResolvedValue(
      params?.app?.proposal?.ProposalUtils?.getProposalList ?? [],
    );
  //////////

  //////////
  //Google Analytics related
  AnalyticsUtils.initializeSettings =
    params?.app?.googleAnalytics?.AnalyticsUtils?.initializeSettings ??
    jest.fn().mockResolvedValue(true);
  window.gtag =
    params?.app?.googleAnalytics?.window?.gtag ??
    jest.fn().mockImplementation((...args) => undefined);
  AnalyticsUtils.initializeGoogleAnalytics =
    params?.app?.googleAnalytics?.AnalyticsUtils?.initializeGoogleAnalytics ??
    jest.fn().mockImplementation(() => undefined);
  AnalyticsUtils.acceptAll =
    params?.app?.googleAnalytics?.AnalyticsUtils?.acceptAll ??
    jest.fn().mockImplementation(() => undefined);
  AnalyticsUtils.rejectAll =
    params?.app?.googleAnalytics?.AnalyticsUtils?.rejectAll ??
    jest.fn().mockImplementation(() => undefined);
  /////////

  /////////
  //AppPopups related (including: survey, governance, whats'new)
  SurveyUtils.getSurvey =
    params?.app?.popupsRelated?.SurveyUtils?.getSurvey ??
    jest.fn().mockResolvedValue(undefined);
  SurveyUtils.setCurrentAsSeen =
    params?.app?.popupsRelated?.SurveyUtils?.setCurrentAsSeen ??
    jest.fn().mockImplementation(() => {});
  GovernanceUtils.addToIgnoreRenewal =
    params?.app?.popupsRelated?.GovernanceUtils?.addToIgnoreRenewal ??
    jest.fn().mockImplementation(() => Promise.resolve(undefined));
  GovernanceUtils.getGovernanceReminderList = jest
    .fn()
    .mockResolvedValue(
      params?.app?.popupsRelated?.GovernanceUtils?.getGovernanceReminderList ??
        [],
    );
  GovernanceUtils.getGovernanceRenewalIgnored = jest
    .fn()
    .mockResolvedValue(
      params?.app?.popupsRelated?.GovernanceUtils
        ?.getGovernanceRenewalIgnored ?? [],
    );
  GovernanceUtils.removeFromIgnoreRenewal = jest
    .fn()
    .mockImplementation(
      params?.app?.popupsRelated?.GovernanceUtils?.removeFromIgnoreRenewal ??
        (() => Promise.resolve(undefined)),
    );
  GovernanceUtils.renewUsersGovernance = jest
    .fn()
    .mockImplementation(
      params?.app?.popupsRelated?.GovernanceUtils?.renewUsersGovernance ??
        (() => Promise.resolve(undefined)),
    );
  chrome.runtime.getManifest = jest.fn().mockReturnValue(
    params?.app?.popupsRelated?.whatsnew?.chrome?.runtime?.getManifest ?? {
      name: manifestFile.chromium.name,
      version: manifestFile.chromium.version,
    },
  );
  //////////

  //////////
  //API related
  //Note: For now it is only passing customData IF no need to change the get implementation.
  KeychainApi.get =
    params?.app?.apiRelated?.KeychainApi?.get ??
    jest
      .fn()
      .mockImplementation((...args: any[]) =>
        mocksImplementation.keychainApiGet(
          args[0],
          params?.app?.apiRelated?.KeychainApi?.customData,
        ),
      );
  ///////////

  //////////
  //Ledger Related
  LedgerUtils.isLedgerSupported = jest
    .fn()
    .mockResolvedValue(
      params?.app?.ledgerRelated?.LedgerUtils?.isLedgerSupported ?? false,
    );
  //////////
};

export const LoadingValuesConfiguration = { set };
